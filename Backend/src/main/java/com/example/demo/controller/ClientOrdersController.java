package com.example.demo.controller;

import com.example.demo.dto.OrderDto;
import com.example.demo.dto.OrderItemDto;
import com.example.demo.model.Client;
import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import com.example.demo.model.Product;
import com.example.demo.repository.ClientRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.ProductRepository;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.util.*;

/**
 * Endpointy klienta do składania i podglądu jego zamówień.
 * Wymaga autoryzacji JWT i roli KLIENT/CLIENT ustawionej w SecurityConfig.
 */
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/client/orders")
public class ClientOrdersController {

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final ClientRepository clientRepo;

    public ClientOrdersController(OrderRepository orderRepo,
                                  ProductRepository productRepo,
                                  ClientRepository clientRepo) {
        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
        this.clientRepo = clientRepo;
    }

    // --------- DTO wejściowe do POST ---------
    public static class CreateOrderDto {
        public List<Item> items;
        public String notes; // obecnie niewykorzystywane, ale zostawione pod rozbudowę
        public static class Item {
            public Long productId;
            public int quantity;
        }
    }

    // =============== POST /api/client/orders =================
    @PostMapping
    @Transactional
    public ResponseEntity<?> create(Principal principal, @RequestBody CreateOrderDto dto) {
        if (dto == null || dto.items == null || dto.items.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Brak pozycji zamówienia"));
        }

        // 1) zalogowany klient
        String username = principal.getName();
        Client client = clientRepo.findByUser_Username(username)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono klienta dla użytkownika: " + username));

        // 2) nagłówek zamówienia
        Order order = new Order();
        order.setClient(client);
        order.setClientName(client.getName());
        order.setClientEmail(client.getEmail());
        order.setOrderDate(LocalDate.now());

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        // 3) pozycje i stany magazynowe
        for (CreateOrderDto.Item it : dto.items) {
            if (it == null || it.productId == null || it.quantity <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Nieprawidłowa pozycja zamówienia"));
            }

            Product p = productRepo.findById(it.productId)
                    .orElseThrow(() -> new IllegalArgumentException("Produkt " + it.productId + " nie istnieje"));

            if (p.getQuantity() != null && p.getQuantity() < it.quantity) {
                return ResponseEntity.badRequest().body(Map.of("error", "Brak stanu magazynowego dla: " + p.getName()));
            }

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(p);
            oi.setQuantity(it.quantity);
            oi.setProductName(p.getName());
            oi.setPrice(p.getPrice());
            items.add(oi);

            // aktualizacja magazynu
            if (p.getQuantity() != null) {
                p.setQuantity(p.getQuantity() - it.quantity);
            }

            if (p.getPrice() != null) {
                total = total.add(BigDecimal.valueOf(p.getPrice()).multiply(BigDecimal.valueOf(it.quantity)));
            }
        }

        order.setItems(items);
        Order saved = orderRepo.save(order);

        return ResponseEntity.status(201).body(Map.of(
                "orderId", saved.getId(),
                "total",   total
        ));
    }

    // =============== GET /api/client/orders =================
    @GetMapping
    @Transactional(Transactional.TxType.SUPPORTS)
    public List<OrderDto> listOwn(Principal principal) {
        String username = principal.getName();
        var orders = orderRepo.findWithItemsByClientUsername(username);

        return orders.stream().map(o -> {
            double total = o.getItems().stream()
                    .mapToDouble(it -> (it.getPrice() != null ? it.getPrice() : 0.0) *
                            (it.getQuantity() != null ? it.getQuantity() : 0))
                    .sum();

            var items = o.getItems().stream()
                    .map(it -> new OrderItemDto(
                            it.getId(),
                            it.getProductName(),
                            it.getPrice(),
                            it.getQuantity()
                    ))
                    .toList();

            return new OrderDto(
                    o.getId(),
                    o.getOrderDate(),
                    o.getClientName(),
                    o.getClientEmail(),
                    total,
                    items
            );
        }).toList();
    }

    // =============== GET /api/client/orders/{id} =================
    @GetMapping("/{id}")
    @Transactional(Transactional.TxType.SUPPORTS)
    public ResponseEntity<?> getOwn(@PathVariable Long id, Principal principal) {
        String username = principal.getName();
        return orderRepo.findOneWithItemsByIdAndUsername(id, username)
                .<ResponseEntity<?>>map(o -> {
                    double total = o.getItems().stream()
                            .mapToDouble(it -> (it.getPrice() != null ? it.getPrice() : 0.0) *
                                    (it.getQuantity() != null ? it.getQuantity() : 0))
                            .sum();

                    var items = o.getItems().stream()
                            .map(it -> new OrderItemDto(
                                    it.getId(),
                                    it.getProductName(),
                                    it.getPrice(),
                                    it.getQuantity()
                            ))
                            .toList();

                    return ResponseEntity.ok(new OrderDto(
                            o.getId(), o.getOrderDate(), o.getClientName(), o.getClientEmail(), total, items
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("error", "Zamówienie nie znalezione")));
    }
}
