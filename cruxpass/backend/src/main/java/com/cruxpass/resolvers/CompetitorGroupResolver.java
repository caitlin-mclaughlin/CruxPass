package com.cruxpass.resolvers;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.cruxpass.dtos.ResolvedCompetitorGroup;
import com.cruxpass.mappers.DefaultCompetitorGroups;
import com.cruxpass.models.GroupRefs.CustomGroupRef;
import com.cruxpass.models.GroupRefs.DefaultGroupRef;
import com.cruxpass.models.GroupRefs.GroupRef;
import com.cruxpass.repositories.CompetitorGroupRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CompetitorGroupResolver {

    private final CompetitorGroupRepository repository;

    public ResolvedCompetitorGroup resolve(GroupRef ref) {

        if (ref instanceof DefaultGroupRef d) {
            var meta = DefaultCompetitorGroups.META.get(d.key());

            return new ResolvedCompetitorGroup(
                null,
                meta.label(),
                meta.ageRule()
            );
        }

        if (ref instanceof CustomGroupRef c) {
            var group = repository.findById(c.id())
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Competitor group not found: " + c.id()
                ));

            return new ResolvedCompetitorGroup(
                group.getId(),
                group.getName(),
                group.getAgeRule()
            );
        }

        throw new IllegalStateException("Unknown GroupRef type");
    }
}
