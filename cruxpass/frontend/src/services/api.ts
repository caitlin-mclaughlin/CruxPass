// api.ts
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
})

export function attachToken(token: string) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export default api
