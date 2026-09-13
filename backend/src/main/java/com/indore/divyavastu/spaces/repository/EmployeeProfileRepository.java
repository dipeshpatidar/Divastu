package com.indore.divyavastu.spaces.repository;

import com.indore.divyavastu.spaces.entity.EmployeeProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeProfileRepository extends JpaRepository<EmployeeProfile, Long> {
    Optional<EmployeeProfile> findByAssignedSectorAndRoleType(String assignedSector, String roleType);
}
