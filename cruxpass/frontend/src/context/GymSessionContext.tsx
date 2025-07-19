// GymSessionContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import api from '@/services/api'
import { useAuth } from './AuthContext'

const GymSessionContext = createContext<GymSessionContextType | undefined>(undefined)

export function GymSessionProvider({ children }: { children: ReactNode }) {
  const [gymSession, setGymSession] = useState<GymSession | null>(null)
  const { token } = useAuth()

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'GYM') return;
    } catch (e) {
      console.warn("Failed to decode token:", e);
      return;
    }

    api.get('/gyms/me')
      .then(res => {
        const { id, name, address } = res.data.gym ?? res.data;
        const fullAddress = `${address.streetAddress}, ${address.city}, ${address.state} ${address.zipCode}`;
        setGymSession({
          id: id,
          gymName: name,
          gymAddress: fullAddress
        });
      })
      .catch(err => {
        console.warn('Not logged in as a gym or token invalid:', err);
      });
  }, [token]);

  return (
    <GymSessionContext.Provider value={{ gymSession, setGymSession }}>
      {children}
    </GymSessionContext.Provider>
  )
}

export function useGymSession() {
  const context = useContext(GymSessionContext)
  if (!context) throw new Error('useGymSession must be used within a GymSessionProvider')
  return context
}
