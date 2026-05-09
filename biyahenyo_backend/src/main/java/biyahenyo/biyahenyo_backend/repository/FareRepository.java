package biyahenyo.biyahenyo_backend.repository;

import biyahenyo.biyahenyo_backend.model.FareMatrix;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FareRepository extends JpaRepository<FareMatrix, Long> {
    List<FareMatrix> findByVehicleType(String vehicleType);
}
