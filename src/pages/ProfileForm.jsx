import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_BASE_URL from '../config/api.js'

const ALL_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'Go',
  'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'React', 'Vue.js', 'Angular',
  'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap', 'Next.js', 'Svelte',
  'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'FastAPI',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'SQLite',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'Linux', 'CI/CD',
  'React Native', 'Flutter', 'Android', 'iOS',
  'Machine Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
  'GraphQL', 'REST API', 'Jest', 'Figma', 'Agile', 'Scrum'
]

function ProfileForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ targetJob: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [existingTargetJob, setExistingTargetJob] = useState(null)

  const [selectedSkills, setSelectedSkills] = useState([])
  const [skillSearch, setSkillSearch] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${API_BASE_URL}/profile`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.data.profile?.targetJob) {
          setExistingTargetJob(res.data.profile.targetJob)
          setFormData(prev => ({ ...prev, targetJob: res.data.profile.targetJob }))
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchProfile()
  }, [])

  const isNewUser = !existingTargetJob

  const filteredSkills = ALL_SKILLS.filter(s =>
    s.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !selectedSkills.includes(s)
  )

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  const jobRoles = [
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'Data Scientist',
    'Machine Learning Engineer',
    'DevOps Engineer',
    'Mobile Developer',
    'UI/UX Designer',
    'Cloud Engineer',
    'Cybersecurity Specialist'
  ]

  const validateForm = () => {
    const newErrors = {}

    if (!formData.targetJob) {
      newErrors.targetJob = 'Please select a target job position'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')

      const payload = {
        targetJob: formData.targetJob,
        ...(isNewUser && selectedSkills.length > 0 && { masteredSkills: selectedSkills })
      }

      const response = await axios.post(`${API_BASE_URL}/profile`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = response.data

      // Store in localStorage too (for quick access)
      localStorage.removeItem('userRoadmap')
      localStorage.removeItem('userProfile')

      // Navigate to dashboard
      navigate('/dashboard')
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save profile. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="bg-[#111111] border-b border-[#242424]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-[#ff5500]">CareerPath</h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-[#111111] rounded-lg shadow-lg p-8 border border-[#242424]">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#ffffff] mb-2">
              Edit Profile
            </h2>
            <p className="text-[#a0a0a0]">
              Update your target job role to regenerate your roadmap
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Target Job Position */}
            <div>
              <label className="block text-sm font-medium text-[#a0a0a0] mb-2">
                Target Job Position *
              </label>
              <select
                value={formData.targetJob}
                onChange={(e) => setFormData(prev => ({ ...prev, targetJob: e.target.value }))}
                className={`w-full px-3 py-2 bg-[#1a1a1a] text-[#ffffff] border ${errors.targetJob ? 'border-red-500' : 'border-[#242424]'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5500]`}
              >
                <option value="">Select a job role</option>
                {jobRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              {errors.targetJob && (
                <p className="mt-1 text-sm text-red-600">{errors.targetJob}</p>
              )}
            </div>

            {isNewUser ? (
              <div className="mt-6 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#ffffff] mb-1">
                    Skills I Already Know
                    <span className="text-[#a0a0a0] font-normal ml-2 text-xs">
                      (these will be marked as mastered in your roadmap)
                    </span>
                  </label>
                  <p className="text-xs text-[#a0a0a0] mb-3 italic">
                    You can only select these once. Skills can be added later via certificates or quizzes.
                  </p>
                </div>

                {/* Selected skill tags */}
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedSkills.map(skill => (
                      <span key={skill} className="flex items-center gap-1 px-3 py-1 bg-[#2a1500] text-[#ff5500] border border-[#ff5500]/30 rounded-full text-xs font-bold">
                        {skill}
                        <button type="button" onClick={() => toggleSkill(skill)} className="ml-1 hover:text-white transition">×</button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Search input */}
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={skillSearch}
                  onChange={e => setSkillSearch(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#242424] text-[#ffffff] placeholder-[#606060] rounded-lg focus:ring-2 focus:ring-[#ff5500] outline-none"
                />

                {/* Skill buttons */}
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 bg-[#1a1a1a] rounded-lg border border-[#242424]">
                  {filteredSkills.length > 0 ? filteredSkills.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className="px-3 py-1 bg-[#111111] text-[#a0a0a0] border border-[#242424] rounded-full text-xs font-medium hover:border-[#ff5500] hover:text-[#ff5500] transition-all"
                    >
                      + {skill}
                    </button>
                  )) : (
                    <p className="text-[#606060] text-xs italic">No skills match your search.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <p className="text-[#606060] text-xs italic">To add mastered skills, upload a certificate or complete a quiz.</p>
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-[#242424] bg-[#1a1a1a] rounded-lg text-[#ffffff] hover:bg-[#242424] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 bg-[#ff5500] text-white rounded-lg hover:bg-[#e64d00] disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfileForm
