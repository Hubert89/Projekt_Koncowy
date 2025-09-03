package com.example.demo.service;

import com.example.demo.model.Client;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.ClientRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClientService {

    private final ClientRepository clientRepo;
    private final PasswordEncoder encoder;

    public ClientService(ClientRepository clientRepo, PasswordEncoder encoder) {
        this.clientRepo = clientRepo;
        this.encoder = encoder;
    }

    public List<Client> findAll() {
        return clientRepo.findAll();
    }

    @Transactional
    public Client create(Client client) {
        User u = client.getUser();
        if (u == null) {
            throw new IllegalArgumentException("Client must have an associated user");
        }
        if (u.getRole() == null) {
            u.setRole(Role.KLIENT);
        }
        u.setPassword(encoder.encode(u.getPassword()));  // HASH hasła!
        return clientRepo.save(client);                  // zapisze także usera, jeśli w encji Client jest cascade
    }
}
