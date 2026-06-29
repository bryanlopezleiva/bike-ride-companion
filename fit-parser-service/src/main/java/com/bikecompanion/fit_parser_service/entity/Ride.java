package com.bikecompanion.fit_parser_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rides")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Ride {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ride_name")
    private String rideName;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "total_distance_meters")
    private Double totalDistanceMeters;

    @Column(name = "total_elapsed_time_seconds")
    private Float totalElapsedTimeSeconds;

    @Column(name = "avg_speed_ms")
    private Float avgSpeedMs;

    @Column(name = "max_speed_ms")
    private Float maxSpeedMs;

    @Column(name = "total_ascent_meters")
    private Integer totalAscentMeters;

    @Column(name = "total_descent_meters")
    private Integer totalDescentMeters;

    @Column(name = "avg_heart_rate")
    private Short avgHeartRate;

    @Column(name = "max_heart_rate")
    private Short maxHeartRate;

    @Column(name = "avg_cadence")
    private Short avgCadence;

    @Column(name = "avg_power_watts")
    private Integer avgPowerWatts;

    @Column(name = "normalized_power_watts")
    private Integer normalizedPowerWatts;

    @Column(name = "total_calories")
    private Integer totalCalories;

    @Column(name = "fit_file_name")
    private String fitFileName;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "ride", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GpsPoint> gpsPoints = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

}
