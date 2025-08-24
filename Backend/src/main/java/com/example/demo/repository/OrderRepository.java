package com.example.demo.repository;

import com.example.demo.model.Order;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // ====== PANEL KLIENTA =====================================================

    // Lista zamówień danego użytkownika (łącznie z "usuniętymi"), z pozycjami
    @Query("""
        select distinct o from Order o
        join o.client c
        join c.user u
        left join fetch o.items i
        left join fetch i.product p
        where u.username = :username
        order by o.id desc
    """)
    List<Order> findAllByUsernameWithItemsIncludingDeleted(@Param("username") String username);

    // Jedno zamówienie użytkownika, z pozycjami (również "usunięte")
    @Query("""
        select distinct o from Order o
        join o.client c
        join c.user u
        left join fetch o.items i
        left join fetch i.product p
        where o.id = :id and u.username = :username
    """)
    Optional<Order> findByIdAndUsernameWithItemsIncludingDeleted(@Param("id") Long id,
                                                                 @Param("username") String username);

    // ====== PANEL PRACOWNIKA / ADMINA =========================================

    // Wszystkie zamówienia, z pozycjami, malejąco po id
    @Query("""
        select distinct o from Order o
        left join fetch o.items i
        left join fetch i.product p
        order by o.id desc
    """)
    List<Order> findAllWithItemsOrderByIdDesc();

    // Jedno zamówienie (bez filtrowania po użytkowniku), z pozycjami
    @Query("""
        select distinct o from Order o
        left join fetch o.items i
        left join fetch i.product p
        where o.id = :id
    """)
    Optional<Order> findByIdWithItems(@Param("id") Long id);

    // ====== SOFT DELETE (aktualizuje też status w DB) ==========================
    @Modifying
    @Transactional
    @Query(
            value = """
        update Order o
           set o.deleted   = true,
               o.deletedAt = :ts,
               o.status    = 'Usunięte'
         where o.id        = :id
        """,
            nativeQuery = true)
    int softDelete(@Param("id") Long id, @Param("ts") LocalDateTime ts);
}
