package com.example.demo.controller;

import com.example.demo.model.Client;
import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import com.example.demo.model.Product;
import com.example.demo.repository.ClientRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;          // <— brakujący import

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

    public static class CreateOrderDto {
        public static class Item { public Long productId; public int quantity; }
        public List<Item> items;
        public String notes;
    }

    @PostMapping
    @PreAuthorize("hasRole('KLIENT')")
    @Transactional
    public ResponseEntity<?> create(Principal principal, @RequestBody CreateOrderDto dto) {
        if (dto == null || dto.items == null || dto.items.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Brak pozycji zamówienia"));
        }

        // 1) klient zalogowany
        String username = principal.getName();
        Client client = clientRepo.findByUser_Username(username)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono klienta dla użytkownika: " + username));

        // 2) zamówienie
        Order order = new Order();
        order.setClient(client);
        order.setClientName(client.getName());
        order.setClientEmail(client.getEmail());
        order.setOrderDate(LocalDate.now());

        List<OrderItem> items = new ArrayList<>();
        for (CreateOrderDto.Item it : dto.items) {
            if (it.quantity <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Ilość musi być > 0"));
            }
            Product p = productRepo.findById(it.productId)
                    .orElseThrow(() -> new IllegalArgumentException("Produkt " + it.productId + " nie istnieje"));

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(p);
            oi.setQuantity(it.quantity);
            oi.setProductName(p.getName());
            oi.setPrice(p.getPrice());
            items.add(oi);

            if (p.getQuantity() != null) {
                if (p.getQuantity() < it.quantity) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Brak stanu dla produktu: " + p.getName()));
                }
                p.setQuantity(p.getQuantity() - it.quantity);
            }
        }

        order.setItems(items);
        Order saved = orderRepo.save(order);
        return ResponseEntity.status(201).body(Map.of("id", saved.getId()));
    }

    @GetMapping
    @PreAuthorize("hasRole('KLIENT')")
    public List<Order> listOwn(Principal principal) {
        return orderRepo.findByClient_User_Username(principal.getName());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('KLIENT')")
    public ResponseEntity<?> getOwn(@PathVariable Long id, Principal principal) {
        return orderRepo.findByIdAndClient_User_Username(id, principal.getName())
                .<ResponseEntity<?>>map(ResponseEntity::ok)   // erzecznie wskazujemy typ
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(Map.of("error", "Zamówienie nie znalezione")));
    }
}
