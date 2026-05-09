package biyahenyo.biyahenyo_backend.repository;

import biyahenyo.biyahenyo_backend.model.TransitStop;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransitStopRepository extends JpaRepository<TransitStop, Long> {

    Optional<TransitStop> findByNameIgnoreCase(String name);

    List<TransitStop> findAllByOrderByNameAsc();
}
