package biyahenyo.biyahenyo_backend.repository;

import biyahenyo.biyahenyo_backend.model.TransitRoute;
import biyahenyo.biyahenyo_backend.model.TransitRouteStop;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransitRouteStopRepository extends JpaRepository<TransitRouteStop, Long> {

    List<TransitRouteStop> findByRouteOrderBySequenceNumberAsc(TransitRoute route);
}
