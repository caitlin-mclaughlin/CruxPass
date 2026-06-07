package com.cruxpass.services;

import static com.cruxpass.support.TestFixtures.climber;
import static com.cruxpass.support.TestFixtures.competition;
import static com.cruxpass.support.TestFixtures.defaultGroup;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import com.cruxpass.dtos.ResolvedCompetitorGroup;
import com.cruxpass.dtos.SubmittedRouteDto;
import com.cruxpass.dtos.requests.SubmissionRequestDto;
import com.cruxpass.enums.BoulderGrade;
import com.cruxpass.enums.DefaultCompetitorGroup;
import com.cruxpass.enums.Division;
import com.cruxpass.enums.PricingType;
import com.cruxpass.events.SubmissionUpdatedEvent;
import com.cruxpass.mappers.ResolvedCompetitorGroupMapper;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Registration;
import com.cruxpass.models.Route;
import com.cruxpass.models.Submission;
import com.cruxpass.models.SubmittedRoute;
import com.cruxpass.models.GroupRefs.GroupRefEmbeddable;
import com.cruxpass.repositories.SubmissionRepository;

@ExtendWith(MockitoExtension.class)
class SubmissionServiceTest {

    @Mock private SubmissionRepository submissionRepository;
    @Mock private RouteService routeService;
    @Mock private RegistrationService registrationService;
    @Mock private ResolvedCompetitorGroupMapper resolvedGroupMapper;
    @Mock private ApplicationEventPublisher eventPublisher;

    @Test
    void submitOrUpdateScoresSavesFullScorecardAndRemovesClearedRoutes() {
        SubmissionService service = service();
        Competition comp = competition(PricingType.FLAT);
        comp.setId(10L);
        Climber climber = climber("Avery Climber");
        climber.setId(2L);
        Registration registration = registration(comp, climber);
        Route routeOne = route(101L, 1, 100, comp);
        Route routeTwo = route(102L, 2, 200, comp);
        Route routeThree = route(103L, 3, 300, comp);
        Submission existing = submission(comp, climber, registration);
        existing.getRoutes().add(submittedRoute(existing, routeOne, 2, true));
        existing.getRoutes().add(submittedRoute(existing, routeTwo, 1, true));

        when(registrationService.getByClimberAndCompetition(climber, comp)).thenReturn(registration);
        when(submissionRepository.findByCompetitionIdAndClimberIdWithRoutes(10L, 2L)).thenReturn(Optional.of(existing));
        when(routeService.getById(101L)).thenReturn(routeOne);
        when(routeService.getById(102L)).thenReturn(routeTwo);
        when(routeService.getById(103L)).thenReturn(routeThree);
        when(submissionRepository.saveAndFlush(any(Submission.class))).thenAnswer(inv -> inv.getArgument(0));

        service.submitOrUpdateScores(
            comp,
            climber,
            new SubmissionRequestDto(
                List.of(
                    new SubmittedRouteDto(101L, 0, false),
                    new SubmittedRouteDto(102L, 3, true),
                    new SubmittedRouteDto(103L, 2, false)
                )
            )
        );

        assertEquals(List.of(102L, 103L), existing.getRoutes().stream().map(sr -> sr.getRoute().getId()).toList());
        assertEquals(200, existing.getTotalPoints());
        assertEquals(3, existing.getTotalAttempts());

        ArgumentCaptor<SubmissionUpdatedEvent> eventCaptor = ArgumentCaptor.forClass(SubmissionUpdatedEvent.class);
        verify(eventPublisher).publishEvent(eventCaptor.capture());
        assertEquals(10L, eventCaptor.getValue().getCompetitionId());
        assertEquals(2L, eventCaptor.getValue().getClimberId());
        assertEquals(103L, eventCaptor.getValue().getRouteId());
    }

