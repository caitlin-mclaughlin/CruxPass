import { CompetitionFormPayload, CompRegistrationRequestDto, RegistrationResponseDto, RouteDto, RouteResponseDto, SubmissionRequestDto, SubmissionResponseDto, SubmittedRouteDto } from '@/models/dtos';
import api from './apiService';
import { Registration, Route, SubmittedRoute } from '@/models/domain';

export async function getCompetition(gymId: number, competitionId: number) {
  const res = api.get(`/gyms/${gymId}/competitions/${competitionId}`);
  return res;
}

export async function getMyRegistrationForComp(gymId: number, competitionId: number) {
  const res = api.get(`/gyms/${gymId}/competitions/${competitionId}/registrations/me`);
  return res;
} 

export async function getMySubmissionsForComp(gymId: number, competitionId: number): Promise<SubmittedRouteDto[]> {
  const res = await api.get<SubmittedRouteDto[]>(`/gyms/${gymId}/competitions/${competitionId}/submissions/me`);
  return res.data;
}

export async function getRoutesForComp(gymId: number, competitionId: number): Promise<RouteResponseDto[]>  {
  const res = await api.get<RouteResponseDto[]>(`/competitions/${competitionId}/routes`);
  return res.data;
} 

export async function updateMyRegistrationForComp(gymId: number, competitionId: number, data: CompRegistrationRequestDto): Promise<RegistrationResponseDto> {
  const res = await api.put(`gyms/${gymId}/competitions/${competitionId}/registrations/me`, data);
  return res.data;
}

export async function submitScoresForComp(gymId: number, competitionId: number, data: SubmissionRequestDto): Promise<SubmissionResponseDto> {
  const res = await api.put(`gyms/${gymId}/competitions/${competitionId}/submissions/me`, data);
  return res.data;
}
