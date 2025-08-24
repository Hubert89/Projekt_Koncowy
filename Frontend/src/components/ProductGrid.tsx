import { useEffect, useState } from "react";
import { api } from "../lib/axios";
import { useCart } from "../cart/CartContext";
import { useAuth } from "../auth/AuthContext";
import type { Product } from "../types/shop";

// 🔹 Lokalne PNG jako fallback (gdy produkt nie ma imageUrl z backendu)
import laptopImg from "../assets/products/laptop-pro-15.png";
import keyboardImg from "../assets/products/keyboard-red.png";
import mouseImg from "../assets/products/mouse-bt.png";
import monitorImg from "../assets/products/monitor-27-4k.png";
import earbudsImg from "../assets/products/earbuds.png";

const IMAGES: Record<number, { src: string; alt: string }> = {
  1: { src: laptopImg, alt: "Laptop Pro 15 – procesor i7, 16GB RAM, 512GB SSD" },
  2: { src: keyboardImg, alt: "Klawiatura mechaniczna – podświetlana, przełączniki Red" },
  3: { src: mouseImg, alt: "Mysz bezprzewodowa – optyczna, Bluetooth" },
  4: { src: monitorImg, alt: "Monitor 27\" 4K – IPS, 3840×2160" },
  5: { src: earbudsImg, alt: "Słuchawki bezprzewodowe – z etui ładującym" },
  // nowe id bez lokalnego pliku -> wpadnie w fallback z backendu (imageUrl)
};

const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL?.toString() || "http://localhost:8080";

export default function ProductGrid() {
  const { add } = useCart();
  const { user } = useAuth();                 // ⬅️ mamy rolę użytkownika
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get<Product[]>("/api/products");
        setProducts(res.data);
        setError(null);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Nie udało się pobrać produktów.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getProductImage = (p: Product): string | undefined => {
    // 1) jeśli backend zwrócił imageUrl – użyj go
    if (p.imageUrl) {
      return p.imageUrl.startsWith("http") ? p.imageUrl : `${API_BASE}${p.imageUrl}`;
    }
    // 2) jeśli mamy lokalny asset dla danego id – użyj
    if (IMAGES[p.id]) return IMAGES[p.id].src;
    // 3) w przeciwnym razie brak
    return undefined;
  };

  const getProductAlt = (p: Product): string => {
    if (IMAGES[p.id]?.alt) return IMAGES[p.id].alt;
    return p.name || "Produkt";
  };

  const formatPrice = (v: number) => `${v.toFixed(2)} zł`.replace(".", ",");

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-body-secondary">Ładowanie…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="text-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container py-3">
      <div className="row g-4">
        {products.map((p) => {
          const imgSrc = getProductImage(p);

          return (
            <div className="col-12 col-sm-6 col-lg-4" key={p.id}>
              <div className="card h-100 shadow-sm">
                {imgSrc && (
                  <img
                    src={imgSrc}
                    alt={getProductAlt(p)}
                    className="card-img-top"
                    style={{ maxHeight: 240, objectFit: "contain" }}
                    loading="lazy"
                  />
                )}

                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-center">{p.name}</h5>
                  <p className="card-text text-center text-body-secondary">
                    {p.description}
                  </p>

                  <div className="mt-auto d-flex align-items-center justify-content-between">
                    <div className="fw-semibold">{formatPrice(p.price)}</div>

                    {/* 🔒 Przycisk „Dodaj” widoczny tylko dla CLIENT */}
                    {user?.role === "CLIENT" && (
                      <button
                        className="btn btn-primary"
                        disabled={p.quantity <= 0}
                        onClick={() => add(p, 1)}
                        title={p.quantity <= 0 ? "Brak na stanie" : "Dodaj do koszyka"}
                      >
                        Dodaj
                      </button>
                    )}
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
