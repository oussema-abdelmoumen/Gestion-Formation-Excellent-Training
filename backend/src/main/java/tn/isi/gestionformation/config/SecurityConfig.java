package tn.isi.gestionformation.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
import org.springframework.http.HttpMethod;
import java.util.Arrays;

@Configuration @EnableWebSecurity @EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired private JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(c -> c.configurationSource(corsConfigurationSource()))
            .csrf(c -> c.disable())
            .authorizeHttpRequests(auth -> auth
                // Public: login, register, verify email
                .requestMatchers("/api/auth/**").permitAll()

                // ── ADMIN ONLY ───────────────────────────────────────
                // GET (lecture) accessible à tous pour remplir les formulaires
                .requestMatchers(HttpMethod.GET, "/api/domaines/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/structures/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/profils/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/employeurs/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/formateurs/**").authenticated()
                // CRUD (écriture) réservé à ADMIN uniquement
                .requestMatchers(HttpMethod.POST,   "/api/domaines/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/domaines/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/domaines/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST,   "/api/structures/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/structures/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/structures/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST,   "/api/profils/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/profils/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/profils/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST,   "/api/employeurs/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/employeurs/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/employeurs/**").hasRole("ADMIN")
                .requestMatchers("/api/utilisateurs/**").hasRole("ADMIN")
                .requestMatchers("/api/roles/**").hasRole("ADMIN")

                // ── FORMATIONS : ADMIN+UTILISATEUR CRUD | RESPONSABLE GET only ──
                .requestMatchers(HttpMethod.GET,    "/api/formations/**").hasAnyRole("ADMIN","RESPONSABLE","UTILISATEUR")
                .requestMatchers(HttpMethod.POST,   "/api/formations/**").hasAnyRole("ADMIN","UTILISATEUR")
                .requestMatchers(HttpMethod.PUT,    "/api/formations/**").hasAnyRole("ADMIN","UTILISATEUR")
                .requestMatchers(HttpMethod.DELETE, "/api/formations/**").hasAnyRole("ADMIN","UTILISATEUR")

                // ── FORMATEURS : UTILISATEUR+ADMIN CRUD | RESPONSABLE GET ──
                .requestMatchers(HttpMethod.GET,    "/api/formateurs/**").hasAnyRole("ADMIN","UTILISATEUR","RESPONSABLE")
                .requestMatchers(HttpMethod.POST,   "/api/formateurs/**").hasAnyRole("ADMIN","UTILISATEUR")
                .requestMatchers(HttpMethod.PUT,    "/api/formateurs/**").hasAnyRole("ADMIN","UTILISATEUR")
                .requestMatchers(HttpMethod.DELETE, "/api/formateurs/**").hasAnyRole("ADMIN","UTILISATEUR")

                // ── PARTICIPANTS : UTILISATEUR+ADMIN CRUD | RESPONSABLE GET ──
                .requestMatchers(HttpMethod.GET,    "/api/participants/**").hasAnyRole("ADMIN","UTILISATEUR","RESPONSABLE")
                .requestMatchers(HttpMethod.POST,   "/api/participants/**").hasAnyRole("ADMIN","UTILISATEUR")
                .requestMatchers(HttpMethod.PUT,    "/api/participants/**").hasAnyRole("ADMIN","UTILISATEUR")
                .requestMatchers(HttpMethod.DELETE, "/api/participants/**").hasAnyRole("ADMIN","UTILISATEUR")

                .anyRequest().authenticated()
            )
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
        config.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
