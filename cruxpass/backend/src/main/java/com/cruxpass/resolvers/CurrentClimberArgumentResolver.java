package com.cruxpass.resolvers;

import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.web.server.ResponseStatusException;

import com.cruxpass.annotations.CurrentClimber;
import com.cruxpass.models.Climber;
import com.cruxpass.security.CurrentUserService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CurrentClimberArgumentResolver
    implements HandlerMethodArgumentResolver {

    private final CurrentUserService currentUserService;

    @Override
    public boolean supportsParameter(@NonNull MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentClimber.class)
            && parameter.getParameterType().equals(Climber.class);
    }

    @Override
    public Object resolveArgument(
        @NonNull MethodParameter parameter,
        @Nullable ModelAndViewContainer mavContainer,
        @NonNull NativeWebRequest webRequest,
        @Nullable WebDataBinderFactory binderFactory
    ) {
        String auth = webRequest.getHeader("Authorization");
        Climber climber = currentUserService.getClimberFromToken(auth);
        if (climber == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return climber;
    }
}

