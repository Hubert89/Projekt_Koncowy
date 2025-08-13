package com.example.demo.repository;

import com.example.demo.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByClient_Id(Long clientId);
    List<Order> findByClient_User_Username(String username);

    Optional<Order> findByIdAndClient_User_Username(Long id, String username);
}
