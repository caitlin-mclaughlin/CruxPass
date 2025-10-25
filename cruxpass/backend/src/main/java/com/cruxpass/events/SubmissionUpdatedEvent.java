package com.cruxpass.events;

import org.springframework.context.ApplicationEvent;

public class SubmissionUpdatedEvent extends ApplicationEvent {
    private final Long competitionId;
    private final Long climberId;
    private final Long routeId;

    public SubmissionUpdatedEvent(Object source, Long competitionId, Long climberId, Long routeId) {
        super(source);
        this.competitionId = competitionId;
        this.climberId = climberId;
        this.routeId = routeId;
    }

    public Long getCompetitionId() { return competitionId; }
    public Long getClimberId() { return climberId; }
    public Long getRouteId() { return routeId; }
}
