package com.example.demo.controller;

import com.example.demo.model.Client;
import com.example.demo.service.ClientService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService clientService;  // <-- pole

    // wstrzyknięcie przez konstruktor
    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @GetMapping
    public List<Client> getAllClients() {
        return clientService.findAll();
    }

    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @PostMapping
    public Client createClient(@RequestBody @Valid Client client) {
        return clientService.create(client);
    }
}
