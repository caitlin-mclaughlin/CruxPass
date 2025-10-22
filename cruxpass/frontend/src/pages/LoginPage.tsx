import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useClimberSession } from '@/context/ClimberSessionContext'
import { useGymSession } from '@/context/GymSessionContext'
import { Input } from '@/components/ui/Input'
import { useNavigate } from 'react-router-dom'
import { EnumSelect } from '@/components/ui/EnumSelect'
import { formatPhoneNumber, stripNonDigits } from '@/utils/formatters'
import CustomRadioGroup from '@/components/ui/CustomRadioGroup'
import { AccountType, AccountTypeDisplay, Gender, GENDER_OPTIONS, GenderEnumMap } from '@/constants/enum'
import SegmentedDateInput from '@/components/ui/SegmentedDateInput'
import { useSeriesSession } from '@/context/SeriesSessionContext'
import logo from '@/assets/logo_transparent.png'
import { PasswordInput } from '@/utils/uiRendering'
import { Button } from '@/components/ui/Button'

export default function Login() {
  const navigate = useNavigate()
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    accountType: AccountType.CLIMBER,
    name: "",
    email: "",
    username: "",
    phone: "",
    dob: null as Date | null,
    gender: null as Gender | null,
    password: "",
    confirmPassword: "",
    emailOrUsername: "",
    address: {
      streetAddress: "",
      apartmentNumber: "",
      city: "",
      state: "",
      zipCode: ""
    },
    emergencyName: "",
    emergencyPhone: ""
  })
  const [errorMessage, setErrorMessage] = useState<string>("")
  const { login, register, skipLogin, token } = useAuth()
  const { refreshClimber } = useClimberSession()
  const { refreshGym } = useGymSession()
  const { refreshSeries } = useSeriesSession()
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (token) navigate("/dashboard")
  }, [token, navigate])

  useEffect(() => {
    setInvalidFields(new Set())
    setErrorMessage("")
  }, [isCreating])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setErrorMessage("");
    const { name, value } = e.target;

    // Clear invalid flag
    setInvalidFields(prev => {
      const updated = new Set(prev);
      updated.delete(name);
      return updated;
    });

    if (name.startsWith("address.")) {
      if (!formData.address) return;
      const key = name.split(".")[1] as keyof typeof formData.address;
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [key]: value }
      }));
    } else if (name === "phone" || name === "emergencyPhone") {
      setFormData(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDobChange = (date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      dob: date,
    }));

    setInvalidFields((prev) => {
      const updated = new Set(prev);
      if (date) updated.delete("dob");
      return updated;
    });
  };

  const getRequiredFields = (): string[] => {
    if (!isCreating) return ["emailOrUsername", "password"];
    if (formData.accountType === AccountType.CLIMBER) {
      return [
        "name", "email", "phone", "password", "confirmPassword", "dob", "gender",
        "address.streetAddress", "address.city", "address.state", "address.zipCode"
      ];
    } else if (formData.accountType === AccountType.GYM) {
      return [
        "name", "email", "phone", "password", "confirmPassword",
        "address.streetAddress", "address.city", "address.state", "address.zipCode"
      ];
    } else if (formData.accountType === AccountType.SERIES) {
      return [
        "name", "email", "password", "confirmPassword",
      ];
    }
    return [];
  };

  const getFieldValue = (field: string): string => {
    if (field === "dob") {
      return formData.dob instanceof Date ? formData.dob.toISOString() : "";
    }

    if (field.startsWith("address.")) {
      const key = field.split(".")[1] as keyof typeof formData.address;
      return formData.address[key];
    }

    return (formData as any)[field] || "";
  };


  const validateForm = (): boolean => {
    const required = getRequiredFields();
    const invalid = required.filter(field => !getFieldValue(field).trim());

    if (invalid.length > 0) {
      setInvalidFields(new Set(invalid));
      return false;
    }

    setInvalidFields(new Set());
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setErrorMessage("Please fill out all required fields.")
      return
    }

    // --- password match check ---
    if (isCreating && formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setInvalidFields(prev => new Set([...prev, "password", "confirmPassword"]));
      return;
    }

    try {
      if (isCreating) {
        if (!formData.accountType) return
        if (formData.accountType === AccountType.CLIMBER) {
          // CLIMBER registration
          await register(AccountType.CLIMBER, {
            name: formData.name,
            email: formData.email,
            username: formData.username?.trim() !== '' ? formData.username.trim() : formData.email,
            phone: stripNonDigits(formData.phone),
            dob: formData.dob?.toISOString().split('T')[0],
            gender: formData.gender,
            password: formData.password,
            address: formData.address,
            emergencyName: formData.emergencyName,
            emergencyPhone: stripNonDigits(formData.emergencyPhone)
          });
        } else if (formData.accountType === AccountType.GYM) {
          // GYM registration
          await register(AccountType.GYM, {
            name: formData.name,
            email: formData.email,
            username: formData.username?.trim() !== '' ? formData.username.trim() : formData.email,
            phone: stripNonDigits(formData.phone),
            password: formData.password,
            address: formData.address
          });
        } else {
          // SERIES registration
          await register(AccountType.SERIES, {
            name: formData.name,
            email: formData.email,
            username: formData.username?.trim() !== '' ? formData.username.trim() : formData.email,
            password: formData.password
          });
        }
      } else {
        await login({
          emailOrUsername: formData.emailOrUsername,
          password: formData.password
        });
      }

      if (formData.accountType === AccountType.CLIMBER) {
        await refreshClimber()
      } else if (formData.accountType === AccountType.GYM)  {
        await refreshGym()
      } else {
        await refreshSeries()
      }
      navigate("/dashboard")

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

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="flex flex-col items-center w-full overflow-y-auto scrollbar-thin-green p-4 pb-4">
        <img src={logo} alt="CruxPass Logo" className="h-75 w-auto " />
        <h1 className="text-green text-2xl font-bold mb-2" >
          {isCreating ? "Create Account" : "Login"}
        </h1>

        <form onSubmit={handleSubmit} noValidate className="w-full px-2 space-y-3 max-w-lg">
          {isCreating ? (
            <>
              {/* Climber / Gym / Series Organizer drop down menu */}
              <EnumSelect
                labelMap={AccountTypeDisplay}
                options={Object.values(AccountType)}
                value={formData.accountType}
                onChange={(val: AccountType) => {
                  setFormData(prev => ({
                    ...prev,
                    accountType: val,
                    ...(val === AccountType.GYM
                      ? { dob: null, gender: null }
                      : val === AccountType.SERIES
                      ? { dob: null, gender: null, phone: "", address: {
                          streetAddress: "",
                          apartmentNumber: "",
                          city: "",
                          state: "",
                          zipCode: ""
                        }}
                      : {}
                    )
                  }))
                }}
              />
              {/* Name */}
              <Input name="name" value={formData.name} onChange={handleChange} 
                placeholder={
                  formData.accountType === AccountType.CLIMBER ? "Full Name" :
                  formData.accountType === AccountType.GYM ? "Gym Name" :
                  "Series Name"
                } 
                required 
              />
              {/* Email */}
              <Input name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
              {formData.accountType !== AccountType.SERIES && (
                <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required />
              )}
              {/* Username */}
              <Input name="username" value={formData.username} onChange={handleChange} placeholder="Username (optional)" />
              {/* Password */}
              <PasswordInput
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <PasswordInput
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm Password"
              />

              {/* Climber Specific Fields: DOB and Gender */}
              {formData.accountType === AccountType.CLIMBER && (
                <div className="flex flex-col">
                  <label htmlFor="dob" className="mb-1 font-medium text-green" >
                    Date of Birth:
                  </label>
                  <div className="w-full bg-shadow rounded-md">
                    <SegmentedDateInput
                      mode="birthday"
                      value={formData.dob}
                      onChange={handleDobChange}
                    />
                  </div>
                  <label htmlFor="gender" className="mt-3 mb-1 font-medium text-green" >
                    Gender (For Competition Genders):
                  </label>
                  <div className="px-3 py-1 bg-shadow border border-green rounded-md shadow-md">
                    <CustomRadioGroup
                      name="gender"
                      options={GENDER_OPTIONS.map(g => ({ 
                        value: g, 
                        label: GenderEnumMap[g as keyof typeof GenderEnumMap]
                      }))}
                      selected={formData.gender}
                      onChange={(g: string) => {
                        setFormData((prev: any) => ({ 
                          ...prev, 
                          gender: g
                        }))
                      }}
                    />
                  </div>
                  {/* Emergency Contact Name and Phone */}
                  <div className="space-y-3 mt-3 mb-1 ">
                    <label className="font-medium text-green" >
                      Emergency Contact:
                    </label>
                    <Input name="emergencyName" value={formData.emergencyName} onChange={handleChange} placeholder="Full Name (Emergency Contact)" required />
                    <Input name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} placeholder="Phone Number (Emergency Contact)" required />
                  </div>
                </div>
              )}

              {formData.accountType !== AccountType.SERIES && (
                <>
                  <label htmlFor="address" className="mt-3 mb-1 font-medium text-green" >
                    Address:
                  </label>
                  <Input name="address.streetAddress" value={formData.address.streetAddress} onChange={handleChange} placeholder="Street Address" required />
                  <Input name="address.apartmentNumber" value={formData.address.apartmentNumber} onChange={handleChange} placeholder="Apartment (optional)" />
                  <Input name="address.city" value={formData.address.city} onChange={handleChange} placeholder="City" required />
                  <Input name="address.state" value={formData.address.state} onChange={handleChange} placeholder="State" required />
                  <Input name="address.zipCode" value={formData.address.zipCode} onChange={handleChange} placeholder="Zip Code" required />
                </>
              )}
            </>
          ) : (
            <>
              <Input name="emailOrUsername" value={formData.emailOrUsername} onChange={handleChange} placeholder="Email or Username" required />
              <Input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
            </>
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
              navigate("/dashboard")
            }}
            className="text-green underline hover:text-select"
          >
            Skip login
          </button>
        </form>
      </div>
    </div>
  )
}
