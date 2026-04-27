package com.example.campus_nexus_backend.auth; // ඔයාගේ package නම හරියටම තියෙනවද බලන්න

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @Autowired
    private JwtFilter jwtFilter;

    // 1. Security Filter Chain 
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults()) // යට තියෙන CORS configuration එක පාවිච්චි කරන්න කියනවා
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
//merge conflict resolved here
                        .requestMatchers("/auth/**", "/login/**", "/oauth2/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/resources/recommendations").authenticated()
                    .requestMatchers(HttpMethod.GET, "/uploads/**", "/resources", "/resources/*", "/test-bookings", "/api/bookings/verify/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/resources/*/availability-blocks").authenticated()
                    .requestMatchers(HttpMethod.POST, "/resources/*/availability-blocks").hasAuthority("ROLE_ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/resources/*/availability-blocks/*").hasAuthority("ROLE_ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/resources/*/availability-blocks/*").hasAuthority("ROLE_ADMIN")
                    .requestMatchers(HttpMethod.PUT, "/resources/**").hasAuthority("ROLE_ADMIN")


                        // admin parts only for ADMIN_ROLE
                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                        
                    .requestMatchers("/api/technician/**").hasAuthority("ROLE_TECHNICIAN")

                        .requestMatchers("/api/user/**").authenticated()
                        .anyRequest().authenticated())
                    .exceptionHandling(ex -> ex
                        .defaultAuthenticationEntryPointFor(
                            (request, response, authEx) -> {
                                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                                response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}");
                            },
                            request -> request.getRequestURI() != null && request.getRequestURI().startsWith("/resources/")
                        )
                        .defaultAccessDeniedHandlerFor(
                            (request, response, deniedEx) -> {
                                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                                response.getWriter().write("{\"status\":403,\"error\":\"Forbidden\",\"message\":\"You are not allowed to perform this action\"}");
                            },
                            request -> request.getRequestURI() != null && request.getRequestURI().startsWith("/resources/")
                        )
                    )
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuth2LoginSuccessHandler))

                //set jwt security filter before the default username password authentication filter
                .addFilterBefore(jwtFilter,
                        org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 2. allow PUT and tokens
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // allow react frontend
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://127.0.0.1:5173"));

        // GET, POST, PUT, PATCH, DELETE allowed all
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // allow to take tokens
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}