package com.cruxpass.services;

import com.cruxpass.models.Competition;
import com.cruxpass.repositories.CompetitionRepository;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CompetitionServiceDeepTest {

    @Test
    void getByIdReturnsNullWhenNotFound() {
        CompetitionRepository repo = mock(CompetitionRepository.class);
        CompetitionService svc = new CompetitionService(repo, null, null, null);
        when(repo.findById(2L)).thenReturn(java.util.Optional.empty());

        assertNull(svc.getById(2L));
    }
}
