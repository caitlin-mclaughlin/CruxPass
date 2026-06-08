import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'

import { AccountType, USState } from '@/constants/enum'
import { useAuth } from '@/context/AuthContext'
import { useClimberSession } from '@/context/ClimberSessionContext'
import { useGymSession } from '@/context/GymSessionContext'
import { useSeriesSession } from '@/context/SeriesSessionContext'
import { formatPhoneNumber, stripNonDigits } from '@/utils/formatters'
import { formatForApi } from '@/utils/datetime'
import { useIsMobile } from '@/hooks/isMobile'
import { Address, ClimberLocation } from '@/models/domain'
import logo from '@/assets/logo_transparent.png'
import { Button } from '@/components/ui/Button'
import PageContainer from '@/components/PageContainer'
import { AccountTypeSelect } from '@/components/auth/AccountTypeSelect'
import { ClimberSignupForm } from '@/components/auth/ClimberSignupForm'
import { GymSignupForm } from '@/components/auth/GymSignupForm'
import { LoginForm } from '@/components/auth/LoginForm'
import { SeriesSignupForm } from '@/components/auth/SeriesSignupForm'
import { LoginFormData } from '@/components/auth/types'

const initialFormData: LoginFormData = {
  accountType: AccountType.CLIMBER,
  name: "",
  email: "",
  username: "",
  phone: "",
  dob: null,
  gender: null,
  password: "",
  confirmPassword: "",
  emailOrUsername: "",
  address: {
    streetAddress: "",
    apartmentNumber: "",
    city: "",
    state: "UNSET" as USState,
    zipCode: ""
  },
  emergencyName: "",
  emergencyPhone: "",
  seriesDescription: "",
  seriesStartDate: null,
  seriesEndDate: null,
  seriesDeadline: null,
}

