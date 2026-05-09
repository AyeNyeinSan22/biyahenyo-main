package biyahenyo.biyahenyo_backend.repository;

import biyahenyo.biyahenyo_backend.model.TransitVehicle;
import biyahenyo.biyahenyo_backend.model.VehicleLocation;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleLocationRepository extends JpaRepository<VehicleLocation, Long> {

    Optional<VehicleLocation> findByVehicle(TransitVehicle vehicle);
}
