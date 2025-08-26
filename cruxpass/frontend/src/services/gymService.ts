import { GymData } from "@/models/domain";
import api from "./apiService";
import { CompetitionFormPayload, GymResponseDto } from "@/models/dtos";

export async function getGymProfile(): Promise<GymResponseDto> {
  const res = await api.get('/gyms/me');
  return res.data;
} 

export async function createCompetitionForGym(gymId: number, data: CompetitionFormPayload) {
  const res = api.put(`/gyms/${gymId}/competitions`, data);
  return res;
} 

export async function updateGym(data: Partial<GymData>) {
  const res = api.put("gyms/me", data);
  return res;
} 

export async function getAllCompetitionsForGym(gymId: number) {
  const res = api.get(`/gyms/${gymId}/competitions`);
  return res;
} 