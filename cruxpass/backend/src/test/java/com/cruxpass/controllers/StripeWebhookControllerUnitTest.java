package com.cruxpass.controllers;

import com.cruxpass.repositories.RegistrationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class StripeWebhookControllerUnitTest {

    @Test
    void handleWebhookReturnsBadRequestWhenSignatureMissing() {
        RegistrationRepository repo = mock(RegistrationRepository.class);
        StripeWebhookController ctrl = new StripeWebhookController(repo, "secret");

        ResponseEntity<String> resp = ctrl.handleWebhook(null, "{}");
        assertEquals(400, resp.getStatusCode().value());
        assertTrue(resp.getBody().contains("Missing"));
    }

    @Test
    void handleWebhookReturnsServiceUnavailableWhenSecretNotConfigured() {
        RegistrationRepository repo = mock(RegistrationRepository.class);
        StripeWebhookController ctrl = new StripeWebhookController(repo, "");

        ResponseEntity<String> resp = ctrl.handleWebhook("sig", "payload");
        assertEquals(503, resp.getStatusCode().value());
        assertTrue(resp.getBody().contains("not configured"));
    }

    @Test
    void handleWebhookReturnsBadRequestWhenVerificationFails() {
        RegistrationRepository repo = mock(RegistrationRepository.class);
        // Provide an actual secret so controller attempts verification which will fail for invalid signature
        StripeWebhookController ctrl = new StripeWebhookController(repo, "whsec_test");

        ResponseEntity<String> resp = ctrl.handleWebhook("bad-signature", "{}");
        assertEquals(400, resp.getStatusCode().value());
        assertTrue(resp.getBody().contains("verification failed") || resp.getBody().contains("Webhook verification failed") || resp.getBody().contains("Webhook verification failed"));
    }
}
