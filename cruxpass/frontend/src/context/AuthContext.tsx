// AuthContext.tsx
import { createContext, useState, useContext, useEffect, ReactNode } from 'react'
import api from '../services/api'

interface AuthContextType {
  token: string | null
  login: (token: string) => void
  logout: () => void
}

// ✅ Provide default (dummy) values to silence TS warning
const AuthContext = createContext<AuthContextType>({
  token: null,
  login: () => {},
  logout: () => {}
})

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState(localStorage.getItem('token'))

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

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
  return useContext(AuthContext)
}
