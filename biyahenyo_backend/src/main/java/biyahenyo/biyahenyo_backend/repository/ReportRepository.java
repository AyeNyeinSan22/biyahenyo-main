package biyahenyo.biyahenyo_backend.repository;

import biyahenyo.biyahenyo_backend.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
}
