package com.example.demo.controller;

import com.example.demo.model.Product;
import com.example.demo.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepo;

    public ProductController(ProductRepository productRepo) {
        this.productRepo = productRepo;
    }

    // === READ ALL ===
    @GetMapping
    public List<Product> all() {
        return productRepo.findAllByOrderByIdAsc();
    }

    // === READ ONE ===
    @GetMapping("/{id}")
    public Product one(@PathVariable Long id) {
        return productRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    // === CREATE ===
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATOR')")
    @ResponseStatus(HttpStatus.CREATED)
    public Product create(@RequestBody Product p) {
        validate(p);
        p.setId(null);
        return productRepo.save(p);
    }

    // === UPDATE ===
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATOR')")
    public Product update(@PathVariable Long id, @RequestBody Product p) {
        if (!productRepo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        validate(p);
        p.setId(id);
        return productRepo.save(p);
    }

    // === DELETE ===
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATOR')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!productRepo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        productRepo.deleteById(id);
    }

    // === IMAGE UPLOAD (multipart/form-data: file) ===
    @PostMapping("/{id}/image")
    @PreAuthorize("hasAnyRole('ADMIN','ADMINISTRATOR')")
    public Product uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        Product p = productRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "empty file");
        }

        try {
            // ensure dir: uploads/products
            Path root = Paths.get("uploads").resolve("products");
            Files.createDirectories(root);

            // extension from original file
            String ext = Optional.ofNullable(file.getOriginalFilename())
                    .filter(fn -> fn.contains("."))
                    .map(fn -> fn.substring(fn.lastIndexOf('.')))
                    .orElse(".png");

            // target filename
            String fname = "product_" + id + "_" + System.currentTimeMillis() + ext;
            Path out = root.resolve(fname);

            // write
            Files.write(out, file.getBytes(), StandardOpenOption.CREATE_NEW);

            // save URL relative to app (served by WebConfig as /uploads/**)
            p.setImageUrl("/uploads/products/" + fname);
            return productRepo.save(p);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "upload failed");
        }
    }

    private void validate(Product p) {
        if (p.getName() == null || p.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name required");
        }
        if (p.getPrice() == null || p.getPrice() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "price must be >= 0");
        }
        if (p.getQuantity() == null || p.getQuantity() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "quantity must be >= 0");
        }
    }
}
