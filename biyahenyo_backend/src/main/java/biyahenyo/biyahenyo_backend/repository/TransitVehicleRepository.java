package biyahenyo.biyahenyo_backend.repository;

import biyahenyo.biyahenyo_backend.model.TransitRoute;
import biyahenyo.biyahenyo_backend.model.TransitVehicle;
import biyahenyo.biyahenyo_backend.model.VehicleStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransitVehicleRepository extends JpaRepository<TransitVehicle, Long> {

    Optional<TransitVehicle> findFirstByDriverEmailIgnoreCase(String driverEmail);

    List<TransitVehicle> findByRouteAndStatus(TransitRoute route, VehicleStatus status);

    Optional<TransitVehicle> findFirstByStatusOrderByIdAsc(VehicleStatus status);
}
