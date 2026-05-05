package com.cruxpass.mappers;

import java.util.List;
import java.util.Optional;

import com.cruxpass.dtos.SimpleRegistrationDto;
import com.cruxpass.dtos.requests.CompRegistrationRequestDto;
import com.cruxpass.dtos.responses.RegistrationResponseDto;
import com.cruxpass.dtos.responses.SimpleRegistrationResponseDto;
import com.cruxpass.models.Climber;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Heat;
import com.cruxpass.models.Registration;
import com.cruxpass.models.GroupRefs.GroupRefEmbeddable;
import com.cruxpass.enums.GroupRefType;
import com.cruxpass.services.CompetitionPricingService;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RegistrationMapper {

    private final HeatMapper heatMapper;
    private final ResolvedCompetitorGroupMapper resolvedGroupMapper;
    private final CompetitionPricingService pricingService;

    private boolean groupRefMatches(GroupRefEmbeddable left, GroupRefEmbeddable right) {
        if (left == null || right == null || left.getType() != right.getType()) return false;
        if (left.getType() == GroupRefType.DEFAULT) {
            return left.getDefaultKey() != null && left.getDefaultKey() == right.getDefaultKey();
        }
        return left.getCustomGroupId() != null && left.getCustomGroupId().equals(right.getCustomGroupId());
    }

    private boolean heatMatchesRegistration(Heat heat, GroupRefEmbeddable groupRef, com.cruxpass.enums.Division division) {
        if (heat == null) return false;

        boolean groupMatch = heat.getGroups().stream()
            .anyMatch(ref -> groupRefMatches(ref, groupRef));
        if (!groupMatch) return false;

        if (!heat.isDivisionsEnabled()) return true;
        if (heat.getDivisions() == null || heat.getDivisions().isEmpty()) return true;
        return heat.getDivisions().contains(division);
    }

    private Heat resolveHeatEntity(CompRegistrationRequestDto dto, Competition comp, GroupRefEmbeddable groupRef) {
        if (comp == null || comp.getHeats() == null || comp.getHeats().isEmpty()) return null;

        if (dto.heat() != null && dto.heat().id() != null) {
            Optional<Heat> byId = comp.getHeats().stream()
                .filter(h -> h.getId() != null && h.getId().equals(dto.heat().id()))
                .findFirst();
            Heat selected = byId.orElseThrow(() -> new IllegalArgumentException("Selected heat does not belong to competition."));
            if (!heatMatchesRegistration(selected, groupRef, dto.division())) {
                throw new IllegalArgumentException("Selected heat does not allow chosen group/division.");
            }
            return selected;
        }

        return comp.getHeats().stream()
            .filter(heat -> heatMatchesRegistration(heat, groupRef, dto.division()))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("No valid heat available for chosen group/division."));
    }

    // Convert from Registration entity to RegistrationResponseDto
    public RegistrationResponseDto toResponseDto(Registration reg) {
        if (reg == null) return null;
        return new RegistrationResponseDto(
            reg.getId(),
            reg.getCompetition().getGym().getId(),
            reg.getCompetition().getId(),
            reg.getClimber().getName(),
            reg.getClimber().getDob(),
            reg.getClimber().getEmail(),
            resolvedGroupMapper.toResolved(reg.getCompetitorGroupRef()),
            reg.getDivision(),
            heatMapper.toDto(reg.getHeat()),
            reg.getFeeamount(),
            reg.getFeeCurrency(),
            reg.isPaid()
        );
    }

    // Convert from Registration entity to SimpleRegistrationDto
    public SimpleRegistrationDto toSimpleDto(Registration reg) {
        if (reg == null) return null;
        return new SimpleRegistrationDto(
            reg.getDivision(),
            resolvedGroupMapper.toResolved(reg.getCompetitorGroupRef()),
            heatMapper.toDto(reg.getHeat())
        );
    }

    /** Convert Registration entity to SimpleRegistrationResponseDto */
    public SimpleRegistrationResponseDto toSimpleResponseDto(Registration reg) {
        if (reg == null) return null;
        return new SimpleRegistrationResponseDto(
            reg.getId(),
            reg.getCompetition().getId(),
            reg.getClimber().getName(),
            reg.getClimber().getDob(),
            reg.getClimber().getEmail(),
            resolvedGroupMapper.toResolved(reg.getCompetitorGroupRef()),
            reg.getDivision(),
            heatMapper.toDto(reg.getHeat()),
            reg.getFeeamount(),
            reg.getFeeCurrency()
        );
    }

    // Convert from CompRegistrationRequestDto to Registration entity
    public Registration toEntity(CompRegistrationRequestDto dto, Climber climber, Competition comp) {
        if (dto == null || climber == null || comp == null) return null;
        GroupRefEmbeddable groupRef = resolvedGroupMapper.toEmbeddable(dto.competitorGroup());
        Heat heat = resolveHeatEntity(dto, comp, groupRef);

        Registration reg = new Registration();
        reg.setClimber(climber);
        reg.setCompetition(comp);
        reg.setCompetitorGroupRef(groupRef);
        reg.setDivision(dto.division());
        reg.setHeat(heat);
        var quote = pricingService.quoteFor(comp, climber, groupRef);
        reg.setFeeamount(quote.amount());
        reg.setFeeCurrency(quote.currency());
        reg.setPaid(dto.paid());
        return reg;
    }

    // Optionally, map a list of registrations to response DTOs
    public List<RegistrationResponseDto> toResponseDtoList(List<Registration> registrations) {
        return registrations.stream()
            .map(this::toResponseDto)
            .toList();
    }

    public List<SimpleRegistrationDto> toSimpleDtoList(List<Registration> registrations) {
        return registrations.stream()
            .map(this::toSimpleDto)
            .toList();
    }
}
