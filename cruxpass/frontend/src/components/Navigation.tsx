// src/components/Navigation.tsx
import { Link, useLocation } from "react-router-dom";
import { LogOut, Search, LogIn, User, House } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useGymSession } from "@/context/GymSessionContext";
import { useClimberSession } from "@/context/ClimberSessionContext";
import { useSeriesSession } from "@/context/SeriesSessionContext";
import { AccountType } from "@/constants/enum";
import monogram from "@/assets/monogram.png";
import logo from "@/assets/logo.png";

export default function Navigation({ onSearchClick, showProfileOption }: { onSearchClick: () => void; showProfileOption: boolean; }) {
  const location = useLocation();
  const { gym } = useGymSession();
  const { climber } = useClimberSession();
  const { series } = useSeriesSession();
  const { logout, accountType, token } = useAuth();

  const shouldShowProfile =
    (accountType === AccountType.GYM && !!gym) ||
    (accountType === AccountType.CLIMBER && !!climber) ||
    (accountType === AccountType.SERIES && !!series);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* MOBILE TOP BAR (hidden on md+) */}
      <header data-top-nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-green text-background px-4 py-3 shadow md:hidden">
        <Link to="/" className="flex items-center gap-x-2">
          <img src={monogram} alt="CruxPass Logo" className="h-11 w-auto" />
          <div className="font-bold text-2xl">CruxPass</div>
        </Link>
      </header>

      {/* MOBILE BOTTOM NAV: 4 equal columns — rightmost can be accent */}
      <nav data-bottom-nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="grid grid-cols-4">
          <Link to="/" className="flex flex-col items-center gap-1 py-3 bg-green text-background">
            <House size={20} />
            <span className="text-xs">Dashboard</span>
          </Link>

          <Link to="/profile" className="flex flex-col items-center gap-1 py-3 bg-green text-background">
            <User size={20} />
            <span className="text-xs">Profile</span>
          </Link>

          <button onClick={onSearchClick} className="flex flex-col items-center gap-1 py-3 bg-green text-background">
            <Search size={20} />
            <span className="text-xs">Search</span>
          </button>

          {/* Right quadrant — accent if signed-in (token present), otherwise remain green */}
          {token ? (
            <button onClick={() => logout()} className="flex flex-col items-center gap-1 py-3 bg-accent text-background">
              <LogOut size={20} />
              <span className="text-xs">Sign out</span>
            </button>
          ) : (
            <Link to="/login" className="flex flex-col items-center gap-1 py-3 bg-green text-background">
              <LogIn size={20} />
              <span className="text-xs">Sign in</span>
            </Link>
          )}
        </div>
      </nav>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:flex-col md:w-52 bg-green text-background shadow-md">
        <div className="flex flex-col h-full py-2">
          <div className="flex justify-center p-1">
            <img src={logo} alt="CruxPass Logo" className="h-30 w-auto" />
          </div>

          <nav className="flex flex-col gap-2">
            <Link to="/" className={`flex items-center px-4 py-2 hover:bg-select ${isActive("/") ? "bg-select font-bold" : ""}`}>
              <House size={18} className="mr-2" />
              <span className="relative top-[1px]">Dashboard</span>
            </Link>
            <Link to="/profile" className={`flex items-center px-4 py-2 hover:bg-select ${isActive("/profile") ? "bg-select font-bold" : ""}`}>
              <User size={18} className="mr-2" />
              <span className="relative top-[1px]">Profile</span>
            </Link>
            <button onClick={onSearchClick} className="flex items-center px-4 py-2 hover:bg-select">
              <Search size={18} className="mr-2" />
              <span className="relative top-[1px]">Search</span>
            </button>
          </nav>

          <div className="mt-auto pb-3">
            {shouldShowProfile ? (
              <button onClick={() => logout()} className="flex items-center w-full bg-accent px-4 py-2 hover:bg-accentHighlight">
                <LogOut size={18} className="mr-2" />
                <span className="relative top-[1px]">Sign out</span>
              </button>
            ) : (
              <Link to="/login" className="flex items-center w-full px-4 py-2 hover:bg-select">
                <LogIn size={18} className="mr-2" /> 
                <span className="relative top-[1px]">Sign in</span>
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
