package com.example.demo.controller;

import com.example.demo.dto.OrderDto;
import com.example.demo.dto.OrderMapper;
import com.example.demo.repository.OrderRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employee/orders")
@PreAuthorize("hasRole('PRACOWNIK')")
public class EmployeeOrdersController {

    private final OrderRepository orderRepo;
    private final OrderMapper mapper;

    public EmployeeOrdersController(OrderRepository orderRepo, OrderMapper mapper) {
        this.orderRepo = orderRepo;
        this.mapper = mapper;
    }

    @GetMapping
    public List<OrderDto> listAll() {
        return orderRepo.findAllWithItemsOrderByIdDesc()   // <-- ta metoda istnieje w repo
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    public OrderDto getOne(@PathVariable Long id) {
        var order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        return mapper.toDto(order);
    }
}
