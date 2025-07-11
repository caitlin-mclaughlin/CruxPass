// Navigation.tsx
import { NavLink } from 'react-router-dom'
import { Home, User, Search, Trophy, Clock } from 'lucide-react'

export default function Navigation({ onSearchClick }: { onSearchClick: () => void }) {
  const base = "flex flex-col items-center text-xs"
  const active = "text-blue-600"
  const inactive = "text-gray-500"

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 md:hidden z-50">
      <NavLink to="/dashboard" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <Home className="w-5 h-5" />
        Home
      </NavLink>
      <button onClick={onSearchClick} className={`${base} ${inactive}`}>
        <Search className="w-5 h-5" />
        Search
      </button>
      <NavLink to="/leaderboards" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <Trophy className="w-5 h-5" />
        Leaderboard
      </NavLink>
      <NavLink to="/recent" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <Clock className="w-5 h-5" />
        Recent
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <User className="w-5 h-5" />
        Profile
      </NavLink>
    </nav>
  )
}
