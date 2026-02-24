
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
                <p className="text-slate-500 font-medium">Opening your Credential Wallet...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-blue-600 font-bold text-sm uppercase tracking-widest">
                        <Briefcase className="w-4 h-4" />
                        Professional Portfolio
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">
                        Credential Wallet
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl font-medium leading-relaxed">
                        Securely manage your professional certifications. Our AI analyzes your proofs
                        to automatically verify skills and update your career roadmap.
                    </p>
                </div>

                <div className="bg-white border border-slate-100 rounded-[2rem] p-4 flex items-center gap-6 shadow-xl shadow-slate-200/40">
                    <div className="pl-2">
                        <div className="text-3xl font-black text-slate-900 leading-none mb-1">
                            {certificates.length}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                            <h2 className="text-xl font-bold text-slate-900">Add New Credential</h2>
                        </div>
                        <CertificateUpload onUploadSuccess={() => {
                            fetchCertificates();
                            refreshProfile();
                        }} />

                        <div className="mt-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                            <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" />
                                Why verify?
                            </h4>
                            <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                Verified certificates automatically move skills to "Mastered" on your roadmap,
                                increasing your profile strength by up to 40%.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: List */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            Current Portfolio
                            <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
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
                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 px-6">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                                <FolderOpen className="w-10 h-10" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-2">No certificates yet</h4>
                            <p className="text-slate-400 font-medium text-center max-w-xs">
                                Your credential wallet is empty. Upload your professional certifications to showcase your expertise.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Minimal helper icon for info box
function ShieldCheck({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
