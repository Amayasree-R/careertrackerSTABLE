import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/Avatar'

export default function Profile() {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    navigate('/login')
                    return
                }

                const res = await fetch('http://localhost:5000/api/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await res.json()

                if (res.ok) {
                    if (data.user) {
                        setUser(data.user)
                    } else {
                        setError('User data not found in response')
                    }
                } else {
                    throw new Error(data.message || 'Failed to fetch profile')
                }
            } catch (err) {
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProfile()
    }, [navigate])

    if (isLoading) return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    )

    if (error) return (
        <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center">
                <p className="font-bold">Error Loading Profile</p>
                <p>{error}</p>
            </div>
        </div>
    )

    if (!user) return (
        <div className="p-6 text-center">
            <p className="text-gray-500 text-lg">No user profile data available.</p>
            <p className="text-xs text-gray-400">Please try logging in again.</p>
        </div>
    )

    const isWorkingProf = user.currentStatus === 'Working Professional'

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* 1. Header Section */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6">
                <Avatar name={user.fullName} size="xl" />
                <div className="text-center md:text-left flex-1">
                    <h1 className="text-3xl font-black text-slate-900">{user.fullName}</h1>
                    <p className="text-slate-500 font-medium">{user.email}</p>
                    <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                            {user.currentStatus}
                        </span>
                        {user.personalDetails?.location?.city && (
                            <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-bold">
                                📍 {user.personalDetails.location.city}, {user.personalDetails.location.country}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 2. Personal Information Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <span>👤</span> Personal Information
                    </h2>
                    <div className="space-y-4">
                        <InfoRow label="Full Name" value={user.fullName} />
                        <InfoRow label="Email ID" value={user.email} />
                        <InfoRow label="Phone Number" value={user.phoneNumber} />
                        {user.personalDetails?.dob && (
                            <InfoRow label="Date of Birth" value={new Date(user.personalDetails.dob).toLocaleDateString()} />
                        )}
                        <InfoRow label="Gender" value={user.personalDetails?.gender} />
                        <InfoRow label="Nationality" value={user.personalDetails?.nationality} />
                        <InfoRow
                            label="Location"
                            value={`${user.personalDetails?.location?.city || ''}, ${user.personalDetails?.location?.state || ''}, ${user.personalDetails?.location?.country || ''}`.replace(/^, , |, $/g, '')}
                        />
                    </div>
                </div>

                {/* 5. Social & Portfolio Links Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <span>🔗</span> Links & Portfolio
                    </h2>
                    <div className="space-y-4">
                        <SocialLink
                            icon="💻"
                            label="GitHub"
                            url={user.socialLinks?.github}
                        />
                        <SocialLink
                            icon="💼"
                            label="LinkedIn"
                            url={user.socialLinks?.linkedin}
                        />
                        <SocialLink
                            icon="🌐"
                            label="Portfolio"
                            url={user.socialLinks?.portfolio}
                        />
                    </div>
                    {!user.socialLinks?.github && !user.socialLinks?.linkedin && !user.socialLinks?.portfolio && (
                        <p className="text-slate-400 italic text-sm">No social links provided.</p>
                    )}
                </div>
            </div>

            {/* 3. Education Details Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <span>🎓</span> Education Details
                </h2>
                <div className="space-y-6">
                    {user.education && user.education.length > 0 ? (
                        user.education.map((edu, idx) => (
                            <div key={idx} className="border-l-4 border-blue-500 pl-4 py-1">
                                <h3 className="font-bold text-lg text-slate-800">{edu.degree} in {edu.specialization}</h3>
                                <p className="text-slate-600 font-medium">{edu.college}</p>
                                <p className="text-blue-600 text-sm font-bold mt-1">{edu.startYear} – {edu.endYear}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-400 italic">No education details recorded.</p>
                    )}
                </div>
            </div>

            {/* 4. Professional Details Card */}
            {isWorkingProf && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <span>🏢</span> Professional Experience
                    </h2>
                    <div className="space-y-6">
                        {user.experience && user.experience.length > 0 ? (
                            user.experience.map((exp, idx) => (
                                <div key={idx} className="border-l-4 border-indigo-500 pl-4 py-1">
                                    <h3 className="font-bold text-lg text-slate-800">{exp.role}</h3>
                                    <p className="text-slate-600 font-medium">{exp.company}</p>
                                    <p className="text-indigo-600 text-sm font-bold mt-1">
                                        {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : 'N/A'} – {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                                    </p>
                                    {exp.responsibilities && (
                                        <div className="mt-3 text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                                            {exp.responsibilities}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-400 italic">No professional experience recorded.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function InfoRow({ label, value }) {
    if (!value || value.trim() === ',' || value === 'Invalid Date') return null
    return (
        <div className="flex justify-between border-b border-slate-50 pb-2">
            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">{label}</span>
            <span className="text-slate-700 font-bold text-right">{value}</span>
        </div>
    )
}

function SocialLink({ icon, label, url }) {
    if (!url) return null
    return (
        <a
            href={url.startsWith('http') ? url : `https://${url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 group"
        >
            <div className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <span className="font-bold text-slate-700">{label}</span>
            </div>
            <span className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">➜</span>
        </a>
    )
}
