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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-blue-600">CareerPath</h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h2>
            <p className="text-gray-600">
              Tell us about your skills and career goals to get personalized recommendations
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Skills (Optional)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a skill and press Enter"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  list="skills-list"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Add skills you already know. Leave empty if you're a complete beginner.
              </p>
            </div>

            {/* Target Job Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Job Position *
              </label>
              <select
                value={formData.targetJob}
                onChange={(e) => setFormData(prev => ({ ...prev, targetJob: e.target.value }))}
                className={`w-full px-3 py-2 border ${errors.targetJob ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
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
