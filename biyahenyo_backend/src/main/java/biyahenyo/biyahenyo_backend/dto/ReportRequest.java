package biyahenyo.biyahenyo_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ReportRequest {

    @NotBlank(message = "Report type is required")
    @Size(max = 50, message = "Report type must be 50 characters or fewer")
    private String reportType;

    @NotBlank(message = "Location is required")
    @Size(max = 200, message = "Location must be 200 characters or fewer")
    private String location;

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must be 2000 characters or fewer")
    private String description;

    public ReportRequest() {
    }

    public String getReportType() {
        return reportType;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
