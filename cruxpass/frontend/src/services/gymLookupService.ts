import api from './apiService';
import { CompetitionDto, SimpleGymDto } from "@/models/dtos";

export async function getGymProfile(gymId: number): Promise<SimpleGymDto> {
  const res = await api.get(`/gyms/${gymId}`);
  return res.data;
}

export async function getCompetitionsById(gymId: number): Promise<CompetitionDto[]> {
  const res = await api.get(`/gyms/${gymId}/competitions`);
  return res.data;
}

export async function searchGymsByQuery(query: string): Promise<SimpleGymDto[]> {
  const [field, value] = query.split(':', 2)
  const params: Record<string, string> = {}
  if (field && value) {
    params[field.toLowerCase()] = value.trim()
  }

  const res = await api.get(`/gyms/search`, { params })
  return res.data
}

