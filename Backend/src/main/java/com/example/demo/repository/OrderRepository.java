package com.example.demo.repository;

import com.example.demo.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Lista zamówień zalogowanego klienta wraz z pozycjami (items) – unikamy problemów z Lazy Proxy.
     */
    @Query("""
           select distinct o
           from Order o
           left join fetch o.items i
           join o.client c
           join c.user u
           where u.username = :username
           order by o.orderDate desc, o.id desc
           """)
    List<Order> findWithItemsByClientUsername(@Param("username") String username);

    /**
     * Pojedyncze zamówienie klienta (po ID) wraz z pozycjami – tylko jeśli należy do danego użytkownika.
     */
    @Query("""
           select o
           from Order o
           left join fetch o.items i
           join o.client c
           join c.user u
           where o.id = :id and u.username = :username
           """)
    Optional<Order> findOneWithItemsByIdAndUsername(@Param("id") Long id,
                                                    @Param("username") String username);
}
