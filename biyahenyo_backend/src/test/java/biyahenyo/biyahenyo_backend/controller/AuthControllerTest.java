package biyahenyo.biyahenyo_backend.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void register_withValidInput_returns201() throws Exception {
        String body = """
                {
                    "fullName": "Test User",
                    "email": "test@example.com",
                    "password": "password123",
                    "role": "USER"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fullName").value("Test User"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void register_withDuplicateEmail_returns409() throws Exception {
        String body = """
                {
                    "fullName": "First User",
                    "email": "dup@example.com",
                    "password": "password123",
                    "role": "USER"
                }
                """;

        // Register once
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());

        // Register again with same email
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void register_withShortPassword_returns400() throws Exception {
        String body = """
                {
                    "fullName": "Short Pass User",
                    "email": "short@example.com",
                    "password": "abc",
                    "role": "USER"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_withMissingFields_returns400() throws Exception {
        String body = """
                {
                    "email": "incomplete@example.com"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_withValidCredentials_returns200() throws Exception {
        // First register
        String registerBody = """
                {
                    "fullName": "Login User",
                    "email": "login@example.com",
                    "password": "password123",
                    "role": "USER"
                }
                """;
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated());

        // Then login
        String loginBody = """
                {
                    "email": "login@example.com",
                    "password": "password123"
                }
                """;
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.message").value("Login successful"));
    }

    @Test
    void login_withWrongPassword_returns401() throws Exception {
        // Register first
        String registerBody = """
                {
                    "fullName": "Wrong Pass User",
                    "email": "wrongpass@example.com",
                    "password": "password123",
                    "role": "USER"
                }
                """;
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated());

        // Login with wrong password
        String loginBody = """
                {
                    "email": "wrongpass@example.com",
                    "password": "wrongpassword"
                }
                """;
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_withValidToken_returns200() throws Exception {
        // Register
        String registerBody = """
                {
                    "fullName": "Me User",
                    "email": "me@example.com",
                    "password": "password123",
                    "role": "USER"
                }
                """;
        String registerResponse = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        // Extract token
        String token = com.jayway.jsonpath.JsonPath.read(registerResponse, "$.token");

        // Call /me with token
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("me@example.com"));
    }

    @Test
    void me_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
