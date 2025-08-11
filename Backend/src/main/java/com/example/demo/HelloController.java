package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@CrossOrigin(origins = "http://localhost:5173")  // Zezwolenie na połączenia z frontendu React
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Działa! Pozdrowienia z backendu 🚀";
    }
}

