// LoginPage.tsx
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api, { attachToken } from '../services/api'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react';

export default function Login() {
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        accountType: "user",
        name: "",
        email: "",
        username: "",
        phone: "",
        dob: "",
        password: "",
        emailOrUsername: "",
        address: {
            streetAddress: "",
            apartmentNumber: "",
            city: "",
            state: "",
            zipCode: ""
        }
    });
    const [errorMessage, setErrorMessage] = useState<string>("");
    const { login, token } = useAuth();

    useEffect(() => {
        if (token) {
            navigate("/dashboard");
        }
    }, [token, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setErrorMessage("");

        const { name, value } = e.target;
        if (name.startsWith("address.")) {
            const key = name.split(".")[1];
            setFormData(prev => ({
            ...prev,
            address: { ...prev.address, [key]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isCreating) {
                const res = await api.post(`/auth/register/${formData.accountType}`, {
                    name: formData.name,
                    email: formData.email,
                    username: formData.username || null,
                    phone: formData.phone,
                    dob: formData.dob || null,
                    password: formData.password,
                    address: formData.address
                });
                login(res.data.token)
                navigate("/dashboard");
            } else {
                const res = await api.post("/auth/login", {
                    emailOrUsername: formData.emailOrUsername,
                    password: formData.password
                });
                login(res.data.token)
                navigate("/dashboard");
            }
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                err.message ||
                "Login failed";

            setErrorMessage(msg);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen px-4">
            <h1 className="text-2xl font-bold mb-4">{isCreating ? "Create Account" : "Login"}</h1>
            <form onSubmit={handleSubmit} className="space-y-3">
            {isCreating ? (
                <>
                <select name="accountType" value={formData.accountType} onChange={handleChange} className="border p-2 w-full">
                    <option value="climber">Climber</option>
                    <option value="gym">Gym</option>
                </select>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="border p-2 w-full" required />
                <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="border p-2 w-full" required />
                <input name="username" value={formData.username} onChange={handleChange} placeholder="Username (optional)" className="border p-2 w-full" />
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="border p-2 w-full" required />
                <input name="dob" type="date" value={formData.dob} onChange={handleChange} className="border p-2 w-full" />
                <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" className="border p-2 w-full" required />
                <h2 className="font-semibold">Address</h2>
                <input name="address.streetAddress" value={formData.address.streetAddress} onChange={handleChange} placeholder="Street Address" className="border p-2 w-full" required />
                <input name="address.apartmentNumber" value={formData.address.apartmentNumber} onChange={handleChange} placeholder="Apartment (optional)" className="border p-2 w-full" />
                <input name="address.city" value={formData.address.city} onChange={handleChange} placeholder="City" className="border p-2 w-full" required />
                <input name="address.state" value={formData.address.state} onChange={handleChange} placeholder="State" className="border p-2 w-full" required />
                <input name="address.zipCode" value={formData.address.zipCode} onChange={handleChange} placeholder="ZIP Code" className="border p-2 w-full" required />
                </>
            ) : (
                <>
                <input name="emailOrUsername" value={formData.emailOrUsername} onChange={handleChange} placeholder="Email or Username" className="border p-2 w-full" required />
                <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" className="border p-2 w-full" required />
                </>
            )}
            {errorMessage && (
                <div className="bg-red-100 text-red-700 p-2 rounded mb-2">
                {errorMessage}
                </div>
            )}
            <button type="submit" className="bg-blue-600 text-white p-2 w-full rounded">{isCreating ? "Create Account" : "Login"}</button>
            <button type="button" onClick={() => setIsCreating(!isCreating)} className="text-blue-600 underline block mt-2">
                {isCreating ? "Already have an account?" : "Don't have an account? Create one"}
            </button>
            </form>
        </div>
    );
}
