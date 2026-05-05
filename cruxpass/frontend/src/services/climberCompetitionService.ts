import { CompRegistrationRequestDto, CompRegistrationResponseDto, RouteDto, RouteResponseDto, SubmissionRequestDto, SubmissionResponseDto, SubmittedRouteDto } from '@/models/dtos';
import api from './apiService';

export async function getCompetition(compId: number) {
  const res = api.get(`/competitions/${compId}`);
  return res;
}

export async function getMyRegistrationForComp(compId: number) {
  const res = api.get(`/competitions/${compId}/registrations/me`);
  return res;
} 

export async function getMySubmissionsForComp(compId: number): Promise<SubmittedRouteDto[]> {
  const res = await api.get<SubmittedRouteDto[]>(`/competitions/${compId}/submissions/me`);
  return res.data;
}

export async function getRoutesForComp(compId: number): Promise<RouteResponseDto[]>  {
  const res = await api.get<RouteResponseDto[]>(`/competitions/${compId}/routes`);
  return res.data;
} 

export async function updateMyRegistrationForComp(compId: number, data: CompRegistrationRequestDto): Promise<CompRegistrationResponseDto> {
  const res = await api.put(`/competitions/${compId}/registrations/me`, data);
  return res.data;
}

export async function submitScoresForComp(compId: number, data: SubmissionRequestDto): Promise<SubmissionResponseDto> {
  const res = await api.put(`/competitions/${compId}/submissions/me`, data);
  return res.data;
}
