import { loadStripe } from '@stripe/stripe-js'

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = publishableKey ? loadStripe(publishableKey) : Promise.resolve(null)

export async function useStripePayment(sessionId: string, sessionUrl?: string) {
  if (!publishableKey && sessionUrl) {
    window.location.assign(sessionUrl)
    return
  }

  const stripe = await stripePromise
  if (!stripe) {
    throw new Error('Stripe failed to initialize. Set VITE_STRIPE_PUBLISHABLE_KEY.')
  }

  const result = await stripe.redirectToCheckout({ sessionId })
  if (result && result.error) {
    throw result.error
  }
}
