import api from './apiService'

type StripeCheckoutRequestDto = {
  registrationId: number
  successUrl: string
  cancelUrl: string
}

type StripeSessionResponseDto = {
  sessionId: string
  sessionUrl: string
}

export async function createStripeCheckoutSession(
  registrationId: number,
  successUrl: string,
  cancelUrl: string
): Promise<StripeSessionResponseDto> {
  const res = await api.post<StripeSessionResponseDto>('/stripe/checkout', {
    registrationId,
    successUrl,
    cancelUrl,
  } as StripeCheckoutRequestDto)
  return res.data
}
