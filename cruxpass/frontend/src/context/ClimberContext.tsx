// context/ClimberContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import api from '@/services/api'
import { useAuth } from './AuthContext'

const ClimberContext = createContext<ClimberContextType | undefined>(undefined)

export function ClimberProvider({ children }: { children: ReactNode }) {
  const [climber, setClimber] = useState<Climber | null>(null)
  const { token } = useAuth()

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'CLIMBER') return;
    } catch (e) {
      console.warn("Failed to decode token:", e);
      return;
    }

    api.get('/climbers/me')
      .then(res => {
        const { id, name, email, gender, dob } = res.data
        setClimber({ id, name, email, gender, dob })
      })
      .catch(err => {
        console.warn('Could not fetch climber info:', err)
      })
  }, [token])

  return (
    <ClimberContext.Provider value={{ climber, setClimber }}>
      {children}
    </ClimberContext.Provider>
  )
}

export function useClimber() {
  const context = useContext(ClimberContext)
  if (!context) throw new Error('useClimber must be used within a ClimberProvider')
  return context
}
