import { Link, useLocation } from 'react-router-dom'
import { LogOut, Search, Menu, LogIn, User, ChartLine, Calendar, House } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { useGymSession } from '@/context/GymSessionContext'
import { useClimberSession } from '@/context/ClimberSessionContext'
import { AccountType } from '@/constants/enum'

export default function Navigation({ 
    onSearchClick,
    showProfileOption,
}: { 
    onSearchClick: () => void
    showProfileOption: boolean
}) {
  const location = useLocation()
  const { gym } = useGymSession()
  const { climber } = useClimberSession()
  const { logout, accountType } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect (() => {
    if ((accountType === AccountType.GYM && !gym) ||
        (accountType === AccountType.CLIMBER && !climber)) {
      showProfileOption = false;
    }
  }, [gym, climber])

  const linkClasses = (path: string) =>
    `block px-4 py-2 hover:bg-select transition ${
      location.pathname === path ? 'bg-select font-bold' : ''
    }`

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-green px-4 py-3 shadow sticky top-0 z-50 text-background">
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
        className={`flex h-screen md:relative top-0 left-0 z-40 h-full w-52 bg-green shadow-md transform transition-transform duration-200 text-background
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:flex md:flex-col`}
      >
        <div className="flex flex-col h-full py-6 space-y-2 bg-green">
          <Link to="/dashboard" className={"flex items-center w-full text-background px-4 py-2 hover:bg-select cursor-pointer"}>
            <House size={18} className="mr-2" /> Dashboard
          </Link>
          <Link to="/leaderboards" className={"flex items-center w-full text-background px-4 py-2 hover:bg-select cursor-pointer"}>
            <ChartLine size={18} className="mr-2" /> Leaderboards
          </Link>
          <Link to="/profile" className={"flex items-center w-full text-background px-4 py-2 hover:bg-select cursor-pointer"}>
            <User size={18} className="mr-2" /> Profile
          </Link>
          <button
            onClick={onSearchClick}
            className="flex items-center px-4 py-2 hover:bg-select cursor-pointer"
          >
            <Search size={18} className="mr-2" /> Search
          </button>

          <div className="mt-auto">
            {showProfileOption ? (
              <button
                onClick={() => logout()}
                className="flex items-center w-full text-background bg-accent px-4 py-2 hover:bg-accentHighlight cursor-pointer"
              >
                <LogOut size={18} className="mr-2" /> Sign out
              </button>
            ) : (
              <Link
                to="/"
                className="flex items-center w-full text-background px-4 py-2 hover:bg-select cursor-pointer"
              >
                <LogIn size={18} className="mr-2" /> Sign in
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-backgroundz-30 md:hidden text-green"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
