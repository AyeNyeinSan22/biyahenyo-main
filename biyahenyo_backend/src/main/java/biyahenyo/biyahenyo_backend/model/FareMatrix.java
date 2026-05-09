package biyahenyo.biyahenyo_backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "fare_matrix")
public class FareMatrix {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String vehicleType;
    private Double distanceMin;
    private Double distanceMax;
    private Double regularFare;
    private Double studentFare;
    private Double seniorFare;

    public FareMatrix() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public Double getDistanceMin() {
        return distanceMin;
    }

    public void setDistanceMin(Double distanceMin) {
        this.distanceMin = distanceMin;
    }

    public Double getDistanceMax() {
        return distanceMax;
    }

    public void setDistanceMax(Double distanceMax) {
        this.distanceMax = distanceMax;
    }

    public Double getRegularFare() {
        return regularFare;
    }

    public void setRegularFare(Double regularFare) {
        this.regularFare = regularFare;
    }

    public Double getStudentFare() {
        return studentFare;
    }

    public void setStudentFare(Double studentFare) {
        this.studentFare = studentFare;
    }

    public Double getSeniorFare() {
        return seniorFare;
    }

    public void setSeniorFare(Double seniorFare) {
        this.seniorFare = seniorFare;
    }
}
