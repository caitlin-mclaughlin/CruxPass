import { Link, useLocation } from 'react-router-dom'
import { LogOut, Search, Menu, LogIn, User, ChartLine, Calendar, House } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { useGymSession } from '@/context/GymSessionContext'
import { useClimberSession } from '@/context/ClimberSessionContext'
import { AccountType } from '@/constants/enum'
import { useSeriesSession } from '@/context/SeriesSessionContext'

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
  const { series } = useSeriesSession()
  const { logout, accountType } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect (() => {
    if ((accountType === AccountType.GYM && gym) ||
        (accountType === AccountType.CLIMBER && climber) ||
        (accountType === AccountType.SERIES && series)) {
      showProfileOption = true;
    } else {
      showProfileOption = false;
    }
  }, [gym, climber])

  const linkClasses = (path: string) =>
    `block px-4 py-2 hover:bg-select transition ${
      location.pathname === path ? 'bg-select font-bold' : ''
    }`

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-52 bg-green shadow-md transform transition-transform duration-200 text-background
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:flex md:flex-col
        `}
      >
        {/* Make the inner container stretch to full height and push signout to bottom */}
        <div className="flex flex-col h-full py-6 px-0">
          <nav className="flex flex-col gap-2">
            <Link to="/dashboard" className="flex items-center text-background px-4 py-2 hover:bg-select cursor-pointer">
              <House size={18} className="mr-2" /> Dashboard
            </Link>
{/*
            <Link to="/leaderboards" className="flex items-center text-background px-4 py-2 hover:bg-select cursor-pointer">
              <ChartLine size={18} className="mr-2" /> Leaderboards
            </Link>
            */}

            <Link to="/profile" className="flex items-center text-background px-4 py-2 hover:bg-select cursor-pointer">
              <User size={18} className="mr-2" /> Profile
            </Link>

            <button
              onClick={onSearchClick}
              className="flex items-center text-background px-4 py-2 hover:bg-select"
            >
              <Search size={18} className="mr-2" /> Search
            </button>
          </nav>

          {/* Spacer + footer */}
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

      {/* Mobile backdrop — only visible when menu open */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden z-30"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
