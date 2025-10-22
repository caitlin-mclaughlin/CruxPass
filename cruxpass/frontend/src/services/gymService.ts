import { GymData } from "@/models/domain";
import api from "./apiService";
import { CompetitionFormPayload, CompetitionSummaryDto, GymResponseDto } from "@/models/dtos";

export async function getGymProfile(): Promise<GymResponseDto> {
  const res = await api.get('/gyms/me');
  return res.data;
} 

export async function createCompetitionForGym(gymId: number, data: CompetitionFormPayload) {
  const res = await api.put(`/gyms/${gymId}/competitions`, data);
  return res.data;
} 

export async function updateGym(data: Partial<GymData>) {
  const res = await api.put("gyms/me", data);
  return res.data;
} 

export async function getAllCompetitionsForGym(gymId: number): Promise<CompetitionSummaryDto[]> {
  const res = await api.get(`/gyms/${gymId}/competitions`);
  return res.data;
} 