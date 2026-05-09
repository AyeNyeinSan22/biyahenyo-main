package biyahenyo.biyahenyo_backend.repository;

import biyahenyo.biyahenyo_backend.model.TrafficData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrafficRepository extends JpaRepository<TrafficData, Long> {
    Optional<TrafficData> findByLocation(String location);
}
