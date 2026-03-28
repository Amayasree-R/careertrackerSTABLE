import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ProfileForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ targetJob: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

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

      const response = await fetch('https://careertracker-gtc7a3g9gvfrgsf4.centralindia-01.azurewebsites.net/api/profile', {
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
