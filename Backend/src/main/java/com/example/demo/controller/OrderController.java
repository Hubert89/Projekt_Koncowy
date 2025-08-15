package com.example.demo.controller;

import com.example.demo.model.Order;
import com.example.demo.repository.OrderRepository;
import com.example.demo.model.OrderItem;
import com.example.demo.model.Product;
import com.example.demo.model.Client;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.ClientRepository;

import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*; // zawiera RestController, RequestMapping, CrossOrigin, PostMapping, RequestBody

import java.util.List;
import java.util.Map;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.web.bind.annotation.GetMapping;


@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/orders")
@PreAuthorize("hasAnyRole('ADMINISTRATOR','PRACOWNIK')")
public class OrderController {

    private final OrderRepository orderRepo;

    public OrderController(OrderRepository orderRepo) {
        this.orderRepo = orderRepo;
    }

    @GetMapping
    public List<Order> listAll() {
        return orderRepo.findAll();
    }

    @GetMapping("/{id}")
//    @PreAuthorize("hasAnyRole('ADMINISTRATOR','PRACOWNIK')")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return orderRepo.findById(id)
                .map(o -> ResponseEntity.ok().body(o))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // PATCH statusu (opcjonalnie, jeśli masz enum OrderStatus)
    /*
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return orderRepo.findById(id).map(order -> {
            order.setStatus(OrderStatus.valueOf(body.get("status")));
            orderRepo.save(order);
            return ResponseEntity.ok().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
    */
}

