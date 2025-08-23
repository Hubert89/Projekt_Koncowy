package com.example.demo.dto;

import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OrderMapper {
    public OrderDto toDto(Order o) {
        double total = 0.0;
        List<OrderItemDto> items = o.getItems().stream().map(this::toItemDto).toList();
        for (OrderItemDto it : items) {
            double line = (it.price() != null ? it.price() : 0.0) * (it.quantity() != null ? it.quantity() : 0);
            total += line;
        }
        Long clientId = o.getClient() != null ? o.getClient().getId() : null;
        return new OrderDto(
                o.getId(),
                clientId,
                o.getClientName(),
                o.getClientEmail(),
                o.getOrderDate(),
                o.getStatus(),
                o.getNotes(),
                total,
                o.isDeleted(),
                items
        );
    }

    private OrderItemDto toItemDto(OrderItem i) {
        Long productId = i.getProduct() != null ? i.getProduct().getId() : null;
        return new OrderItemDto(
                i.getId(),
                productId,
                i.getProductName(),
                i.getQuantity(),
                i.getPrice()
        );
    }
}
