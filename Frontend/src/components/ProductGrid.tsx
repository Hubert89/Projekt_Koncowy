import { useEffect, useState } from "react";
import { api } from "../lib/axios";
import { useCart } from "../cart/CartContext";
import type { Product } from "../types/shop";

// 🔹 lokalne PNG (wrzuć pliki do: src/assets/products)
import laptopImg from "../assets/products/laptop-pro-15.png";
import keyboardImg from "../assets/products/keyboard-red.png";
import mouseImg from "../assets/products/mouse-bt.png";
import monitorImg from "../assets/products/monitor-27-4k.png";
import earbudsImg from "../assets/products/earbuds.png";

const IMAGES: Record<number, { src: string; alt: string }> = {
  1: { src: laptopImg, alt: "Laptop Pro 15 – procesor i7, 16GB RAM, 512GB SSD" },
  2: { src: keyboardImg, alt: "Klawiatura mechaniczna – podświetlana, przełączniki Red" },
  3: { src: mouseImg, alt: "Mysz bezprzewodowa – optyczna, Bluetooth" },
  4: { src: monitorImg, alt: "Monitor 27 cali 4K – IPS, rozdzielczość 3840x2160" },
  5: { src: earbudsImg, alt: "Słuchawki douszne – redukcja szumów, etui ładujące" }
};

export default function ProductGrid() {
  const { add } = useCart();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get<Product[]>("/api/products");
        if (alive) setItems(data ?? []);
      } catch (e: any) {
        if (alive) setErr(e?.response?.data?.message || "Nie udało się pobrać produktów");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <p>Ładowanie…</p>;
  if (err) return <p className="text-danger">❌ {err}</p>;
  if (!items.length) return <p>Brak produktów.</p>;

  return (
    <div className="product-grid-wrapper">
      <div className="row g-3 product-grid-row">
        {items.map((p) => {
          const img = IMAGES[p.id];
          return (
            <div key={p.id} className="col-auto d-flex">
              <div className="card shadow-sm h-100 product-card">
                {img && (
                  <div className="d-flex justify-content-center align-items-center p-3">
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading="lazy"
                      decoding="async"
                      style={{ maxWidth: "100%", height: 160, objectFit: "contain" }}
                    />
                  </div>
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{p.name}</h5>
                  <p className="card-text text-body-secondary flex-grow-1">{p.description}</p>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <strong>{p.price.toFixed(2)} zł</strong>
                    <button
                      className="btn btn-sm btn-primary"
                      disabled={p.quantity <= 0}
                      onClick={() => add(p, 1)}
                      title={p.quantity <= 0 ? "Brak na stanie" : "Dodaj do koszyka"}
                    >
                      Dodaj
                    </button>
                  </div>
                  {p.quantity <= 0 && (
                    <div className="small text-body-secondary mt-1">Brak na stanie</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
