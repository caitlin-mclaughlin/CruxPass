package com.cruxpass.controllers;

import com.cruxpass.dtos.requests.RegistrationCheckoutRequestDto;
import com.cruxpass.dtos.responses.StripeSessionResponseDto;
import com.cruxpass.enums.PaymentStatus;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Registration;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.ClimberService;
import com.cruxpass.services.RegistrationService;
import com.cruxpass.services.StripePaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stripe")
public class StripeCheckoutController {

    private final RegistrationService registrationService;
    private final StripePaymentService stripePaymentService;
    private final CurrentUserService currentUserService;
    private final ClimberService climberService;

    public StripeCheckoutController(
        RegistrationService registrationService,
        StripePaymentService stripePaymentService,
        CurrentUserService currentUserService,
        ClimberService climberService
    ) {
        this.registrationService = registrationService;
        this.stripePaymentService = stripePaymentService;
        this.currentUserService = currentUserService;
        this.climberService = climberService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<StripeSessionResponseDto> createCheckoutSession(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody RegistrationCheckoutRequestDto request
    ) throws Exception {
        Registration registration = registrationService.getByIdWithCheckoutDetails(request.registrationId());
        if (registration == null) {
            return ResponseEntity.badRequest().build();
        }

        Competition competition = registration.getCompetition();
        if (competition == null || competition.isPastDeadline()) {
            return ResponseEntity.badRequest().build();
        }

        if (!canCheckoutRegistration(authHeader, registration, competition)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (registration.getFeeamount() == null || registration.getFeeamount() <= 0) {
            registration.setPaid(true);
            registration.setPaymentStatus(PaymentStatus.PAID);
            registrationService.save(registration);
            return ResponseEntity.ok(new StripeSessionResponseDto("", ""));
        }

        if (!stripePaymentService.isConfigured()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }

        registration.setPaymentStatus(PaymentStatus.PENDING);
        registrationService.save(registration);

        var session = stripePaymentService.createCheckoutSession(
            request.successUrl(),
            request.cancelUrl(),
            registration.getFeeamount(),
            registration.getFeeCurrency(),
            registration.getId().toString(),
            competition.getName(),
            registration.getClimber().getEmail()
        );

        registration.setCheckoutSessionId(session.getId());
        registrationService.save(registration);

        return ResponseEntity.ok(new StripeSessionResponseDto(session.getId(), session.getUrl()));
    }

    private boolean canCheckoutRegistration(String authHeader, Registration registration, Competition competition) {
        Climber climber = currentUserService.getClimberFromToken(authHeader);
        if (climber != null) {
            try {
                climberService.getSelfOrDependent(climber.getId(), registration.getClimber().getId());
                return true;
            } catch (Exception ignored) {
                return false;
            }
        }

        Gym gym = currentUserService.getGymFromToken(authHeader);
        return gym != null
            && competition.getGym() != null
            && competition.getGym().getId().equals(gym.getId());
    }
}
