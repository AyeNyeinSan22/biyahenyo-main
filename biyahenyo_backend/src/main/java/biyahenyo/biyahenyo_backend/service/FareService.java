package biyahenyo.biyahenyo_backend.service;

import biyahenyo.biyahenyo_backend.model.FareMatrix;
import biyahenyo.biyahenyo_backend.repository.FareRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FareService {

    private final FareRepository fareRepository;

    public FareService(FareRepository fareRepository) {
        this.fareRepository = fareRepository;
    }

    public Double estimateFare(String vehicleType, Double distance, String passengerType) {
        List<FareMatrix> matrix = fareRepository.findByVehicleType(vehicleType);
        
        Optional<FareMatrix> matchingRange = matrix.stream()
                .filter(m -> distance >= m.getDistanceMin() && distance <= m.getDistanceMax())
                .findFirst();
        
        if (matchingRange.isPresent()) {
            FareMatrix fm = matchingRange.get();
            if ("STUDENT".equalsIgnoreCase(passengerType)) {
                return fm.getStudentFare();
            } else if ("SENIOR".equalsIgnoreCase(passengerType)) {
                return fm.getSeniorFare();
            } else {
                return fm.getRegularFare();
            }
        }
        
        return null;
    }
}
