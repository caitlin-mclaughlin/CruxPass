package com.cruxpass.services;

import com.cruxpass.dtos.CompetitionStatusUpdateDto;
import com.cruxpass.enums.CompetitionStatus;
import com.cruxpass.mappers.CompetitionMapper;
import com.cruxpass.models.Competition;
import com.cruxpass.models.Heat;
import com.cruxpass.repositories.CompetitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompetitionLifecycleService {

    private final CompetitionMapper compMapper;
    private final CompetitionRepository competitionRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Scheduled(fixedRate = 30000) // every 30 seconds
    @Transactional
    public void updateCompetitionStatuses() {
        List<Competition> competitions = competitionRepository.findAll();

        for (Competition comp : competitions) {
            CompetitionStatus previous = comp.getCompStatus();
            CompetitionStatus current = compMapper.calculateStatus(comp);

            if (current != previous) {
                comp.setCompStatus(current);
                competitionRepository.save(comp);

                // Broadcast to WebSocket
                messagingTemplate.convertAndSend(
                    "/topic/competitions/status",
                    new CompetitionStatusUpdateDto(comp.getId(), current)
                );

                System.out.println("Broadcasted competition status update: " +
                        comp.getName() + " → " + current);
            }
        }
    }
}
