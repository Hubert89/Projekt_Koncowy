package com.example.demo.controller;

import com.example.demo.model.Product;
import com.example.demo.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")            // możesz zostawić "/products" jeśli tak masz na froncie
//@CrossOrigin(origins = "http://localhost:5173") // albo "*"
public class ProductController {

    private final ProductRepository products;

    public ProductController(ProductRepository products) {
        this.products = products;
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return products.findAll();
    }
}
