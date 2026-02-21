
import { useState, useEffect } from 'react'
import CertificateUpload from '../components/profile/CertificateUpload'
import CertificateCard from '../components/profile/CertificateCard'

export default function Certificates() {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        const token = localStorage.getItem('token')
        if (!token) return

        try {
            const res = await fetch('http://localhost:5000/api/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok && data.profile) {
                setProfile(data.profile)
            }
        } catch (err) {
            console.error('Fetch profile error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleCert = async (certId) => {
        const token = localStorage.getItem('token')
        try {
            await fetch(`http://localhost:5000/api/cert/toggle/${certId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            fetchProfile() // Refresh
        } catch (err) { console.error(err) }
    }

    const handleDeleteCert = async (certId) => {
        const token = localStorage.getItem('token')
        try {
            await fetch(`http://localhost:5000/api/cert/${certId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            fetchProfile() // Refresh
        } catch (err) { console.error(err) }
    }

    if (loading) return <div className="p-10 text-center">Loading...</div>

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                <div className="max-w-3xl">
                    <h1 className="text-4xl font-black text-slate-900 mb-4">Credential Wallet 💼</h1>
                    <p className="text-lg text-slate-500">
                        Manage your verified certificates. Upload new ones to automatically verify skills,
                        and control which credentials appear on your generated resume.
                    </p>
                </div>
            </div>

            {/* Upload Section */}
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                <h4 className="font-black text-slate-900 text-2xl mb-2">Upload New Certificate 📤</h4>
                <p className="text-slate-500 mb-6">Support for PDF files. AI will analyze and verify your skills.</p>
                <CertificateUpload onUploadSuccess={fetchProfile} />
            </div>

            {/* Certificates Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                    <h3 className="text-2xl font-black text-slate-900">Your Certificates</h3>
                    <span className="bg-blue-100 text-blue-700 font-bold px-4 py-1.5 rounded-full">
                        {profile?.certifications?.length || 0} Verified
                    </span>
                </div>

                {profile?.certifications && profile.certifications.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {profile.certifications.map((cert) => (
                            <div key={cert._id} className="h-full">
                                <CertificateCard
                                    cert={cert}
                                    onToggle={handleToggleCert}
                                    onDelete={handleDeleteCert}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 border-dashed">
                        <div className="text-6xl mb-4">📭</div>
                        <h4 className="text-xl font-bold text-slate-900">No certificates yet</h4>
                        <p className="text-slate-400">Upload your first certificate above to get started.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
