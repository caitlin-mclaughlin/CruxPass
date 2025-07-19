package com.cruxpass.repositories;

import com.cruxpass.models.Submission;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByCompetitionId(Long id);
    List<Submission> findByClimberId(Long id);
}