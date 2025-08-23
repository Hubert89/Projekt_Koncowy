package com.example.demo.dto;

import java.time.LocalDate;
import java.util.List;

public record OrderDto(
        Long id,
        Long clientId,
        String clientName,
        String clientEmail,
        LocalDate orderDate,
        String status,
        String notes,
        Double total,
        boolean deleted,
        List<OrderItemDto> items
) {}
