package biyahenyo.biyahenyo_backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import biyahenyo.biyahenyo_backend.dto.AuthResponse;
import biyahenyo.biyahenyo_backend.dto.LoginRequest;
import biyahenyo.biyahenyo_backend.dto.RegisterRequest;
import biyahenyo.biyahenyo_backend.model.User;
import biyahenyo.biyahenyo_backend.model.UserRole;
import biyahenyo.biyahenyo_backend.repository.UserRepository;
import biyahenyo.biyahenyo_backend.security.JwtUtil;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setFullName("Juan Dela Cruz");
        sampleUser.setEmail("juan@example.com");
        sampleUser.setPassword("$2a$encoded");
        sampleUser.setRole(UserRole.USER);
    }

    // ── Register ──────────────────────────────────────────────────────

    @Test
    void register_withValidInput_returnsAuthResponse() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Juan Dela Cruz");
        request.setEmail("juan@example.com");
        request.setPassword("password123");
        request.setRole(UserRole.USER);

        when(userRepository.existsByEmailIgnoreCase("juan@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$encoded");
        when(userRepository.save(any())).thenReturn(sampleUser);
        when(jwtUtil.generateToken(any())).thenReturn("test-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("Juan Dela Cruz", response.getFullName());
        assertEquals("juan@example.com", response.getEmail());
        assertEquals("USER", response.getRole());
        assertEquals("test-token", response.getToken());
        verify(userRepository).save(any());
    }

    @Test
    void register_withDuplicateEmail_throwsConflict() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Juan");
        request.setEmail("existing@example.com");
        request.setPassword("password123");

        when(userRepository.existsByEmailIgnoreCase("existing@example.com")).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.register(request));

        assertEquals(409, exception.getStatusCode().value());
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_trimsAndLowercasesEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Juan");
        request.setEmail("  JUAN@Example.COM  ");
        request.setPassword("password123");

        when(userRepository.existsByEmailIgnoreCase("juan@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$encoded");
        when(userRepository.save(any())).thenReturn(sampleUser);
        when(jwtUtil.generateToken(any())).thenReturn("token");

        authService.register(request);

        verify(userRepository).existsByEmailIgnoreCase("juan@example.com");
    }

    @Test
    void register_defaultsToUserRole_whenRoleIsNull() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Juan");
        request.setEmail("juan@example.com");
        request.setPassword("password123");
        request.setRole(null);

        when(userRepository.existsByEmailIgnoreCase("juan@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$encoded");
        when(userRepository.save(any())).thenReturn(sampleUser);
        when(jwtUtil.generateToken(any())).thenReturn("token");

        AuthResponse response = authService.register(request);
        assertNotNull(response);
    }

    // ── Login ─────────────────────────────────────────────────────────

    @Test
    void login_withValidCredentials_returnsAuthResponse() {
        LoginRequest request = new LoginRequest();
        request.setEmail("juan@example.com");
        request.setPassword("password123");

        when(userRepository.findByEmailIgnoreCase("juan@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("password123", "$2a$encoded")).thenReturn(true);
        when(jwtUtil.generateToken(sampleUser)).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals("Login successful", response.getMessage());
    }

    @Test
    void login_withWrongPassword_throwsUnauthorized() {
        LoginRequest request = new LoginRequest();
        request.setEmail("juan@example.com");
        request.setPassword("wrongpassword");

        when(userRepository.findByEmailIgnoreCase("juan@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongpassword", "$2a$encoded")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.login(request));

        assertEquals(401, exception.getStatusCode().value());
    }

    @Test
    void login_withNonExistentEmail_throwsUnauthorized() {
        LoginRequest request = new LoginRequest();
        request.setEmail("nobody@example.com");
        request.setPassword("password123");

        when(userRepository.findByEmailIgnoreCase("nobody@example.com")).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> authService.login(request));

        assertEquals(401, exception.getStatusCode().value());
    }

    // ── Current User ──────────────────────────────────────────────────

    @Test
    void currentUser_withValidEmail_returnsAuthResponse() {
        when(userRepository.findByEmailIgnoreCase("juan@example.com")).thenReturn(Optional.of(sampleUser));

        AuthResponse response = authService.currentUser("juan@example.com");

        assertNotNull(response);
        assertEquals("juan@example.com", response.getEmail());
        assertEquals("Authenticated", response.getMessage());
    }

    @Test
    void currentUser_withUnknownEmail_throwsUnauthorized() {
        when(userRepository.findByEmailIgnoreCase("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class,
                () -> authService.currentUser("unknown@example.com"));
    }
}
