package com.example.demo.controller;

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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.util.*;

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

    public static class CreateOrderDto {
        public static class Item { public Long productId; public int quantity; }
        public List<Item> items;
        public String notes;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('KLIENT','CLIENT')")
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
        BigDecimal total = BigDecimal.ZERO;

        for (CreateOrderDto.Item it : dto.items) {
            if (it.quantity <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Ilość musi być > 0"));
            }
            Product p = productRepo.findById(it.productId)
                    .orElseThrow(() -> new IllegalArgumentException("Produkt " + it.productId + " nie istnieje"));

            if (p.getQuantity() != null && p.getQuantity() < it.quantity) {
                return ResponseEntity.badRequest().body(Map.of("error", "Brak stanu dla produktu: " + p.getName()));
            }

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(p);
            oi.setQuantity(it.quantity);
            oi.setProductName(p.getName());
            oi.setPrice(p.getPrice());
            items.add(oi);

            // stan magazynowy
            if (p.getQuantity() != null) {
                p.setQuantity(p.getQuantity() - it.quantity); // zostanie zflushowane przy commit dzięki @Transactional
            }

            if (p.getPrice() != null) {
                BigDecimal price = BigDecimal.valueOf(p.getPrice());            // <- z Double na BigDecimal
                BigDecimal qty   = BigDecimal.valueOf(it.quantity);             // <- z int na BigDecimal
                total = total.add(price.multiply(qty));
            }
        }

        order.setItems(items);
        Order saved = orderRepo.save(order);

        // Zwracamy pola zgodne z typem w TS
        return ResponseEntity.status(201).body(Map.of(
                "orderId", saved.getId(),
                "total",   total
        ));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('KLIENT','CLIENT')")
    public List<Order> listOwn(Principal principal) {
        return orderRepo.findByClient_User_Username(principal.getName());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('KLIENT','CLIENT')")
    public ResponseEntity<?> getOwn(@PathVariable Long id, Principal principal) {
        return orderRepo.findByIdAndClient_User_Username(id, principal.getName())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(Map.of("error", "Zamówienie nie znalezione")));
    }
}
