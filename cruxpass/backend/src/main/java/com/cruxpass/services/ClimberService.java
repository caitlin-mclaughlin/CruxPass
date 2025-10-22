package com.cruxpass.services;

import com.cruxpass.dtos.requests.CreateDependentDto;
import com.cruxpass.dtos.requests.RegisterRequest;
import com.cruxpass.dtos.requests.UpdateClimberRequestDto;
import com.cruxpass.mappers.ClimberMapper;
import com.cruxpass.models.Climber;
import com.cruxpass.repositories.ClimberRepository;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ClimberService {

    private final ClimberRepository climberRepo;
    private final PasswordEncoder passwordEncoder;

    private final ClimberMapper climberMap;

    public ClimberService(
        ClimberRepository climberRepo,
        ClimberMapper climberMap,
        PasswordEncoder passwordEncoder
    ) {
        this.climberRepo = climberRepo;
        this.climberMap = climberMap;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Climber createAdult(RegisterRequest dto) {
        if (climberRepo.findByEmailIgnoreCaseAndActiveTrue(dto.email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        } else if (climberRepo.findByUsernameAndActiveTrue(dto.username).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already in use");
        }

        return climberRepo.save(climberMap.toEntity(dto, passwordEncoder));
    }

    @Transactional
    public Climber createDependent(Long guardianId, CreateDependentDto dto) {
        Climber guardian = climberRepo.findById(guardianId).orElseThrow();
        Climber dependent = climberRepo.save(climberMap.toDependentEntity(dto, guardian));

        // Link guardian <-> dependent
        dependent.getGuardians().add(guardian);
        guardian.getDependents().add(dependent);

        return climberRepo.save(dependent);
    }

    @Transactional
    public Climber updateDependent(Long guardianId, Long dependentId, UpdateClimberRequestDto dto) {
        Climber dependent = climberRepo.findById(dependentId).orElseThrow();

        boolean isGuardian = dependent.getGuardians().stream()
            .anyMatch(g -> g.getId().equals(guardianId));
        if (!isGuardian) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your dependent");
        }

        climberMap.updateEntityFromDto(dto, dependent);
        return climberRepo.save(dependent);
    }

    @Transactional
    public Climber addGuardianToDependent(Long requesterId, Long dependentId, Long guardianId) {
        Climber requester = climberRepo.findById(requesterId).orElseThrow();
        Climber dependent = climberRepo.findById(dependentId).orElseThrow();
        Climber newGuardian = climberRepo.findById(guardianId).orElseThrow();

        // only an existing guardian can add another guardian
        boolean isGuardian = dependent.getGuardians().stream()
            .anyMatch(g -> g.getId().equals(requester.getId()));
        if (!isGuardian) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your dependent");
        }

        dependent.getGuardians().add(newGuardian);
        newGuardian.getDependents().add(dependent);

        return climberRepo.save(dependent);
    }

    @Transactional
    public Climber removeGuardianFromDependent(Long requesterId, Long dependentId, Long guardianId) {
        Climber requester = climberRepo.findById(requesterId).orElseThrow();
        Climber dependent = climberRepo.findById(dependentId).orElseThrow();

        boolean isGuardian = dependent.getGuardians().stream()
            .anyMatch(g -> g.getId().equals(requester.getId()));
        if (!isGuardian) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your dependent");
        }

        Climber guardianToRemove = dependent.getGuardians().stream()
            .filter(g -> g.getId().equals(guardianId))
            .findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Guardian not found"));

        dependent.getGuardians().remove(guardianToRemove);
        guardianToRemove.getDependents().remove(dependent);

        return climberRepo.save(dependent);
    }

    @Transactional
    public void deactivateGuardian(Long guardianId) {
        Climber guardian = climberRepo.findById(guardianId)
            .orElseThrow(() -> new RuntimeException("Guardian not found"));

        guardian.setActive(false);
        climberRepo.save(guardian);

        // Update dependents who no longer have any active guardians
        for (Climber dependent : guardian.getDependents()) {
            boolean hasOtherActiveGuardians = dependent.getGuardians()
                .stream()
                .anyMatch(Climber::isActive);

            if (!hasOtherActiveGuardians) {
                dependent.setActive(false);
                climberRepo.save(dependent);
            }
        }
    }

    @Transactional
    public boolean deleteDependent(Long guardianId, Long dependentId) {
        Climber guardian = climberRepo.findById(guardianId).orElse(null);
        Climber dependent = climberRepo.findById(dependentId).orElse(null);
        if (guardian == null || dependent == null)
            return false;

        // Ensure guardian actually has rights to this dependent
        if (!dependent.getGuardians().contains(guardian))
            return false;

        // Remove the guardian relationship
        dependent.getGuardians().remove(guardian);
        guardian.getDependents().remove(dependent);
        climberRepo.save(guardian);
        climberRepo.save(dependent);

        // If no guardians remain → soft delete
        if (dependent.getGuardians().isEmpty()) {
            dependent.setActive(false); // or dependent.setDeleted(true);
            climberRepo.save(dependent);
        }

        return true;
    }

    @Transactional
    public void deactivateClimber(Long climberId) {
        Climber climber = climberRepo.findById(climberId)
            .orElseThrow(() -> new RuntimeException("Climber not found"));

        climber.setActive(false);
        climberRepo.save(climber);

        // If climber is a guardian, cascade deactivation check for dependents
        for (Climber dependent : climber.getDependents()) {
            boolean hasOtherActiveGuardians = dependent.getGuardians()
                .stream()
                .anyMatch(Climber::isActive);

            if (!hasOtherActiveGuardians) {
                dependent.setActive(false);
                climberRepo.save(dependent);
            }
        }
    }

    @Transactional
    public Climber save(Climber climber) {
        return climberRepo.save(climber);
    }

    public List<Climber> getAll() {
        return climberRepo.findAll();
    }

    public Climber getById(Long id) {
        return climberRepo.findById(id).orElse(null);
    }

    public Climber getByEmail(String email) {
        if (email == null) return null;
        return climberRepo.findByEmailIgnoreCaseAndActiveTrue(email).orElse(null);
    }

    public Climber getByUsername(String username) {
        return climberRepo.findByUsernameAndActiveTrue(username).orElse(null);
    }
    
    public Climber getByEmailOrUsername(String id) {
        return (climberRepo.findByEmailIgnoreCaseAndActiveTrue(id).or(() -> climberRepo.findByUsernameAndActiveTrue(id))).orElse(null);
    }

    public boolean passwordMatches(Climber climber, String rawPassword) {
        return passwordEncoder.matches(rawPassword, climber.getPasswordHash());
    }
    
    public List<Climber> getDependentsOfGuardian(Long guardianId) {
        return climberRepo.findByGuardians_IdAndActiveTrue(guardianId);
    }

    public List<Climber> searchClimbers(String email, String name, String phone) {
        // If no filters were provided, just return an empty list
        if ((email == null || email.isBlank()) &&
            (name == null || name.isBlank()) &&
            (phone == null || phone.isBlank())) {
            return List.of();
        }

        Set<Climber> results = new HashSet<>();

        // Search by email
        if (email != null && !email.isBlank()) {
            climberRepo.findByEmailIgnoreCaseAndActiveTrue(email)
                    .ifPresent(results::add);
        }

        // Search by name
        if (name != null && !name.isBlank()) {
            results.addAll(climberRepo.findByNameContainingIgnoreCaseAndActiveTrue(name));
        }

        // Search by phone
        if (phone != null && !phone.isBlank()) {
            results.addAll(climberRepo.findByPhoneContainingAndActiveTrue(phone));
        }

        return new ArrayList<>(results);
    }

}
