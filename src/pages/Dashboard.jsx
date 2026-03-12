
import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer
} from 'recharts'
import SkillTooltip from '../components/SkillTooltip'
import { StatsCardSkeleton, SkillCardSkeleton } from '../components/Skeleton'
import { Rocket, BookOpen, FileText, Star, Search, Activity } from 'lucide-react'

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
    <div className="h-[450px] w-full bg-white rounded-3xl p-4">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="#f1f5f9" strokeWidth={2} />
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
                  fontSize={10}
                  fontWeight={700}
                  className="uppercase tracking-tighter"
                >
                  {payload.value.length > 12 ? `${payload.value.substring(0, 10)}...` : payload.value}
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
            fillOpacity={0.2}
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
    <div className="space-y-8">
      {/* Target Job Header */}
      {!isProfileComplete ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 ease-out p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Rocket size={40} className="text-blue-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Let's build your roadmap!</h2>
          <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
            Complete your profile with your target job and skills. We'll generate an AI-powered path to your dream career.
          </p>
          <Link
            to="/profile"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-sm"
          >
            Get Started
          </Link>
        </div>
      ) : (
        <>
          {/* Header with Target Job */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 ease-out">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-[0.2em]">Target Career Path</h2>
              </div>
              <h3 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">{profile.targetJob}</h3>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/roadmap"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition shadow-sm"
              >
                Full Roadmap
              </Link>
              <Link
                to="/profile"
                className="px-6 py-2.5 bg-white text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition border border-slate-200"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Middle Section: Stats & Radar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Stats Containers */}
            <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {loading ? (
                <>
                  <StatsCardSkeleton />
                  <StatsCardSkeleton />
                  <StatsCardSkeleton />
                </>
              ) : (
                <>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 ease-out relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest relative">Mastered</p>
                    <p className="text-4xl font-black text-slate-900 relative mt-1">{masteredCount} <span className="text-lg font-bold text-slate-300">/ {requiredCount}</span></p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 ease-out relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest relative">Learning</p>
                    <p className="text-4xl font-black text-blue-600 relative mt-1">{learningCount}</p>
                  </div>
                </>
              )}

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 ease-out sm:col-span-2 lg:col-span-1">
                <div className="flex justify-between items-end mb-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Overall Match</p>
                  <span className="text-sm font-semibold text-indigo-600 uppercase">{progressPercentage}% Ready</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 ease-out rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Radar Chart Visualization */}
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 ease-out flex flex-col min-h-[400px]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-bold text-slate-900 text-xl flex items-center gap-2">Skill Fingerprint <Activity size={18} className="text-slate-400" /></h4>
                  <p className="text-sm text-slate-400">Your core competency across target skills.</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> <span className="text-xs font-semibold text-slate-400 uppercase">Mastered</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-300" /> <span className="text-xs font-semibold text-slate-400 uppercase">Learning</span></div>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <SkillRadar roadmap={roadmap} profile={profile} />
              </div>
            </div>
          </div>

          {/* Interactive Skill Section */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 ease-out space-y-8">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <div>
                <h4 className="font-bold text-slate-900 text-2xl flex items-center gap-3">
                  Your Skills to Acquire <BookOpen size={20} className="text-slate-400" />
                </h4>
                <p className="text-slate-400 font-medium">Build your expertise one step at a time.</p>
                <div className="flex gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Learning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-200"></div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
                  </div>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-out"
                  />
                </div>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="All">All Priority</option>
                  <option value="High">High Only</option>
                  <option value="Medium">Medium Only</option>
                  <option value="Low">Low Only</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="All">All Status</option>
                  <option value="To Learn">To Learn</option>
                  <option value="Learning">Learning</option>
                  <option value="Mastered">Mastered</option>
                </select>
                <button
                  onClick={() => setHideMastered(!hideMastered)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${hideMastered ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  {hideMastered ? 'Showing New' : 'Hide Mastered'}
                </button>
              </div>
            </div>

            {profile.focusSkill && (
              <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center"><Star size={28} className="text-white fill-white" /></div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-100">Current Focus</p>
                      <h5 className="text-2xl font-bold">{profile.focusSkill}</h5>
                      <p className="text-sm text-blue-100 font-medium">You're making great progress! Stay focused.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSkillDetails(profile.focusSkill)}
                    className="px-6 py-2.5 bg-white text-blue-700 font-medium rounded-xl hover:bg-blue-50 transition border border-white/30"
                  >
                    Continue Learning
                  </button>
                </div>
              </div>
            )}

            {(!roadmap && loading) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => <SkillCardSkeleton key={i} />)}
              </div>
            ) : filteredPath.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <Search size={48} className="text-slate-300 mx-auto" />
                <h5 className="font-semibold text-slate-900 text-xl">No skills found</h5>
                <p className="text-slate-400">Try adjusting your filters or search term.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPath.map((item, idx) => {
                  const isMastered = profile?.completedSkills?.some(s => (typeof s === 'object' ? s.skill === item.skill : s === item.skill))
                  const isLearning = profile?.learningSkills?.includes(item.skill)
                  const isUpdating = updatingSkill === item.skill
                  const isFocused = profile?.focusSkill === item.skill

                  return (
                    <div
                      key={item.skill}
                      ref={el => skillRefs.current[item.skill] = el}
                      className={`group relative p-6 rounded-2xl border transition-all duration-300 ease-out cursor-pointer ${isMastered
                        ? 'border-slate-200 bg-green-50 shadow-sm hover:shadow-lg hover:-translate-y-0.5'
                        : isLearning
                          ? 'border-slate-200 bg-blue-50 shadow-sm hover:shadow-lg hover:-translate-y-0.5'
                          : 'border-slate-200 bg-white hover:border-blue-200 hover:shadow-lg hover:-translate-y-0.5'
                        } ${isFocused ? 'ring-2 ring-blue-500/20' : ''}`}
                      onClick={() => setActiveSkillDetails(item.skill)}
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isUpdating) {
                                if (isLearning) {
                                  // If learning, go to quiz to master it
                                  navigate(`/quiz/${encodeURIComponent(item.skill)}`)
                                } else {
                                  // Otherwise toggle as usual (To Learn -> Learning, or Mastered -> To Learn)
                                  toggleSkill(item.skill);
                                }
                              }
                            }}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all transform hover:scale-110 active:scale-90 ${isMastered
                              ? 'bg-green-500 border-green-500 text-white shadow-sm'
                              : isLearning
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-transparent'
                              }`}
                          >
                            {isMastered ? <span className="text-lg">✓</span> : isLearning ? <FileText className="w-4 h-4 text-white" /> : ''}
                          </button>
                          <div>
                            <h6 className={`text-base font-semibold leading-tight ${isMastered ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                              {item.skill}
                            </h6>
                            <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full ${item.priority === 'High' ? 'text-red-600 bg-red-50' :
                              item.priority === 'Medium' ? 'text-amber-600 bg-amber-50' :
                                'text-blue-600 bg-blue-50'
                              }`}>
                              {item.priority}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFocus(item.skill); }}
                          className={`transition transform hover:scale-125 ${isFocused ? 'text-amber-400 scale-110' : 'text-slate-400 hover:text-amber-300'}`}
                        >
                          <Star size={18} className={isFocused ? 'fill-amber-400' : ''} />
                        </button>
                      </div>

                      {
                        isUpdating && (
                          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )
                      }
                    </div>
                  )
                })}
              </div>
            )}

            {activeSkillDetails && (
              <SkillTooltip
                skill={activeSkillDetails}
                targetJob={profile?.targetJob}
                anchorRef={{ current: skillRefs.current[activeSkillDetails] }}
                onClose={() => setActiveSkillDetails(null)}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
