package com.example.campus_nexus_backend.auth;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        
        // 1. get the providet(google,github) from token)
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        String provider = oauthToken.getAuthorizedClientRegistrationId(); 
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        String email = "";
        String name = "";
        String picture = "";
        String providerId = "";

        // 2. take details from provider according to provider type (google, github)
        if (provider.equals("github")) {
            email = oAuth2User.getAttribute("email");
            
            //if github email is private, create a fake email using username
            if (email == null) { 
                email = oAuth2User.getAttribute("login") + "@github.com"; 
            }
            
            name = oAuth2User.getAttribute("name");
            if (name == null) { 
                name = oAuth2User.getAttribute("login"); 
            }
            
            picture = oAuth2User.getAttribute("avatar_url");
            
            // turn github id into string because our User entity expects a string for providerId
            Object idObj = oAuth2User.getAttribute("id");
            if (idObj != null) {
                providerId = idObj.toString();
            }
            
        } else {
            // old google code
            email = oAuth2User.getAttribute("email");
            name = oAuth2User.getAttribute("name");
            picture = oAuth2User.getAttribute("picture");
            providerId = oAuth2User.getAttribute("sub");
        }

        // variables should be final if want to go in lambda (->) expression 
        final String finalEmail = email;
        final String finalName = name;
        final String finalPicture = picture;
        final String finalProviderId = providerId;

        // check email exist in DB or not, if not exist create new user
        User user = userRepository.findByEmail(finalEmail).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(finalEmail);
            newUser.setFullName(finalName);
            newUser.setAvatarUrl(finalPicture);
            newUser.setProvider(provider.toUpperCase()); // save provider in uppercase (GOOGLE, GITHUB)
            newUser.setProviderId(finalProviderId);

            // set the role according to email
            if (finalEmail.equals("mwsahirubro75@gmail.com")) { 
                newUser.setRole("ROLE_ADMIN");
            } else if (finalEmail.equals("mewanyamagedaragama@gmail.com")) { 
                newUser.setRole("ROLE_TECHNICIAN");
            } else {
                newUser.setRole("ROLE_STUDENT"); // github student part
            }

            return userRepository.save(newUser);
        });

        // create the token using email and role
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        //redirect to the frontend with token
        String frontendUrl = "http://localhost:5173/login/success?token=" + token;
        getRedirectStrategy().sendRedirect(request, response, frontendUrl);
    }
}