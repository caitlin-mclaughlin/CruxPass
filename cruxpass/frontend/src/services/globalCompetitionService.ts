import { CompetitionFormPayload, SubmissionRequestDto } from '@/models/dtos';
import api from './apiService';
import { Registration, Route } from '@/models/domain';

export async function fetchLeaderboard(competitionId: number) {
  const res = api.get(`/competitions/${competitionId}/rankings`);
  return res;
}

export async function getAllCompetitions() {
  const res = api.get('/competitions');
  return res;
}

export async function getCompetition(id: number) {
  const res = api.get(`/competitions/${id}`);
  return res;
}

export async function getRegistrationsForCompetition(competitionId: number): Promise<Registration[]> {
  const res = await api.get<Registration[]>(`/competitions/${competitionId}/registrations`);
  return res.data;
}

export async function getRoutesForCompetition(competitionId: number): Promise<Route[]> {
  const res = await api.get<Route[]>(`/competitions/${competitionId}/routes`);
  return res.data;
}
