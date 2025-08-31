package com.example.demo.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class JwtService {

    private final Key key;

    public JwtService(@Value("${app.jwt.secret}") String secret) {
        // akceptuje zwykły tekst (co jest w properties)
        byte[] bytes = secret.getBytes();
        if (secret.matches("^[A-Za-z0-9+/=]+$") && secret.length() % 4 == 0) {
            // jeśli ktoś kiedyś poda Base64
            try { bytes = Decoders.BASE64.decode(secret); } catch (Exception ignored) {}
        }
        this.key = Keys.hmacShaKeyFor(bytes);
    }

    public String generateToken(UserDetails user) {
        Map<String, Object> claims = new HashMap<>();

        // authorities jako [{"authority":"ROLE_X"}] — kompatybilne z Spring Security
        List<Map<String, String>> authorities = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(a -> Collections.singletonMap("authority", a))
                .collect(Collectors.toList());
        claims.put("authorities", authorities);

        Instant now = Instant.now();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getUsername())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(60L * 60L * 4L))) // 4h
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isValid(String token, UserDetails user) {
        String sub = extractUsername(token);
        return sub != null && sub.equals(user.getUsername()) && !isExpired(token);
    }

    public String extractUsername(String token) {
        return parse(token).getBody().getSubject();
    }

    public boolean isExpired(String token) {
        Date exp = parse(token).getBody().getExpiration();
        return exp != null && exp.before(new Date());
    }

    public List<String> extractRoles(String token) {
        Claims c = parse(token).getBody();

        List<String> out = new ArrayList<>();
        Object authorities = c.get("authorities");
        if (authorities instanceof Collection<?> col) {
            for (Object el : col) {
                if (el instanceof Map<?,?> m && m.get("authority") != null) {
                    out.add(String.valueOf(m.get("authority")));
                } else if (el instanceof String s) {
                    out.add(s);
                }
            }
        }
        Object roles = c.get("roles");
        if (out.isEmpty() && roles instanceof Collection<?> col2) {
            for (Object el : col2) out.add(String.valueOf(el));
        }
        Object role = c.get("role");
        if (out.isEmpty() && role != null) out.add(String.valueOf(role));
        return out;
    }

    private Jws<Claims> parse(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
    }
}
