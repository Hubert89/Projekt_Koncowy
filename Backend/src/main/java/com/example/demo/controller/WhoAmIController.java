package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class WhoAmIController {
    @GetMapping("/me")
    public Map<String, Object> me(java.security.Principal p) {
        var auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        var authorities = auth == null ? java.util.List.of()
                : auth.getAuthorities().stream().map(Object::toString).toList();
        return Map.of(
                "username", p != null ? p.getName() : null,
                "authorities", authorities
        );
    }
}
