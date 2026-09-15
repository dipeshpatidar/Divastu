package com.indore.pathome.spaces.config;

import com.indore.pathome.spaces.entity.EmployeeProfile;
import com.indore.pathome.spaces.entity.Role;
import com.indore.pathome.spaces.entity.User;
import com.indore.pathome.spaces.repository.EmployeeProfileRepository;
import com.indore.pathome.spaces.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           EmployeeProfileRepository employeeProfileRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.employeeProfileRepository = employeeProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Seed default Tenant
        if (userRepository.findByEmail("tenant@pathome.in").isEmpty()) {
            User tenant = new User();
            tenant.setEmail("tenant@pathome.in");
            tenant.setPasswordHash(passwordEncoder.encode("Password123!"));
            tenant.setFullName("Indore Tenant");
            tenant.setRole(Role.ROLE_TENANT);
            tenant.setFreeVisitsRemaining(5);
            userRepository.save(tenant);
        }

        // Seed default Ground Boy (Vijay Nagar Sector)
        if (userRepository.findByEmail("groundboy@pathome.in").isEmpty()) {
            User groundBoyUser = new User();
            groundBoyUser.setEmail("groundboy@pathome.in");
            groundBoyUser.setPasswordHash(passwordEncoder.encode("Ground123!"));
            groundBoyUser.setFullName("Vijay Nagar Ground Boy");
            groundBoyUser.setRole(Role.ROLE_GROUND_BOY);
            groundBoyUser = userRepository.save(groundBoyUser);

            EmployeeProfile profile = new EmployeeProfile(groundBoyUser, "GROUND_BOY", "Vijay Nagar", new BigDecimal("15000"));
            employeeProfileRepository.save(profile);
        }

        // 1. Seed Super Admin (Full Master Control)
        if (userRepository.findByEmail("superadmin@pathome.in").isEmpty()) {
            User superAdmin = new User();
            superAdmin.setEmail("superadmin@pathome.in");
            superAdmin.setPasswordHash(passwordEncoder.encode("SuperAdmin123!"));
            superAdmin.setFullName("Pathome Master CEO");
            superAdmin.setRole(Role.ROLE_ADMIN);
            superAdmin = userRepository.save(superAdmin);

            EmployeeProfile profile = new EmployeeProfile(superAdmin, "SUPER_ADMIN", "ALL", new BigDecimal("150000"));
            employeeProfileRepository.save(profile);
        }

        // 2. Seed Legacy/Primary Admin
        if (userRepository.findByEmail("admin@pathome.in").isEmpty()) {
            User adminUser = new User();
            adminUser.setEmail("admin@pathome.in");
            adminUser.setPasswordHash(passwordEncoder.encode("Admin123!"));
            adminUser.setFullName("Indore Platform Owner");
            adminUser.setRole(Role.ROLE_ADMIN);
            adminUser = userRepository.save(adminUser);

            EmployeeProfile profile = new EmployeeProfile(adminUser, "ADMIN", "ALL", new BigDecimal("100000"));
            employeeProfileRepository.save(profile);
        }

        // 3. Seed Sub-Admin (Limited Access Manager)
        if (userRepository.findByEmail("subadmin@pathome.in").isEmpty()) {
            User subAdmin = new User();
            subAdmin.setEmail("subadmin@pathome.in");
            subAdmin.setPasswordHash(passwordEncoder.encode("SubAdmin123!"));
            subAdmin.setFullName("Indore Operations Manager");
            subAdmin.setRole(Role.ROLE_ADMIN);
            subAdmin = userRepository.save(subAdmin);

            EmployeeProfile profile = new EmployeeProfile(subAdmin, "SUB_ADMIN", "INDORE_OPS", new BigDecimal("45000"));
            employeeProfileRepository.save(profile);
        }

        // 4. Seed Employee (Staff CRM)
        if (userRepository.findByEmail("employee@pathome.in").isEmpty()) {
            User employeeUser = new User();
            employeeUser.setEmail("employee@pathome.in");
            employeeUser.setPasswordHash(passwordEncoder.encode("Employee123!"));
            employeeUser.setFullName("Rahul Verma (Field Escort)");
            employeeUser.setRole(Role.ROLE_GROUND_BOY);
            employeeUser = userRepository.save(employeeUser);

            EmployeeProfile profile = new EmployeeProfile(employeeUser, "GROUND_BOY", "Vijay Nagar", new BigDecimal("15000"));
            employeeProfileRepository.save(profile);
        }
    }
}
