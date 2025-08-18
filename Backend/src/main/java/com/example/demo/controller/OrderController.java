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
@PreAuthorize("hasRole('PRACOWNIK')")
public class OrderController {

    private final OrderRepository orderRepo;
    private final OrderMapper mapper;

    public OrderController(OrderRepository orderRepo, OrderMapper mapper) {
        this.orderRepo = orderRepo;
        this.mapper = mapper;
    }

    // READ: lista aktywnych (bez soft-deleted)
    @GetMapping
    public List<OrderDto> listAll() {
        return orderRepo.findAllWithItems()
                .stream().map(mapper::toDto).toList();
    }

    // READ: pojedyncze aktywne (bez soft-deleted)
    @GetMapping("/{id}")
    public OrderDto getOne(@PathVariable Long id) {
        Order o = orderRepo.findByIdWithItems(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return mapper.toDto(o);
    }

    // UPDATE (full) – pracownik może np. zmienić status/notatki
    @PutMapping("/{id}")
    public OrderDto replace(@PathVariable Long id, @RequestBody UpdateOrderRequest body) {
        Order o = orderRepo.findByIdWithItems(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));


        orderRepo.save(o);
        return mapper.toDto(o);
    }

    // UPDATE (partial)
    @PatchMapping("/{id}")
    public OrderDto patch(@PathVariable Long id, @RequestBody Map<String, Object> patch) {
        Order o = orderRepo.findByIdWithItems(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));


        orderRepo.save(o);
        return mapper.toDto(o);
    }

    // DELETE (SOFT) – oznacza deleted=true, deleted_at=now()
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void softDelete(@PathVariable Long id) {
        Order o = orderRepo.findByIdWithItemsIncludingDeleted(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (o.isDeleted()) return; // idempotentnie

        // (opcjonalnie) odwróć rezerwacje/zwroty:
        // inventoryService.release(o);
        // paymentService.refundIfPaid(o);

        o.softDelete();
        orderRepo.save(o);
    }

    // DTO do PUT
    public record UpdateOrderRequest(String status, String notes) {}
}
