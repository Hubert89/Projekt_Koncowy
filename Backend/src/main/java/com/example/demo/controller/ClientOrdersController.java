package com.example.demo.controller;

import com.example.demo.dto.OrderDto;
import com.example.demo.dto.OrderMapper;
import com.example.demo.model.Order;
import com.example.demo.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/client/orders")
@PreAuthorize("hasRole('KLIENT')")
public class ClientOrdersController {

    private final OrderRepository orderRepo;
    private final OrderMapper mapper;

    public ClientOrdersController(OrderRepository orderRepo, OrderMapper mapper) {
        this.orderRepo = orderRepo;
        this.mapper = mapper;
    }

    // GET: lista własnych zamówień
    @GetMapping
    public List<OrderDto> listOwn(Principal principal) {
        var username = principal.getName();
        var orders = orderRepo.findAllByUsernameWithItems(username);
        return orders.stream().map(mapper::toDto).toList();
    }

    // GET: jedno własne zamówienie
    @GetMapping("/{id}")
    public OrderDto getOwn(@PathVariable Long id, Principal principal) {
        var username = principal.getName();
        Order o = orderRepo.findByIdAndUsernameWithItems(id, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return mapper.toDto(o);
    }

    // POST (składanie zamówienia) – zostaw swój kod albo daj znać, to dopasuję do mappera
}
