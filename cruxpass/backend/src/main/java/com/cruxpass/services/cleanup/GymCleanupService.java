package com.cruxpass.services.cleanup;

import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cruxpass.models.Gym;
import com.cruxpass.repositories.GymRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class GymCleanupService {

    private final GymRepository GymRepo;

    // Run once daily at 3 AM
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupInactiveGyms() {
        List<Gym> inactiveGyms = GymRepo.findFullyInactiveGyms();

        if (inactiveGyms.isEmpty()) {
            log.info("No inactive Gyms to delete.");
            return;
        }

        log.info("Cleaning up {} fully inactive Gyms...", inactiveGyms.size());
        GymRepo.deleteAll(inactiveGyms);
        log.info("Cleanup complete.");
    }
}
