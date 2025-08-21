import { useEffect, useState } from "react";
import { apiNoAuth } from "./lib/axios";
import ProductGrid from "./components/ProductGrid";
import type { Product } from "./types/shop";

export default function ProductList() {
  const [items, setItems] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // DOPASUJ jeśli backend ma inną ścieżkę (np. /shop/products)
        // ...
        const res = await apiNoAuth.get<Product[]>("/api/products");
        // ...

        if (!alive) return;
        setItems(res.data);
      } catch (e: any) {
        setError("Nie udało się pobrać produktów.");
        console.error("GET /products failed:", e?.response?.status, e?.response?.data);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <section className="container py-4">
      <h2>Sklep</h2>
      {error && <p className="text-danger mt-3">{error}</p>}
      {!error && <ProductGrid products={items} />}
    </section>
  );
}
