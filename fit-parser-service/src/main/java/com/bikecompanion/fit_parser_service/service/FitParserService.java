package com.bikecompanion.fit_parser_service.service;

import com.bikecompanion.fit_parser_service.dto.RideResponseDTO;
import com.bikecompanion.fit_parser_service.entity.GpsPoint;
import com.bikecompanion.fit_parser_service.entity.Ride;
import com.bikecompanion.fit_parser_service.mapper.RideMapper;
import com.bikecompanion.fit_parser_service.repository.RideRepository;
import com.garmin.fit.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FitParserService {

    private final RideRepository rideRepository;
    private final RideMapper rideMapper;

    @Transactional
    public RideResponseDTO parseAndSave(MultipartFile file) {

        String fileName = file.getOriginalFilename();

        // prevent duplicate uploads
        if (rideRepository.findByFitFileName(fileName).isPresent()) {
            log.warn("FIT file already uploaded: {}", fileName);
            throw new IllegalArgumentException(
                    "This FIT file has already been uploaded: " + fileName
            );
        }

        Ride ride = new Ride();
        ride.setFitFileName(fileName);

        List<GpsPoint> gpsPoints = new ArrayList<>();

        Decode decode = new Decode();
        MesgBroadcaster broadcaster = new MesgBroadcaster(decode);

        broadcaster.addListener((SessionMesgListener) mesg -> {
            log.info("Parsing session message from FIT file");

            if (mesg.getStartTime() != null) {
                ride.setStartTime(convertGarminTime(mesg.getStartTime()));
            }
            if (mesg.getTimestamp() != null) {
                ride.setEndTime(convertGarminTime(mesg.getTimestamp()));
            }

            ride.setTotalDistanceMeters(
                    mesg.getTotalDistance() != null ? mesg.getTotalDistance().doubleValue() : null
            );
            ride.setTotalElapsedTimeSeconds(mesg.getTotalElapsedTime());
            ride.setAvgSpeedMs(mesg.getAvgSpeed());
            ride.setMaxSpeedMs(mesg.getMaxSpeed());
            ride.setTotalCalories(
                    mesg.getTotalCalories() != null ? mesg.getTotalCalories().intValue() : null
            );
            ride.setAvgHeartRate(mesg.getAvgHeartRate());
            ride.setMaxHeartRate(mesg.getMaxHeartRate());
            ride.setAvgCadence(mesg.getAvgCadence());
            ride.setTotalAscentMeters(
                    mesg.getTotalAscent() != null ? mesg.getTotalAscent().intValue() : null
            );
            ride.setTotalDescentMeters(
                    mesg.getTotalDescent() != null ? mesg.getTotalDescent().intValue() : null
            );
        });

        broadcaster.addListener((LapMesgListener) mesg -> {
            log.debug("Lap detected — avg speed: {}", mesg.getAvgSpeed());
        });

        broadcaster.addListener((RecordMesgListener) mesg -> {
            GpsPoint point = new GpsPoint();

            if (mesg.getPositionLat() != null && mesg.getPositionLong() != null) {
                point.setLatitude(semicirclesToDegrees(mesg.getPositionLat()));
                point.setLongitude(semicirclesToDegrees(mesg.getPositionLong()));
            }

            if (mesg.getTimestamp() != null) {
                point.setTimestamp(convertGarminTime(mesg.getTimestamp()));
            }

            point.setAltitudeMeters(mesg.getAltitude());
            point.setSpeedMs(mesg.getSpeed());
            point.setHeartRate(mesg.getHeartRate());
            point.setCadence(mesg.getCadence());
            point.setPowerWatts(
                    mesg.getPower() != null ? mesg.getPower().intValue() : null
            );
            point.setTemperatureCelsius(mesg.getTemperature());
            point.setDistanceMeters(
                    mesg.getDistance() != null ? mesg.getDistance().doubleValue() : null
            );

            point.setRide(ride);
            gpsPoints.add(point);
        });

        try (InputStream inputStream = file.getInputStream()) {
            decode.read(inputStream, broadcaster);
            log.info("Successfully parsed {} GPS points", gpsPoints.size());
        } catch (IOException e) {
            log.error("Failed to read FIT file: {}", fileName, e);
            throw new RuntimeException("Failed to read FIT file: " + fileName, e);
        } catch (RuntimeException e) {
            log.error("Failed to parse FIT file: {}", fileName, e);
            throw new RuntimeException("Failed to parse FIT file: " + fileName, e);
        }

        if (ride.getRideName() == null && ride.getStartTime() != null) {
            ride.setRideName(generateRideName(ride.getStartTime()));
        }

        ride.setGpsPoints(gpsPoints);

        Ride saved = rideRepository.save(ride);
        log.info("Saved ride with id: {}", saved.getId());

        return rideMapper.toResponseDTO(saved);
    }

    private Double semicirclesToDegrees(int semicircles) {
        return semicircles * (180.0 / Math.pow(2, 31));
    }

    private LocalDateTime convertGarminTime(DateTime garminTime) {
        return LocalDateTime.ofInstant(
                garminTime.getDate().toInstant(),
                ZoneId.systemDefault()
        );
    }

    private String generateRideName(LocalDateTime startTime) {
        int hour = startTime.getHour();
        String timeOfDay;
        if (hour < 12) timeOfDay = "Morning";
        else if (hour < 17) timeOfDay = "Afternoon";
        else timeOfDay = "Evening";
        return timeOfDay + " Ride — " + startTime.toLocalDate();
    }
}