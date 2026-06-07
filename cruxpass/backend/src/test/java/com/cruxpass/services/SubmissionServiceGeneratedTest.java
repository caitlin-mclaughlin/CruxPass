package com.cruxpass.services;

import com.cruxpass.models.Submission;
import com.cruxpass.repositories.SubmissionRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SubmissionServiceGeneratedTest {

    @Test
    void getByIdReturnsNullWhenMissing() {
        SubmissionRepository repo = mock(SubmissionRepository.class);
        SubmissionService svc = new SubmissionService(repo, null, null, null, null);
        when(repo.findById(1L)).thenReturn(Optional.empty());

        assertNull(svc.getById(1L));
    }
}
