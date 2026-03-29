
import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Briefcase, Award, Plus, FolderOpen, Loader2 } from 'lucide-react'
import API_BASE_URL from '../config/api.js'
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
            const res = await axios.get(`${API_BASE_URL}/cert`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            setCertificates(res.data || [])
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
            const res = await axios.get(`${API_BASE_URL}/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.data && res.data.user) {
                localStorage.setItem('userProfile', JSON.stringify(res.data.user.profile))
            }
        } catch (err) {
            console.error('Refresh profile error:', err)
        }
    }, [])

    const handleToggleCert = async (certId) => {
        const token = localStorage.getItem('token')
        try {
            const res = await axios.patch(`${API_BASE_URL}/cert/toggle-resume/${certId}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            fetchCertificates()
            refreshProfile() // Ensure dashboard/roadmap are in sync
        } catch (err) {
            console.error('Toggle error:', err)
        }
    }

    const handleDeleteCert = async (certId) => {
        const token = localStorage.getItem('token')
        try {
            const res = await axios.delete(`${API_BASE_URL}/cert/${certId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.data.removedSkills?.length > 0) {
                console.log('Skills removed from profile due to cert deletion:', res.data.removedSkills)
            }
            fetchCertificates()
            refreshProfile() // Ensure dashboard/roadmap are in sync
        } catch (err) {
            console.error('Delete error:', err)
        }
    }

    if (isInitialLoad) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-[#ff5500] animate-spin mb-4" />
                <p className="text-[#a0a0a0] font-medium">Loading certificates...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                <h1 className="flex items-center gap-3 text-3xl font-semibold text-[#ffffff]">
                    <Briefcase className="w-6 h-6 text-[#ff5500]" />
                    Certificates
                </h1>

                <div className="bg-[#111111] border border-[#242424] rounded-2xl shadow-sm p-4 flex items-center gap-6">
                    <div className="pl-2">
                        <div className="text-2xl font-semibold text-[#ffffff] leading-none mb-1">
                            {certificates.length}
                        </div>
                        <div className="text-xs text-[#606060] uppercase tracking-wide">
                            Verified Assets
                        </div>
                    </div>
                    <div className="w-14 h-14 bg-[#2a1500] rounded-2xl flex items-center justify-center text-[#ff5500]">
                        <Award className="w-8 h-8" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
                {/* Left Column: Upload */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="sticky top-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-[#ff5500] rounded-lg flex items-center justify-center text-white">
                                <Plus className="w-5 h-5" />
                            </div>
                            <h2 className="text-base font-semibold text-[#ffffff]">Add Certificate</h2>
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
                        <h3 className="text-lg font-semibold text-[#ffffff] flex items-center gap-3">
                            Your Certificates
                            <span className="text-xs font-medium text-[#606060] bg-[#1a1a1a] px-2.5 py-1 rounded-full">
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
                        <div className="flex flex-col items-center justify-center py-20 bg-[#111111] rounded-2xl border border-[#242424] px-6 text-center">
                            <div className="w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center text-[#606060] mb-4">
                                <FolderOpen className="w-8 h-8" />
                            </div>
                            <h4 className="text-lg font-semibold text-[#ffffff] mb-2">No certificates yet</h4>
                            <p className="text-sm text-[#a0a0a0] max-w-md">
                                Upload your certificates to showcase your expertise and automatically update your skill profile.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

