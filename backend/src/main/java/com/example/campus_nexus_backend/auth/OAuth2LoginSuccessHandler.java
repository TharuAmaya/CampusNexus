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
        
        // 1. Token එකෙන් provider එක (google ද github ද) හොයාගන්නවා
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        String provider = oauthToken.getAuthorizedClientRegistrationId(); 
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        String email = "";
        String name = "";
        String picture = "";
        String providerId = "";

        // 2. ලොග් වුණේ කොහෙන්ද කියලා බලලා අදාළ විස්තර ගන්නවා
        if (provider.equals("github")) {
            email = oAuth2User.getAttribute("email");
            // GitHub එකේ Email එක Private කරලා නම්, username එකෙන් email එකක් හදාගන්නවා
            if (email == null) { 
                email = oAuth2User.getAttribute("login") + "@github.com"; 
            }
            
            name = oAuth2User.getAttribute("name");
            if (name == null) { 
                name = oAuth2User.getAttribute("login"); 
            }
            
            picture = oAuth2User.getAttribute("avatar_url");
            
            // GitHub id එක integer එකක් නිසා string එකට හරවනවා
            Object idObj = oAuth2User.getAttribute("id");
            if (idObj != null) {
                providerId = idObj.toString();
            }
            
        } else {
            // මේ තියෙන්නේ පරණ Google කෑල්ල
            email = oAuth2User.getAttribute("email");
            name = oAuth2User.getAttribute("name");
            picture = oAuth2User.getAttribute("picture");
            providerId = oAuth2User.getAttribute("sub");
        }

        // lambda (->) expression එක ඇතුළට යවන්න නම් variables "final" වෙන්න ඕනේ
        final String finalEmail = email;
        final String finalName = name;
        final String finalPicture = picture;
        final String finalProviderId = providerId;

        // Database එකේ මේ email එක තියෙනවද බලනවා. නැත්නම් අලුතින් හදනවා.
        User user = userRepository.findByEmail(finalEmail).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(finalEmail);
            newUser.setFullName(finalName);
            newUser.setAvatarUrl(finalPicture);
            newUser.setProvider(provider.toUpperCase()); // GOOGLE හෝ GITHUB කියලා සේව් වෙනවා
            newUser.setProviderId(finalProviderId);

            // Email එක අනුව Role එක තීරණය කරනවා
            if (finalEmail.equals("mwsahirubro75@gmail.com")) { 
                newUser.setRole("ROLE_ADMIN");
            } else if (finalEmail.equals("mewanyamagedaragama@gmail.com")) { 
                newUser.setRole("ROLE_TECHNICIAN");
            } else {
                newUser.setRole("ROLE_STUDENT"); // ඔයාගේ GitHub එකෙන් එන එකත් වැටෙන්නේ මෙතනටයි!
            }

            return userRepository.save(newUser);
        });

        // Token එක හදනවා
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        // React Frontend එකට Redirect කරනවා Token එකත් අරගෙන!
        String frontendUrl = "http://localhost:5173/login/success?token=" + token;
        getRedirectStrategy().sendRedirect(request, response, frontendUrl);
    }
}