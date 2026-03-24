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
        className={`group relative flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 border-l-2 ${
          isActive
            ? 'bg-[#2a1500] text-[#ff5500] border-[#ff5500]'
            : 'text-[#a0a0a0] hover:bg-[#1a1a1a] hover:text-[#ffffff] border-transparent'
        }`}
      >
        <Icon
          size={18}
          className={`flex-shrink-0 transition-colors duration-200 ${
            isActive ? 'text-[#ff5500]' : 'text-[#a0a0a0] group-hover:text-[#ffffff]'
          }`}
        />
        <span className="truncate">{name}</span>
      </Link>
    )
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#111111] border-r border-[#242424] z-50 flex flex-col">

      {/* Logo */}
      <div className="flex items-center gap-1 px-4 py-5">
        <span className="text-xl font-black text-[#ffffff] tracking-tight">Career</span>
        <span className="text-xl font-black text-[#ffffff] tracking-tight">Path</span>
        <div className="ml-1 w-1.5 h-1.5 rounded-full bg-[#ff5500] animate-pulse" />
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(renderLink)}
      </nav>

      {/* Bottom: Profile */}
      <div className="px-3 pb-4 pt-4 border-t border-[#242424]">
        {renderLink(profileItem)}
      </div>

      {/* Version Label */}
      <div className="px-6 py-4 border-t border-[#242424]">
        <span className="text-xs text-[#606060]">v1.0.4-stable</span>
      </div>

    </aside>
  )
}


