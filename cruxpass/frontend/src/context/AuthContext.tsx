// AuthContext.tsx
import { createContext, useState, useContext, useEffect, ReactNode } from 'react'
import api from '../services/api'

interface AuthContextType {
  token: string | null
  login: (token: string) => void
  logout: () => void
  skipLogin: () => void
  guest: boolean
}

// ✅ Provide default (dummy) values to silence TS warning
const AuthContext = createContext<AuthContextType>({
  token: null,
  login: () => {},
  logout: () => {},
  skipLogin: () => {},
  guest: false
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [guest, setGuest] = useState(false)

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])
    
  function login(newToken: string) {
    setToken(newToken)
    localStorage.setItem('token', newToken)
  }

  function logout() {
    setToken(null)
    localStorage.removeItem('token')
  }

  function skipLogin() {
    setToken(null)
    setGuest(true)
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, skipLogin, guest }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
