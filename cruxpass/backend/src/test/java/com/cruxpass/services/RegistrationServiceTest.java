package com.cruxpass.services;

import com.cruxpass.models.Competition;
import com.cruxpass.models.Registration;
import com.cruxpass.models.Climber;
import com.cruxpass.repositories.RegistrationRepository;
import org.junit.jupiter.api.Test;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RegistrationServiceTest {

    @Test
    void getAllDelegatesToRepository() {
        RegistrationRepository repo = mock(RegistrationRepository.class);
        RegistrationService svc = new RegistrationService(repo);
        when(repo.findAll()).thenReturn(Collections.emptyList());

        assertTrue(svc.getAll().isEmpty());
    }

    @Test
    void getByIdReturnsNullWhenNotFound() {
        RegistrationRepository repo = mock(RegistrationRepository.class);
        RegistrationService svc = new RegistrationService(repo);
        when(repo.findById(5L)).thenReturn(java.util.Optional.empty());

        assertNull(svc.getById(5L));
    }

    @Test
    void saveReturnsSavedEntity() {
        RegistrationRepository repo = mock(RegistrationRepository.class);
        RegistrationService svc = new RegistrationService(repo);
        Registration r = new Registration();
        when(repo.save(r)).thenReturn(r);

        assertSame(r, svc.save(r));
    }
}
