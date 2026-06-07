package com.cruxpass.services;

import com.stripe.model.checkout.Session;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class StripePaymentServiceDeepTest {

    @Test
    void createCheckoutSessionWillThrowWhenNotConfigured() {
        StripePaymentService svc = new StripePaymentService("");
        assertThrows(IllegalStateException.class, () -> {
            svc.createCheckoutSession("ok", "cancel", 500, "USD", "r1", "Comp", null);
        });
    }

    @Test
    void isConfiguredTrueWhenKeyProvided() {
        StripePaymentService svc = new StripePaymentService("sk_test_abc");
        assertTrue(svc.isConfigured());
    }
}
