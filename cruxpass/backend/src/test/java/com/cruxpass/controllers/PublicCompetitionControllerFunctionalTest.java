package com.cruxpass.controllers;

import static com.cruxpass.support.TestFixtures.resolvedCompetition;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.cruxpass.services.CompetitionService;

class PublicCompetitionControllerFunctionalTest {

    private CompetitionService competitionService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        competitionService = org.mockito.Mockito.mock(CompetitionService.class);
        mockMvc = MockMvcBuilders
            .standaloneSetup(new PublicCompetitionController(competitionService))
            .build();
    }

    @Test
    void getAllCompetitionsReturnsResolvedCompetitions() throws Exception {
        when(competitionService.getAllDtos()).thenReturn(List.of(
            resolvedCompetition(1L, "Spring Boulder Bash"),
            resolvedCompetition(2L, "Summer Lead Rally")
        ));

        mockMvc.perform(get("/api/competitions"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[0].name").value("Spring Boulder Bash"))
            .andExpect(jsonPath("$[0].pricingType").value("FLAT"))
            .andExpect(jsonPath("$[1].id").value(2))
            .andExpect(jsonPath("$[1].name").value("Summer Lead Rally"));

        verify(competitionService).getAllDtos();
    }

    @Test
    void getCompetitionByIdDelegatesToPublicLookup() throws Exception {
        when(competitionService.getDtoById(12L)).thenReturn(resolvedCompetition(12L, "Citizen Comp"));

        mockMvc.perform(get("/api/competitions/12"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(12))
            .andExpect(jsonPath("$.name").value("Citizen Comp"))
            .andExpect(jsonPath("$.feeCurrency").value("USD"));

        verify(competitionService).getDtoById(12L);
    }
}
