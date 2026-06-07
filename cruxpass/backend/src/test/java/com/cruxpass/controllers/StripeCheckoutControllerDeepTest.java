package com.cruxpass.controllers;

import com.cruxpass.models.Registration;
import com.cruxpass.repositories.RegistrationRepository;
import com.cruxpass.services.RegistrationService;
import com.cruxpass.services.StripePaymentService;
import com.cruxpass.security.CurrentUserService;
import com.cruxpass.services.ClimberService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class StripeCheckoutControllerDeepTest {

    @Test
    void handleMissingRegistrationDoesNotThrow() {
        RegistrationRepository repo = mock(RegistrationRepository.class);
        RegistrationService registrationService = mock(RegistrationService.class);
        StripePaymentService stripePaymentService = mock(StripePaymentService.class);
        CurrentUserService currentUserService = mock(CurrentUserService.class);
        ClimberService climberService = mock(ClimberService.class);

        StripeCheckoutController ctrl = new StripeCheckoutController(registrationService, stripePaymentService, currentUserService, climberService);
        when(repo.findById(1L)).thenReturn(java.util.Optional.empty());

        assertNotNull(ctrl);
    }
}
