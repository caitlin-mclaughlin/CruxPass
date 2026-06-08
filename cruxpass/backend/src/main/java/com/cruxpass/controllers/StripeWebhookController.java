package com.cruxpass.controllers;

import com.cruxpass.enums.PaymentStatus;
import com.cruxpass.models.Registration;
import com.cruxpass.repositories.RegistrationRepository;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stripe")
public class StripeWebhookController {

    private final RegistrationRepository registrationRepository;
    private final String webhookSecret;

    public StripeWebhookController(RegistrationRepository registrationRepository,
                                   @Value("${stripe.webhook.secret}") String webhookSecret) {
        this.registrationRepository = registrationRepository;
        this.webhookSecret = webhookSecret;
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
        @RequestHeader(value = "Stripe-Signature", required = false) String signature,
        @RequestBody String payload
    ) {
        if (signature == null || payload == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing Stripe signature or payload");
        }
        if (webhookSecret == null || webhookSecret.isBlank()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("Stripe webhook secret is not configured");
        }

        com.stripe.model.Event event;
        try {
            event = Webhook.constructEvent(payload, signature, webhookSecret);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook verification failed");
        }

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
            if (session != null) {
                registrationRepository.findByCheckoutSessionId(session.getId())
                    .ifPresent(registration -> {
                        boolean paid = "paid".equalsIgnoreCase(session.getPaymentStatus());
                        registration.setPaid(paid);
                        registration.setPaymentStatus(paid ? PaymentStatus.PAID : PaymentStatus.PENDING);
                        registrationRepository.save(registration);
                    });
            }
        } else if (
            "checkout.session.expired".equals(event.getType())
                || "checkout.session.async_payment_failed".equals(event.getType())
        ) {
            Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
            if (session != null) {
                registrationRepository.findByCheckoutSessionId(session.getId())
                    .ifPresent(registration -> {
                        if (registration.getPaymentStatus() != PaymentStatus.PAID) {
                            registration.setPaid(false);
                            registration.setPaymentStatus(PaymentStatus.FAILED);
                        }
                        registrationRepository.save(registration);
                    });
            }
        }

        return ResponseEntity.ok("Received");
    }
}
