// ProfilePage.tsx
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api'

export default function ProfilePage() {
  const { token } = useAuth()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (token) {
      api.get('/users/me').then(res => setProfile(res.data))
    }
  }, [token])

  if (!profile) return <div>Loading...</div>

  return (
    <div className="flex h-screen p-8 bg-background text-base">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <div>Name: {profile.name}</div>
      <div>Email: {profile.email}</div>
      <div>Username: {profile.username}</div>
      <div>Phone: {profile.phone}</div>
      {/* You can add address and DOB here as well */}
    </div>
  )
}
