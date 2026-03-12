
import { useState, useEffect, useCallback } from 'react'
import { Briefcase, Award, Plus, FolderOpen, Loader2 } from 'lucide-react'
import CertificateUpload from '../components/profile/CertificateUpload'
import CertificateCard from '../components/profile/CertificateCard'

export default function Certificates() {
    const [certificates, setCertificates] = useState([])
    const [loading, setLoading] = useState(true)
    const [isInitialLoad, setIsInitialLoad] = useState(true)

    const fetchCertificates = useCallback(async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            setLoading(false)
            return
        }

        try {
            const res = await fetch('http://localhost:5000/api/cert', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) {
                setCertificates(data || [])
            }
        } catch (err) {
            console.error('Fetch certificates error:', err)
        } finally {
            setLoading(false)
            setIsInitialLoad(false)
        }
    }, [])

    useEffect(() => {
        fetchCertificates()
    }, [fetchCertificates])

    const refreshProfile = useCallback(async () => {
        const token = localStorage.getItem('token')
        if (!token) return

        try {
            const res = await fetch('http://localhost:5000/api/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok && data.user) {
                localStorage.setItem('userProfile', JSON.stringify(data.user.profile))
            }
        } catch (err) {
            console.error('Refresh profile error:', err)
        }
    }, [])

    const handleToggleCert = async (certId) => {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`http://localhost:5000/api/cert/toggle-resume/${certId}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                fetchCertificates()
                refreshProfile() // Ensure dashboard/roadmap are in sync
            }
        } catch (err) {
            console.error('Toggle error:', err)
        }
    }

    const handleDeleteCert = async (certId) => {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`http://localhost:5000/api/cert/${certId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                fetchCertificates()
                refreshProfile() // Ensure dashboard/roadmap are in sync
            }
        } catch (err) {
            console.error('Delete error:', err)
        }
    }

    if (isInitialLoad) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading certificates...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                <h1 className="flex items-center gap-3 text-3xl font-semibold text-slate-900">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                    Certificates
                </h1>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex items-center gap-6">
                    <div className="pl-2">
                        <div className="text-2xl font-semibold text-slate-900 leading-none mb-1">
                            {certificates.length}
                        </div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">
                            Verified Assets
                        </div>
                    </div>
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <Award className="w-8 h-8" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
                {/* Left Column: Upload */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="sticky top-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                <Plus className="w-5 h-5" />
                            </div>
                            <h2 className="text-base font-semibold text-slate-900">Add Certificate</h2>
                        </div>
                        <CertificateUpload onUploadSuccess={() => {
                            fetchCertificates();
                            refreshProfile();
                        }} />


                    </div>
                </div>

                {/* Right Column: List */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-3">
                            Your Certificates
                            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                                {certificates.length}
                            </span>
                        </h3>
                    </div>

                    {certificates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {certificates.map((cert) => (
                                <CertificateCard
                                    key={cert._id}
                                    cert={cert}
                                    onToggle={handleToggleCert}
                                    onDelete={handleDeleteCert}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 px-6 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                                <FolderOpen className="w-8 h-8" />
                            </div>
                            <h4 className="text-lg font-semibold text-slate-700 mb-2">No certificates yet</h4>
                            <p className="text-sm text-slate-400 max-w-md">
                                Upload your certificates to showcase your expertise and automatically update your skill profile.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

