// hooks/useStripePayment.ts
/*
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!)

export async function useStripePayment(sessionId: string) {
  const stripe = await stripePromise
  if (!stripe) throw new Error('Stripe failed to initialize')
  await stripe.redirectToCheckout({ sessionId })
}
*/