import { ClimberData, SubmittedRoute } from '@/models/domain';
import api from './apiService';
import { SubmissionRequestDto } from '@/models/dtos';

export async function getClimberProfile() {
    const res = await api.get('/climbers/me');
    return res;
}

export async function updateClimber(data: Partial<ClimberData>) {
    const res = await api.put("climbers/me", data);
    return res;
}
