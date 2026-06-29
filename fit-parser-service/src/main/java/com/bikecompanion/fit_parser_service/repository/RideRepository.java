package com.bikecompanion.fit_parser_service.repository;

import com.bikecompanion.fit_parser_service.entity.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

public interface RideRepository extends JpaRepository<Ride, Long> {
    /// here we will list all rides ordered by most recent first
    List<Ride> findAllByOrderByStartTimeDesc();

    /// here we list rides within a date range
    List<Ride> findByStartTimeBetweenOrderByStartTimeDesc(LocalDateTime from, LocalDateTime to);

    Optional<Ride> findByFitFileName(String fitFileName);

    List<Ride> findByAvgSpeedMsGreaterThanOrderByStartTimeDesc(Float ms);

    /// model monthly stats - total distance and time for a given month
    @Query("""
SELECT SUM(r.totalDistanceMeters), SUM(r.totalElapsedTimeSeconds)
FROM Ride r
WHERE YEAR(r.startTime) = :year
AND MONTH(r.startTime) = :month
""")
    Object[] getMonthlyTotals(@Param("year") int year, @Param("month") int month);

    ///count the rides in a given month
    @Query("""
SELECT COUNT(r)
FROM Ride r
WHERE YEAR(r.startTime) = :year
AND MONTH (r.startTime) = :month
""")
    Long countRidesInMonth(@Param("year") int year, @Param("month") int month);
}
