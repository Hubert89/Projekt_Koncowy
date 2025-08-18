package com.example.demo.dto;

public record OrderItemDto(
        Long id,
        Long productId,
        String productName,
        Integer quantity,
        Double price
) {}
