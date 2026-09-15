package com.indore.pathome.spaces.service;

import com.indore.pathome.spaces.entity.EmployeeProfile;
import com.indore.pathome.spaces.entity.LeadRoutingQueue;
import com.indore.pathome.spaces.entity.LeadStatus;
import com.indore.pathome.spaces.entity.User;
import com.indore.pathome.spaces.repository.EmployeeProfileRepository;
import com.indore.pathome.spaces.repository.LeadRoutingQueueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

public class MetaLeadIngestionServiceTest {

    @Mock
    private EmployeeProfileRepository employeeProfileRepository;

    @Mock
    private LeadRoutingQueueRepository leadRoutingQueueRepository;

    @InjectMocks
    private MetaLeadIngestionService metaLeadIngestionService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testProcessMetaLeadAsync_AssignedGroundBoy_SavesAssignedLead() {
        User user = new User();
        user.setFullName("Rahul Verma");
        user.setPhoneNumber("+919826011111");

        EmployeeProfile profile = new EmployeeProfile();
        profile.setUser(user);
        profile.setAssignedSector("Vijay Nagar");
        profile.setRoleType("GROUND_BOY");

        when(employeeProfileRepository.findByAssignedSectorAndRoleType(eq("Vijay Nagar"), eq("GROUND_BOY")))
                .thenReturn(Optional.of(profile));

        metaLeadIngestionService.processMetaLeadAsync("META-LEAD-101");

        verify(leadRoutingQueueRepository, times(1)).save(any(LeadRoutingQueue.class));
    }

    @Test
    public void testProcessMetaLeadAsync_UnmappedSector_SavesUnmappedLead() {
        when(employeeProfileRepository.findByAssignedSectorAndRoleType(anyString(), anyString()))
                .thenReturn(Optional.empty());

        metaLeadIngestionService.processMetaLeadAsync("META-LEAD-102");

        verify(leadRoutingQueueRepository, times(1)).save(any(LeadRoutingQueue.class));
    }
}
