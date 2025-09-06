import { ClimberData, SubmittedRoute } from '@/models/domain';
import api from './apiService';
import { ClimberResponseDto, SubmissionRequestDto } from '@/models/dtos';

export async function getClimberProfile(): Promise<ClimberResponseDto> {
    const res = await api.get('/climbers/me');
    return res.data;
}

export async function updateClimber(data: Partial<ClimberData>): Promise<ClimberResponseDto>  {
    const res = await api.put("climbers/me", data);
    return res.data;
}
