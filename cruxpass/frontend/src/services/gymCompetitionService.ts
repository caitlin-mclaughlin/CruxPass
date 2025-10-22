import { CompetitionFormPayload, CompRegistrationRequestDto, CompRegistrationResponseDto, RouteDto, RouteResponseDto, SubmissionRequestDto, SubmissionResponseDto, SubmittedRouteDto } from '@/models/dtos';
import api from './apiService';
import { Registration, Route, SubmittedRoute } from '@/models/domain';

export async function createCompetitionForGym(gymId: number, data: CompetitionFormPayload) {
  const res = api.put(`/gyms/${gymId}/competitions`, data);
  return res;
} 

export async function getCompetition(gymId: number, competitionId: number) {
  const res = api.get(`/gyms/${gymId}/competitions/${competitionId}`);
  return res;
}

export async function getRegistrationsForComp(gymId: number, competitionId: number): Promise<CompRegistrationResponseDto[]> {
  const res = await api.get(`/gyms/${gymId}/competitions/${competitionId}/registrations`);
  return res.data;
} 

export async function getRoutesForComp(gymId: number, competitionId: number): Promise<RouteResponseDto[]>  {
  const res = await api.get(`/gyms/${gymId}/competitions/${competitionId}/routes`);
  return res.data;
} 

export async function getSubmissionsForComp(gymId: number, competitionId: number): Promise<SubmissionResponseDto[]>  {
  const res = await api.get(`/gyms/${gymId}/competitions/${competitionId}/submissions`);
  return res.data;
} 

export async function updateCompetitionInfo(gymId: number, competitionId: number, data: CompetitionFormPayload) {
  const res = api.put(`gyms/${gymId}/competitions/${competitionId}`, data);
  return res;
}

export async function updateRegistrationsForComp(gymId: number, competitionId: number, data: Registration[]) {
  const res = api.put(`gyms/${gymId}/competitions/${competitionId}/registrations`, data);
  return res;
}

export async function updateRoutesForComp(gymId: number, competitionId: number, data: RouteDto[]): Promise<RouteResponseDto[]> {
  const res = await api.put(`gyms/${gymId}/competitions/${competitionId}/routes`, data);
  return res.data;
}
