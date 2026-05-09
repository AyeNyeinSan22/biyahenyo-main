package biyahenyo.biyahenyo_backend.repository;

import biyahenyo.biyahenyo_backend.model.TransportRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransportRepository extends JpaRepository<TransportRoute, Long> {
    List<TransportRoute> findByVehicleType(String vehicleType);
}
