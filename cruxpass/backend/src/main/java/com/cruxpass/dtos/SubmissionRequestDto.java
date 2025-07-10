package com.cruxpass.dtos;

import java.util.List;

public class SubmissionRequestDto {
    public List<RouteAttempt> routes;

    public static class RouteAttempt {
        public Long routeId;
        public int attempts;
    }
}
