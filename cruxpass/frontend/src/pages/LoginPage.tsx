import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { AccountTypeSelect } from '@/components/AccountTypeSelect'
import { formatPhoneNumber, stripNonDigits } from '@/utils/formatters'
import DatePicker from "react-datepicker";
import { MAX_AGE, MIN_AGE } from '@/constants/literal'
import CustomRadioGroup from '@/components/ui/CustomRadioGroup'
import { GENDER_OPTIONS, GenderEnumMap } from '@/constants/enum'

export default function Login() {
  const navigate = useNavigate()
  const [isCreating, setIsCreating] = useState(false)
  const accountTypes = [
    { label: 'Climber', value: 'climber' },
    { label: 'Gym', value: 'gym' }
  ]
  const [formData, setFormData] = useState({
    accountType: "climber",
    name: "",
    email: "",
    username: "",
    phone: "",
    dob: "",
    gender: "",
    password: "",
    emailOrUsername: "",
    address: {
      streetAddress: "",
      apartmentNumber: "",
      city: "",
      state: "",
      zipCode: ""
    }
  })
  const [errorMessage, setErrorMessage] = useState<string>("")
  const { login, token, skipLogin } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [selectedGender, setSelectedGender] = useState<string | null>(null)
  const today = new Date()
  const minDob = new Date(today.getFullYear() - MAX_AGE, today.getMonth(), today.getDate())
  const maxDob = new Date(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate())

  useEffect(() => {
    if (token) navigate("/dashboard")
  }, [token, navigate])

  useEffect(() => {
    setInvalidFields(new Set())
    setSubmitted(false)
    setErrorMessage("")
  }, [isCreating])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setErrorMessage("");
    const { name, value } = e.target;

    if (name === "accountType" && value === "gym") {
      setFormData(prev => ({ ...prev, dob: "" }));
    }

    // Clear invalid flag for this field
    setInvalidFields(prev => {
      const updated = new Set(prev);
      updated.delete(name);
      return updated;
    });

    if (name.startsWith("address.")) {
      const key = name.split(".")[1] as keyof typeof formData.address;
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [key]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (name === "phone") {
      setFormData(prev => ({ ...prev, phone: formatPhoneNumber(value) }));
    } else if (name.startsWith("address.")) {
      const key = name.split(".")[1] as keyof typeof formData.address;
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [key]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDobChange = (date: Date | null) => {
    setFormData((prev: any) => ({
      ...prev,
      dob: date ? date.toISOString().split('T')[0] : ''
    }))

    // Clear invalid field
    setInvalidFields(prev => {
      const updated = new Set(prev)
      updated.delete("dob")
      return updated
    })
  }

  const getRequiredFields = (): string[] => {
    if (!isCreating) return ["emailOrUsername", "password"];
    return [
      "name", "email", "phone", "password",
      "address.streetAddress", "address.city", "address.state", "address.zipCode"
    ];
  };

  const getFieldValue = (field: string): string => {
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
    setSubmitted(true)

    if (!validateForm()) {
      setErrorMessage("Please fill out all required fields.")
      return
    }

    try {
      if (isCreating) {
        const res = await api.post(`/auth/register/${formData.accountType}`, {
          name: formData.name,
          email: formData.email,
          username: formData.username?.trim() !== '' ? formData.username.trim() : formData.email,
          phone: stripNonDigits(formData.phone),
          dob: formData.dob || null,
          gender: formData.gender || null,
          password: formData.password,
          address: formData.address
        })
        login(res.data.token)
        navigate("/dashboard")
      } else {
        const res = await api.post("/auth/login", {
          emailOrUsername: formData.emailOrUsername,
          password: formData.password
        })
        login(res.data.token)
        navigate("/dashboard")
      }
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

  const inputClass = (field: string) => {
    const base = "form-input"; // use a class that handles styling via global.css

    return invalidFields.has(field)
      ? `${base} border-accent text-accent placeholder-accent`
      : base;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 bg-background">
      <h1 className="text-green text-2xl font-bold mb-4" >
        {isCreating ? "Create Account" : "Login"}
      </h1>

      <form onSubmit={handleSubmit} noValidate className="space-y-3 w-full max-w-md">
        {isCreating ? (
          <>
            {/* Climber / Gym drop down menu */}
            <AccountTypeSelect
              value={formData.accountType}
              onChange={(val) => setFormData(prev => ({ ...prev, accountType: val }))}
            />

            <input name="name" value={formData.name} onChange={handleChange} placeholder={formData.accountType !== "gym" ? "Full Name" : "Gym Name"} className={inputClass("name")} required />
            <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" className={inputClass("email")} required />
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className={inputClass("phone")}  required />
            <input name="username" value={formData.username} onChange={handleChange} placeholder="Username (optional)" className={inputClass("username")}  />
            <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" className={inputClass("password")}  required />
            {formData.accountType !== "gym" && (
              <div className="flex flex-col">
                <label htmlFor="dob" className="mb-1 font-medium text-green" >
                  Date of Birth
                </label>
                <DatePicker
                  dateFormat="MM/dd/yyyy"
                  minDate={minDob}
                  maxDate={maxDob}
                  placeholderText="MM/DD/YYYY"
                  selected={formData.dob ? new Date(formData.dob) : null}
                  onChange={handleDobChange}
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={50}
                  className={inputClass("dob")}
                />

                <label htmlFor="gender" className="mt-3 mb-1 font-medium text-green" >
                  Which gender group / division will you compete in?
                </label>
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
              </div>
            )}

            <h2 className="font-semibold">Address</h2>
            <input name="address.streetAddress" value={formData.address.streetAddress} onChange={handleChange} placeholder="Street Address" className={inputClass("address.streetAddress")}  required />
            <input name="address.apartmentNumber" value={formData.address.apartmentNumber} onChange={handleChange} placeholder="Apartment (optional)" className={inputClass("address.apartmentNumber")}  />
            <input name="address.city" value={formData.address.city} onChange={handleChange} placeholder="City" className={inputClass("address.city")}  required />
            <input name="address.state" value={formData.address.state} onChange={handleChange} placeholder="State" className={inputClass("address.state")}  required />
            <input name="address.zipCode" value={formData.address.zipCode} onChange={handleChange} placeholder="Zip Code" className={inputClass("address.zipCode")}  required />
          </>
        ) : (
          <>
            <input name="emailOrUsername" value={formData.emailOrUsername} onChange={handleChange} placeholder="Email or Username" className={inputClass("emailOrUsername")}  required />
            <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" className={inputClass("password")}  required />
          </>
        )}

        {errorMessage && (
          <div className="bg-background text-accent p-2 rounded">{errorMessage}</div>
        )}

        <button
          type="submit"
          className="bg-green text-background font-bold p-2 w-full rounded-md hover:bg-select transition-colors"
        >
          {isCreating ? "Create Account" : "Login"}
        </button>

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
          className="text-green underline block hover:text-select"
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
  )
}
