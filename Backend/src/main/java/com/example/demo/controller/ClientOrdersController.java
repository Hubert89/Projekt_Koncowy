package com.example.demo.controller;

import com.example.demo.dto.OrderDto;
import com.example.demo.dto.OrderMapper;
import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import com.example.demo.model.Product;
import com.example.demo.repository.ClientRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.ProductRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/client/orders")
@PreAuthorize("hasRole('KLIENT')")
public class ClientOrdersController {

    private final OrderRepository orderRepo;
    private final OrderMapper mapper;
    private final ProductRepository productRepo;
    private final ClientRepository clientRepo;

    public ClientOrdersController(
            OrderRepository orderRepo,
            OrderMapper mapper,
            ProductRepository productRepo,
            ClientRepository clientRepo
    ) {
        this.orderRepo = orderRepo;
        this.mapper = mapper;
        this.productRepo = productRepo;
        this.clientRepo = clientRepo;
    }

    // --- GET: lista własnych zamówień (bez zmian)
    @GetMapping
    public List<OrderDto> listOwn(Principal principal) {
        var username = principal.getName();
        var orders = orderRepo.findAllByUsernameWithItemsIncludingDeleted(username);
        return orders.stream().map(mapper::toDto).toList();
    }

    // --- GET: jedno własne zamówienie (bez zmian)
    @GetMapping("/{id}")
    public OrderDto getOwn(@PathVariable Long id, Principal principal) {
        var username = principal.getName();
        Order o = orderRepo.findByIdAndUsernameWithItemsIncludingDeleted(id, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return mapper.toDto(o);
    }

    // --- POST: złożenie zamówienia (NOWE)
    @PostMapping
    @Transactional
    public ResponseEntity<CreateOrderResponse> create(
            @Valid @RequestBody CreateOrderRequest req,
            Principal principal
    ) {
        if (req.items().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lista pozycji nie może być pusta");
        }

        // 1) znajdź klienta po zalogowanym użytkowniku
        var username = principal.getName();
        var client = clientRepo.findByUserUsername(username) // albo findByUsername(username) jeśli użyłeś wersji 1B
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Profil klienta nie znaleziony"));

// 2) nagłówek zamówienia
        var order = new Order();
        order.setClient(client);
        try { order.setClientName(client.getName()); } catch (Exception ignored) {}
        try { order.setClientEmail(client.getEmail()); } catch (Exception ignored) {}
        try { order.setDeleted(false); } catch (Exception ignored) {}
        order.setOrderDate(LocalDate.from(LocalDateTime.now()));   // ⬅️ zmiana z LocalDateTime na Instant
        order.setNotes(req.notes());


        // 3) pozycje + weryfikacja stanów; zapis pozycji kaskadowo przez order
        var items = new ArrayList<OrderItem>();
        double total = 0.0;

        for (var it : req.items()) {
            Product p = productRepo.findById(it.productId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Produkt nie istnieje: " + it.productId()));
            if (p.getQuantity() < it.quantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Brak stanu dla produktu: " + p.getName());
            }

            // zmniejsz stan magazynowy
            p.setQuantity(p.getQuantity() - it.quantity());
            productRepo.save(p);

            var oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(p);
            try { oi.setProductName(p.getName()); } catch (Exception ignored) {}
            oi.setQuantity(it.quantity());
            // snapshot ceny (jeśli w modelu masz double/Double)
            oi.setPrice(p.getPrice());

            items.add(oi);

            total += p.getPrice() * it.quantity();
        }

        // jeżeli w Order mam `@OneToMany(cascade = CascadeType.ALL, mappedBy = "order", orphanRemoval = true)`
        // to wystarczy podpiąć kolekcję:
        try { order.setItems(items); } catch (Exception e) { /* jeśli nie ma settera, dołóż add */ }
        for (var oi : items) {
            // na wszelki wypadek związuję obustronnie, gdyby brakowało settera kolekcji
            oi.setOrder(order);
        }

        order = orderRepo.save(order);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new CreateOrderResponse(order.getId(), total));
    }

    // --- Lokalne DTO do POST (żeby nie ruszać istniejących klas)
    public record CreateOrderRequest(
            @NotEmpty List<Item> items,
            String notes
    ) {
        public record Item(
                @NotNull Long productId,
                @Min(1) int quantity
        ) {}
    }

    public record CreateOrderResponse(Long orderId, double total) {}
}
