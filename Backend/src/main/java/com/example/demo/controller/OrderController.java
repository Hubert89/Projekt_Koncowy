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

import java.time.Instant;
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

    // GET: lista wszystkich zamówień (obecnie bez usuniętych – jak w repo)
    @GetMapping
    public List<OrderDto> listAll() {
        List<Order> orders = orderRepo.findAllWithItemsIncludingDeleted();
        return orders.stream().map(mapper::toDto).toList();
    }

    // GET: pojedyncze zamówienie (bez usuniętych)
    @GetMapping("/{id}")
    public OrderDto getOne(@PathVariable Long id) {
        Order o = orderRepo.findByIdWithItems(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return mapper.toDto(o);
    }

    // DTO do PUT/PATCH (przywrócone)
    public record UpdateOrderRequest(String status, String notes) {}

    // PUT: pełna podmiana pól (status/notes)
    @PutMapping("/{id}")
    public OrderDto replace(@PathVariable Long id, @RequestBody UpdateOrderRequest body) {
        Order o = orderRepo.findByIdWithItems(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.status() != null) o.setStatus(body.status());
        o.setNotes(body.notes()); // może być null – czyści notatki
        orderRepo.save(o);
        return mapper.toDto(o);
    }

    // PATCH: częściowa modyfikacja (status/notes)
    @PatchMapping("/{id}")
    public OrderDto patch(@PathVariable Long id, @RequestBody Map<String, Object> patch) {
        Order o = orderRepo.findByIdWithItems(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (patch.containsKey("status") && patch.get("status") != null) {
            o.setStatus(patch.get("status").toString());
        }
        if (patch.containsKey("notes")) {
            Object v = patch.get("notes");
            o.setNotes(v != null ? v.toString() : null);
        }
        orderRepo.save(o);
        return mapper.toDto(o);
    }

    // DELETE: soft delete (ustawia też status "Usunięte")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void softDelete(@PathVariable Long id) {
        Order order = orderRepo.findByIdWithItemsIncludingDeleted(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (order.isDeleted()) return; // idempotentnie

        order.setDeleted(true);
        order.setDeletedAt(Instant.now());
        order.setStatus("Usunięte");
        orderRepo.save(order);
    }

    // Alias PATCH /{id}/delete (ta sama logika)
    @PatchMapping("/{id}/delete")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void softDeleteAlias(@PathVariable Long id) {
        softDelete(id);
    }
}
