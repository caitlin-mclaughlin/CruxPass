package com.cruxpass.services;

import com.cruxpass.models.Competition;
import com.cruxpass.repositories.CompetitionRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CompetitionPricingServiceGeneratedTest {

    @Test
    void getCompetitionReturnsNullWhenMissing() {
        CompetitionRepository repo = mock(CompetitionRepository.class);
        CompetitionPricingService svc = new CompetitionPricingService(repo, null);
        when(repo.findById(5L)).thenReturn(Optional.empty());

        assertNull(svc.getById(5L));
    }
}
