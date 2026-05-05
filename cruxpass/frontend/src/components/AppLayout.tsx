// src/components/AppLayout.tsx
import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import FloatingSearch from "@/components/ui/FloatingSearch";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "react-router-dom";
import useViewportVars from "@/hooks/useViewportVars"; // <-- new
import api from "@/services/apiService";

export function useAttachToken() {
  const { token } = useAuth()
  React.useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [showSearch, setShowSearch] = useState(false);
  const { token } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  useViewportVars();

  return (
    <div className="w-full h-screen flex bg-background text-green">
      {!isLoginPage && (
        <Navigation
          onSearchClick={() => setShowSearch(p => !p)}
          showProfileOption={token !== null}
        />
      )}

      {/* MAIN CONTENT */}
      <main
        className="
          flex-1
          overflow-y-auto
          md:overflow-y-auto
        "
        style={{
          // mobile only padding
          paddingTop: "calc(var(--top-nav-height) + var(--safe-top))",
          paddingBottom: "calc(var(--bottom-nav-height) + var(--safe-bottom))",
        }}
      >
        {showSearch && <FloatingSearch onClose={() => setShowSearch(false)} />}
        {children}
      </main>
    </div>
  );
}
