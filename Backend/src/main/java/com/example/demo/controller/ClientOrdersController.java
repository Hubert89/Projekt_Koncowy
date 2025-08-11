package com.example.demo.controller;

import com.example.demo.model.Order;
import com.example.demo.repository.OrderRepository;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/client")
@SecurityRequirement(name = "bearerAuth") // pokaże kłódkę w Swaggerze
public class ClientOrdersController {

    private final OrderRepository orders;

    public ClientOrdersController(OrderRepository orders) {
        this.orders = orders;
    }

    @GetMapping("/orders")
    public List<Order> myOrders(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid JWT");
        }
        String username = auth.getName(); // ustawiasz w JwtFilter jako principal
        return orders.findByClient_User_Username(username);
    }
}
