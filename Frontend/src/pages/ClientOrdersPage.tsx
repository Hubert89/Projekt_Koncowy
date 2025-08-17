import { useEffect, useState } from "react";
import { api } from "../lib/axios";
import type { OrderDto } from "../types/shop";

export default function ClientOrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<OrderDto[]>("/api/client/orders");
        setOrders(data);
      } catch (e: any) {
        setError(
          e?.response?.status === 401
            ? "Zaloguj się, aby zobaczyć zamówienia."
            : "Nie udało się pobrać zamówień."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Ładowanie…</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!orders.length) return <div>Brak zamówień.</div>;

  return (
    <div className="container py-4">
      <h2 className="h4 mb-3 text-center">Moje zamówienia</h2>

      {/* >>> najważniejsze: list-unstyled usuwa kropki z zewnętrznej listy */}
      <ul className="list-unstyled">
        {orders.map((o) => (
          <li key={o.id} className="rounded-lg p-4 border mb-3">
            <div className="fw-medium">Zamówienie #{o.id}</div>
            <div className="small text-body-secondary">
              {new Date(o.orderDate).toLocaleDateString()} • {o.clientEmail}
            </div>

            {/* >>> i tutaj też bez kropek */}
            <ul className="list-unstyled mt-2 small ps-0">
              {o.items.map((i) => (
                <li key={i.id}>
                  {i.productName} × {i.quantity} — {i.price?.toFixed(2)} zł
                </li>
              ))}
            </ul>

            <div className="mt-2 fw-semibold">Suma: {o.total.toFixed(2)} zł</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
