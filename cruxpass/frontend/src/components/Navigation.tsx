import { Link, useLocation } from 'react-router-dom'
import { LogOut, Search, Menu } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'

export default function Navigation({ 
    onSearchClick,
    showProfileOption,
}: { 
    onSearchClick: () => void
    showProfileOption: boolean
}) {
  const location = useLocation()
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)

  const linkClasses = (path: string) =>
    `block px-4 py-2 hover:bg-select transition ${
      location.pathname === path ? 'bg-select font-bold' : ''
    }`

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-base px-4 py-3 shadow sticky top-0 z-50 text-background">
        <button onClick={() => setOpen(!open)} className="base-select text-background">
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-semibold">CruxPass</h1>
        <button onClick={onSearchClick}>
          <Search size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`flex h-screen md:relative top-0 left-0 z-40 h-full w-52 bg-base shadow-md transform transition-transform duration-200 text-background
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:flex md:flex-col`}
      >
        <div className="flex flex-col h-full py-6 space-y-2 bg-base">
          <Link to="/dashboard" className={linkClasses('/dashboard')}>
            Dashboard
          </Link>
          <Link to="/leaderboards" className={linkClasses('/leaderboards')}>
            Leaderboards
          </Link>
          <Link to="/profile" className={linkClasses('/profile')}>
            Profile
          </Link>
          <button
            onClick={onSearchClick}
            className="flex items-center px-4 py-2 hover:bg-select"
          >
            <Search size={18} className="mr-2" /> Search
          </button>

          <div className="mt-auto">
            {showProfileOption ? (
              <button
                onClick={logout}
                className="flex items-center w-full text-background bg-accent px-4 py-2 hover:bg-accentHighlight"
              >
                <LogOut size={18} className="mr-2" /> Sign out
              </button>
            ) : (
              <Link
                to="/"
                className="flex items-center w-full text-background px-4 py-2 hover:bg-select"
              >
                <LogOut size={18} className="mr-2" /> Sign in
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-backgroundz-30 md:hidden text-base"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
