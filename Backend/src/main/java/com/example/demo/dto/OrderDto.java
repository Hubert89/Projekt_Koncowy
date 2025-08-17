package com.example.demo.dto;
import java.time.LocalDate;
import java.util.List;
public record OrderDto(Long id, LocalDate orderDate, String clientName, String clientEmail, Double total, List<OrderItemDto> items) {}
