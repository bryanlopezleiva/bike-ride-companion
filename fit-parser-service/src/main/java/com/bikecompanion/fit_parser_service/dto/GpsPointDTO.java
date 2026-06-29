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
public class GpsPointDTO {
    private LocalDateTime timestamp;

    // coordinates — already converted from semicircles in the parser
    private Double latitude;
    private Double longitude;

    // altitude in feet — converted from meters
    private Double altitudeFeet;

    // speed in mph — converted from m/s
    private Double speedMph;

    // cumulative distance in miles — converted from meters
    private Double distanceMiles;

    private Short heartRate;
    private Short cadence;
    private Integer powerWatts;

    // temperature in fahrenheit — converted from celsius
    private Double temperatureFahrenheit;
}
