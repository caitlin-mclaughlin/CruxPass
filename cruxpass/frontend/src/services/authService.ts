// services/authService.ts
import { AccountType } from "@/constants/enum";
import { AuthRequestDto, RegisterRequestDto } from "@/models/dtos";
import api from "@/services/apiService";

export async function loginEntity(loginRequest: AuthRequestDto) {
  const res = await api.post("/auth/login", loginRequest);
  return res.data; // { token, id }
}

// --- Registration ---
export async function registerEntity(role: AccountType, data: RegisterRequestDto): Promise<any>{
  const endpoint = {
    [AccountType.CLIMBER]: 'climber',
    [AccountType.GYM]: 'gym',
    [AccountType.SERIES]: 'series',
  }[role];
  const res = await api.post(`/auth/register/${endpoint}`, data);
  return res.data; // { token, id}
}
