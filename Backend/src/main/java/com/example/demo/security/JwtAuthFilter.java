package com.example.demo.security;

import com.example.demo.util.JwtUtil;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    public JwtAuthFilter(JwtUtil jwtUtil) { this.jwtUtil = jwtUtil; }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest req,
                                    @NonNull HttpServletResponse res,
                                    @NonNull FilterChain chain) throws ServletException, IOException {
        String path = req.getRequestURI();
        String authHeader = req.getHeader("Authorization");

        System.out.println("[JWT] >>> path=" + path + " | Authorization=" + authHeader);

        try {
            if (SecurityContextHolder.getContext().getAuthentication() == null
                    && authHeader != null
                    && authHeader.regionMatches(true, 0, "Bearer ", 0, 7)) {

                String token = authHeader.substring(7).trim();
                boolean valid = jwtUtil.validateToken(token);
                System.out.println("[JWT] valid=" + valid);

                if (valid) {
                    String username = jwtUtil.getUsername(token);
                    String role = jwtUtil.getRole(token); // np. KLIENT/ADMINISTRATOR/PRACOWNIK

                    var auth = new UsernamePasswordAuthenticationToken(
                            username, null, List.of(new SimpleGrantedAuthority("ROLE_" + role)));
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));

                    SecurityContextHolder.getContext().setAuthentication(auth);
                    System.out.println("[JWT] ctx set -> " + auth);
                }
            }
        } catch (Exception ex) {
            System.out.println("[JWT] EX: " + ex.getMessage());
        }

        chain.doFilter(req, res);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest req) {
        String p = req.getRequestURI();
        return p.startsWith("/api/auth/login") || p.startsWith("/v3/api-docs") || p.startsWith("/swagger-ui");
    }
}
