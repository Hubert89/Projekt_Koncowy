package com.example.demo.controller;

import com.example.demo.dto.OrderDto;
import com.example.demo.dto.OrderMapper;
import com.example.demo.model.Order;
import com.example.demo.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@PreAuthorize("hasAnyRole('PRACOWNIK','ADMINISTRATOR')")
public class OrderController {

    private final OrderRepository orderRepo;
    private final OrderMapper mapper;

    public OrderController(OrderRepository orderRepo, OrderMapper mapper) {
        this.orderRepo = orderRepo;
        this.mapper = mapper;
    }

    // GET: lista wszystkich zamówień (wraz z pozycjami)
    @GetMapping
    public List<OrderDto> listAll() {
        return orderRepo.findAllWithItemsOrderByIdDesc()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    // GET: szczegóły zamówienia (wraz z pozycjami)
    @GetMapping("/{id}")
    public OrderDto getOne(@PathVariable Long id) {
        var order = orderRepo.findByIdWithItems(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        return mapper.toDto(order);
    }

    // PATCH: soft delete (oznaczenie jako usunięte)
    @PatchMapping("/{id}/delete")
    public void softDelete(@PathVariable Long id) {
        Order o = orderRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        o.setDeleted(true);
        o.setDeletedAt(Instant.now());
        orderRepo.save(o);
    }
}
