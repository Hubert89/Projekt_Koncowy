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
import org.springframework.web.bind.annotation.*; // zawiera RestController, RequestMapping, CrossOrigin, PostMapping, RequestBody

import java.util.List;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.web.bind.annotation.GetMapping;


@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/orders")
//@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ClientRepository clientRepository; // jeśli chcesz też snapshot klienta

    public OrderController(OrderRepository orderRepository,
                           ProductRepository productRepository,
                           ClientRepository clientRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.clientRepository = clientRepository;
    }
    @PostMapping
    @Transactional
    public ResponseEntity<String> createOrder(@RequestBody Order order) {
        // relacja odwrotna i snapshoty pozycji
        if (order.getItems() != null) {
            for (var item : order.getItems()) {
                item.setOrder(order);

                // wczytaj pełny produkt po id i ustaw snapshoty
                if (item.getProduct() != null && item.getProduct().getId() != null) {
                    var prod = productRepository.findById(item.getProduct().getId())
                            .orElseThrow(() -> new IllegalArgumentException("Product not found: " + item.getProduct().getId()));
                    item.setProduct(prod);
                    if (item.getProductName() == null) item.setProductName(prod.getName());
                    if (item.getPrice() == null)       item.setPrice(prod.getPrice());
                }
            }
        }

        // (opcjonalnie) snapshot klienta, jeśli podany client.id
        if (order.getClient() != null && order.getClient().getId() != null) {
            var client = clientRepository.findById(order.getClient().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Client not found: " + order.getClient().getId()));
            order.setClient(client);
            if (order.getClientName() == null)  order.setClientName(client.getName());
            if (order.getClientEmail() == null) order.setClientEmail(client.getEmail());
        }

        orderRepository.save(order);
        return ResponseEntity.ok("✅ Zamówienie zostało złożone pomyślnie!");
    }
    @GetMapping
    public java.util.List<com.example.demo.model.Order> getAllOrders() {
        return orderRepository.findAll();
    }
}

