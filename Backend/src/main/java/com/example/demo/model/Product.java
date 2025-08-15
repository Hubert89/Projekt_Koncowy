package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "products") // nazwa tabeli w DB
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)         private String name;
    @Column(columnDefinition = "text") private String description;
    @Column(nullable = false)         private Double price;     // wrapper (null-safe)
    @Column(nullable = false)         private Integer quantity; // wrapper (null-safe)

    public Product() {}

    public Product(Long id, String name, String description, Double price, Integer quantity) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.quantity = quantity;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public Double getPrice() { return price; }
    public Integer getQuantity() { return quantity; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setPrice(Double price) { this.price = price; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}


