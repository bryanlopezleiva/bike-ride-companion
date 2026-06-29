package com.bikecompanion.fit_parser_service.controller;

import com.bikecompanion.fit_parser_service.dto.GpsPointDTO;
import com.bikecompanion.fit_parser_service.dto.RideResponseDTO;
import com.bikecompanion.fit_parser_service.dto.RideSummaryResponseDTO;
import com.bikecompanion.fit_parser_service.service.FitParserService;
import com.bikecompanion.fit_parser_service.service.RideService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/rides")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
public class FitController {
    private final FitParserService fitParserService;
    private final RideService rideService;

    @PostMapping("/upload")
    public ResponseEntity<RideResponseDTO> uploadFitFile(@RequestParam("file")MultipartFile file)
    {
        log.info("Received FIT file upload: {}", file.getOriginalFilename());
        RideResponseDTO responseDTO = fitParserService.parseAndSave(file);
        return ResponseEntity.ok(responseDTO);
    }

    // get all rides — summary list for the ride history page
    @GetMapping
    public ResponseEntity<List<RideSummaryResponseDTO>> getAllRides() {
        List<RideSummaryResponseDTO> rides = rideService.getAllRides();
        return ResponseEntity.ok(rides);
    }

    // get a single ride with details
    @GetMapping("/{id}")
    public ResponseEntity<RideResponseDTO> getRideById(@PathVariable Long id)
    {
        RideResponseDTO ride = rideService.getRideById(id);
        return ResponseEntity.ok(ride);
    }

    // get GPS points for map display — full resolution
    @GetMapping("/{id}/gps")
    public ResponseEntity<List<GpsPointDTO>> getGpsPoints(
            @PathVariable Long id
    ) {
        List<GpsPointDTO> points = rideService.getGpsPoints(id);
        return ResponseEntity.ok(points);
    }

    // get sampled GPS points — lightweight preview for ride list
    @GetMapping("/{id}/gps/preview")
    public ResponseEntity<List<GpsPointDTO>> getGpsPointsPreview(
            @PathVariable Long id,
            @RequestParam(defaultValue = "10") int sampleRate
    ) {
        List<GpsPointDTO> points = rideService.getGpsPointsSampled(id, sampleRate);
        return ResponseEntity.ok(points);
    }

    // get rides within a date range
    @GetMapping("/range")
    public ResponseEntity<List<RideSummaryResponseDTO>> getRidesByDateRange(
            @RequestParam LocalDateTime from,
            @RequestParam LocalDateTime to
    ) {
        List<RideSummaryResponseDTO> rides = rideService.getRidesByDateRange(from, to);
        return ResponseEntity.ok(rides);
    }

    // delete a ride
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRide(@PathVariable Long id) {
        log.info("Deleting ride with id: {}", id);
        rideService.deleteRide(id);
        return ResponseEntity.noContent().build();
    }
}
