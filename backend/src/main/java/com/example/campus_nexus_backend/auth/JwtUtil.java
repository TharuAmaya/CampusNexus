package com.example.campus_nexus_backend.auth;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

import io.jsonwebtoken.Claims;

@Component
public class JwtUtil {

    // මේක ගොඩක් දිග රහස් පදයක් වෙන්න ඕනේ (අවම characters 32 ක්). 
    private final String SECRET_KEY = "CampusNexusSecretKeyForJwtTokenGenerationMustBeLong";
    // Token එකේ ආයු කාලය (පැය 24 ක් = 86400000 milliseconds)
    private final long EXPIRATION_TIME = 86400000; 

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role) // Token එක ඇතුළේ Role එකත් යවනවා
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }


    // Token එකෙන් සම්පූර්ණ විස්තර ටික ගන්නවා
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Token එකෙන් Email එක විතරක් ගන්නවා
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    // Token එක තාමත් Valid ද කියලා බලනවා
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
}