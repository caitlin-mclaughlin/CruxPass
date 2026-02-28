package com.cruxpass.repositories;

import com.cruxpass.models.Climber;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClimberRepository extends JpaRepository<Climber, Long> {
    Optional<Climber> findByEmailIgnoreCaseAndActiveTrue(String email);
    Optional<Climber> findByUsernameAndActiveTrue(String username);
    List<Climber> findByGuardians_IdAndActiveTrue(Long guardianId);

    @Query("""
        SELECT DISTINCT c FROM Climber c
        WHERE c.active = true
        AND (
            (:email IS NULL OR LOWER(c.email) LIKE LOWER(CONCAT('%', :email, '%')))
            OR (:name IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')))
            OR (:phone IS NULL OR c.phone LIKE CONCAT('%', :phone, '%'))
        )
    """)
    List<Climber> searchClimbersFlexible(
        @Param("email") String email,
        @Param("name") String name,
        @Param("phone") String phone
    );

    @Query("SELECT d FROM Climber d WHERE d.active = true AND " +
       "NOT EXISTS (SELECT g FROM d.guardians g WHERE g.active = true)")
    List<Climber> findDependentsWithNoActiveGuardians();

    @Query("""
        SELECT c FROM Climber c
        WHERE c.active = false
          AND (c.registrations IS EMPTY OR c.registrations IS NULL)
          AND (c.submissions IS EMPTY OR c.submissions IS NULL)
          AND (c.dependents IS EMPTY OR c.dependents IS NULL)
          AND (c.guardians IS EMPTY OR c.guardians IS NULL)
    """)
    List<Climber> findFullyInactiveClimbers();
}
