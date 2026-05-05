// services/climberService.ts
import { ClimberData } from '@/models/domain';
import api from './apiService';
import { ClimberResponseDto, DependentClimberDto } from '@/models/dtos';

const DEFAULT_CLIMBER_STREET = 'N/A';
const DEFAULT_CLIMBER_ZIP = '00000';

function normalizeClimberAddress(address: Partial<ClimberData['address']> | undefined) {
  return {
    streetAddress: DEFAULT_CLIMBER_STREET,
    apartmentNumber: '',
    city: address?.city ?? '',
    state: address?.state ?? '',
    zipCode: DEFAULT_CLIMBER_ZIP,
  };
}

export async function getClimberProfile(): Promise<ClimberResponseDto> {
  const res = await api.get('/climbers/me');
  const data = res.data as any;
  return {
    ...data,
    address: {
      city: data?.address?.city ?? '',
      state: data?.address?.state ?? '',
    }
  } as ClimberResponseDto;
}

export async function updateClimber(data: Partial<ClimberData>): Promise<ClimberResponseDto> {
  const payload = {
    ...data,
    ...(data.address && { address: normalizeClimberAddress(data.address) }),
  };

  const res = await api.put('climbers/me', payload);
  const responseData = res.data as any;
  return {
    ...responseData,
    address: {
      city: responseData?.address?.city ?? '',
      state: responseData?.address?.state ?? '',
    }
  } as ClimberResponseDto;
}

export async function getCompetitionIds(): Promise<number[]> {
  const res = await api.get('/climbers/me/competitionIds');
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
