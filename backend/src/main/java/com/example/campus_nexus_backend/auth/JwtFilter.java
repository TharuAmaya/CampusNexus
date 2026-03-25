package com.example.campus_nexus_backend.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import io.jsonwebtoken.Claims;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        
        // React එකෙන් එවන "Authorization" Header එක අල්ලගන්නවා
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;

        // ඒක ඇතුළේ "Bearer " කියලා තියෙනවද බලනවා
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // "Bearer " කෑල්ල අයින් කරලා Token එක ගන්නවා
            try {
                email = jwtUtil.extractUsername(token);
            } catch (Exception e) {
                System.out.println("Token validation failed!");
            }
        }

        // Token එක හරි නම්, Spring Security එකට කියනවා "මෙයාට ඇතුළට යන්න දෙන්න" කියලා
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.validateToken(token)) {
                Claims claims = jwtUtil.extractAllClaims(token);
                String role = claims.get("role", String.class); // Role එක ගන්නවා

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email, null, Collections.singletonList(new SimpleGrantedAuthority(role)));
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        // ඊළඟ පියවරට යන්න දෙනවා
        filterChain.doFilter(request, response);
    }
}