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
        CompetitionPricingService svc = new CompetitionPricingService();
        var quote = svc.quoteFor(null, null, null);

        assertEquals(0, quote.amount());
        assertEquals("USD", quote.currency());
    }
}
