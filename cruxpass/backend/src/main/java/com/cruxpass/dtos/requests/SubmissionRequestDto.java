package com.cruxpass.dtos.requests;

import java.util.List;

public class SubmissionRequestDto {
    public List<RouteAttempt> routes;

    public static class RouteAttempt {
        public Long routeId;
        public int attempts;
    }
}
