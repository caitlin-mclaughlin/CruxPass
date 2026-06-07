package com.cruxpass.services;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class StripePaymentServiceTest {

    @Test
    void isConfiguredReturnsFalseWhenApiKeyMissingOrBlank() {
        StripePaymentService svcNull = new StripePaymentService(null);
        assertFalse(svcNull.isConfigured());

        StripePaymentService svcBlank = new StripePaymentService("");
        assertFalse(svcBlank.isConfigured());
    }

    @Test
    void isConfiguredReturnsTrueWhenApiKeyPresent() {
        StripePaymentService svc = new StripePaymentService("sk_test_123");
        assertTrue(svc.isConfigured());
    }

    @Test
    void createCheckoutSessionThrowsWhenNotConfigured() {
        StripePaymentService svc = new StripePaymentService(null);

        assertThrows(IllegalStateException.class, () -> {
            svc.createCheckoutSession("https://ok", "https://cancel", 1000, "USD", "reg-1", "Comp", "a@b.com");
        });
    }
}
