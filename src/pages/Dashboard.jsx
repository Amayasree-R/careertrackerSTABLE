
import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer
} from 'recharts'
import SkillTooltip from '../components/SkillTooltip'
import { StatsCardSkeleton, SkillCardSkeleton } from '../components/Skeleton'
import { Rocket, BookOpen, FileText, Star, Search, Activity, Briefcase } from 'lucide-react'

function SkillRadar({ roadmap, profile }) {
  const chartData = useMemo(() => {
    if (!roadmap?.learningPath) return []

    // Map all available skills for the radar shape
    return roadmap.learningPath.map(item => {
      const isMastered = profile?.completedSkills?.some(s => (typeof s === 'object' ? s.skill === item.skill : s === item.skill))
      const isLearning = profile?.learningSkills?.includes(item.skill)

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
    <div className="h-[420px] w-full bg-[#13131a] rounded-3xl p-4">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="62%" data={chartData}>
          <PolarGrid stroke="#1e1e2e" strokeWidth={2} />
          <PolarAngleAxis
            dataKey="subject"
            tick={({ x, y, payload }) => (
              <g transform={`translate(${x},${y})`}>
                <text
                  x={0}
                  y={0}
                  dy={4}
                  textAnchor="middle"
                  fill="#94a3b8"
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
            stroke="#1d4ed8"
            strokeWidth={3}
            fill="#3b82f6"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)
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

        // Parallel fetching
        const [profRes, roadRes] = await Promise.all([
          fetch('http://localhost:5000/api/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:5000/api/roadmap', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])

        const profData = await profRes.json()
        const roadData = await roadRes.json()

        if (profRes.ok && profData.user) {
          setProfile(profData.user.profile)
          localStorage.setItem('userProfile', JSON.stringify(profData.user.profile))
        }

        if (roadRes.ok) {
          setRoadmap(roadData)
          localStorage.setItem('userRoadmap', JSON.stringify(roadData))
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
      const res = await fetch('http://localhost:5000/api/profile/toggle-skill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skill })
      })

      if (res.ok) {
        const data = await res.json()
        setProfile(prev => ({
          ...prev,
          completedSkills: data.completedSkills,
          learningSkills: data.learningSkills || []
        }))
      }
    } catch (err) {
      console.error('Toggle skill error:', err)
    } finally {
      setUpdatingSkill(null)
    }
  }

  const toggleFocus = async (skill) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('http://localhost:5000/api/profile/focus-skill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skill })
      })

      if (res.ok) {
        const data = await res.json()
        setProfile(prev => ({ ...prev, focusSkill: data.focusSkill }))
      }
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

      const isMastered = profile?.completedSkills?.some(s => (typeof s === 'object' ? s.skill === item.skill : s === item.skill))
      const isLearning = profile?.learningSkills?.includes(item.skill)
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
  const masteredCount = profile?.completedSkills?.length || 0
  const learningCount = profile?.learningSkills?.length || 0
  const requiredCount = roadmap?.skillGap?.required || 0

  const progressPercentage = (roadmap && requiredCount > 0)
    ? Math.round(((masteredCount + (learningCount * 0.5)) / requiredCount) * 100)
    : 0

  return (
    <div className="space-y-4">
      {/* Target Job Header */}
      {!isProfileComplete ? (
        <div className="bg-[#13131a] rounded-2xl border border-[#1e1e2e] hover:border-violet-500/30 shadow-sm hover:shadow-lg transition-all duration-300 ease-out p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-[#1e1e2e] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Rocket size={40} className="text-blue-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-100">Let's build your roadmap!</h2>
          <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
            Complete your profile with your target job and skills. We'll generate an AI-powered path to your dream career.
          </p>
          <Link
            to="/profile"
            className="inline-block px-8 py-3 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition shadow-sm"
          >
            Get Started
          </Link>
        </div>
      ) : (
        <>
          {/* ROW 1: Target Career Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#13131a] p-6 sm:p-7 rounded-2xl border border-[#1e1e2e] hover:border-violet-500/30 shadow-sm hover:shadow-lg transition-all duration-300 ease-out">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                <h2 className="text-[10px] font-semibold text-violet-400 uppercase tracking-[0.2em]">Target Career Path</h2>
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">{profile.targetJob}</h3>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/roadmap"
                className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition shadow-sm"
              >
                Full Roadmap
              </Link>
              <Link
                to="/profile"
                className="px-6 py-2.5 bg-[#1e1e2e] text-slate-300 rounded-xl font-medium hover:bg-[#2a2a3d] transition border border-[#2a2a3d]"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {/* ROW 2: 4-Column Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            {/* Mastered Card */}
            <div className="bg-[#13131a] border border-[#1e1e2e] rounded-2xl p-4 hover:border-violet-500/30 transition h-[110px] flex flex-col justify-between">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Mastered</p>
              <p className="text-3xl font-black text-slate-100">{masteredCount} <span className="text-sm font-bold text-slate-500">/ {requiredCount}</span></p>
            </div>

            {/* Learning Card */}
            <div className="bg-[#13131a] border border-[#1e1e2e] rounded-2xl p-4 hover:border-violet-500/30 transition h-[110px] flex flex-col justify-between">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Learning</p>
              <p className="text-3xl font-black text-blue-500">{learningCount}</p>
            </div>

            {/* Overall Match Card */}
            <div className="bg-[#13131a] border border-[#1e1e2e] rounded-2xl p-4 hover:border-violet-500/30 transition h-[110px] flex flex-col justify-between">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Overall Match</p>
              <div className="space-y-2">
                <span className="text-3xl font-black text-violet-400">{progressPercentage}%</span>
                <div className="w-full h-1.5 bg-[#1e1e2e] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 ease-out rounded-full" style={{ width: `${progressPercentage}%` }} />
                </div>
              </div>
            </div>

            {/* Job Matches Card */}
            <Link 
              to="/dashboard/jobs" 
              className="bg-[#13131a] border border-[#1e1e2e] rounded-2xl p-4 hover:border-violet-500/60 hover:bg-[#1a1a2e] transition h-[110px] flex flex-col justify-between group"
            >
              <div className="flex justify-between items-start">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Job Matches</p>
                <Briefcase size={22} className="text-violet-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-sm text-violet-400 font-medium">View matches →</p>
            </Link>
          </div>

          {/* ROW 3: Skills & Radar Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
            
            {/* LEFT (Col 2): Radar Chart Panel */}
            <div className="lg:col-span-2 bg-[#13131a] p-5 rounded-2xl border border-[#1e1e2e] hover:border-violet-500/30 shadow-sm transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-100 text-lg flex items-center gap-2">Skill Fingerprint <Activity size={18} className="text-slate-500" /></h4>
                  <p className="text-xs text-slate-400">Your core competency across target skills.</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> <span className="text-[10px] font-semibold text-slate-400 uppercase">Mastered</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-300" /> <span className="text-[10px] font-semibold text-slate-400 uppercase">Learning</span></div>
                </div>
              </div>
              <div className="flex justify-center">
                <SkillRadar roadmap={roadmap} profile={profile} />
              </div>
            </div>

            {/* RIGHT (Col 3): Skills Panel */}
            <div className="lg:col-span-3 bg-[#13131a] p-5 rounded-2xl border border-[#1e1e2e] hover:border-violet-500/30 shadow-sm transition-all duration-300 space-y-4">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <h4 className="font-bold text-slate-100 text-lg flex items-center gap-2">Skills to Acquire <BookOpen size={18} className="text-slate-400" /></h4>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[150px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input type="text" placeholder="Search skills..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                           className="w-full pl-9 pr-3 py-1.5 bg-[#1e1e2e] border border-[#2a2a3d] rounded-xl text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition" />
                  </div>
                  <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
                          className="px-3 py-1.5 bg-[#1e1e2e] border border-[#2a2a3d] rounded-xl text-[11px] font-medium text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 transition">
                    <option value="All">All Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-1.5 bg-[#1e1e2e] border border-[#2a2a3d] rounded-xl text-[11px] font-medium text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                  >
                    <option value="All">All Status</option>
                    <option value="To Learn">To Learn</option>
                    <option value="Learning">Learning</option>
                    <option value="Mastered">Mastered</option>
                  </select>
                  <button onClick={() => setHideMastered(!hideMastered)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-medium border transition ${hideMastered ? 'bg-violet-600 text-white border-violet-600' : 'bg-[#1e1e2e] text-slate-300 border-[#2a2a3d] hover:bg-[#2a2a3d]'}`}>
                    {hideMastered ? 'New Only' : 'Hide Mastered'}
                  </button>
                </div>
              </div>

              {profile.focusSkill && (
                <div className="p-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl text-white shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
                  <div className="relative flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center"><Star size={20} className="text-white fill-white" /></div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-200">Current Focus</p>
                        <h5 className="text-lg font-bold">{profile.focusSkill}</h5>
                      </div>
                    </div>
                    <button onClick={() => setActiveSkillDetails(profile.focusSkill)} className="px-4 py-1.5 bg-white/10 text-white text-xs font-semibold rounded-lg hover:bg-white/20 transition border border-white/20">Resume</button>
                  </div>
                </div>
              )}

              {(!roadmap && loading) ? (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map(i => <SkillCardSkeleton key={i} />)}
                </div>
              ) : filteredPath.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <Search size={32} className="text-slate-300 mx-auto opacity-50" />
                  <h5 className="font-semibold text-slate-400 text-sm">No skills found</h5>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredPath.map((item) => {
                    const isMastered = profile?.completedSkills?.some(s => (typeof s === 'object' ? s.skill === item.skill : s === item.skill))
                    const isLearning = profile?.learningSkills?.includes(item.skill)
                    const isUpdating = updatingSkill === item.skill
                    const isFocused = profile?.focusSkill === item.skill

                    return (
                      <div key={item.skill} ref={el => skillRefs.current[item.skill] = el}
                           className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${isMastered ? 'border-emerald-700 bg-emerald-950' : isLearning ? 'border-[#2a2050] bg-[#12102a]' : 'border-[#1e1e2e] bg-[#13131a]'} hover:border-violet-500/30 ${isFocused ? 'ring-2 ring-violet-500/30' : ''}`}
                           onClick={() => setActiveSkillDetails(item.skill)}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <button onClick={(e) => { e.stopPropagation(); if (!isUpdating) { if (isLearning) navigate(`/quiz/${encodeURIComponent(item.skill)}`); else toggleSkill(item.skill); } }}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-all ${isMastered ? 'bg-emerald-500 border-emerald-500 text-white' : isLearning ? 'bg-violet-600 border-violet-600 text-white' : 'bg-[#1e1e2e] border-[#2a2a3d] text-transparent'}`}>
                              {isMastered ? <span className="text-sm">✓</span> : isLearning ? <FileText className="w-3.5 h-3.5 text-white" /> : ''}
                            </button>
                            <div className="min-w-0">
                              <h6 className={`text-sm font-semibold truncate ${isMastered ? 'text-slate-500 line-through' : 'text-slate-100'}`}>{item.skill}</h6>
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                                isMastered 
                                  ? 'text-slate-600 bg-[#1e1e2e]' 
                                  : item.priority === 'High' ? 'text-red-400 bg-red-950' : 
                                    item.priority === 'Medium' ? 'text-amber-400 bg-amber-950' : 
                                    'text-violet-400 bg-violet-950'
                              }`}>{item.priority}</span>
                            </div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); toggleFocus(item.skill); }} className={`transition ${isFocused ? 'text-amber-400' : 'text-slate-500 hover:text-amber-300'}`}>
                            <Star size={14} className={isFocused ? 'fill-amber-400' : ''} />
                          </button>
                        </div>
                        {isUpdating && <div className="absolute inset-0 bg-[#13131a]/70 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
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
