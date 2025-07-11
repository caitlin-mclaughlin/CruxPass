import { NavLink } from 'react-router-dom'

export default function TopNav() {
  return (
    <nav className="hidden md:flex justify-between items-center px-6 py-3 bg-white border-b shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="text-xl font-bold text-blue-600">CruxPass</div>
      <div className="flex gap-6 text-sm">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "text-blue-600" : "text-gray-600"}>Dashboard</NavLink>
        <NavLink to="/search" className={({ isActive }) => isActive ? "text-blue-600" : "text-gray-600"}>Search</NavLink>
        <NavLink to="/leaderboard" className={({ isActive }) => isActive ? "text-blue-600" : "text-gray-600"}>Leaderboard</NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? "text-blue-600" : "text-gray-600"}>Profile</NavLink>
      </div>
    </nav>
  )
}
