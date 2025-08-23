package com.example.demo.repository;

import com.example.demo.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // ===== LISTY (pracownik/admin) =====

    // TYLKO nieusunięte
    @Query("""
        select distinct o from Order o
        left join fetch o.items i
        where o.deleted = false
        order by o.id desc
    """)
    List<Order> findAllWithItems();

    // WRAZ z usuniętymi  ⬅️ UŻYJ TEJ METODY w OrderController.listAll()
    @Query("""
        select distinct o from Order o
        left join fetch o.items i
        order by o.id desc
    """)
    List<Order> findAllWithItemsIncludingDeleted();

    // ===== POJEDYNCZE =====

    // tylko nieusunięte
    @Query("""
        select o from Order o
        left join fetch o.items i
        where o.id = :id and o.deleted = false
    """)
    Optional<Order> findByIdWithItems(@Param("id") Long id);

    // wraz z usuniętymi
    @Query("""
        select o from Order o
        left join fetch o.items i
        where o.id = :id
    """)
    Optional<Order> findByIdWithItemsIncludingDeleted(@Param("id") Long id);

    // ===== WIDOK KLIENTA (po username) – przywrócone =====

    @Query("""
        select distinct o from Order o
        left join fetch o.items i
        join o.client c
        join c.user u
        where u.username = :username and o.deleted = false
        order by o.id desc
    """)
    List<Order> findAllByUsernameWithItems(@Param("username") String username);

    @Query("""
        select o from Order o
        left join fetch o.items i
        join o.client c
        join c.user u
        where o.id = :id and u.username = :username and o.deleted = false
    """)
    Optional<Order> findByIdAndUsernameWithItems(@Param("id") Long id, @Param("username") String username);
}
