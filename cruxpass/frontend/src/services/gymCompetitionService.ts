import { CompRegistrationResponseDto, RouteDto, RouteResponseDto, SubmissionResponseDto, CompetitionDto, HeatDto, UpdateCompetitionDto } from '@/models/dtos';
import api from './apiService';
import { Registration } from '@/models/domain';

export async function getCompetition(compId: number): Promise<CompetitionDto> {
  const res = await api.get(`/gyms/me/competitions/${compId}`);
  return res.data;
}

export async function getHeats(compId: number): Promise<HeatDto[]> {
  const res = await api.get(`/gyms/me/competitions/${compId}/heats`);
  return res.data;
}

export async function getRegistrationsForComp(compId: number): Promise<CompRegistrationResponseDto[]> {
  const res = await api.get(`/gyms/me/competitions/${compId}/registrations`);
  return res.data;
} 

export async function getRoutesForComp(compId: number): Promise<RouteResponseDto[]>  {
  const res = await api.get(`/gyms/me/competitions/${compId}/routes`);
  return res.data;
} 

export async function getSubmissionsForComp(compId: number): Promise<SubmissionResponseDto[]>  {
  const res = await api.get(`/gyms/me/competitions/${compId}/submissions`);
  return res.data;
} 

export async function updateCompetitionInfo(compId: number, data: UpdateCompetitionDto) {
  const res = api.put(`gyms/me/competitions/${compId}`, data);
  return res;
}

export async function updateRegistrationsForComp(compId: number, data: Registration[]) {
  const res = api.put(`gyms/me/competitions/${compId}/registrations`, data);
  return res;
}

export async function updateRoutesForComp(compId: number, data: RouteDto[]): Promise<RouteResponseDto[]> {
  const res = await api.put(`gyms/me/competitions/${compId}/routes`, data);
  return res.data;
}

export async function startCompetition(compId: number) {
  return api.post(`/gyms/me/competitions/${compId}/start`);
}

export async function stopCompetition(compId: number) {
  return api.post(`/gyms/me/competitions/${compId}/stop`);
}

