import api from './apiService';
import { DependentClimberDto, SimpleClimberDto } from "@/models/dtos";

export async function getClimberProfile(climberId: number): Promise<SimpleClimberDto> {
  const res = await api.get(`/climbers/${climberId}`);
  return res.data;
}

export async function getDependentsById(climberId: number): Promise<DependentClimberDto[]> {
  const res = await api.get(`/climbers/${climberId}/dependents`);
  return res.data;
}

export async function searchClimbersByQuery(query: string): Promise<SimpleClimberDto[]> {
  const [field, value] = query.split(':', 2)
  const params: Record<string, string> = {}
  if (field && value) {
    params[field.toLowerCase()] = value.trim()
  }

  const res = await api.get(`/climbers/search`, { params })
  return res.data
}

