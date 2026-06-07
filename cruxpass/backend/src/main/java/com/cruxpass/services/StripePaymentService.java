package com.cruxpass.services;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripePaymentService {
    private final String stripeApiKey;

    public StripePaymentService(@Value("${stripe.api.key}") String stripeApiKey) {
        this.stripeApiKey = stripeApiKey;
    }

    public boolean isConfigured() {
        return stripeApiKey != null && !stripeApiKey.isBlank();
    }

    public Session createCheckoutSession(
        String successUrl,
        String cancelUrl,
        Integer amount,
        String currency,
        String registrationId,
        String competitionName,
        String climberEmail
    ) throws Exception {
        if (!isConfigured()) {
            throw new IllegalStateException("Stripe API key is required. Set STRIPE_API_KEY.");
        }
        Stripe.apiKey = stripeApiKey;

        SessionCreateParams.LineItem.PriceData.ProductData productData = SessionCreateParams.LineItem.PriceData.ProductData.builder()
            .setName(competitionName == null || competitionName.isBlank()
                ? "Competition registration"
                : competitionName + " registration")
            .build();

        SessionCreateParams.LineItem.PriceData priceData = SessionCreateParams.LineItem.PriceData.builder()
            .setCurrency(currency.toLowerCase())
            .setUnitAmount((long) amount)
            .setProductData(productData)
            .build();

        SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
            .setPriceData(priceData)
            .setQuantity(1L)
            .build();

        SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
            .setMode(SessionCreateParams.Mode.PAYMENT)
            .setSuccessUrl(successUrl)
            .setCancelUrl(cancelUrl)
            .addLineItem(lineItem)
            .putMetadata("registrationId", registrationId)
            .setClientReferenceId(registrationId);

        if (climberEmail != null && !climberEmail.isBlank()) {
            paramsBuilder.setCustomerEmail(climberEmail);
        }

        SessionCreateParams params = paramsBuilder.build();

        return Session.create(params);
    }
}
