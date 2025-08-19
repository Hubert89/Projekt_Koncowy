package com.example.demo.controller;

import com.example.demo.dto.OrderDto;
import com.example.demo.dto.OrderMapper;
import com.example.demo.model.Order;
import com.example.demo.repository.OrderRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

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

    // GET: lista wszystkich zamówień (bez usuniętych), najnowsze na górze
    @GetMapping
    public List<OrderDto> listAll() {
        List<Order> orders = orderRepo.findAllWithItems();
        return orders.stream().map(mapper::toDto).toList();
    }

    // GET: pojedyncze zamówienie (bez usuniętych)
    @GetMapping("/{id}")
    public OrderDto getOne(@PathVariable Long id) {
        Order o = orderRepo.findByIdWithItems(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return mapper.toDto(o);
    }

    // PUT: pełna podmiana pól edytowalnych przez pracownika (status/notes)
    @PutMapping("/{id}")
    public OrderDto replace(@PathVariable Long id, @RequestBody UpdateOrderRequest body) {
        Order o = orderRepo.findByIdWithItems(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        o.setStatus(body.status() != null ? body.status() : o.getStatus());
        o.setNotes(body.notes()); // może być null – oznacza wyczyszczenie
        orderRepo.save(o);
        return mapper.toDto(o);
    }

    // PATCH: częściowa modyfikacja
    @PatchMapping("/{id}")
    public OrderDto patch(@PathVariable Long id, @RequestBody Map<String, Object> patch) {
        Order o = orderRepo.findByIdWithItems(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (patch.containsKey("status")) {
            Object v = patch.get("status");
            if (v != null) o.setStatus(v.toString());
        }
        if (patch.containsKey("notes")) {
            Object v = patch.get("notes");
            o.setNotes(v != null ? v.toString() : null);
        }
        orderRepo.save(o);
        return mapper.toDto(o);
    }

    // DELETE: soft-delete
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void softDelete(@PathVariable Long id) {
        Order o = orderRepo.findByIdWithItemsIncludingDeleted(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (o.isDeleted()) return; // idempotentnie
        o.softDelete();
        orderRepo.save(o);
    }

    // DTO do PUT/PATCH
    public record UpdateOrderRequest(String status, String notes) {}
}
