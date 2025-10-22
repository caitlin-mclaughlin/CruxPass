package com.cruxpass.services;

import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cruxpass.models.Climber;
import com.cruxpass.repositories.ClimberRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClimberCleanupService {

    private final ClimberRepository climberRepo;

    // Run once daily at 3 AM
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupInactiveClimbers() {
        List<Climber> inactiveClimbers = climberRepo.findFullyInactiveClimbers();

        if (inactiveClimbers.isEmpty()) {
            log.info("No inactive climbers to delete.");
            return;
        }

        log.info("Cleaning up {} fully inactive climbers...", inactiveClimbers.size());
        climberRepo.deleteAll(inactiveClimbers);
        log.info("Cleanup complete.");
    }
}
