package biyahenyo.biyahenyo_backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import biyahenyo.biyahenyo_backend.model.User;
import biyahenyo.biyahenyo_backend.model.UserRole;
import biyahenyo.biyahenyo_backend.repository.UserRepository;

@Configuration
public class AuthDataInitializer {

    private static final String DEFAULT_DRIVER_EMAIL = "driver@gmail.com";
    private static final String DEFAULT_DRIVER_PASSWORD = "driver";
    private static final String DEFAULT_USER_EMAIL = "user@gmail.com";
    private static final String DEFAULT_USER_PASSWORD = "user";

    @Bean
    CommandLineRunner seedDefaultDriver(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.existsByEmailIgnoreCase(DEFAULT_DRIVER_EMAIL)) {
                return;
            }

            User driver = new User();
            driver.setFullName("Demo Driver");
            driver.setEmail(DEFAULT_DRIVER_EMAIL);
            driver.setPassword(passwordEncoder.encode(DEFAULT_DRIVER_PASSWORD));
            driver.setRole(UserRole.DRIVER);
            userRepository.save(driver);
        };
    }

    @Bean
    CommandLineRunner seedDefaultUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.existsByEmailIgnoreCase(DEFAULT_USER_EMAIL)) {
                return;
            }

            User user = new User();
            user.setFullName("Demo User");
            user.setEmail(DEFAULT_USER_EMAIL);
            user.setPassword(passwordEncoder.encode(DEFAULT_USER_PASSWORD));
            user.setRole(UserRole.USER);
            userRepository.save(user);
        };
    }
}