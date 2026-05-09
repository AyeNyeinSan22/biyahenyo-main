package biyahenyo.biyahenyo_backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import biyahenyo.biyahenyo_backend.model.Report;
import biyahenyo.biyahenyo_backend.service.ReportService;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/add")
    public Report addReport(@RequestBody Report report) {
        return reportService.addReport(report == null ? new Report() : report);
    }

    @GetMapping("/all")
    public List<Report> getAllReports() {
        return reportService.getAllReports();
    }
}
