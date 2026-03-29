import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_BASE_URL from '../config/api.js'
import { CheckCircle, Award, Target, ChevronRight } from 'lucide-react'
import SkillTooltip from '../components/common/SkillTooltip'

function Roadmap() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [roadmapData, setRoadmapData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeSkill, setActiveSkill] = useState(null) // { skill, index }
  const skillRefs = useRef({}) // refs keyed by index for positioning

  // Shared check for mastery (consistent with Dashboard)
  const isSkillMastered = (skillName) => {
    if (!profile?.completedSkills) return false
    return profile.completedSkills.some(s =>
      typeof s === 'object' ? s.skill === skillName : s === skillName
    )
  }

  // Close tooltip on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setActiveSkill(null)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  // Close tooltip on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeSkill && !e.target.closest('.skill-tooltip-anchor') && !e.target.closest('.skill-tooltip-popup')) {
        setActiveSkill(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeSkill])

  useEffect(() => {
    const fetchRoadmap = async () => {
      const token = localStorage.getItem('token')
      const savedProfile = localStorage.getItem('userProfile')
      const savedRoadmap = localStorage.getItem('userRoadmap')

      if (!token) {
        navigate('/login')
        return
      }

      // Optimistic UI
      if (savedProfile) setProfile(JSON.parse(savedProfile))
      if (savedRoadmap) setRoadmapData(JSON.parse(savedRoadmap))

      try {
        setIsLoading(true)

        // Parallel fetching
        const [profRes, roadRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/roadmap`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])

        const profData = profRes.data
        const roadData = roadRes.data

        if (profData.user) {
          setProfile(profData.user.profile)
          localStorage.setItem('userProfile', JSON.stringify(profData.user.profile))
        }

        if (roadData) {
          setRoadmapData(roadData)
          localStorage.setItem('userRoadmap', JSON.stringify(roadData))
        }
      } catch (error) {
        console.error('Error fetching roadmap:', error)
        // Only alert if we don't have cached data to show
        if (!savedRoadmap) {
          alert('Failed to generate roadmap: ' + error.message)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoadmap()
  }, [navigate])

  const handleSkillHover = useCallback((skill, index) => {
    setActiveSkill({ skill, index })
  }, [])

  const handleSkillLeave = useCallback((e) => {
    // Don't close if moving into the tooltip itself
    const related = e.relatedTarget
    if (related && related.closest('.skill-tooltip-popup')) return
    setActiveSkill(null)
  }, [])

  const handleTooltipMouseLeave = useCallback((e) => {
    const related = e.relatedTarget
    if (related && related.closest('.skill-tooltip-anchor')) return
    setActiveSkill(null)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 border-4 border-[#ff5500]/20 border-t-[#ff5500] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">
            🗺️
          </div>
        </div>
        <h2 className="text-3xl font-black text-[#ffffff] mb-2">Analyzing Your Career Profile</h2>
        <p className="text-[#a0a0a0] max-w-md mx-auto leading-relaxed">
          We're fetching real-time data from GitHub and using AI to build your personalized learning path for <span className="text-[#ff5500] font-bold">{profile?.targetJob}</span>.
        </p>
        <div className="mt-10 flex gap-2">
          <div className="w-2 h-2 bg-[#ff5500] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-[#ff5500] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-[#ff5500] rounded-full animate-bounce"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="bg-[#111111] border-b border-[#242424] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-[#ff5500]">CareerPath</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-[#ff5500] border border-[#ff5500] hover:bg-[#2a1500] rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

      </nav >

      {/* Main Content */}
      < div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8" >
        {/* Header */}
        < div className="mb-8" >
          <h2 className="text-3xl font-bold text-[#ffffff] mb-2">
            Your Personalized Learning Roadmap
          </h2>
          <p className="text-[#a0a0a0]">
            Target Position: <span className="font-semibold text-[#ffffff]">{profile?.targetJob}</span>
          </p>
        </div >

        {/* Skill Gap Analysis */}
        < div className="bg-[#111111] rounded-2xl border border-[#242424] p-6 mb-8" >
          <h3 className="text-xl font-bold text-[#ffffff] mb-4">Skill Gap Analysis</h3>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#ffffff]">{roadmapData?.skillGap.current}</div>
              <div className="text-sm text-[#a0a0a0]">Current Skills</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#22c55e]">{roadmapData?.skillGap.required}</div>
              <div className="text-sm text-[#a0a0a0]">Required Skills</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#ff5500]">{roadmapData?.skillGap.percentage}%</div>
              <div className="text-sm text-[#a0a0a0]">Match Percentage</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-[#a0a0a0]">Progress to Target Role</span>
              <span className="text-sm font-medium text-[#ff5500]">{roadmapData?.skillGap.percentage}%</span>
            </div>
            <div className="w-full bg-[#242424] rounded-full h-3">
              <div
                className="bg-[#ff5500] h-3 rounded-full transition-all"
                style={{ width: `${roadmapData?.skillGap.percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Missing Skills */}
          <div>
            <h4 className="font-semibold text-[#ffffff] mb-3">Skills You Need to Learn:</h4>
            <div className="flex flex-wrap gap-2">
              {roadmapData?.missingSkills.map(skill => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-[#1a1a1a] text-[#a0a0a0] rounded-full text-sm font-medium border border-[#242424]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div >

        {/* Learning Path */}
        < div className="bg-[#111111] rounded-2xl border border-[#242424] p-6 mb-8" >
          <h3 className="text-xl font-bold text-[#ffffff] mb-2">Recommended Learning Path</h3>

          <div className="space-y-4">
            {roadmapData?.learningPath.map((item, index) => (
              <div key={item.id || index} className={`border rounded-3xl p-6 transition-all duration-300 ${isSkillMastered(item.skill) ? 'bg-[#1a2a1a]/30 border-[#22c55e]/50 shadow-sm' : 'bg-[#111111] border-[#242424] hover:border-[#ff5500]'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-2xl w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0 transition-colors ${isSkillMastered(item.skill) ? 'bg-[#22c55e] text-[#ffffff] shadow-lg shadow-[#22c55e]/20' : 'bg-[#1a1a1a] text-[#ff5500] border border-[#242424]'}`}>
                      {isSkillMastered(item.skill) ? <CheckCircle className="w-6 h-6" /> : index + 1}
                    </div>
                    <div className="relative">
                      <div className="flex flex-col">
                        <span
                          ref={el => skillRefs.current[index] = el}
                          className={`skill-tooltip-anchor inline-block font-black text-xl cursor-pointer transition-colors duration-150 select-none ${isSkillMastered(item.skill) ? 'text-[#606060] line-through' : 'text-[#ffffff] hover:text-[#ff5500]'}`}
                          onMouseEnter={() => handleSkillHover(item.skill, index)}
                          onMouseLeave={handleSkillLeave}
                          onClick={() => handleSkillHover(item.skill, index)}
                        >
                          {item.skill}
                        </span>
                        {isSkillMastered(item.skill) && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            COMPLETED
                          </span>
                        )}
                      </div>

                      {/* Tooltip Popup — rendered via portal-like positioning */}
                      {activeSkill && activeSkill.index === index && (
                        <div
                          className="skill-tooltip-popup"
                          onMouseEnter={() => { }} // keep open
                          onMouseLeave={handleTooltipMouseLeave}
                        >
                          <SkillTooltip
                            skill={item.skill}
                            targetJob={profile?.targetJob}
                            anchorRef={{ current: skillRefs.current[index] }}
                            onClose={() => setActiveSkill(null)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Priority + Time badges */}
                <div className="flex gap-3 mt-1 ml-11">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${item.priority === 'High' ? 'bg-[#2a1500] text-[#ff5500]' :
                    item.priority === 'Medium' ? 'bg-[#1a1a1a] text-[#a0a0a0]' :
                      'bg-[#1a1a1a] text-[#606060]'
                    }`}>
                    {item.priority} Priority
                  </span>
                </div>

                {/* Inline Resources (kept as-is) */}

              </div >
            ))
            }
          </div >
        </div >

        {/* Recommended Projects */}
          <div className="bg-[#111111] rounded-lg shadow-lg p-6 border border-[#242424]">
          <h3 className="text-xl font-bold text-slate-100 mb-4">Practice Projects from GitHub</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roadmapData?.projects.map(project => (
               <div key={project.id} className="border border-[#242424] bg-[#111111] rounded-lg p-4 hover:shadow-md hover:border-[#ff5500]/30 transition">
                <h4 className="font-semibold text-slate-100 mb-2">{project.name}</h4>

                <div className="flex gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded ${project.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                    project.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                    {project.difficulty}
                  </span>
                  <span className="text-xs px-2 py-1 bg-[#1e1e2e] text-slate-300 rounded flex items-center gap-1">
                    ⭐ {project.stars}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {project.skills.map(skill => (
                    <span key={skill} className="text-xs px-2 py-0.5 bg-violet-950 text-violet-400 rounded">
                      {skill}
                    </span>
                  ))}
                </div>

                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#ff5500] hover:text-[#ff7733] hover:underline font-medium"
                >
                  View on GitHub →
                </a>
              </div>
            ))}
          </div>
        </div >
      </div >
    </div >
  )
}

export default Roadmap
