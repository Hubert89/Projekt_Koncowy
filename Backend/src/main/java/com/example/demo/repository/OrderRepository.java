
package com.example.demo.repository;

import com.example.demo.model.Order;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.*;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // LISTA wszystkich (dla pracownika) – bez usuniętych
    @Query("""
        select distinct o from Order o
          left join fetch o.items i
          left join fetch i.product p
          left join fetch o.client c
        where o.deleted = false
        order by o.id desc
    """)
    List<Order> findAllWithItems();

    // LISTA klienta (własne) – bez usuniętych
    @Query("""
        select distinct o from Order o
          left join fetch o.items i
          left join fetch i.product p
          join o.client c
          join c.user u
        where o.deleted = false
          and u.username = :username
        order by o.id desc
    """)
    List<Order> findAllByUsernameWithItems(@Param("username") String username);

    // POJEDYNCZE – bez usuniętych
    @Query("""
        select o from Order o
          left join fetch o.items i
          left join fetch i.product p
          left join fetch o.client c
        where o.id = :id
          and o.deleted = false
    """)
    Optional<Order> findByIdWithItems(@Param("id") Long id);

    // POJEDYNCZE – łącznie z usuniętymi (przy soft-delete / idempotencji)
    @Query("""
        select o from Order o
          left join fetch o.items i
          left join fetch i.product p
          left join fetch o.client c
        where o.id = :id
    """)
    Optional<Order> findByIdWithItemsIncludingDeleted(@Param("id") Long id);

    // POJEDYNCZE klienta – bez usuniętych
    @Query("""
        select o from Order o
          left join fetch o.items i
          left join fetch i.product p
          join o.client c
          join c.user u
        where o.id = :id
          and u.username = :username
          and o.deleted = false
    """ )
    Optional<Order> findByIdAndUsernameWithItems(@Param("id") Long id,
                                                 @Param("username") String username);
}
