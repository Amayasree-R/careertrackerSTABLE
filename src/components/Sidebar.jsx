import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
    const location = useLocation()

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
        { name: 'Profile', path: '/dashboard/profile', icon: '👤' },
        { name: 'Certificates', path: '/dashboard/certificates', icon: '📜' },
        { name: 'Resume Builder', path: '/dashboard/resume-builder', icon: '🚀' },
    ]

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 z-50">
            <div className="flex flex-col h-full">
                <div className="p-6">
                    <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        CareerPath
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 translate-x-1'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-6 border-t border-slate-100 italic text-xs text-slate-400 font-medium">
                    CareerPath v1.0.0
                </div>
            </div>
        </aside>
    )
}