export default function Login() {
  const navigate = useNavigate()
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<LoginFormData>(initialFormData)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set())
  const { login, register, skipLogin, token } = useAuth()
  const { refreshClimber } = useClimberSession()
  const { refreshGym } = useGymSession()
  const { refreshSeries } = useSeriesSession()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (token) navigate("/")
  }, [token, navigate])

  useEffect(() => {
    setInvalidFields(new Set())
    setErrorMessage("")
  }, [isCreating])

  const clearInvalidField = (field: string) => {
    setInvalidFields(prev => {
      const updated = new Set(prev)
      updated.delete(field)
      return updated
    })
  }

  const handleAccountTypeChange = (accountType: AccountType) => {
    setFormData(prev => ({
      ...prev,
      accountType,
      dob: accountType === AccountType.CLIMBER ? prev.dob : null,
      gender: accountType === AccountType.CLIMBER ? prev.gender : null,
      phone: accountType === AccountType.SERIES ? "" : prev.phone,
      address: {
        streetAddress: "",
        apartmentNumber: "",
        city: "",
        state: "UNSET" as USState,
        zipCode: "",
      },
    }))
    setInvalidFields(new Set())
    setErrorMessage("")
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setErrorMessage("")
    const { name, value } = e.target
    clearInvalidField(name)

    if (name.startsWith("address.")) {
      const key = name.split(".")[1] as keyof LoginFormData["address"]
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [key]: value }
      }))
    } else if (name === "phone" || name === "emergencyPhone") {
      setFormData(prev => ({ ...prev, [name]: formatPhoneNumber(value) }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const getRequiredFields = (): string[] => {
    if (!isCreating) return ["emailOrUsername", "password"]
    if (formData.accountType === AccountType.CLIMBER) {
      return [
        "name", "email", "phone", "password", "confirmPassword", "dob", "gender",
        "address.city", "address.state", "address.zipCode"
      ]
    }
    if (formData.accountType === AccountType.GYM) {
      return [
        "name", "email", "phone", "password", "confirmPassword",
        "address.streetAddress", "address.city", "address.state", "address.zipCode"
      ]
    }
    return [
      "name", "email", "password", "confirmPassword", "seriesStartDate", "seriesEndDate", "seriesDeadline",
    ]
  }

  const getFieldValue = (field: string): string => {
    if (field === "dob") {
      return formData.dob instanceof Date ? formData.dob.toISOString() : ""
    }
    if (field === "seriesStartDate" || field === "seriesEndDate" || field === "seriesDeadline") {
      const value = formData[field]
      return value instanceof Date ? value.toISOString() : ""
    }
    if (field.startsWith("address.")) {
      const key = field.split(".")[1] as keyof LoginFormData["address"]
      return formData.address[key]
    }
    return (formData as any)[field] || ""
  }

  const validateForm = (): boolean => {
    const invalid = getRequiredFields().filter(field => !getFieldValue(field).trim())

    if (invalid.length > 0) {
      setInvalidFields(new Set(invalid))
      return false
    }

    setInvalidFields(new Set())
    return true
  }

  const refreshActiveSession = async () => {
    if (formData.accountType === AccountType.CLIMBER) {
      await refreshClimber()
    } else if (formData.accountType === AccountType.GYM)  {
      await refreshGym()
    } else {
      await refreshSeries()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setErrorMessage("Please fill out all required fields.")
      return
    }

    if (isCreating && formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.")
      setInvalidFields(prev => new Set([...prev, "password", "confirmPassword"]))
      return
    }

    try {
      if (isCreating) {
        if (formData.accountType === AccountType.CLIMBER) {
          await register(AccountType.CLIMBER, {
            name: formData.name,
            email: formData.email,
            username: formData.username?.trim() !== '' ? formData.username.trim() : formData.email,
            phone: stripNonDigits(formData.phone),
            dob: formData.dob?.toISOString().split('T')[0] ?? null,
            gender: formData.gender,
            password: formData.password,
            address: {
              city: formData.address.city.trim(),
              state: formData.address.state,
              zipCode: formData.address.zipCode.trim(),
            } as ClimberLocation,
            emergencyName: formData.emergencyName,
            emergencyPhone: stripNonDigits(formData.emergencyPhone)
          })
        } else if (formData.accountType === AccountType.GYM) {
          await register(AccountType.GYM, {
            name: formData.name,
            email: formData.email,
            username: formData.username?.trim() !== '' ? formData.username.trim() : formData.email,
            phone: stripNonDigits(formData.phone),
            password: formData.password,
            address: formData.address as Address
          })
        } else {
          await register(AccountType.SERIES, {
            name: formData.name,
            email: formData.email,
            username: formData.username?.trim() !== '' ? formData.username.trim() : formData.email,
            password: formData.password,
            description: formData.seriesDescription.trim(),
            startDate: format(formData.seriesStartDate!, 'yyyy-MM-dd'),
            endDate: format(formData.seriesEndDate!, 'yyyy-MM-dd'),
            deadline: formatForApi(formData.seriesDeadline!)
          })
        }
      } else {
        await login({
          emailOrUsername: formData.emailOrUsername,
          password: formData.password
        })
      }

      await refreshActiveSession()
      navigate("/")
    } catch (err: any) {
      console.error("Login error:", err.response?.data)
      const msg =
        typeof err?.response?.data?.message === "string"
          ? err.response.data.message
          : typeof err?.response?.data === "string"
          ? err.response.data
          : err.message || "Login failed"
      setErrorMessage(msg)
    }
  }

  const renderCreateForm = () => {
    if (formData.accountType === AccountType.CLIMBER) {
      return (
        <ClimberSignupForm
          formData={formData}
          setFormData={setFormData}
          onChange={handleChange}
          clearInvalidField={clearInvalidField}
        />
      )
    }

    if (formData.accountType === AccountType.GYM) {
      return (
        <GymSignupForm
          formData={formData}
          setFormData={setFormData}
          onChange={handleChange}
          clearInvalidField={clearInvalidField}
        />
      )
    }

    return (
      <SeriesSignupForm
        formData={formData}
        setFormData={setFormData}
        onChange={handleChange}
        clearInvalidField={clearInvalidField}
        isMobile={isMobile}
      />
    )
  }

  return (
    <PageContainer>
      <div className="h-full w-full flex flex-col items-center justify-center pb-6">
        <img src={logo} alt="CruxPass Logo" className="h-75 w-auto" />
        <div className={`w-full max-w-lg flex flex-col items-center overflow-y-auto scrollbar-thin-green scroll-smooth px-4 ${isCreating ? 'h-full' : ''}`}>
          <h1 className="text-green text-2xl font-bold mb-2">
            {isCreating ? "Create Account" : "Login"}
          </h1>

          <form onSubmit={handleSubmit} noValidate className="w-full px-2 space-y-4 max-w-lg">
            {isCreating ? (
              <>
                <AccountTypeSelect value={formData.accountType} onChange={handleAccountTypeChange} />
                {renderCreateForm()}
              </>
            ) : (
              <LoginForm formData={formData} onChange={handleChange} />
            )}

            {errorMessage && (
              <div className="bg-background text-accent">{errorMessage}</div>
            )}

            <Button type="submit" className="mb-1 w-full">
              {isCreating ? "Create Account" : "Login"}
            </Button>

            <button
              type="button"
              onClick={() => {
                setIsCreating(!isCreating)
                setFormData(prev => ({
                  ...prev,
                  emailOrUsername: "",
                  password: "",
                }))
              }}
              className="text-green mb-1 underline block hover:text-select"
            >
              {isCreating ? "Already have an account?" : "Don't have an account? Create one"}
            </button>

            <button
              type="button"
              onClick={() => {
                skipLogin()
                navigate("/")
              }}
              className="text-green underline hover:text-select"
            >
              Skip login
            </button>
          </form>
        </div>
      </div>
    </PageContainer>
  )
}
