package com.bikecompanion.fit_parser_service.mapper;

import com.bikecompanion.fit_parser_service.dto.GpsPointDTO;
import com.bikecompanion.fit_parser_service.dto.RideResponseDTO;
import com.bikecompanion.fit_parser_service.dto.RideSummaryResponseDTO;
import com.bikecompanion.fit_parser_service.entity.GpsPoint;
import com.bikecompanion.fit_parser_service.entity.Ride;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface RideMapper {

    // --- Ride → RideResponseDTO ---
    @Mapping(target = "totalDistanceMiles",
            source = "totalDistanceMeters",
            qualifiedByName = "metersToMiles")
    @Mapping(target = "avgSpeedMph",
            source = "avgSpeedMs",
            qualifiedByName = "msToMph")
    @Mapping(target = "maxSpeedMph",
            source = "maxSpeedMs",
            qualifiedByName = "msToMph")
    @Mapping(target = "totalAscentFeet",
            source = "totalAscentMeters",
            qualifiedByName = "metersToFeet")
    @Mapping(target = "totalDescentFeet",
            source = "totalDescentMeters",
            qualifiedByName = "metersToFeet")
    @Mapping(target = "formattedDuration",
            source = "totalElapsedTimeSeconds",
            qualifiedByName = "secondsToFormattedDuration")
    RideResponseDTO toResponseDTO(Ride ride);

    // --- Ride → RideSummaryResponseDTO ---
    @Mapping(target = "totalDistanceMiles",
            source = "totalDistanceMeters",
            qualifiedByName = "metersToMiles")
    @Mapping(target = "avgSpeedMph",
            source = "avgSpeedMs",
            qualifiedByName = "msToMph")
    @Mapping(target = "totalAscentFeet",
            source = "totalAscentMeters",
            qualifiedByName = "metersToFeet")
    @Mapping(target = "formattedDuration",
            source = "totalElapsedTimeSeconds",
            qualifiedByName = "secondsToFormattedDuration")
    RideSummaryResponseDTO toSummaryDTO(Ride ride);

    // --- GpsPoint → GpsPointDTO ---
    @Mapping(target = "speedMph",
            source = "speedMs",
            qualifiedByName = "msToMph")
    @Mapping(target = "altitudeFeet",
            source = "altitudeMeters",
            qualifiedByName = "metersToFeetDouble")
    @Mapping(target = "distanceMiles",
            source = "distanceMeters",
            qualifiedByName = "metersToMiles")
    @Mapping(target = "temperatureFahrenheit",
            source = "temperatureCelsius",
            qualifiedByName = "celsiusToFahrenheit")
    GpsPointDTO toGpsPointDTO(GpsPoint gpsPoint);

    // --- Conversion helpers ---

    @Named("metersToMiles")
    static Double metersToMiles(Double meters) {
        if (meters == null) return null;
        return Math.round((meters / 1609.344) * 100.0) / 100.0;
    }

    @Named("msToMph")
    static Double msToMph(Float ms) {
        if (ms == null) return null;
        return Math.round((ms * 2.23694) * 100.0) / 100.0;
    }

    @Named("metersToFeet")
    static Integer metersToFeet(Integer meters) {
        if (meters == null) return null;
        return (int) Math.round(meters * 3.28084);
    }

    @Named("metersToFeetDouble")
    static Double metersToFeetDouble(Float meters) {
        if (meters == null) return null;
        return Math.round((meters * 3.28084) * 100.0) / 100.0;
    }

    @Named("celsiusToFahrenheit")
    static Double celsiusToFahrenheit(Byte celsius) {
        if (celsius == null) return null;
        return Math.round(((celsius * 9.0 / 5.0) + 32) * 100.0) / 100.0;
    }

    @Named("secondsToFormattedDuration")
    static String secondsToFormattedDuration(Float seconds) {
        if (seconds == null) return null;
        int total = seconds.intValue();
        int hours = total / 3600;
        int minutes = (total % 3600) / 60;
        int secs = total % 60;
        if (hours > 0) {
            return String.format("%dh %02dm", hours, minutes);
        }
        return String.format("%dm %02ds", minutes, secs);
    }
}
