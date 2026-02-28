package com.cruxpass.services;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.cruxpass.dtos.CompetitorGroupDto;
import com.cruxpass.dtos.CreatedGroupResult;
import com.cruxpass.dtos.ResolvedCompetitorGroup;
import com.cruxpass.dtos.requests.CreateCompetitorGroupDto;
import com.cruxpass.dtos.requests.GroupMutationsDto;
import com.cruxpass.enums.OwnerType;
import com.cruxpass.mappers.CompetitorGroupMapper;
import com.cruxpass.models.CompetitorGroup;
import com.cruxpass.models.Gym;
import com.cruxpass.models.Series;
import com.cruxpass.models.GroupRefs.CustomGroupRef;
import com.cruxpass.models.GroupRefs.GroupRef;
import com.cruxpass.repositories.CompetitorGroupRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CompetitorGroupService {

    private final CompetitorGroupRepository groupRepo;
    private final CompetitorGroupMapper groupMap;

    public List<ResolvedCompetitorGroup> getActiveGroups(OwnerType type, Long ownerId) {
        return groupRepo.findActiveGroupsByOwnerTypeAndOwnerId(type, ownerId)
            .stream()
            .map(groupMap::toResolved)
            .toList();
    }

    public ResolvedCompetitorGroup createGroup(
        OwnerType type,
        Long ownerId,
        CreateCompetitorGroupDto dto
    ) {
        CompetitorGroup g = groupRepo.findDuplicate(type, ownerId, dto.name(), dto.ageRule()).orElse(null);
        if (g != null) {
            if (g.isDeleted() && g.getDeletedAt() != null) {
                g.setDeleted(false);
                g.setDeletedAt(null);
            groupMap.updateGroupFromDto(new CompetitorGroupDto(g.getId(), dto), g);

            return groupMap.toResolved(groupRepo.save(g));
            } else {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "active, identical group exists");
            }
        } else {
            g = groupMap.createGroupFromDto(dto, type, ownerId);
        }
        return groupMap.toResolved(groupRepo.save(g));
    }

    public ResolvedCompetitorGroup updateGroup(
        OwnerType type,
        Long ownerId,
        Long groupId,
        CompetitorGroupDto dto
    ) {
        CompetitorGroup g = groupRepo.findById(groupId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        validateOwnership(g, type, ownerId);

        if (g.isDeleted())
            throw new IllegalStateException("Cannot update deleted group " + dto.id());

        groupMap.updateGroupFromDto(dto, g);

        return groupMap.toResolved(groupRepo.save(g));
    }

    @Transactional
    public void deleteGroup(
        OwnerType type,
        Long ownerId,
        Long groupId
    ) {
        CompetitorGroup group = groupRepo.findById(groupId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deleted group not found: " + groupId));

        validateOwnership(group, type, ownerId);

        group.setDeleted(true);
        group.setDeletedAt(Instant.now());
    }

    @Transactional
    public List<CreatedGroupResult> applyGroupMutations(
        OwnerType ownerType, // GYM or SERIES
        Long ownerId,
        GroupMutationsDto dto
    ) {
        List<CreatedGroupResult> createdResults = new ArrayList<>();
        if (dto.created() != null) {
            for (CreateCompetitorGroupDto c : dto.created()) {
                ResolvedCompetitorGroup g = createGroup(ownerType, ownerId, c);
                createdResults.add(new CreatedGroupResult(c.clientId(), g.id()));
            }
        }

        if (dto.updated() != null) {
            for (CompetitorGroupDto u : dto.updated()) {
                updateGroup(ownerType, ownerId, u.id(), u);
            }
        }

        if (dto.deleted() != null) {
            for (Long id : dto.deleted()) {
                deleteGroup(ownerType, ownerId, id);
            }
        }
        return createdResults;
    }

    public void validateOwnership(
        CompetitorGroup group,
        OwnerType expectedOwner,
        Long ownerId
    ) {
        if (group.getOwnerType() != expectedOwner ||
            !group.getOwnerId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

    public void validateGroupRefs(
        Set<GroupRef> groups,
        Gym gym,
        Series series
    ) {
        if ((gym == null) == (series == null)) {
            throw new IllegalStateException("Exactly one owner must be provided");
        }

        OwnerType expectedOwner =
            gym != null ? OwnerType.GYM : OwnerType.SERIES;

        Long ownerId =
            gym != null ? gym.getId() : series.getId();

        // 1. Extract custom group IDs
        Set<Long> ids = groups.stream()
            .filter(r -> r instanceof CustomGroupRef)
            .map(r -> ((CustomGroupRef) r).id())
            .collect(Collectors.toSet());

        if (ids.isEmpty()) {
            return;
        }

        // 2. Bulk load
        Map<Long, CompetitorGroup> found = groupRepo.findAllById(ids)
            .stream()
            .collect(Collectors.toMap(
                CompetitorGroup::getId,
                Function.identity()
            ));

        // 3. Detect missing IDs
        if (found.size() != ids.size()) {
            Set<Long> missing = new HashSet<>(ids);
            missing.removeAll(found.keySet());
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Competitor group(s) not found: " + missing
            );
        }

        // 4. Validate ownership
        for (CompetitorGroup group : found.values()) {
            validateOwnership(group, expectedOwner, ownerId);
        }
    }
    
}
