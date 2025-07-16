import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api'
import { formatAddress, formatPhoneNumber } from '@/utils/formatters'

export default function ProfilePage() {
  const { token } = useAuth()
  const [climberProfile, setClimberProfile] = useState<any | null>(null)
  const [gymProfile, setGymProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    // Try loading climber first
    api.get('/climbers/me')
      .then(res => setClimberProfile(res.data))
      .catch(() => {
        // If climber fetch fails, try gym
        api.get('/gyms/me')
          .then(res => setGymProfile(res.data))
          .catch(err => {
            console.error('Failed to fetch profile:', err)
          })
          .finally(() => setLoading(false))
      })
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <div>Loading...</div>

  if (climberProfile) {
    return (
      <div className="h-screen p-8 bg-background text-base">
        <h2 className="text-xl font-semibold mb-4">Climber Profile</h2>

        <div className="grid grid-cols-2 gap-y-3 max-w-md rounded-md px-2 py-2 bg-shadow border border-base">
          <div className="font-medium text-base">Name:</div>
          <div className="text-base">{climberProfile.name}</div>

          <div className="font-medium text-base">Email:</div>
          <div className="text-base">{climberProfile.email}</div>

          <div className="font-medium text-base">Phone:</div>
          <div className="text-base">{formatPhoneNumber(climberProfile.phone)}</div>

          <div className="font-medium text-base">Username:</div>
          <div className="text-base">{climberProfile.username}</div>

          <div className="font-medium text-base">Date of Birth:</div>
          <div className="text-base">{climberProfile.dob}</div>

          <div className="font-medium text-base">Address:</div>
          <div className="text-sm">
            {formatAddress(climberProfile.address).split('\n').map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>

          <div className="font-medium text-base">User Since:</div>
          <div className="text-base">{new Date(climberProfile.createdAt).toLocaleDateString()}</div>
        </div>
      </div>
    )
  }

  if (gymProfile) {
    return (
      <div className="h-screen p-8 bg-background text-base">
        <h2 className="text-xl font-semibold mb-4">Gym Profile</h2>

        <div className="grid grid-cols-2 gap-y-3 max-w-md rounded-md px-2 py-2 bg-shadow border border-base">
          <div className="font-medium text-base">Gym Name:</div>
          <div className="text-base">{gymProfile.name}</div>

          <div className="font-medium text-base">Email:</div>
          <div className="text-base">{gymProfile.email}</div>

          <div className="font-medium text-base">Phone:</div>
          <div className="text-base">{formatPhoneNumber(gymProfile.phone)}</div>

          <div className="font-medium text-base">Username:</div>
          <div className="text-base">{gymProfile.username}</div>

          <div className="font-medium text-base">Address:</div>
          <div className="text-base">
            {formatAddress(gymProfile.address).split('\n').map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>

          <div className="font-medium text-base">Gym Since:</div>
          <div className="text-base">{new Date(gymProfile.createdAt).toLocaleDateString()}</div>
        </div>
      </div>
    )
  }

  return <div className="p-8">No profile found.</div>
}
