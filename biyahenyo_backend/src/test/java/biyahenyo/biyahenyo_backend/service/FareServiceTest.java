package biyahenyo.biyahenyo_backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import biyahenyo.biyahenyo_backend.model.FareMatrix;
import biyahenyo.biyahenyo_backend.repository.FareRepository;

@ExtendWith(MockitoExtension.class)
class FareServiceTest {

    @Mock
    private FareRepository fareRepository;

    @InjectMocks
    private FareService fareService;

    private List<FareMatrix> jeepneyFares;
    private List<FareMatrix> tricycleFares;

    @BeforeEach
    void setUp() {
        FareMatrix jeepneyBase = new FareMatrix();
        jeepneyBase.setVehicleType("JEEPNEY");
        jeepneyBase.setDistanceMin(0.0);
        jeepneyBase.setDistanceMax(4.0);
        jeepneyBase.setRegularFare(13.0);
        jeepneyBase.setStudentFare(11.0);
        jeepneyBase.setSeniorFare(11.0);

        FareMatrix jeepneyExtended = new FareMatrix();
        jeepneyExtended.setVehicleType("JEEPNEY");
        jeepneyExtended.setDistanceMin(4.1);
        jeepneyExtended.setDistanceMax(100.0);
        jeepneyExtended.setRegularFare(15.0);
        jeepneyExtended.setStudentFare(13.0);
        jeepneyExtended.setSeniorFare(13.0);

        jeepneyFares = List.of(jeepneyBase, jeepneyExtended);

        FareMatrix tricycle = new FareMatrix();
        tricycle.setVehicleType("TRICYCLE");
        tricycle.setDistanceMin(0.0);
        tricycle.setDistanceMax(100.0);
        tricycle.setRegularFare(20.0);
        tricycle.setStudentFare(16.0);
        tricycle.setSeniorFare(16.0);

        tricycleFares = List.of(tricycle);
    }

    @Test
    void estimateFare_jeepneyShortDistance_regularFare() {
        when(fareRepository.findByVehicleType("JEEPNEY")).thenReturn(jeepneyFares);

        Double fare = fareService.estimateFare("JEEPNEY", 2.5, "REGULAR");

        assertEquals(13.0, fare);
    }

    @Test
    void estimateFare_jeepneyShortDistance_studentFare() {
        when(fareRepository.findByVehicleType("JEEPNEY")).thenReturn(jeepneyFares);

        Double fare = fareService.estimateFare("JEEPNEY", 3.0, "STUDENT");

        assertEquals(11.0, fare);
    }

    @Test
    void estimateFare_jeepneyShortDistance_seniorFare() {
        when(fareRepository.findByVehicleType("JEEPNEY")).thenReturn(jeepneyFares);

        Double fare = fareService.estimateFare("JEEPNEY", 1.0, "SENIOR");

        assertEquals(11.0, fare);
    }

    @Test
    void estimateFare_jeepneyLongDistance_regularFare() {
        when(fareRepository.findByVehicleType("JEEPNEY")).thenReturn(jeepneyFares);

        Double fare = fareService.estimateFare("JEEPNEY", 8.0, "REGULAR");

        assertEquals(15.0, fare);
    }

    @Test
    void estimateFare_jeepneyLongDistance_studentFare() {
        when(fareRepository.findByVehicleType("JEEPNEY")).thenReturn(jeepneyFares);

        Double fare = fareService.estimateFare("JEEPNEY", 10.0, "STUDENT");

        assertEquals(13.0, fare);
    }

    @Test
    void estimateFare_tricycle_anyDistance_regularFare() {
        when(fareRepository.findByVehicleType("TRICYCLE")).thenReturn(tricycleFares);

        Double fare = fareService.estimateFare("TRICYCLE", 5.0, "REGULAR");

        assertEquals(20.0, fare);
    }

    @Test
    void estimateFare_tricycle_anyDistance_studentFare() {
        when(fareRepository.findByVehicleType("TRICYCLE")).thenReturn(tricycleFares);

        Double fare = fareService.estimateFare("TRICYCLE", 5.0, "STUDENT");

        assertEquals(16.0, fare);
    }

    @Test
    void estimateFare_noMatchingRange_returnsNull() {
        when(fareRepository.findByVehicleType("BUS")).thenReturn(List.of());

        Double fare = fareService.estimateFare("BUS", 5.0, "REGULAR");

        assertNull(fare);
    }

    @Test
    void estimateFare_jeepneyAtBoundary_returnsCorrectRange() {
        when(fareRepository.findByVehicleType("JEEPNEY")).thenReturn(jeepneyFares);

        // Exactly at 4.0 should match the base range (0.0 - 4.0)
        Double fareAtBoundary = fareService.estimateFare("JEEPNEY", 4.0, "REGULAR");
        assertEquals(13.0, fareAtBoundary);

        // Just above 4.0 should match the extended range (4.1 - 100.0)
        Double fareAboveBoundary = fareService.estimateFare("JEEPNEY", 4.1, "REGULAR");
        assertEquals(15.0, fareAboveBoundary);
    }
}
