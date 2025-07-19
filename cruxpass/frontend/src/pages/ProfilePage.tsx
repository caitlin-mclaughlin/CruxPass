import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api'
import { formatAddress, formatDate, formatPhoneNumber } from '@/utils/formatters'
import DatePicker from 'react-datepicker'
import { MAX_AGE, MIN_AGE } from '@/constants/literal'
import { GENDER_OPTIONS, GenderEnumMap } from '@/constants/enum'
import CustomRadioGroup from '@/components/ui/CustomRadioGroup'

export default function ProfilePage() {
  const { token } = useAuth()
  const hasInitialized = useRef(false)
  const [profileType, setProfileType] = useState<'climber' | 'gym' | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedGender, setSelectedGender] = useState<string | null>(null)
  const today = new Date()
  const minDob = new Date(today.getFullYear() - MAX_AGE, today.getMonth(), today.getDate())
  const maxDob = new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate())

  useEffect(() => {
    if (!token) return

    api.get('/auth/me')
      .then(res => {
        if (res.data.type === 'climber') {
          setProfileType('climber')
          setProfile(res.data.climber)
          setFormData({ ...res.data.climber })
        } else if (res.data.type === 'gym') {
          setProfileType('gym')
          setProfile(res.data.gym)
          setFormData({ ...res.data.gym })
        }
      })
      .catch(err => console.error('Failed to load profile:', err))
      .finally(() => setLoading(false))
  }, [token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name.startsWith("address.")) {
      const field = name.split('.')[1]
      setFormData((prev: any) => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }))
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async () => {
    if (profileType === 'climber') {
      const dobDate = new Date(formData.dob)
      const age = today.getFullYear() - dobDate.getFullYear()
      if (age < MIN_AGE || age > MAX_AGE) {
        alert("Date of birth must be between ages " + MIN_AGE + " and " + MAX_AGE)
        return
      }
    }
    const endpoint = profileType === 'climber' ? '/climbers/me' : '/gyms/me'

    try {
      console.log(formData)
      await api.put(endpoint, formData)
      const res = await api.get('/auth/me')
      const updated = profileType === 'climber' ? res.data.climber : res.data.gym
      setProfile(updated)
      setFormData(updated)
      setEditing(false)
    } catch (err) {
      console.error("Failed to update profile:", err)
      alert("Profile update failed.")
    }
  }

  if (loading) return <div className="h-screen p-8 bg-background text-green">Loading...</div>
  if (!profile) return <div className="h-screen p-8 bg-background text-green">No profile found.</div>

  const renderInput = (label: string, name: string, value: any) => (
    <>
      <div className="font-medium text-green">{label}</div>
      <div className="text-green">
        {editing ? (
          <input
            name={name}
            value={value || ''}
            onChange={handleChange}
            className="bg-background border-b border-green outline-none w-full"
          />
        ) : (
          value
        )}
      </div>
    </>
  )

  return (
    <div className="h-screen p-8 bg-background text-green">
      <h2 className="text-xl font-semibold mb-4">
        {profileType === 'climber' ? 'Climber Profile' : 'Gym Profile'}
      </h2>

      <div className="grid grid-cols-2 gap-y-3 max-w-md rounded-md px-2 py-2 bg-shadow border border-green">
        {renderInput(profileType === 'climber' ? 'Name:' : 'Gym Name:', 'name', formData.name)}
        {renderInput('Email:', 'email', formData.email)}
        {renderInput('Phone:', 'phone', formatPhoneNumber(formData.phone))}
        {renderInput('Username:', 'username', formData.username)}

        {profileType === 'climber' && (
          <>
            <div className="font-medium text-green">Date of Birth:</div>
            <div className="text-green">
              {editing ? (
                <DatePicker
                  dateFormat="MM/dd/yyyy"
                  minDate={minDob}
                  maxDate={maxDob}
                  selected={formData.dob ? new Date(formData.dob) : null}
                  onChange={(date: Date | null) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      dob: date ? date.toISOString().split('T')[0] : ''
                    }))
                  }
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={50}
                  className="bg-background border-b border-green outline-none w-full"
                />
              ) : (
                formatDate(formData.dob)
              )}
            </div>

            <div className="font-medium text-green">Gender (Division):</div>
            <div className="text-green">
              {editing ? (
                <CustomRadioGroup
                  name="gender"
                  options={GENDER_OPTIONS.map(g => ({ 
                    value: g, 
                    label: GenderEnumMap[g as keyof typeof GenderEnumMap] 
                  }))}
                  selected={selectedGender}
                  onChange={(g: string) => {
                    setSelectedGender(g)
                    setFormData((prev: any) => ({ 
                      ...prev, 
                      gender: g
                    }))
                  }}
                />
              ) : (
                GenderEnumMap[formData.gender as keyof typeof GenderEnumMap] || ''
              )}
            </div>
          </>
        )}

        {/* Address Field */}
        <div className="font-medium text-green">Address:</div>
        <div className="text-green">
          {editing ? (
            <div className="grid grid-cols-1 gap-2">
              <input
                name="address.streetAddress"
                value={formData.address?.streetAddress || ''}
                placeholder="Street Address"
                onChange={handleChange}
                className="bg-background border-b border-green outline-none"
              />
              <input
                name="address.apartmentNumber"
                value={formData.address?.apartmentNumber || ''}
                placeholder="Apartment Number"
                onChange={handleChange}
                className="bg-background border-b border-green outline-none"
              />
              <input
                name="address.city"
                value={formData.address?.city || ''}
                placeholder="City"
                onChange={handleChange}
                className="bg-background border-b border-green outline-none"
              />
              <input
                name="address.state"
                value={formData.address?.state || ''}
                placeholder="State"
                onChange={handleChange}
                className="bg-background border-b border-green outline-none"
              />
              <input
                name="address.zipCode"
                value={formData.address?.zipCode || ''}
                placeholder="Zip Code"
                onChange={handleChange}
                className="bg-background border-b border-green outline-none"
              />
            </div>
          ) : (
            formatAddress(profile.address).split('\n').map((line, idx) => (
              <div key={idx}>{line}</div>
            ))
          )}
        </div>

        <div className="font-medium text-green">
          {profileType === 'climber' ? 'User Since:' : 'Gym Since:'}
        </div>
        <div className="text-green">{new Date(profile.createdAt).toLocaleDateString()}</div>
      </div>

      <div className="mt-6 space-x-4">
        {editing ? (
          <>
            <button onClick={handleSubmit} className="bg-green text-background px-4 py-1 rounded-md font-semibold">Save</button>
            <button onClick={() => { setEditing(false); setFormData(profile); }} className="bg-accent text-background px-4 py-1 rounded-md font-semibold">Cancel</button>
          </>
        ) : (
          <button 
            onClick={() =>  {          
              setEditing(true)
              if (profileType === 'climber' && formData.gender) {
                setSelectedGender(formData.gender)
              }}
            } 
            className="bg-green text-background px-4 py-1 rounded-md font-semibold"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  )
}
