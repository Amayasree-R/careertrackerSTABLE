import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ProfileForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    currentSkills: [],
    targetJob: ''
  })
  const [skillInput, setSkillInput] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Common programming skills for suggestions
  const popularSkills = [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js',
    'HTML', 'CSS', 'SQL', 'MongoDB', 'Git', 'Docker',
    'TypeScript', 'Angular', 'Vue.js', 'Django', 'Flask',
    'Spring Boot', 'AWS', 'Azure', 'Kubernetes'
  ]

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

  const addSkill = () => {
    if (skillInput.trim() && !formData.currentSkills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        currentSkills: [...prev.currentSkills, skillInput.trim()]
      }))
      setSkillInput('')
    }
  }

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      currentSkills: prev.currentSkills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

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

      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save profile')
      }

      // Store in localStorage too (for quick access)
      localStorage.setItem('userProfile', JSON.stringify(formData))

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
              Complete Your Profile
            </h2>
            <p className="text-[#a0a0a0]">
              Tell us about your skills and career goals to get personalized recommendations
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Skills */}
            <div>
              <label className="block text-sm font-medium text-[#a0a0a0] mb-2">
                Current Skills (Optional)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a skill and press Enter"
                  className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#242424] text-[#ffffff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5500]"
                  list="skills-list"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-[#ff5500] text-white rounded-lg hover:bg-[#e64d00] transition"
                >
                  Add
                </button>
              </div>

              <datalist id="skills-list">
                {popularSkills.map(skill => (
                  <option key={skill} value={skill} />
                ))}
              </datalist>

              {/* Display Added Skills */}
              {formData.currentSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.currentSkills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#2a1500] text-[#ff5500]"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-[#ff5500] hover:text-[#e64d00]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-2 text-sm text-[#a0a0a0]">
                Add skills you already know. Leave empty if you're a complete beginner.
              </p>
            </div>

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



            {/* Submit Error */}
            {errors.submit && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
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
                {isLoading ? 'Saving...' : 'Save & Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfileForm
