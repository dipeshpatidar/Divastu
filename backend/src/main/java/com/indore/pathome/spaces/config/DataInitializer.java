package com.indore.pathome.spaces.config;

import com.indore.pathome.spaces.entity.Role;
import com.indore.pathome.spaces.entity.User;
import com.indore.pathome.spaces.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String bootstrapAdminEmail;
    private final String bootstrapAdminPassword;

    public DataInitializer(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           @Value("${APP_BOOTSTRAP_ADMIN_EMAIL:}") String bootstrapAdminEmail,
                           @Value("${APP_BOOTSTRAP_ADMIN_PASSWORD:}") String bootstrapAdminPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.bootstrapAdminEmail = bootstrapAdminEmail;
        this.bootstrapAdminPassword = bootstrapAdminPassword;
    }

    @Override
    public void run(String... args) {
        if (bootstrapAdminEmail.isBlank() || bootstrapAdminPassword.isBlank()
                || userRepository.findByEmail(bootstrapAdminEmail).isPresent()) {
            return;
        }

        User admin = new User();
        admin.setEmail(bootstrapAdminEmail.trim());
        admin.setPasswordHash(passwordEncoder.encode(bootstrapAdminPassword));
        admin.setFullName("Platform Administrator");
        admin.setRole(Role.ROLE_ADMIN);
        admin.setFreeVisitsRemaining(0);
        userRepository.save(admin);
    }
}
