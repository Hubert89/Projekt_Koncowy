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

    @GetMapping
    public List<OrderDto> listAll() {
        return orderRepo.findAllWithItems().stream().map(mapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public OrderDto getOne(@PathVariable Long id) {
        Order o = orderRepo.findByIdWithItems(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return mapper.toDto(o);
    }

    /** SOFT DELETE */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void softDelete(@PathVariable Long id) {
        Order o = orderRepo.findByIdWithItemsIncludingDeleted(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (o.isDeleted()) {
            // idempotentnie: już usunięte -> 204
            return;
        }

        // (opcjonalnie) odwróć rezerwacje magazynu / zainicjuj refund:
        // inventoryService.release(o);
        // paymentService.refundIfPaid(o);

        o.softDelete();          // ustawia deleted=true i deletedAt=now
        orderRepo.save(o);
    }
}
