package com.bikecompanion.fit_parser_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "gps_points", indexes = {@Index(name = "idx_gps_ride_id", columnList = "ride_id"),@Index(name = "idx_gps_timestamp", columnList = "timestamp") })
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GpsPoint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ride_id", nullable = false)
    @ToString.Exclude
    private Ride ride;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "altitude_meters")
    private Float altitudeMeters;

    @Column(name = "speed_ms")
    private Float speedMs;

    @Column(name = "heart_rate")
    private Short heartRate;

    @Column(name = "cadence")
    private Short cadence;

    @Column(name = "power_watts")
    private Integer powerWatts;

    @Column(name = "temperature_celsius")
    private Byte temperatureCelsius;

    @Column(name = "distance_meters")
    private Double distanceMeters;
}
