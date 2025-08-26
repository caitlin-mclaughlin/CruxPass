// services/authService.ts
import { AccountType } from "@/constants/enum";
import { AuthRequestDto, RegisterRequestDto } from "@/models/dtos";
import api from "@/services/apiService";

export async function loginEntity(loginRequest: AuthRequestDto) {
  const res = await api.put("/auth/", loginRequest);
  return res.data; // { token, id }
}

// --- Registration ---
export async function registerEntity(role: AccountType, data: RegisterRequestDto): Promise<any>{
  const res = await api.put(`/auth/register/${role}`, data);
  return res.data; // { token, id}
}

