import { useNavigate, Link, Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import API_BASE_URL from '../config/api.js'
import Sidebar from '../components/common/Sidebar'
import Avatar from '../components/common/Avatar'

export default function DashboardLayout() {
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                navigate('/login')
                return
            }

            try {
                const res = await axios.get(`${API_BASE_URL}/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = res.data
                if (data.user) {
                    setProfile(data.user)
                }
            } catch (err) {
                console.error('Layout fetch profile error:', err)
            }
        }

        fetchProfile()
    }, [navigate])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('userProfile')
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <Sidebar />

            <div className="ml-64">
                {/* Persistent Top Nav inside layout */}
                <nav className="sticky top-0 z-40 bg-[#0a0a0a] border-b border-[#1e1e2e]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex justify-between items-center h-16">
                            <div /> {/* Spacer for flex-justify-between */}

                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-end text-right hidden sm:block">
                                    <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Logged in as</p>
                                    <p className="text-sm font-semibold text-slate-100">{profile?.fullName}</p>
                                </div>
                                <Avatar name={profile?.fullName} size="sm" />
                                <button
                                    onClick={handleLogout}
                                    className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-violet-400 transition rounded-lg"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-6 py-10">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
