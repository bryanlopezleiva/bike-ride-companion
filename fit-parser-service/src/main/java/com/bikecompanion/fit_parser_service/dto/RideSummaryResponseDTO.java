package com.bikecompanion.fit_parser_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RideSummaryResponseDTO {
    private Long id;
    private String rideName;

    private LocalDateTime startTime;

    // distance in miles
    private Double totalDistanceMiles;

    // duration as formatted string e.g. "1h 12m"
    private String formattedDuration;

    // speed in mph
    private Double avgSpeedMph;

    // elevation in feet
    private Integer totalAscentFeet;

    private Integer totalCalories;
    private Short avgHeartRate;
}
