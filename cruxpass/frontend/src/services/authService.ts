// services/authService.ts
import { AccountType } from "@/constants/enum";
import { AuthRequestDto, RegisterRequestDto } from "@/models/dtos";
import api from "@/services/apiService";

export async function loginEntity(loginRequest: AuthRequestDto) {
  const res = await api.post("/auth/", loginRequest);
  console.log(res.data);
  return res.data; // { token, id }
}

// --- Registration ---
export async function registerEntity(role: AccountType, data: RegisterRequestDto): Promise<any>{
  const res = await api.post(`/auth/register/${role}`, data);
  console.log(res.data);
  return res.data; // { token, id}
}

