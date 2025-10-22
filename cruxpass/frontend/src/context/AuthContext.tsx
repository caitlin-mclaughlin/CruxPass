// context/AuthContext.tsx
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import api from "@/services/apiService";
import { loginEntity, registerEntity } from "@/services/authService";
import { AccountType } from "@/constants/enum";
import { AuthRequestDto, RegisterRequestDto } from "@/models/dtos";

export interface AuthContextType {
  token: string | null
  accountType: AccountType | null,
  login: (credentials: AuthRequestDto) => void
  register: (type: AccountType, credentials: RegisterRequestDto) => void
  logout: () => void
  skipLogin: () => void
  guest: boolean
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  accountType: null,
  login: async () => {},
  register: async () => null,
  logout: () => {},
  skipLogin: () => {},
  guest: false
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // AuthContext.tsx (excerpt)
  const initialToken = localStorage.getItem('token');
  const initialAccountType =
    (localStorage.getItem('accountType') as AccountType | null) ?? getAccountTypeFromToken(initialToken);

  const [token, setToken] = useState<string | null>(initialToken);
  const [accountType, setAccountType] = useState<AccountType | null>(initialAccountType);
  const [guest, setGuest] = useState(false);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  async function login(loginRequest: AuthRequestDto) {
    const data = await loginEntity(loginRequest); // returns { token }
    const newToken = data.token;
    setToken(newToken);
    localStorage.setItem('token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

    // derive account type from jwt role and persist
    const parsedType = getAccountTypeFromToken(newToken);
    if (parsedType) {
      setAccountType(parsedType);
      localStorage.setItem('accountType', parsedType);
    }
  }

  async function register(type: AccountType, formData: RegisterRequestDto) {
    if (!type) return null;
    const data = await registerEntity(type, formData);
    const newToken = data.token;
    setToken(newToken);
    setAccountType(type);
    localStorage.setItem('token', newToken);
    localStorage.setItem('accountType', type);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  }

  function logout() {
    setToken(null);
    setAccountType(null);
    localStorage.removeItem("token");
    localStorage.removeItem("accountType");
    window.location.reload();
  }

  function skipLogin() {
    setToken(null);
    setAccountType(null);
    setGuest(true);
  }

  function getAccountTypeFromToken(token: string | null): AccountType | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log("JWT payload:", payload);

      const role = (payload.role || payload.type || (payload.roles && payload.roles[0]))?.toString().toUpperCase();
      if (role === 'CLIMBER') return AccountType.CLIMBER;
      if (role === 'GYM') return AccountType.GYM;
      if (role === 'SERIES') return AccountType.SERIES;
      logout()
      return null;
    } catch {
      logout()
      return null;
    }
  }

  return (
    <AuthContext.Provider value={{ token, accountType, login, register, logout, skipLogin, guest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
