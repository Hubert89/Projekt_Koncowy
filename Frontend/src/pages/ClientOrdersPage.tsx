import { useEffect, useState } from "react";
import api from "../lib/axios";

type OrderItemDto = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
};

type OrderDto = {
  id: number;
  clientId: number;
  clientName: string;
  clientEmail: string;
  orderDate: string;
  status: string;
  notes?: string | null;
  total: number;
  items: OrderItemDto[];
};

export default function ClientOrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get<OrderDto[]>("/api/client/orders");
        if (!alive) return;
        setOrders(res.data);
      } catch (e: any) {
        setError("Nie udało się pobrać zamówień.");
        console.error("GET api/client/orders failed:", e?.response?.status, e?.response?.data);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (error) return <p className="container text-danger py-4">{error}</p>;

  return (
    <section className="container py-4">
      <h2>Moje zamówienia</h2>
      {orders.length === 0 ? (
        <p className="text-body-secondary">Brak zamówień.</p>
      ) : (
        <ul className="list-group">
          {orders.map((o) => (
            <li key={o.id} className="list-group-item">
              <div className="d-flex justify-content-between">
                <span>
                  #{o.id} • {new Date(o.orderDate).toLocaleDateString()} • {o.status}
                </span>
                <strong>{o.total.toFixed(2)} zł</strong>
              </div>
              <ul className="mt-2">
                {o.items.map((item) => (
                  <li key={item.id}>
                    {item.productName} × {item.quantity} ({item.price.toFixed(2)} zł)
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
