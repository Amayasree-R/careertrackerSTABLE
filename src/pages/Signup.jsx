import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    personalDetails: {
      dob: '',
      gender: '',
      nationality: '',
      location: {
        city: '',
        state: '',
        country: ''
      }
    },
    currentStatus: '', // Student, Working Professional
    education: {
      degree: '',
      specialization: '',
      college: '',
      years: ''
    },
    experience: {
      company: '',
      role: '',
      dates: '',
      responsibilities: ''
    },
    socialLinks: {
      github: '',
      linkedin: '',
      portfolio: ''
    }
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.includes('.')) {
      const [parent, child, subchild] = name.split('.')
      if (subchild) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [subchild]: value
            }
          }
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Basic Info
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.username.trim()) newErrors.username = 'Username is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!/^\d+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be numeric'
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Current Status
    if (!formData.currentStatus) {
      newErrors.currentStatus = 'Current status is required'
    } else {
      // Education is mandatory for ALL statuses
      if (!formData.education.degree) newErrors['education.degree'] = 'Degree is required'
      if (!formData.education.specialization.trim()) newErrors['education.specialization'] = 'Specialization is required'
      if (!formData.education.college.trim()) newErrors['education.college'] = 'College is required'
      if (!formData.education.years.trim()) newErrors['education.years'] = 'Duration is required'

      // Professional Details mandatory only for Working Professional
      if (formData.currentStatus === 'Working Professional') {
        if (!formData.experience.company.trim()) newErrors['experience.company'] = 'Company name is required'
        if (!formData.experience.role.trim()) newErrors['experience.role'] = 'Role is required'
        if (!formData.experience.dates.trim()) newErrors['experience.dates'] = 'Dates are required'
      }
    }

    // Social Links
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
    if (formData.socialLinks.github && !urlRegex.test(formData.socialLinks.github)) newErrors['socialLinks.github'] = 'Invalid GitHub URL'
    if (formData.socialLinks.linkedin && !urlRegex.test(formData.socialLinks.linkedin)) newErrors['socialLinks.linkedin'] = 'Invalid LinkedIn URL'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      // Scroll to first error
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        ...formData,
        personalDetails: {
          ...formData.personalDetails,
          dob: formData.personalDetails.dob || null
        },
        education: [{
          degree: formData.education.degree,
          specialization: formData.education.specialization,
          college: formData.education.college,
          startYear: formData.education.years.split('-')[0]?.trim() || '',
          endYear: formData.education.years.split('-')[1]?.trim() || ''
        }],
        experience: formData.currentStatus === 'Working Professional' ? [{
          company: formData.experience.company,
          role: formData.experience.role,
          startDate: formData.experience.dates.split('-')[0]?.trim() || null,
          endDate: (() => {
            const end = formData.experience.dates.split('-')[1]?.trim()
            return (end && end.toLowerCase() === 'present') ? null : (end || null)
          })(),
          responsibilities: formData.experience.responsibilities
        }] : []
      }

      const response = await fetch('http://127.0.0.1:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('userId', data.user.id)
      localStorage.setItem('username', data.user.username)

      navigate('/dashboard')
    } catch (error) {
      setErrors({ submit: error.message || 'Signup failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = () => {
    const password = formData.password
    if (!password) return { strength: 0, text: '', color: '' }

    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 10) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++

    if (strength <= 2) return { strength, text: 'Weak', color: 'bg-red-500' }
    if (strength <= 3) return { strength, text: 'Medium', color: 'bg-yellow-500' }
    return { strength, text: 'Strong', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Join Career Tracker</h2>
          <p className="mt-2 text-sm text-gray-600">Tell us about yourself to personalize your roadmap</p>
        </div>

        <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-700 border-b pb-2">1. Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 outline-none`}
                />
                {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 outline-none`}
                />
                {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email ID *</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 outline-none`}
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  name="phoneNumber"
                  type="text"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 outline-none`}
                  placeholder="Only numbers"
                />
                {errors.phoneNumber && <p className="text-xs text-red-600 mt-1">{errors.phoneNumber}</p>}
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 outline-none`}
                />
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                {formData.password && !errors.password && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Strength: {passwordStrength.text}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1 rounded-full">
                      <div className={`h-1 rounded-full transition-all ${passwordStrength.color}`} style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 outline-none`}
                />
                {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Personal Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-700 border-b pb-2">2. Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  name="personalDetails.dob"
                  type="date"
                  value={formData.personalDetails.dob}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="personalDetails.gender"
                  value={formData.personalDetails.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <input
                  name="personalDetails.nationality"
                  type="text"
                  value={formData.personalDetails.nationality}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  name="personalDetails.location.city"
                  type="text"
                  value={formData.personalDetails.location.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  name="personalDetails.location.state"
                  type="text"
                  value={formData.personalDetails.location.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  name="personalDetails.location.country"
                  type="text"
                  value={formData.personalDetails.location.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Current Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-700 border-b pb-2">3. Current Status *</h3>
            <div className="flex flex-wrap gap-6">
              {['Student', 'Working Professional'].map(status => (
                <label key={status} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="currentStatus"
                    value={status}
                    checked={formData.currentStatus === status}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700 font-medium">{status}</span>
                </label>
              ))}
            </div>
            {errors.currentStatus && <p className="text-xs text-red-600">{errors.currentStatus}</p>}
          </div>

          {/* Section 4: Education Details (Mandatory once status is selected) */}
          {formData.currentStatus && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-lg font-semibold text-purple-700 border-b pb-2">4. Education Details *</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
                  <select
                    name="education.degree"
                    value={formData.education.degree}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors['education.degree'] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 outline-none`}
                  >
                    <option value="">Select</option>
                    <option value="B.Tech">B.Tech</option>
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                    <option value="B.Sc">B.Sc</option>
                    <option value="M.Sc">M.Sc</option>
                  </select>
                  {errors['education.degree'] && <p className="text-xs text-red-600 mt-1">{errors['education.degree']}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
                  <input
                    name="education.specialization"
                    type="text"
                    value={formData.education.specialization}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors['education.specialization'] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 outline-none`}
                    placeholder="e.g. Computer Science"
                  />
                  {errors['education.specialization'] && <p className="text-xs text-red-600 mt-1">{errors['education.specialization']}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">College / University *</label>
                  <input
                    name="education.college"
                    type="text"
                    value={formData.education.college}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors['education.college'] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 outline-none`}
                  />
                  {errors['education.college'] && <p className="text-xs text-red-600 mt-1">{errors['education.college']}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (e.g. 2020 - 2024) *</label>
                  <input
                    name="education.years"
                    type="text"
                    value={formData.education.years}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors['education.years'] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 outline-none`}
                    placeholder="e.g. 2020 - 2024"
                  />
                  {errors['education.years'] && <p className="text-xs text-red-600 mt-1">{errors['education.years']}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Professional Details (Working Professional only) */}
          {formData.currentStatus === 'Working Professional' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-lg font-semibold text-purple-700 border-b pb-2">5. Professional Details *</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <input
                    name="experience.company"
                    type="text"
                    value={formData.experience.company}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors['experience.company'] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 outline-none`}
                  />
                  {errors['experience.company'] && <p className="text-xs text-red-600 mt-1">{errors['experience.company']}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role / Designation *</label>
                  <input
                    name="experience.role"
                    type="text"
                    value={formData.experience.role}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors['experience.role'] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 outline-none`}
                  />
                  {errors['experience.role'] && <p className="text-xs text-red-600 mt-1">{errors['experience.role']}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (e.g. 2024 - Present) *</label>
                  <input
                    name="experience.dates"
                    type="text"
                    value={formData.experience.dates}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors['experience.dates'] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 outline-none`}
                    placeholder="e.g. 2024 - Present"
                  />
                  {errors['experience.dates'] && <p className="text-xs text-red-600 mt-1">{errors['experience.dates']}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities</label>
                  <textarea
                    name="experience.responsibilities"
                    value={formData.experience.responsibilities}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Social & Portfolio Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-700 border-b pb-2">6. Social & Portfolio Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Profile URL</label>
                <input
                  name="socialLinks.github"
                  type="text"
                  value={formData.socialLinks.github}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors['socialLinks.github'] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 outline-none`}
                  placeholder="https://github.com/username"
                />
                {errors['socialLinks.github'] && <p className="text-xs text-red-600 mt-1">{errors['socialLinks.github']}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile URL</label>
                <input
                  name="socialLinks.linkedin"
                  type="text"
                  value={formData.socialLinks.linkedin}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors['socialLinks.linkedin'] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-purple-500 outline-none`}
                  placeholder="https://linkedin.com/in/username"
                />
                {errors['socialLinks.linkedin'] && <p className="text-xs text-red-600 mt-1">{errors['socialLinks.linkedin']}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Other Portfolio Link</label>
                <input
                  name="socialLinks.portfolio"
                  type="text"
                  value={formData.socialLinks.portfolio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Website or Portfolio URL"
                />
              </div>
            </div>
          </div>

          {/* Submit Button Area */}
          <div className="pt-4">
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                {errors.submit}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Complete Registration'}
            </button>
            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account? <Link to="/login" className="text-purple-600 font-semibold hover:underline">Log In</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Signup
