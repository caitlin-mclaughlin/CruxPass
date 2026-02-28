package com.cruxpass.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.cruxpass.enums.OwnerType;
import com.cruxpass.models.AgeRule;
import com.cruxpass.models.CompetitorGroup;

public interface CompetitorGroupRepository extends JpaRepository<CompetitorGroup, Long> {

    @Query("""
        SELECT g FROM CompetitorGroup g
        WHERE g.ownerType = :ownerType
        AND g.ownerId = :ownerId
        AND g.deleted = false
    """)
    List<CompetitorGroup> findActiveGroupsByOwnerTypeAndOwnerId(OwnerType ownerType, Long ownerId);

    @Query("""
        SELECT g FROM CompetitorGroup g
        WHERE g.ownerType = :ownerType
        AND g.ownerId = :ownerId
        AND g.name = :name
    """)
    Optional<CompetitorGroup> findDuplicate(OwnerType ownerType, Long ownerId, String name, AgeRule ageRule);
    
}