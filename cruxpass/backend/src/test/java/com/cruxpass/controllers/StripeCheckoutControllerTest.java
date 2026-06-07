package com.cruxpass.controllers;

import static com.cruxpass.support.TestFixtures.competition;
import static com.cruxpass.support.TestFixtures.gym;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

import com.cruxpass.dtos.requests.RegistrationCheckoutRequestDto;
import com.cruxpass.enums.PaymentStatus;
import com.cruxpass.enums.PricingType;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Registration;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.ClimberService;
import com.cruxpass.services.RegistrationService;
import com.cruxpass.services.StripePaymentService;

import static org.mockito.Mockito.mock;

class StripeCheckoutControllerTest {

    private final RegistrationService registrationService = mock(RegistrationService.class);
    private final StripePaymentService stripePaymentService = mock(StripePaymentService.class);
    private final CurrentUserService currentUserService = mock(CurrentUserService.class);
    private final ClimberService climberService = mock(ClimberService.class);

    private final StripeCheckoutController controller = new StripeCheckoutController(
        registrationService,
        stripePaymentService,
        currentUserService,
        climberService
    );

    @Test
    void checkoutMarksFreeRegistrationPaidWithoutCallingStripe() throws Exception {
        Climber climber = climber(2L);
        Registration registration = registration(77L, climber, 0);
        when(registrationService.getByIdWithCheckoutDetails(77L)).thenReturn(registration);
        when(currentUserService.getClimberFromToken("Bearer token")).thenReturn(climber);
        when(climberService.getSelfOrDependent(2L, 2L)).thenReturn(climber);

        var response = controller.createCheckoutSession(
            "Bearer token",
            new RegistrationCheckoutRequestDto(77L, "http://success", "http://cancel")
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("", response.getBody().sessionId());
        assertEquals(PaymentStatus.PAID, registration.getPaymentStatus());
        verify(registrationService).save(registration);
        verify(stripePaymentService, never()).createCheckoutSession(
            org.mockito.ArgumentMatchers.any(),
            org.mockito.ArgumentMatchers.any(),
            org.mockito.ArgumentMatchers.any(),
            org.mockito.ArgumentMatchers.any(),
            org.mockito.ArgumentMatchers.any(),
            org.mockito.ArgumentMatchers.any(),
            org.mockito.ArgumentMatchers.any()
        );
    }

    @Test
    void checkoutRejectsRegistrationOutsideCurrentUserHouseholdOrGym() throws Exception {
        Climber owner = climber(2L);
        Climber other = climber(9L);
        Registration registration = registration(77L, other, 3500);
        when(registrationService.getByIdWithCheckoutDetails(77L)).thenReturn(registration);
        when(currentUserService.getClimberFromToken("Bearer token")).thenReturn(owner);
        when(climberService.getSelfOrDependent(2L, 9L)).thenThrow(new RuntimeException("not dependent"));

        var response = controller.createCheckoutSession(
            "Bearer token",
            new RegistrationCheckoutRequestDto(77L, "http://success", "http://cancel")
        );

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void checkoutReturnsUnavailableWhenStripeIsNotConfigured() throws Exception {
        Climber climber = climber(2L);
        Registration registration = registration(77L, climber, 3500);
        when(registrationService.getByIdWithCheckoutDetails(77L)).thenReturn(registration);
        when(currentUserService.getClimberFromToken("Bearer token")).thenReturn(climber);
        when(climberService.getSelfOrDependent(2L, 2L)).thenReturn(climber);
        when(stripePaymentService.isConfigured()).thenReturn(false);

        var response = controller.createCheckoutSession(
            "Bearer token",
            new RegistrationCheckoutRequestDto(77L, "http://success", "http://cancel")
        );

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
    }

    private Registration registration(Long id, Climber climber, int feeAmount) {
        Gym gym = gym(1L);
        Competition competition = competition(PricingType.FLAT);
        competition.setId(10L);
        competition.setGym(gym);
        competition.setDeadline(LocalDateTime.now().plusDays(1));

        Registration registration = new Registration();
        registration.setId(id);
        registration.setClimber(climber);
        registration.setCompetition(competition);
        registration.setFeeamount(feeAmount);
        registration.setFeeCurrency("USD");
        registration.setPaymentStatus(PaymentStatus.PENDING);
        return registration;
    }

    private Climber climber(Long id) {
        Climber climber = com.cruxpass.support.TestFixtures.climber("Avery Climber");
        climber.setId(id);
        climber.setEmail("avery@example.com");
        climber.setActive(true);
        return climber;
    }
}
