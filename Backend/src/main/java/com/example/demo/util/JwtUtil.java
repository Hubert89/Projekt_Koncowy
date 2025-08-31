// Zakomentowany plik - wcześniejsze próby z JWT

//package com.example.demo.util;
//
//import io.jsonwebtoken.*;
//import io.jsonwebtoken.security.Keys;
//import org.springframework.stereotype.Component;
//
//import java.security.Key;
//import java.util.Date;
//
//@Component
//public class JwtUtil {
//
//    private final String jwtSecret = "tajnysekretnyklucz_do_tokena_agh_123456";
//    private final long jwtExpirationMs = 86400000;
//
//    private final Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
//
//    public String generateToken(String username, String role) {
//        long nowMs = System.currentTimeMillis();
//        Date iat = new Date(nowMs);
//        Date exp = new Date(nowMs + jwtExpirationMs); // 24h później
//
//        System.out.println("[JWT-GEN] nowMs=" + nowMs + " iat=" + iat + " exp=" + exp + " (+ms=" + jwtExpirationMs + ")");
//        System.out.println("[JWT-GEN] username=" + username + ", role=" + role);
//        return Jwts.builder()
//                .setSubject(username)
//                .claim("role", role)
//                .setIssuedAt(new Date())
//                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
//                .signWith(key, SignatureAlgorithm.HS256)
//                .compact();
//    }
//
//    public boolean validateToken(String token) {
//        try {
//            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
//            return true;
//        } catch (ExpiredJwtException e) {
//            System.out.println("[JWT-VAL] Expired: " + e.getClaims().getExpiration());
//            return false;
//        } catch (JwtException e) {
//            System.out.println("[JWT-VAL] Invalid: " + e.getMessage());
//            return false;
//        }
//    }
//
//    public String getUsername(String token) {
//        return Jwts.parserBuilder().setSigningKey(key).build()
//                .parseClaimsJws(token).getBody().getSubject();
//    }
//
//    public String getRole(String token) {
//        return (String) Jwts.parserBuilder().setSigningKey(key).build()
//                .parseClaimsJws(token).getBody().get("role");
//    }
//}
