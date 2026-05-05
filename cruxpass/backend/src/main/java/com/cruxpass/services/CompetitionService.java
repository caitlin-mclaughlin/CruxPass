package com.cruxpass.services;
import com.cruxpass.dtos.HeatGroupProjection;
import com.cruxpass.dtos.requests.CompetitionUpsertDto;
import com.cruxpass.dtos.requests.PricingRuleUpsertDto;
import com.cruxpass.dtos.requests.HeatUpsertDto;
import com.cruxpass.dtos.requests.UpdateCompetitionDto;
import com.cruxpass.dtos.responses.ResolvedCompetitionDto;
import com.cruxpass.dtos.responses.ResolvedHeatDto;
import com.cruxpass.enums.PricingRuleType;
import com.cruxpass.enums.PricingType;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.mappers.CompetitionMapper;
import com.cruxpass.mappers.HeatMapper;
import com.cruxpass.models.Competition;
import com.cruxpass.models.PricingRule;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Heat;
import com.cruxpass.models.Series;
import com.cruxpass.models.GroupRefs.GroupRef;
import com.cruxpass.models.GroupRefs.GroupRefEmbeddable;
import com.cruxpass.repositories.CompetitionRepository;

import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CompetitionService {

    private final CompetitionRepository competitionRepo;
    private final CompetitorGroupService groupService;
    private final HeatService heatService;

    private final CompetitionMapper compMap;
    private final HeatMapper heatMap;

    private Map<Long, Set<GroupRefEmbeddable>> mapGroupsByHeatId(List<Heat> heats) {
        if (heats.isEmpty()) return Map.of();

        List<Long> heatIds = heats.stream().map(Heat::getId).toList();
        List<HeatGroupProjection> projections = competitionRepo.findGroupsByHeatIds(heatIds);

        Map<Long, Set<GroupRefEmbeddable>> groupsByHeatId = new HashMap<>();
        for (HeatGroupProjection row : projections) {
            groupsByHeatId
                .computeIfAbsent(row.heatId(), k -> new HashSet<>())
                .add(row.group());
        }
        return groupsByHeatId;
    }

    @Transactional(readOnly = true)
    public List<ResolvedCompetitionDto> getDtosByGymWithHeats(Gym gym) {
        List<Competition> comps = competitionRepo.findAllByGymIdBase(gym.getId());
        if (comps.isEmpty()) return List.of();

        List<Long> compIds = comps.stream()
            .map(Competition::getId)
            .toList();

        List<Heat> heats = competitionRepo.findHeatsByCompetitionIds(compIds);

        Map<Long, List<Heat>> heatsByCompId = heats.stream()
            .collect(Collectors.groupingBy(h -> h.getCompetition().getId()));

        Map<Long, Set<GroupRefEmbeddable>> groupsByHeatId = mapGroupsByHeatId(heats);

        return comps.stream()
            .map(comp -> {
                List<Heat> compHeats =
                    heatsByCompId.getOrDefault(comp.getId(), List.of());

                List<ResolvedHeatDto> heatDtos =
                    heatMap.toDtoListWithGroups(compHeats, groupsByHeatId);

                return compMap.toDtoWithHeats(comp, heatDtos, comp.getGym());
            })
            .toList();
    }
    
    @Transactional(readOnly = true)
    public List<ResolvedCompetitionDto> getAllDtos() {

        List<Competition> comps = competitionRepo.findAllBase();
        if (comps.isEmpty()) return List.of();

        List<Long> compIds = comps.stream()
            .map(Competition::getId)
            .toList();

        List<Heat> heats = competitionRepo.findHeatsByCompetitionIds(compIds);

        Map<Long, List<Heat>> heatsByCompId = heats.stream()
            .collect(Collectors.groupingBy(h -> h.getCompetition().getId()));

        Map<Long, Set<GroupRefEmbeddable>> groupsByHeatId = mapGroupsByHeatId(heats);

        return comps.stream()
            .map(comp -> {
                List<Heat> compHeats =
                    heatsByCompId.getOrDefault(comp.getId(), List.of());

                List<ResolvedHeatDto> heatDtos =
                    heatMap.toDtoListWithGroups(compHeats, groupsByHeatId);

                return compMap.toDtoWithHeats(comp, heatDtos, comp.getGym());
            })
            .toList();
    }

    public Competition getByIdAndGymId(Long id, Long gymId) {
        return competitionRepo.findByIdAndGymId(id, gymId).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public Competition getByIdWithRegistrations(Long id) {
        return competitionRepo.findByIdWithRegistrations(id).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public ResolvedCompetitionDto getDtoByIdAndGym(Long id, Gym gym) {
        Competition comp = competitionRepo.findByIdAndGymId(id, gym.getId()).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        // Fetch heats
        List<Heat> heats = competitionRepo.findHeatsByCompetitionId(id);

        Map<Long, Set<GroupRefEmbeddable>> groupsByHeatId = mapGroupsByHeatId(heats);

        List<ResolvedHeatDto> heatDtos = heatMap.toDtoListWithGroups(heats, groupsByHeatId);

        return compMap.toDtoWithHeats(comp, heatDtos, gym);
    }

    @Transactional(readOnly = true)
    public ResolvedCompetitionDto getDtoById(Long id) {
        // Fetch comp
        Competition comp = competitionRepo.findByIdWithGymBase(id).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        // Fetch heats
        List<Heat> heats = competitionRepo.findHeatsByCompetitionId(id);

        Map<Long, Set<GroupRefEmbeddable>> groupsByHeatId = mapGroupsByHeatId(heats);

        List<ResolvedHeatDto> heatDtos = heatMap.toDtoListWithGroups(heats, groupsByHeatId);

        return compMap.toDtoWithHeats(comp, heatDtos, comp.getGym());
    }

    @Transactional(readOnly = true)
    public Competition getById(Long id) {
        return competitionRepo.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public Competition getByIdWithHeats(Long id) {
        Competition comp = competitionRepo.findByIdWithGymBase(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        comp.setHeats(heatService.getByCompetition(comp));
        return comp;
    }

    private void syncSelectedGroups(
        Competition comp,
        Set<GroupRef> refs,
        Gym gym,
        Series series
    ) {
        groupService.validateGroupRefs(refs, gym, series);

        Set<GroupRefEmbeddable> embeddables =
            refs.stream()
                .map(GroupRefEmbeddable::fromDomain)
                .collect(Collectors.toSet());

        comp.getSelectedGroups().clear();
        comp.getSelectedGroups().addAll(embeddables);
    }

    private void syncHeats(
        Competition comp,
        List<HeatUpsertDto> heatDtos,
        Gym gym,
        Series series
    ) {
        Map<Long, Heat> existing =
            comp.getHeats().stream()
                .filter(h -> h.getId() != null)
                .collect(Collectors.toMap(Heat::getId, h -> h));

        List<Heat> newList = new ArrayList<>();

        for (HeatUpsertDto dto : heatDtos) {

            Heat heat;

            if (dto.id() != null) {
                heat = existing.remove(dto.id());
                if (heat == null) {
                    throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Heat does not belong to this competition: " + dto.id()
                    );
                }
            } else {
                heat = new Heat();
                heat.setCompetition(comp);
            }

            heatService.applyHeatUpsert(heat, dto, gym, series);
            newList.add(heat);
        }

        comp.getHeats().clear();
        comp.getHeats().addAll(newList);
    }

    private void applyUpsert(
        Competition comp,
        CompetitionUpsertDto dto,
        Gym gym,
        Series series
    ) {
        comp.setName(dto.name());
        comp.setStartDate(dto.startDate());
        comp.setDeadline(dto.deadline());
        comp.setTypes(dto.types());
        comp.setCompFormat(dto.compFormat());

        syncSelectedGroups(comp, dto.selectedGroups(), gym, series);
        syncPricing(comp, dto, gym, series);
        syncHeats(comp, dto.heats(), gym, series);
        comp.setCompStatus(compMap.calculateStatus(comp));
    }

    private void validatePricing(CompetitionUpsertDto dto) {
        if (dto.pricingType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pricing type is required.");
        }

        if (dto.feeCurrency() == null || dto.feeCurrency().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fee currency is required.");
        }

        if (dto.pricingType() == PricingType.FLAT) {
            if (dto.flatFee() == null || dto.flatFee() < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Flat fee must be a non-negative amount.");
            }
            return;
        }

        if (dto.pricingRules() == null || dto.pricingRules().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pricing rules are required.");
        }
    }

    private void syncPricing(
        Competition comp,
        CompetitionUpsertDto dto,
        Gym gym,
        Series series
    ) {
        validatePricing(dto);

        comp.setPricingType(dto.pricingType());
        comp.setFeeCurrency(dto.feeCurrency().trim().toUpperCase());
        comp.setFlatFee(dto.pricingType() == PricingType.FLAT ? dto.flatFee() : null);

        List<PricingRuleUpsertDto> rulesDto = dto.pricingRules() == null ? List.of() : dto.pricingRules();

        if (dto.pricingType() == PricingType.FLAT) {
            comp.getPricingRules().clear();
            return;
        }

        Map<Long, PricingRule> existing =
            comp.getPricingRules().stream()
                .filter(r -> r.getId() != null)
                .collect(Collectors.toMap(PricingRule::getId, r -> r));

        List<PricingRule> newRules = new ArrayList<>();

        for (PricingRuleUpsertDto ruleDto : rulesDto) {
            PricingRule rule;

            if (ruleDto.id() != null) {
                rule = existing.remove(ruleDto.id());
                if (rule == null) {
                    throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Pricing rule does not belong to this competition: " + ruleDto.id()
                    );
                }
            } else {
                rule = new PricingRule();
                rule.setCompetition(comp);
            }

            rule.setRuleType(ruleDto.ruleType());
            rule.setAmount(ruleDto.amount());
            rule.setPriority(ruleDto.priority() == null ? 100 : ruleDto.priority());
            rule.setMinAge(ruleDto.minAge());
            rule.setMaxAge(ruleDto.maxAge());

            if (rule.getAmount() == null || rule.getAmount() < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pricing rule amount must be non-negative.");
            }

            if (dto.pricingType() == PricingType.BY_GROUP) {
                Set<GroupRef> groups = ruleDto.groups() == null
                    ? Set.of()
                    : ruleDto.groups();

                if (rule.getRuleType() != PricingRuleType.GROUP || groups.isEmpty()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Group pricing requires group-based rules.");
                }
                groupService.validateGroupRefs(groups, gym, series);
                rule.setGroups(
                    groups.stream()
                        .map(GroupRefEmbeddable::fromDomain)
                        .collect(Collectors.toSet())
                );
                rule.setMinAge(null);
                rule.setMaxAge(null);
            } else if (dto.pricingType() == PricingType.BY_AGE) {
                if (rule.getRuleType() != PricingRuleType.AGE) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Age pricing requires age-based rules.");
                }
                if (rule.getMinAge() == null && rule.getMaxAge() == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Age pricing rules require minAge or maxAge.");
                }
                if (rule.getMinAge() != null && rule.getMaxAge() != null && rule.getMinAge() > rule.getMaxAge()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Age pricing rule minAge cannot exceed maxAge.");
                }
                rule.getGroups().clear();
            }

            newRules.add(rule);
        }

        comp.getPricingRules().clear();
        comp.getPricingRules().addAll(newRules);
    }

    @Transactional
    public ResolvedCompetitionDto createCompetition(Gym gym, CompetitionUpsertDto dto) {
        Competition comp = new Competition();
        comp.setGym(gym);
        applyUpsert(comp, dto, gym, null);
        competitionRepo.save(comp);
        return compMap.toDto(comp, gym);
    }

    @Transactional
    public ResolvedCompetitionDto updateCompetition(Gym gym, Long id, CompetitionUpsertDto dto) {
        Competition comp = competitionRepo.findByIdAndGymId(id, gym.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        applyUpsert(comp, dto, gym, null);
        return compMap.toDto(comp, gym);
    }

    @Transactional
    public Competition save(Competition competition) {
        return competitionRepo.save(competition);
    }

    public Competition startCompetition(Long id) {
        Competition comp = competitionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Competition not found"));
        comp.setCompStatus(CompetitionStatus.LIVE);
        return competitionRepo.save(comp);
    }

    public Competition stopCompetition(Long id) {
        Competition comp = competitionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Competition not found"));
        comp.setCompStatus(CompetitionStatus.FINISHED);
        return competitionRepo.save(comp);
    }

    @Transactional
    public void deleteCompetition(Long competitionId) {
        Competition competition = competitionRepo.findById(competitionId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, 
                "Competition not found with ID " + competitionId
            ));

        // Optional: ownership check
        /*Gym currentGym = gymService.getCurrentGym();
        if (!competition.getGym().getId().equals(currentGym.getId())) {
            throw new AccessDeniedException("You can only delete your own competitions.");
        }*/

        competitionRepo.delete(competition); // cascades to registrations, submissions, routes
    }
}
