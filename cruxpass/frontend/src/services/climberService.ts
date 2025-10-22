// services/climberService.ts
import { ClimberData } from '@/models/domain';
import api from './apiService';
import { ClimberResponseDto, DependentClimberDto } from '@/models/dtos';

export async function getClimberProfile(): Promise<ClimberResponseDto> {
  const res = await api.get('/climbers/me');
  return res.data;
}

export async function updateClimber(data: Partial<ClimberData>): Promise<ClimberResponseDto> {
  const res = await api.put('climbers/me', data);
  return res.data;
}

// --- Dependents ---
export async function getDependents(): Promise<DependentClimberDto[]> {
  const res = await api.get('/climbers/me/dependents');
  return res.data;
}

export async function addDependent(data: DependentClimberDto): Promise<DependentClimberDto> {
  const res = await api.post('/climbers/me/dependents', data);
  return res.data;
}

export async function updateDependent(id: number, data: Partial<DependentClimberDto>): Promise<DependentClimberDto> {
  const res = await api.put(`/climbers/${id}`, data);
  return res.data;
}

export async function removeDependent(id: number): Promise<void> {
  await api.delete(`/climbers/me/dependents/${id}`);
}
