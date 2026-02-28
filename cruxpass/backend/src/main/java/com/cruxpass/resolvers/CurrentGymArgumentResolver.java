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

import com.cruxpass.annotations.CurrentGym;
import com.cruxpass.models.Gym;
import com.cruxpass.repositories.GymRepository;
import com.cruxpass.security.CurrentUserService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CurrentGymArgumentResolver
    implements HandlerMethodArgumentResolver {

    private final CurrentUserService currentUserService;

    @Override
    public boolean supportsParameter(@NonNull MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentGym.class)
            && parameter.getParameterType().equals(Gym.class);
    }

    @Override
    public Object resolveArgument(
        @NonNull MethodParameter parameter,
        @Nullable ModelAndViewContainer mavContainer,
        @NonNull NativeWebRequest webRequest,
        @Nullable WebDataBinderFactory binderFactory
    ) {
        String auth = webRequest.getHeader("Authorization");
        Gym gym = currentUserService.getGymFromToken(auth);
        if (gym == null) {
          throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return gym;
    }
}