    @Test
    void submitOrUpdateScoresRejectsRoutesFromAnotherCompetition() {
        SubmissionService service = service();
        Competition comp = competition(PricingType.FLAT);
        comp.setId(10L);
        Competition otherComp = competition(PricingType.FLAT);
        otherComp.setId(99L);
        Climber climber = climber("Avery Climber");
        climber.setId(2L);
        Registration registration = registration(comp, climber);
        Route foreignRoute = route(101L, 1, 100, otherComp);

        when(registrationService.getByClimberAndCompetition(climber, comp)).thenReturn(registration);
        when(submissionRepository.findByCompetitionIdAndClimberIdWithRoutes(10L, 2L)).thenReturn(Optional.empty());
        when(routeService.getById(101L)).thenReturn(foreignRoute);

        assertThrows(
            IllegalStateException.class,
            () -> service.submitOrUpdateScores(
                comp,
                climber,
                new SubmissionRequestDto(List.of(new SubmittedRouteDto(101L, 1, true)))
            )
        );
    }

    @Test
    void getRankingsOrdersByPointsAttemptsAndKeepsTiesTogether() {
        SubmissionService service = service();
        Competition comp = competition(PricingType.FLAT);
        comp.setId(10L);
        Route routeOne = route(101L, 1, 100, comp);
        Route routeTwo = route(102L, 2, 200, comp);
        Registration registration = registration(comp, climber("placeholder"));

        Climber avery = climber("Avery");
        avery.setId(1L);
        Submission first = submission(comp, avery, registration);
        first.getRoutes().add(submittedRoute(first, routeOne, 1, true));
        first.getRoutes().add(submittedRoute(first, routeTwo, 1, true));

        Climber blake = climber("Blake");
        blake.setId(2L);
        Submission second = submission(comp, blake, registration);
        second.getRoutes().add(submittedRoute(second, routeOne, 2, true));
        second.getRoutes().add(submittedRoute(second, routeTwo, 1, true));

        Climber casey = climber("Casey");
        casey.setId(3L);
        Submission tiedSecond = submission(comp, casey, registration);
        tiedSecond.getRoutes().add(submittedRoute(tiedSecond, routeOne, 2, true));
        tiedSecond.getRoutes().add(submittedRoute(tiedSecond, routeTwo, 1, true));

        when(submissionRepository.findByCompetitionIdAndGroupAndDivision(
            10L,
            defaultGroup(DefaultCompetitorGroup.ADVANCED).getType(),
            DefaultCompetitorGroup.ADVANCED,
            null,
            Division.FEMALE
        )).thenReturn(Optional.of(List.of(second, first, tiedSecond)));
        when(resolvedGroupMapper.toResolved(any(GroupRefEmbeddable.class)))
            .thenReturn(new ResolvedCompetitorGroup(null, "Advanced", null));

        var rankings = service.getRankingsByGroupAndDivision(10L, DefaultCompetitorGroup.ADVANCED, Division.FEMALE);

        assertEquals(List.of("Avery", "Blake", "Casey"), rankings.stream().map(r -> r.climberName()).toList());
        assertEquals(List.of(1, 2, 2), rankings.stream().map(r -> r.place()).toList());
    }

    private SubmissionService service() {
        return new SubmissionService(
            submissionRepository,
            routeService,
            registrationService,
            resolvedGroupMapper,
            eventPublisher
        );
    }

    private Registration registration(Competition comp, Climber climber) {
        Registration registration = new Registration();
        registration.setCompetition(comp);
        registration.setClimber(climber);
        registration.setCompetitorGroupRef(defaultGroup(DefaultCompetitorGroup.ADVANCED));
        registration.setDivision(Division.FEMALE);
        return registration;
    }

    private Submission submission(Competition comp, Climber climber, Registration registration) {
        Submission submission = new Submission();
        submission.setCompetition(comp);
        submission.setClimber(climber);
        submission.setRegistration(registration);
        submission.setCompetitorGroupRef(defaultGroup(DefaultCompetitorGroup.ADVANCED));
        submission.setDivision(Division.FEMALE);
        return submission;
    }

    private Route route(Long id, int number, int points, Competition comp) {
        Route route = new Route();
        route.setId(id);
        route.setNumber(number);
        route.setPointValue(points);
        route.setGrade(BoulderGrade.V1);
        route.setCompetition(comp);
        return route;
    }

    private SubmittedRoute submittedRoute(Submission submission, Route route, int attempts, boolean send) {
        SubmittedRoute submittedRoute = new SubmittedRoute();
        submittedRoute.setSubmission(submission);
        submittedRoute.setRoute(route);
        submittedRoute.setAttempts(attempts);
        submittedRoute.setSend(send);
        return submittedRoute;
    }
}
