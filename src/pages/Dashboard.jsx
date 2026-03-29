
import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import API_BASE_URL from '../config/api.js'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer
} from 'recharts'
import SkillTooltip from '../components/common/SkillTooltip'
import { StatsCardSkeleton, SkillCardSkeleton } from '../components/common/Skeleton'
import { Rocket, BookOpen, FileText, Star, Search, Activity, Briefcase } from 'lucide-react'
import { normalizeSkill } from '../utils/skillNormalizer'

function SkillRadar({ roadmap, profile }) {
  const chartData = useMemo(() => {
    if (!roadmap?.learningPath) return []

    // Map all available skills for the radar shape
    return roadmap.learningPath.map(item => {
      const isMastered = profile?.completedSkills?.some(s => {
        const masteredSkillName = typeof s === 'object' ? s.skill : s;
        return normalizeSkill(masteredSkillName) === normalizeSkill(item.skill);
      })
      const isLearning = profile?.learningSkills?.some(s => normalizeSkill(s) === normalizeSkill(item.skill))

      let value = 20 // Base value
      if (isMastered) value = 100
      else if (isLearning) value = 60

      return {
        subject: item.skill,
        fullMark: 100,
        value: value
      }
    })
  }, [roadmap, profile])

  if (chartData.length < 3) return null

  return (
    <div className="h-[420px] w-full bg-[#111111] rounded-3xl p-4">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="62%" data={chartData}>
          <PolarGrid stroke="#242424" strokeWidth={2} />
          <PolarAngleAxis
            dataKey="subject"
            tick={({ x, y, payload }) => (
              <g transform={`translate(${x},${y})`}>
                <text
                  x={0}
                  y={0}
                  dy={4}
                  textAnchor="middle"
                  fill="#a0a0a0"
                  fontSize={9}
                  fontWeight={700}
                  className="uppercase tracking-tighter"
                >
                  {payload.value.length > 16 ? `${payload.value.substring(0, 14)}...` : payload.value}
                </text>
              </g>
            )}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Skills"
            dataKey="value"
            stroke="#ff5500"
            strokeWidth={3}
            fill="#ff5500"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(() => {
    try {
      const cached = localStorage.getItem('userProfile')
      if (cached) {
        const parsed = JSON.parse(cached)
        return parsed.profile || parsed
      }
    } catch (e) {}
    return null
  })
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [updatingSkill, setUpdatingSkill] = useState(null)
  const [activeSkillDetails, setActiveSkillDetails] = useState(null)
  const skillRefs = useRef({})

  // Filtering State
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [hideMastered, setHideMastered] = useState(false)

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setActiveSkillDetails(null)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  // Optimistic UI: Initialize from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile')
    const savedRoadmap = localStorage.getItem('userRoadmap')

    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile)
        // Adjust for the fact that stored 'userProfile' might be the user object or just the profile part
        setProfile(parsed.profile || parsed)
      } catch (e) {
        console.error('Failed to parse cached profile')
      }
    }

    if (savedRoadmap) {
      try {
        setRoadmap(JSON.parse(savedRoadmap))
      } catch (e) {
        console.error('Failed to parse cached roadmap')
      }
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      try {
        setLoading(true)

        const cachedRoadmap = localStorage.getItem('userRoadmap')
        const cachedProfile = localStorage.getItem('userProfile')

        if (cachedProfile && cachedRoadmap) {
          const parsedProfile = JSON.parse(cachedProfile)
          const parsedRoadmap = JSON.parse(cachedRoadmap)
          
          if (parsedProfile?.targetJob !== parsedRoadmap?.targetJob) {
            setIsRegenerating(true)
            localStorage.removeItem('userRoadmap')
          }
        }

        // Parallel fetching
        const [profRes, roadRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/roadmap`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])

        if (profRes.data && profRes.data.user) {
          setProfile(profRes.data.user.profile)
          localStorage.setItem('userProfile', JSON.stringify(profRes.data.user.profile))
        }

        if (roadRes.data) {
          setRoadmap(roadRes.data)
          localStorage.setItem('userRoadmap', JSON.stringify(roadRes.data))
          setIsRegenerating(false)
        }
      } catch (err) {
        console.error('Fetch dashboard data error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  const toggleSkill = async (skill) => {
    setUpdatingSkill(skill)
    const token = localStorage.getItem('token')
    try {
      const res = await axios.post(`${API_BASE_URL}/profile/toggle-skill`, { skill }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = res.data
      setProfile(prev => ({
        ...prev,
        completedSkills: data.completedSkills,
        learningSkills: data.learningSkills || []
      }))
    } catch (err) {
      console.error('Toggle skill error:', err)
    } finally {
      setUpdatingSkill(null)
    }
  }

  const toggleFocus = async (skill) => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.post(`${API_BASE_URL}/profile/focus-skill`, { skill }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = res.data
      setProfile(prev => ({ ...prev, focusSkill: data.focusSkill }))
    } catch (err) {
      console.error('Toggle focus error:', err)
    }
  }

  // Priority Weights for sorting
  const priorityWeights = { 'High': 1, 'Medium': 2, 'Low': 3 }

  // Memoized Filtered & Sorted Learning Path
  const filteredPath = useMemo(() => {
    if (!roadmap?.learningPath) return []

    const filtered = roadmap.learningPath.filter(item => {
      const matchesSearch = item.skill.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPriority = filterPriority === 'All' || item.priority === filterPriority

      const isMastered = profile?.completedSkills?.some(s => {
        const masteredSkillName = typeof s === 'object' ? s.skill : s;
        return normalizeSkill(masteredSkillName) === normalizeSkill(item.skill);
      })
      const isLearning = profile?.learningSkills?.some(s => normalizeSkill(s) === normalizeSkill(item.skill))
      const status = isMastered ? 'Mastered' : isLearning ? 'Learning' : 'To Learn'

      const matchesStatus = filterStatus === 'All' || status === filterStatus
      const matchesHide = !hideMastered || !isMastered

      return matchesSearch && matchesPriority && matchesStatus && matchesHide
    })

    // Sort by priority weight
    return filtered.sort((a, b) =>
      (priorityWeights[a.priority] || 9) - (priorityWeights[b.priority] || 9)
    )
  }, [roadmap, searchTerm, filterPriority, filterStatus, hideMastered, profile])

  const isProfileComplete = profile && profile.targetJob
  const masteredCount = useMemo(() => {
    if (!roadmap?.learningPath || !profile?.completedSkills) return 0
    return roadmap.learningPath.filter(item =>
      profile.completedSkills.some(s => {
        const masteredName = typeof s === 'object' ? s.skill : s
        return normalizeSkill(masteredName) === normalizeSkill(item.skill)
      })
    ).length
  }, [roadmap, profile])
  const learningCount = profile?.learningSkills?.length || 0
  const requiredCount = roadmap?.skillGap?.required || 0

  const progressPercentage = (roadmap && requiredCount > 0)
    ? Math.round(((masteredCount + (learningCount * 0.5)) / requiredCount) * 100)
    : 0

  return (
    <div className="space-y-4">
      {/* Target Job Header */}
      {loading && !profile ? (
        <div className="bg-[#111111] rounded-2xl border border-[#242424] p-8 animate-pulse">
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-12 h-12 border-4 border-[#ff5500] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#a0a0a0] font-semibold text-sm uppercase tracking-widest">
              Loading your dashboard...
            </p>
          </div>
        </div>
      ) : !isProfileComplete ? (
        <div className="bg-[#111111] rounded-2xl border border-[#242424] hover:border-[#ff5500]/30 shadow-sm hover:shadow-lg transition-all duration-300 ease-out p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Rocket size={40} className="text-[#ff5500]" />
          </div>
          <h2 className="text-3xl font-black text-[#ffffff]">Let's build your roadmap!</h2>
          <p className="text-[#a0a0a0] max-w-lg mx-auto leading-relaxed">
            Complete your profile with your target job and skills. We'll generate an AI-powered path to your dream career.
          </p>
          <Link
            to="/profile"
            className="inline-block px-8 py-3 bg-[#ff5500] text-white font-medium rounded-xl hover:bg-[#e64d00] transition shadow-sm"
          >
            Get Started
          </Link>
        </div>
      ) : (
        <>
          {/* ROW 1: Target Career Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#111111] p-6 sm:p-7 rounded-2xl border border-[#242424] hover:border-[#ff5500]/30 shadow-sm hover:shadow-lg transition-all duration-300 ease-out">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff5500] animate-pulse" />
                <h2 className="text-[10px] font-semibold text-[#ff5500] uppercase tracking-[0.2em]">Target Career Path</h2>
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-[#ffffff] tracking-tight">{profile.targetJob}</h3>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/dashboard/visual-roadmap"
                className="px-6 py-2.5 bg-transparent text-[#ff5500] border border-[#ff5500] rounded-xl font-medium hover:bg-[#2a1500] transition shadow-sm"
              >
                Full Roadmap
              </Link>
              <Link
                to="/profile"
                className="px-6 py-2.5 bg-transparent text-[#ff5500] border border-[#ff5500] rounded-xl font-medium hover:bg-[#2a1500] transition"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {/* ROW 2: 4-Column Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            {/* Mastered Card */}
            <div className="bg-[#111111] border border-[#242424] rounded-2xl p-4 hover:border-[#ff5500]/30 transition h-[110px] flex flex-col justify-between">
              <p className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-widest">Mastered</p>
              <p className="text-3xl font-black text-[#ffffff]">
                {isRegenerating ? '—' : masteredCount}
                <span className="text-sm font-bold text-[#606060]"> / {isRegenerating ? '—' : requiredCount}</span>
              </p>
            </div>

            {/* Learning Card */}
            <div className="bg-[#111111] border border-[#242424] rounded-2xl p-4 hover:border-[#ff5500]/30 transition h-[110px] flex flex-col justify-between">
              <p className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-widest">Learning</p>
              <p className="text-3xl font-black text-[#ff5500]">{isRegenerating ? '—' : learningCount}</p>
            </div>

            {/* Overall Match Card */}
            <div className="bg-[#111111] border border-[#242424] rounded-2xl p-4 hover:border-[#ff5500]/30 transition h-[110px] flex flex-col justify-between">
              <p className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-widest">Overall Match</p>
              <div className="space-y-2">
                <span className="text-3xl font-black text-[#ff5500]">{isRegenerating ? '—' : `${progressPercentage}%`}</span>
                <div className="w-full h-1.5 bg-[#242424] rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff5500] transition-all duration-700 ease-out rounded-full" style={{ width: `${isRegenerating ? 0 : progressPercentage}%` }} />
                </div>
              </div>
            </div>

            {/* Job Matches Card */}
            <Link
              to="/dashboard/jobs"
              className="bg-[#111111] border border-[#242424] rounded-2xl p-4 hover:border-[#ff5500]/60 hover:bg-[#1a1100] transition h-[110px] flex flex-col justify-between group"
            >
              <div className="flex justify-between items-start">
                <p className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-widest">Job Matches</p>
                <Briefcase size={22} className="text-[#ff5500] group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-sm text-[#ff5500] font-medium">View matches →</p>
            </Link>
          </div>

          {/* ROW 3: Skills & Radar Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">

            {/* LEFT (Col 2): Radar Chart Panel */}
            <div className="lg:col-span-2 bg-[#111111] p-5 rounded-2xl border border-[#242424] hover:border-[#ff5500]/30 shadow-sm transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-[#ffffff] text-lg flex items-center gap-2">Skill Fingerprint <Activity size={18} className="text-[#606060]" /></h4>
                  <p className="text-xs text-[#a0a0a0]">Your core competency across target skills.</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#ff5500]" /> <span className="text-[10px] font-semibold text-[#a0a0a0] uppercase">Mastered</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#ff5500]/50" /> <span className="text-[10px] font-semibold text-[#a0a0a0] uppercase">Learning</span></div>
                </div>
              </div>
              <div className="flex justify-center">
                <SkillRadar roadmap={roadmap} profile={profile} />
              </div>
            </div>

            {/* RIGHT (Col 3): Skills Panel */}
            <div className="lg:col-span-3 bg-[#111111] p-5 rounded-2xl border border-[#242424] hover:border-[#ff5500]/30 shadow-sm transition-all duration-300 space-y-4">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <h4 className="font-bold text-[#ffffff] text-lg flex items-center gap-2">Skills to Acquire <BookOpen size={18} className="text-[#a0a0a0]" /></h4>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[150px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#606060] pointer-events-none" />
                    <input type="text" placeholder="Search skills..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-[#1a1a1a] border border-[#242424] rounded-xl text-xs text-[#ffffff] placeholder-[#606060] focus:outline-none focus:ring-2 focus:ring-[#ff5500] transition" />
                  </div>
                  <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-1.5 bg-[#1a1a1a] border border-[#242424] rounded-xl text-[11px] font-medium text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-[#ff5500] transition">
                    <option value="All">All Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-1.5 bg-[#1a1a1a] border border-[#242424] rounded-xl text-[11px] font-medium text-[#ffffff] focus:outline-none focus:ring-2 focus:ring-[#ff5500] transition"
                  >
                    <option value="All">All Status</option>
                    <option value="To Learn">To Learn</option>
                    <option value="Learning">Learning</option>
                    <option value="Mastered">Mastered</option>
                  </select>
                  <button onClick={() => setHideMastered(!hideMastered)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-medium border transition ${hideMastered ? 'bg-[#ff5500] text-white border-[#ff5500]' : 'bg-[#1a1a1a] text-[#a0a0a0] border-[#242424] hover:bg-[#242424]'}`}>
                    {hideMastered ? 'New Only' : 'Hide Mastered'}
                  </button>
                </div>
              </div>

              {profile.focusSkill && (
                <div className="p-4 bg-gradient-to-r from-[#ff5500] to-[#e64d00] rounded-xl text-white shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
                  <div className="relative flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center"><Star size={20} className="text-white fill-white" /></div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-orange-100">Current Focus</p>
                        <h5 className="text-lg font-bold">{profile.focusSkill}</h5>
                      </div>
                    </div>
                    <button onClick={() => setActiveSkillDetails(profile.focusSkill)} className="px-4 py-1.5 bg-white/10 text-white text-xs font-semibold rounded-lg hover:bg-white/20 transition border border-white/20">Resume</button>
                  </div>
                </div>
              )}

              {isRegenerating || (!roadmap && loading) ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="w-12 h-12 border-4 border-[#ff5500] border-t-transparent rounded-full animate-spin" />
                  <p className="text-[#a0a0a0] font-semibold text-sm uppercase tracking-widest">
                    Generating your new roadmap...
                  </p>
                  <p className="text-[#606060] text-xs">
                    This may take a few seconds
                  </p>
                </div>
              ) : filteredPath.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <Search size={32} className="text-slate-300 mx-auto opacity-50" />
                  <h5 className="font-semibold text-slate-400 text-sm">No skills found</h5>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredPath.map((item) => {
                    const isMastered = profile?.completedSkills?.some(s => {
                      const masteredSkillName = typeof s === 'object' ? s.skill : s;
                      return normalizeSkill(masteredSkillName) === normalizeSkill(item.skill);
                    })
                    const isLearning = profile?.learningSkills?.some(s => normalizeSkill(s) === normalizeSkill(item.skill))
                    const isUpdating = updatingSkill === item.skill
                    const isFocused = profile?.focusSkill === item.skill

                    return (
                      <div key={item.skill} ref={el => skillRefs.current[item.skill] = el}
                        className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${isMastered ? 'border-[#22c55e] bg-[#1a2a1a]' : isLearning ? 'border-[#ff5500]/50 bg-[#1a1100]' : 'border-[#242424] bg-[#111111]'} hover:bg-[#1a1a1a] hover:border-[#ff5500] ${isFocused ? 'ring-2 ring-[#ff5500]/30' : ''}`}
                        onClick={() => setActiveSkillDetails(item.skill)}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <button onClick={(e) => { e.stopPropagation(); if (!isUpdating) { if (isLearning) navigate(`/quiz/${encodeURIComponent(item.skill)}`); else toggleSkill(item.skill); } }}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-all ${isMastered ? 'bg-[#22c55e] border-[#22c55e] text-white' : isLearning ? 'bg-[#ff5500] border-[#ff5500] text-white' : 'bg-[#1a1a1a] border-[#242424] text-transparent'}`}>
                              {isMastered ? <span className="text-sm">✓</span> : isLearning ? <FileText className="w-3.5 h-3.5 text-white" /> : ''}
                            </button>
                            <div className="min-w-0">
                              <h6 className={`text-sm font-semibold truncate ${isMastered ? 'text-[#a0a0a0] line-through' : 'text-[#ffffff]'}`}>{item.skill}</h6>
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${isMastered
                                  ? 'text-[#606060] bg-[#1a1a1a]'
                                  : item.priority === 'High' ? 'text-[#ff5500] bg-[#2a1500]' :
                                    item.priority === 'Medium' ? 'text-[#a0a0a0] bg-[#1a1a1a]' :
                                      'text-[#606060] bg-[#1a1a1a]'
                                }`}>{item.priority}</span>
                            </div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); toggleFocus(item.skill); }} className={`transition ${isFocused ? 'text-[#ff5500]' : 'text-[#606060] hover:text-[#ff5500]'}`}>
                            <Star size={14} className={isFocused ? 'fill-[#ff5500]' : ''} />
                          </button>
                        </div>
                        {isUpdating && <div className="absolute inset-0 bg-[#0a0a0a]/70 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-[#ff5500] border-t-transparent rounded-full animate-spin" />
                        </div>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {activeSkillDetails && (
            <SkillTooltip
              skill={activeSkillDetails}
              targetJob={profile?.targetJob}
              anchorRef={{ current: skillRefs.current[activeSkillDetails] }}
              onClose={() => setActiveSkillDetails(null)}
            />
          )}
        </>
      )}
    </div>
  )
}

export default Dashboard
