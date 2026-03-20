import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  User,
  FileText,
  FolderGit2,
  Award,
  Briefcase,
  Map,
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard',      path: '/dashboard',                icon: LayoutDashboard },
  { name: 'Resume Builder', path: '/dashboard/resume-builder', icon: FileText },
  { name: 'Projects',       path: '/dashboard/projects',       icon: FolderGit2 },
  { name: 'Certificates',   path: '/dashboard/certificates',   icon: Award },
  { name: 'Job Matches',    path: '/dashboard/jobs',           icon: Briefcase },
  { name: 'Visual Roadmap', path: '/dashboard/visual-roadmap', icon: Map },
]

const profileItem = { name: 'Profile', path: '/dashboard/profile', icon: User }

export default function Sidebar() {
  const location = useLocation()

  const renderLink = ({ name, path, icon: Icon }) => {
    const isActive = location.pathname === path
    return (
      <Link
        key={name}
        to={path}
        className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
            : 'text-slate-400 hover:bg-[#1e1e2e] hover:text-violet-400'
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white/40 rounded-full" />
        )}
        <Icon
          size={18}
          className={`flex-shrink-0 transition-colors duration-200 ${
            isActive ? 'text-white' : 'text-slate-400 group-hover:text-violet-400'
          }`}
        />
        <span className="truncate">{name}</span>
      </Link>
    )
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#13131a] border-r border-[#1e1e2e] z-50 flex flex-col">

      {/* Logo */}
      <div className="flex items-center gap-1 px-4 py-5">
        <span className="text-xl font-black text-white tracking-tight">Career</span>
        <span className="text-xl font-black text-violet-400 tracking-tight">Path</span>
        <div className="ml-1 w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(renderLink)}
      </nav>

      {/* Bottom: Profile */}
      <div className="px-3 pb-5 pt-4 border-t border-[#1e1e2e]">
        {renderLink(profileItem)}
      </div>

    </aside>
  )
}


