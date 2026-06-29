package com.bikecompanion.fit_parser_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RideResponseDTO {
    private Long id;
    private String rideName;
    private String fitFileName;

    // timestamps
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createdAt;

    // distance — converted from meters to miles for display
    private Double totalDistanceMiles;

    // time — converted from seconds to readable format
    private Float totalElapsedTimeSeconds;
    private String formattedDuration;

    // speed — converted from m/s to mph
    private Double avgSpeedMph;
    private Double maxSpeedMph;

    // elevation — converted from meters to feet
    private Integer totalAscentFeet;
    private Integer totalDescentFeet;

    // heart rate
    private Short avgHeartRate;
    private Short maxHeartRate;

    // cadence and power
    private Short avgCadence;
    private Integer avgPowerWatts;
    private Integer normalizedPowerWatts;

    private Integer totalCalories;

    // GPS points for map display
    private List<GpsPointDTO> gpsPoints;
}
