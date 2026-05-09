package biyahenyo.biyahenyo_backend.repository;

import biyahenyo.biyahenyo_backend.model.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {
    List<Route> findByStartLocationAndEndLocation(String startLocation, String endLocation);
}
