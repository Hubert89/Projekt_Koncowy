package com.example.demo.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Ten kontroler zostawiamy pusty (żeby nie duplikował /api/orders/**).
@RestController
@RequestMapping("/api/employee/orders")
@PreAuthorize("hasAnyRole('PRACOWNIK','ADMINISTRATOR')")
public class EmployeeOrdersController {
    // celowo pusto
}
