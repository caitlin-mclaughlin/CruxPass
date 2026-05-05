import { CompetitionDto, PublicRegistrationDto, RouteResponseDto } from '@/models/dtos';
import api from './apiService';

export async function fetchLeaderboard(competitionId: number) {
  const res = api.get(`/competitions/${competitionId}/rankings`);
  return res;
}

export async function getAllCompetitions(): Promise<CompetitionDto[]> {
  const res = await api.get('/competitions');
  return res.data;
}

export async function getRegistrationsForCompetition(competitionId: number): Promise<PublicRegistrationDto[]> {
  const res = await api.get<PublicRegistrationDto[]>(`/competitions/${competitionId}/registrations`);
  return res.data;
}

export async function getRoutesForCompetition(competitionId: number): Promise<RouteResponseDto[]> {
  const res = await api.get<RouteResponseDto[]>(`/competitions/${competitionId}/routes`);
  return res.data;
}
