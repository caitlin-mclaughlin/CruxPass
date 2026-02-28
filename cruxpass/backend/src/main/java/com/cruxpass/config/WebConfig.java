package com.cruxpass.config;

import java.util.List;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.cruxpass.resolvers.CurrentClimberArgumentResolver;
import com.cruxpass.resolvers.CurrentGymArgumentResolver;
import com.cruxpass.resolvers.CurrentSeriesArgumentResolver;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final CurrentGymArgumentResolver gymResolver;
    private final CurrentClimberArgumentResolver climberResolver;
    private final CurrentSeriesArgumentResolver seriesResolver;

    @Override
    public void addArgumentResolvers(@NonNull List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(gymResolver);
        resolvers.add(climberResolver);
        resolvers.add(seriesResolver);
    }
}

