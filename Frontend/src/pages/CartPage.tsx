import { useState } from "react";
import { useCart } from "../cart/CartContext";
import { api } from "../lib/axios";
import type { CreateOrderRequest, CreateOrderResponse } from "../types/shop";
import ProductGrid from "../components/ProductGrid";

// 🔹 te same PNG co w gridzie
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

export default function CartPage() {
  const { items, total, remove, clear, setQuantity } = useCart();

  const [placing, setPlacing] = useState(false);
  const [result, setResult] = useState<CreateOrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const placeOrder = async () => {
    if (!items.length) return;
    setError(null);
    setPlacing(true);
    try {
      const payload: CreateOrderRequest = {
        items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
      };
      const { data } = await api.post<CreateOrderResponse>("/api/orders", payload);
      setResult(data);
      clear();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Nie udało się złożyć zamówienia");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container py-4">
      <h1 className="h4 mb-3">Zamów produkty</h1>

      {error && <div className="alert alert-danger">❌ {error}</div>}
      {result && (
        <div className="alert alert-success">
          ✅ Zamówienie złożone. Nr: <strong>{result.orderId}</strong>, suma:{" "}
          <strong>{result.total.toFixed(2)} zł</strong>
        </div>
      )}

      {!items.length ? (
        <>
          <p className="text-body-secondary">Koszyk jest pusty.</p>
          <h2 className="h5 mt-4 mb-3">Produkty</h2>
          <ProductGrid />
        </>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th style={{ width: 80 }} />
                  <th>Produkt</th>
                  <th style={{ width: 140 }}>Ilość</th>
                  <th style={{ width: 140 }} className="text-end">Cena</th>
                  <th style={{ width: 80 }} />
                </tr>
              </thead>
              <tbody>
                {items.map(({ product, quantity }) => {
                  const img = IMAGES[product.id];
                  return (
                    <tr key={product.id}>
                      <td>
                        {img && (
                          <img
                            src={img.src}
                            alt={img.alt}
                            width={64}
                            height={64}
                            loading="lazy"
                            decoding="async"
                            style={{ objectFit: "contain" }}
                          />
                        )}
                      </td>
                      <td>
                        <div className="fw-semibold">{product.name}</div>
                        <div className="small text-body-secondary">{product.description}</div>
                      </td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          max={product.quantity}
                          className="form-control"
                          value={quantity}
                          onChange={(e) => setQuantity(product.id, Number(e.target.value))}
                        />
                      </td>
                      <td className="text-end">{(product.price * quantity).toFixed(2)} zł</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => remove(product.id)}
                        >
                          Usuń
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td />
                  <td />
                  <td className="text-end fw-bold">Razem:</td>
                  <td className="text-end fw-bold">{total.toFixed(2)} zł</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-primary" onClick={placeOrder} disabled={placing || items.length === 0}>
              {placing ? "Składanie zamówienia…" : "Zamów"}
            </button>
            <button className="btn btn-outline-secondary" onClick={clear} disabled={!items.length}>
              Wyczyść koszyk
            </button>
          </div>

          <h2 className="h5 mt-4 mb-3">Dodaj coś jeszcze</h2>
          <ProductGrid />
        </>
      )}
    </div>
  );
}
