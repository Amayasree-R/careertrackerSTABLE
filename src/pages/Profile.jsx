import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/common/Avatar'

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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
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
        <div className="space-y-8 max-w-5xl mx-auto pb-12 bg-[#0a0a0a] min-h-screen p-6 sm:p-8">
            {/* 1. Header Section */}
            <div className="bg-[#111111] rounded-2xl p-6 sm:p-8 shadow-sm border border-[#242424] hover:border-[#ff5500]/30 flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-all duration-200">
                <Avatar name={user.fullName} size="xl" />
                <div className="text-center md:text-left flex-1">
                    <h1 className="text-3xl font-bold text-[#ffffff]">{user.fullName}</h1>
                    <p className="text-[#a0a0a0] font-medium">{user.email}</p>
                    <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
                        <span className="px-3 py-1 bg-[#2a1500] text-[#ff5500] rounded-full text-xs font-semibold uppercase tracking-wider">
                            {user.currentStatus}
                        </span>
                        {user.personalDetails?.location?.city && (
                            <span className="px-3 py-1 bg-[#1a1a1a] text-[#a0a0a0] rounded-full text-xs font-semibold">
                                {user.personalDetails.location.city}, {user.personalDetails.location.country}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 2. Personal Information Card */}
                <div className="bg-[#111111] rounded-2xl p-6 shadow-sm border border-[#242424] hover:border-[#ff5500]/30 hover:shadow-md transition-all duration-200">
                    <h2 className="text-lg font-semibold text-[#ffffff] mb-6">
                        Personal Information
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
                <div className="bg-[#111111] rounded-2xl p-6 shadow-sm border border-[#242424] hover:border-[#ff5500]/30 hover:shadow-md transition-all duration-200">
                    <h2 className="text-lg font-semibold text-[#ffffff] mb-6">
                        Links &amp; Portfolio
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
                        <p className="text-[#a0a0a0] italic text-sm">No social links provided.</p>
                    )}
                </div>
            </div>

            {/* 3. Education Details Card */}
            <div className="bg-[#111111] rounded-2xl p-6 shadow-sm border border-[#242424] hover:border-[#ff5500]/30 hover:shadow-md transition-all duration-200">
                <h2 className="text-lg font-semibold text-[#ffffff] mb-6">
                    Education Details
                </h2>
                <div className="space-y-6">
                    {user.education && user.education.length > 0 ? (
                        user.education.map((edu, idx) => (
                            <div key={idx} className="border-l-2 border-[#ff5500] pl-4 py-1">
                                <h3 className="font-semibold text-base text-[#ffffff]">{edu.degree} in {edu.specialization}</h3>
                                <p className="text-[#a0a0a0]">{edu.college}</p>
                                <p className="text-[#ff5500] text-sm font-medium mt-1">{edu.startYear} – {edu.endYear}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-[#a0a0a0] italic">No education details recorded.</p>
                    )}
                </div>
            </div>

            {/* 4. Professional Details Card */}
            {isWorkingProf && (
                <div className="bg-[#111111] rounded-2xl p-6 shadow-sm border border-[#242424] hover:border-[#ff5500]/30 hover:shadow-md transition-all duration-200">
                    <h2 className="text-lg font-semibold text-[#ffffff] mb-6">
                        Professional Experience
                    </h2>
                    <div className="space-y-6">
                        {user.experience && user.experience.length > 0 ? (
                            user.experience.map((exp, idx) => (
                            <div key={idx} className="border-l-2 border-[#ff5500] pl-4 py-1">
                                <h3 className="font-semibold text-base text-[#ffffff]">{exp.role}</h3>
                                <p className="text-[#a0a0a0]">{exp.company}</p>
                                <p className="text-[#ff5500] text-sm font-medium mt-1">
                                        {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : 'N/A'} – {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                                    </p>
                                    {exp.responsibilities && (
                                        <div className="mt-3 text-[#a0a0a0] text-sm leading-relaxed whitespace-pre-line">
                                            {exp.responsibilities}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-[#a0a0a0] italic">No professional experience recorded.</p>
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
        <div className="flex justify-between border-b border-[#242424] pb-2">
            <span className="text-xs font-semibold uppercase text-[#a0a0a0] tracking-wider">{label}</span>
            <span className="text-[#ffffff] font-medium text-right">{value}</span>
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
            className="flex items-center justify-between p-3 rounded-xl border border-[#242424] bg-[#1a1a1a] hover:bg-[#242424] hover:shadow-sm transition-all duration-200 group"
        >
            <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[#ff5500]">{label}</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#a0a0a0] group-hover:text-[#ff5500] group-hover:translate-x-1 transition-all duration-200"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
    )
}
