package biyahenyo.biyahenyo_backend.repository;

import biyahenyo.biyahenyo_backend.model.TransitRoute;
import biyahenyo.biyahenyo_backend.model.TransportMode;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransitRouteRepository extends JpaRepository<TransitRoute, Long> {

    List<TransitRoute> findByModeAndActiveTrue(TransportMode mode);
}
