package biyahenyo.biyahenyo_backend.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import biyahenyo.biyahenyo_backend.model.FareMatrix;
import biyahenyo.biyahenyo_backend.model.TrafficData;
import biyahenyo.biyahenyo_backend.model.TransportRoute;
import biyahenyo.biyahenyo_backend.repository.FareRepository;
import biyahenyo.biyahenyo_backend.repository.TrafficRepository;
import biyahenyo.biyahenyo_backend.repository.TransportRepository;

@Configuration
public class DataInitializer {

    @Bean
    @SuppressWarnings({"null", "unused"})
    CommandLineRunner initDatabase(FareRepository fareRepository, TransportRepository transportRepository, TrafficRepository trafficRepository) {
        return args -> {
            if (fareRepository.count() == 0) {
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

                FareMatrix tricycle = new FareMatrix();
                tricycle.setVehicleType("TRICYCLE");
                tricycle.setDistanceMin(0.0);
                tricycle.setDistanceMax(100.0);
                tricycle.setRegularFare(20.0);
                tricycle.setStudentFare(16.0);
                tricycle.setSeniorFare(16.0);

                fareRepository.saveAll(List.of(jeepneyBase, jeepneyExtended, tricycle));
            }

            transportRepository.deleteAll();
            transportRepository.saveAll(List.of(
                    transportRoute("JEEPNEY", "Lipa", "Batangas City (Bayan)", "Balagtas Exit / Diversion Road", "Lipa -> STAR Tollway -> Balagtas Exit -> Diversion Road -> Capitolio -> Rizal Ave -> Bayan"),
                    transportRoute("JEEPNEY", "Balagtas", "Batangas City (Bayan)", "SM City Batangas", "Balagtas -> Diversion Road -> SM Batangas -> Kumintang -> Rizal Ave -> Bayan"),
                    transportRoute("JEEPNEY", "Capitolio", "Batangas City (Bayan)", "Batangas Medical Center", "Capitolio -> Hospital -> Kumintang Ilaya -> Rizal Ave -> Bayan"),
                    transportRoute("JEEPNEY", "Libjo", "Batangas City (Bayan)", "SM / Pallocan Route", "Libjo -> Pallocan -> SM Batangas -> Rizal Ave -> Bayan"),
                    transportRoute("JEEPNEY", "Batangas Pier", "Batangas City (Bayan)", "Batangas State University (Main)", "Pier -> BatSU -> Hilltop -> City Proper Road -> Bayan"),
                    transportRoute("JEEPNEY", "Bauan", "Batangas City (Bayan)", "Bolbok Crossing", "Bauan -> San Pascual -> Bolbok -> Santa Clara -> Capitolio -> Bayan"),
                    transportRoute("JEEPNEY", "Mabini", "Batangas City (Bayan)", "Lumang Palengke", "Mabini -> Bauan -> San Pascual -> Bolbok -> Bayan"),
                    transportRoute("JEEPNEY", "Mabacong", "Batangas City (Bayan)", "Tabangao / Libjo Route", "Mabacong -> Tabangao -> Libjo -> Pallocan -> SM -> Bayan"),
                    transportRoute("JEEPNEY", "Lemery", "Batangas City (Bayan)", "Taal - Bauan Highway", "Lemery -> Taal -> Alitagtag -> Bauan -> Bolbok -> Bayan"),
                    transportRoute("JEEPNEY", "Taal", "Batangas City (Bayan)", "Alitagtag Road", "Taal -> Alitagtag -> Bauan -> Bolbok -> Bayan"),
                    transportRoute("JEEPNEY", "Calaca", "Batangas City (Bayan)", "Lemery - Bauan Highway", "Calaca -> Lemery -> Bauan -> Bolbok -> Bayan"),
                    transportRoute("JEEPNEY", "Balayan", "Batangas City (Bayan)", "Western Batangas Highway", "Balayan -> Calaca -> Lemery -> Bauan -> Bayan"),
                    transportRoute("JEEPNEY", "Nasugbu", "Batangas City (Bayan)", "Western Batangas Highway", "Nasugbu -> Tuy -> Balayan -> Calaca -> Lemery -> Bauan -> Bayan"),
                    transportRoute("JEEPNEY", "San Juan", "Batangas City (Bayan)", "Rosario - Ibaan Corridor", "San Juan -> Rosario -> Ibaan -> Diversion Road -> Bayan"),
                    transportRoute("JEEPNEY", "Rosario", "Batangas City (Bayan)", "Diversion Road", "Rosario -> Ibaan -> Diversion Road -> Bayan"),
                    transportRoute("JEEPNEY", "Ibaan", "Batangas City (Bayan)", "Diversion Road", "Ibaan -> Diversion Road -> Rizal Ave -> Bayan"),
                    transportRoute("JEEPNEY", "San Pascual", "Batangas City (Bayan)", "Bolbok Corridor", "San Pascual -> Bolbok -> Capitolio -> Rizal Ave -> Bayan"),
                    transportRoute("JEEPNEY", "Alitagtag", "Batangas City (Bayan)", "Bauan Transfer Route", "Alitagtag -> Bauan -> Bolbok -> Rizal Ave -> Bayan"),
                    transportRoute("JEEPNEY", "Tingloy", "Batangas City (Bayan)", "Mabini - Bauan Transfer", "Tingloy -> Mabini -> Bauan -> Batangas City -> Bayan"),
                    transportRoute("JEEPNEY", "Cuenca", "Batangas City (Bayan)", "Lipa Transfer Route", "Cuenca -> Lipa -> Balagtas -> Rizal Ave -> Bayan"),
                    transportRoute("JEEPNEY", "Lobo", "Batangas City (Bayan)", "Coastal Road", "Lobo -> Coastal Road -> Rizal Ave -> Bayan"),
                    transportRoute("JEEPNEY", "Balete", "Batangas City (Bayan)", "Tanauan Transfer Route", "Balete -> Tanauan -> Balagtas -> Rizal Ave -> Bayan"),
                    transportRoute("JEEPNEY", "Laurel", "Batangas City (Bayan)", "STAR Tollway via Tanauan", "Laurel -> Tanauan -> STAR Tollway -> Balagtas -> Bayan"),
                    transportRoute("JEEPNEY", "Agoncillo", "Batangas City (Bayan)", "Lemery Transfer Route", "Agoncillo -> Lemery -> Taal -> Alitagtag -> Bauan -> Bayan"),
                    transportRoute("JEEPNEY", "San Nicolas", "Batangas City (Bayan)", "Lemery Transfer Route", "San Nicolas -> Lemery -> Taal -> Alitagtag -> Bauan -> Bayan"),
                    transportRoute("JEEPNEY", "Talisay", "Batangas City (Bayan)", "STAR Tollway via Tanauan", "Talisay -> Tanauan -> STAR Tollway -> Balagtas -> Bayan"),
                    transportRoute("JEEPNEY", "Mataasnakahoy", "Batangas City (Bayan)", "Lipa Transfer Route", "Mataasnakahoy -> Lipa -> STAR Tollway -> Balagtas -> Bayan"),
                    transportRoute("JEEPNEY", "General Trias", "Batangas City (Bayan)", "Nasugbu Transfer Route", "General Trias -> Nasugbu -> Lemery -> Bauan -> Bayan"),
                    transportRoute("JEEPNEY", "Tagaytay", "Batangas City (Bayan)", "Tagaytay-Nasugbu Highway", "Tagaytay -> Nasugbu -> Balayan -> Calaca -> Lemery -> Bauan -> Bayan"),
                    transportRoute("JEEPNEY", "MOA (Pasay)", "Batangas City (Bayan)", "SLEX - STAR Tollway", "MOA -> SLEX -> STAR Tollway -> Balagtas Exit -> Diversion Road -> Bayan"),
                    transportRoute("JEEPNEY", "Lucena", "Batangas City (Bayan)", "Maharlika Highway", "Lucena -> Sariaya -> San Juan -> Rosario -> Diversion Road -> Bayan"),
                    transportRoute("JEEPNEY", "Alabang", "Batangas City (Bayan)", "SLEX - STAR Tollway", "Alabang -> SLEX -> STAR Tollway -> Balagtas -> Diversion -> Bayan"),
                    transportRoute("JEEPNEY", "Calamba", "Batangas City (Bayan)", "SLEX - STAR Tollway", "Calamba -> SLEX -> STAR Tollway -> Balagtas -> Diversion -> Bayan"),
                    transportRoute("TRICYCLE", "GCH", "SM Batangas City", "Golden Country Homes", "GCH Gate -> Diversion Road -> SM Pallocan")
            ));

            if (trafficRepository.count() == 0) {
                TrafficData h1 = new TrafficData();
                h1.setLocation("Bayan");
                h1.setTrafficLevel("Heavy");

                TrafficData h2 = new TrafficData();
                h2.setLocation("Alangilan");
                h2.setTrafficLevel("Moderate");

                TrafficData h3 = new TrafficData();
                h3.setLocation("Balagtas Rotonda");
                h3.setTrafficLevel("Moderate");

                TrafficData h4 = new TrafficData();
                h4.setLocation("Hilltop");
                h4.setTrafficLevel("Heavy");

                trafficRepository.saveAll(List.of(h1, h2, h3, h4));
            }
        };
    }

    private static TransportRoute transportRoute(
            String vehicleType,
            String startLocation,
            String endLocation,
            String landmark,
            String routeSteps
    ) {
        TransportRoute route = new TransportRoute();
        route.setVehicleType(vehicleType);
        route.setStartLocation(startLocation);
        route.setEndLocation(endLocation);
        route.setLandmark(landmark);
        route.setRouteSteps(routeSteps);
        return route;
    }
}
