package com.cruxpass.services;
import com.cruxpass.dtos.HeatGroupProjection;
import com.cruxpass.dtos.requests.CompetitionUpsertDto;
import com.cruxpass.dtos.requests.HeatUpsertDto;
import com.cruxpass.dtos.requests.UpdateCompetitionDto;
import com.cruxpass.dtos.responses.ResolvedCompetitionDto;
import com.cruxpass.dtos.responses.ResolvedHeatDto;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.mappers.CompetitionMapper;
import com.cruxpass.mappers.HeatMapper;
import com.cruxpass.models.Competition;
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

    public List<Competition> getByGymId(Long gymId) {
        return competitionRepo.findByGymId(gymId);
    }

    @Transactional(readOnly = true)
    public List<ResolvedCompetitionDto> getByGymWithHeats(Gym gym) {
        List<Competition> comps = competitionRepo.findByGymIdWithHeats(gym.getId());
        return compMap.toDtoList(comps, gym);
    }
    
    public List<Competition> getAll() {
        return competitionRepo.findAll();
    }
    
    public List<Competition> getAllWithHeats() {
        return competitionRepo.findAllWithHeats();
    }

    public Competition getById(Long id) {
        return competitionRepo.findById(id).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public Competition getByIdAndGymId(Long id, Long gymId) {
        return competitionRepo.findByIdAndGymId(id, gymId).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public Competition getByIdWithRegistrations(Long id) {
        return competitionRepo.findByIdWithRegistrations(id).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public Competition getByIdWithHeats(Long id) {
        return competitionRepo.findByIdWithHeats(id).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public ResolvedCompetitionDto getDtoByIdWithHeats(Long id, Gym gym) {
        // Fetch comp
        Competition comp = competitionRepo.findByIdWithSelectedGroups(id).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        // Fetch heats
        List<Heat> heats = competitionRepo.findHeatsByCompetitionId(id);

        // Fetch groups for heats
        List<HeatGroupProjection> projections = competitionRepo.findGroupsByHeatIds(
            heats.stream().map(Heat::getId).toList());

        // Map heatId -> Set<GroupRefEmbeddable>
        Map<Long, Set<GroupRefEmbeddable>> groupsByHeatId = new HashMap<>();
        for (HeatGroupProjection row : projections) {
            groupsByHeatId.computeIfAbsent(row.heatId(), k -> new HashSet<>()).add(row.group());
        }

        List<ResolvedHeatDto> heatDtos = heatMap.toDtoListWithGroups(heats, groupsByHeatId);

        return compMap.toDtoWithHeats(comp, heatDtos, gym);
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
        syncHeats(comp, dto.heats(), gym, series);
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