package com.bikecompanion.fit_parser_service.repository;

import com.bikecompanion.fit_parser_service.entity.GpsPoint;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GpsPointRepository extends JpaRepository<GpsPoint, Long> {

    // all GPS points for a ride — used to draw the route on the map
    List<GpsPoint> findByRideIdOrderByTimestampAsc(Long rideId);

    /// sampled points for a ride
    @Query("""
SELECT g FROM GpsPoint g 
WHERE g.ride.id = :rideId
AND MOD(g.id, :sampleRate) = 0
ORDER BY g.timestamp ASC 
""")
    List<GpsPoint> findSampledPointsByRideId(@Param("rideId") Long rideId, @Param("sampleRate") int sampleRate);

    // bounding box query — finds points within a lat/lng area
    @Query("""
        SELECT g FROM GpsPoint g
        WHERE g.ride.id = :rideId
        AND g.latitude BETWEEN :minLat AND :maxLat
        AND g.longitude BETWEEN :minLng AND :maxLng
        ORDER BY g.timestamp ASC
    """)
    List<GpsPoint> findPointsInBoundingBox(
            @Param("rideId") Long rideId,
            @Param("minLat") Double minLat,
            @Param("maxLat") Double maxLat,
            @Param("minLng") Double minLng,
            @Param("maxLng") Double maxLng
    );

    // delete all points for a ride — used if a ride is re-uploaded
    @Modifying
    @Transactional
    @Query("DELETE FROM GpsPoint g WHERE g.ride.id = :rideId")
    void deleteAllByRideId(@Param("rideId") Long rideId);

    // check if points already exist for a ride
    boolean existsByRideId(Long rideId);

}
