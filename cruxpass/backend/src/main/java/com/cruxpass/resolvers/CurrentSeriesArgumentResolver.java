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

import com.cruxpass.annotations.CurrentSeries;
import com.cruxpass.models.Series;
import com.cruxpass.security.CurrentUserService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CurrentSeriesArgumentResolver
    implements HandlerMethodArgumentResolver {

    private final CurrentUserService currentUserService;

    @Override
    public boolean supportsParameter(@NonNull MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentSeries.class)
            && parameter.getParameterType().equals(Series.class);
    }

    @Override
    public Object resolveArgument(
        @NonNull MethodParameter parameter,
        @Nullable ModelAndViewContainer mavContainer,
        @NonNull NativeWebRequest webRequest,
        @Nullable WebDataBinderFactory binderFactory
    ) {
        String auth = webRequest.getHeader("Authorization");
        Series series = currentUserService.getSeriesFromToken(auth);
        if (series == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return series;
    }
}

