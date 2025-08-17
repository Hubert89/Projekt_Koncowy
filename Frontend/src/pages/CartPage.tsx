import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../cart/CartContext";
import { api } from "../lib/axios";
import type { CreateOrderRequest, CreateOrderResponse } from "../types/shop";

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
      const { data } = await api.post<CreateOrderResponse>("/api/client/orders", payload);
      setResult(data);
      clear();
    } catch (e: any) {
      const msg = e?.response?.status === 401
        ? "Musisz być zalogowany jako klient, by złożyć zamówienie."
        : "Nie udało się złożyć zamówienia.";
      setError(msg);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container py-4">
      <h1 className="h4 mb-3 text-center">Zamów produkty</h1>

      {result && (
        <div className="alert alert-success d-flex justify-content-between align-items-center">
          <span>
            ✅ Zamówienie złożone. Nr: <strong>{result.orderId}</strong>, suma:{" "}
            <strong>{result.total.toFixed(2)} zł</strong>
          </span>
          <Link to="/client/orders" className="btn btn-success btn-sm">
            Przejdź do moich zamówień
          </Link>
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}

      {!items.length ? (
        <div className="text-center py-5">
          <p>Koszyk jest pusty.</p>
          <Link to="/client" className="btn btn-primary">
            ← Wróć do sklepu i dodaj produkty
          </Link>
        </div>
      ) : (
        <>
          <ul className="list-group mb-3">
            {items.map(({ product, quantity }) => (
              <li
                key={product.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div className="me-3">
                  <div className="fw-semibold">{product.name}</div>
                  <div className="small text-body-secondary">
                    {product.price.toFixed(2)} zł / szt.
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={quantity}
                    min={1}
                    onChange={(e) =>
                      setQuantity(
                        product.id,
                        Math.max(1, parseInt(e.target.value || "1", 10))
                      )
                    }
                    style={{ width: 80 }}
                  />
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => remove(product.id)}
                  >
                    Usuń
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <strong>Razem: {total.toFixed(2)} zł</strong>
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary"
                onClick={placeOrder}
                disabled={placing || items.length === 0}
              >
                {placing ? "Składanie zamówienia…" : "Zamów"}
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={clear}
                disabled={!items.length}
              >
                Wyczyść koszyk
              </button>
              <Link to="/client/orders" className="btn btn-outline-secondary">
                Moje zamówienia
              </Link>
              <Link to="/client" className="btn btn-link">
                ← Wróć do sklepu
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
