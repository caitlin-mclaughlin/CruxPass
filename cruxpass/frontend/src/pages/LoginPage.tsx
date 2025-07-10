import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api, { attachToken } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const res = await api.post('/auth/login', { email, password })
      const token = res.data.token
      login(token)
      attachToken(token)
    } catch {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">CruxPass Login</h1>
      <form className="flex flex-col gap-3 w-full" onSubmit={handleSubmit}>
        <input
          className="border p-2 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoFocus
        />
        <input
          className="border p-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-600">{error}</div>}
        <button
          className="bg-blue-600 text-white p-2 rounded mt-2"
          type="submit"
        >
          Log In
        </button>
      </form>
    </div>
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const res = await api.post('/auth/login', { email, password })
      const token = res.data.token
      login(token)
      attachToken(token)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password')
    }
  }
}
