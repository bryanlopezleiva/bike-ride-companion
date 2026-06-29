package com.bikecompanion.fit_parser_service.service;

import com.bikecompanion.fit_parser_service.dto.GpsPointDTO;
import com.bikecompanion.fit_parser_service.dto.RideResponseDTO;
import com.bikecompanion.fit_parser_service.dto.RideSummaryResponseDTO;
import com.bikecompanion.fit_parser_service.entity.Ride;
import com.bikecompanion.fit_parser_service.mapper.RideMapper;
import com.bikecompanion.fit_parser_service.repository.GpsPointRepository;
import com.bikecompanion.fit_parser_service.repository.RideRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RideService {
    private final RideRepository rideRepository;
    private final GpsPointRepository gpsPointRepository;
    private final RideMapper rideMapper;

    public List<RideSummaryResponseDTO> getAllRides()
    {
        return rideRepository.findAllByOrderByStartTimeDesc()
                .stream()
                .map(rideMapper::toSummaryDTO)
                .toList();
    }

    public RideResponseDTO getRideById(Long id)
    {
        Ride ride = findRideOrThrow(id);
        return rideMapper.toResponseDTO(ride);
    }

    public List<GpsPointDTO> getGpsPoints(Long id)
    {
        findRideOrThrow(id);
        return gpsPointRepository.findByRideIdOrderByTimestampAsc(id)
                .stream()
                .map(rideMapper::toGpsPointDTO)
                .toList();
    }

    public List<GpsPointDTO> getGpsPointsSampled(Long id, int sampleRate) {
        findRideOrThrow(id);
        return gpsPointRepository.findSampledPointsByRideId(id, sampleRate)
                .stream()
                .map(rideMapper::toGpsPointDTO)
                .toList();
    }

    public List<RideSummaryResponseDTO> getRidesByDateRange(
            LocalDateTime from,
            LocalDateTime to
    ) {
        return rideRepository.findByStartTimeBetweenOrderByStartTimeDesc(from, to)
                .stream()
                .map(rideMapper::toSummaryDTO)
                .toList();
    }

    @Transactional
    public void deleteRide(Long id) {
        findRideOrThrow(id);
        gpsPointRepository.deleteAllByRideId(id);
        rideRepository.deleteById(id);
        log.info("Deleted ride with id: {}", id);
    }

    // central helper — throws a clean exception if a ride isn't found
    private Ride findRideOrThrow(Long id) {
        return rideRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Ride not found with id: {}", id);
                    return new RuntimeException("Ride not found with id: " + id);
                });
    }
}