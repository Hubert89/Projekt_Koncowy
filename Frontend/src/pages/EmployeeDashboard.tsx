import { useEffect, useState } from "react";
import { api } from "../lib/axios";

// ⬇️ Jeśli backend wystawia /api/orders, terzeba podmienić stałą na ten URL
const EMP_ORDERS_BASE = "/api/orders";

// --- types ---
type OrderItemRow = {
  id: number;
  productId?: number | null;
  productName?: string | null;
  quantity: number;
  price: number; // cena jednostkowa
};

type OrderRow = {
  id: number;
  orderDate: any;
  clientName?: string | null;
  clientEmail?: string | null;
  status?: string | null;
  total?: number | null;
  deleted?: boolean | null;
  // jeśli backend już zwraca pozycje na liście – też zostanie obsłużone:
  items?: OrderItemRow[];
};

// --- utils ---
function formatOrderDate(d: any): string {
  if (!d) return "—";
  if (typeof d === "string") {
    const dt = new Date(d);
    return isNaN(+dt) ? "—" : dt.toLocaleDateString("pl-PL");
  }
  if (Array.isArray(d)) {
    const dt = new Date(d[0], (d[1] ?? 1) - 1, d[2] ?? 1);
    return isNaN(+dt) ? "—" : dt.toLocaleDateString("pl-PL");
  }
  if (typeof d === "object") {
    const y = d.year ?? d.y;
    const m = (d.monthValue ?? d.month ?? 1) - 1;
    const day = d.dayOfMonth ?? d.day ?? 1;
    const dt = new Date(y, m, day);
    return isNaN(+dt) ? "—" : dt.toLocaleDateString("pl-PL");
  }
  return "—";
}

function formatPLN(n?: number | null): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n) + " zł";
}

function statusPL(s?: string | null): string {
  if (!s) return "—";
  const norm = s.toUpperCase();
  if (norm === "NEW") return "Nowe";
  return s;
}

// --- component ---
export default function EmployeeOrdersPage() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // rozwinięte wiersze i cache pozycji
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [itemsCache, setItemsCache] = useState<Record<number, OrderItemRow[]>>({});
  const [itemsLoading, setItemsLoading] = useState<Record<number, boolean>>({});
  const [itemsError, setItemsError] = useState<Record<number, string | null>>({});

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await api.get<any>(EMP_ORDERS_BASE);
      const raw = res.data;
      const list: OrderRow[] = Array.isArray(raw) ? raw : raw?.content ?? [];
      setRows(list);
    } catch (e: any) {
      console.error("GET orders failed:", e?.response?.status, e?.response?.data);
      setError("Nie udało się pobrać listy zamówień.");
    } finally {
      setLoading(false);
    }
  }

  async function softDelete(id: number) {
    if (!window.confirm("Czy na pewno chcesz oznaczyć to zamówienie jako usunięte?")) return;
    try {
      await api.patch(`${EMP_ORDERS_BASE}/${id}/delete`);
      await fetchOrders();
    } catch (e: any) {
      console.error("PATCH delete failed:", e?.response?.status, e?.response?.data);
      alert("Nie udało się usunąć zamówienia.");
    }
  }

  async function ensureItemsLoaded(orderId: number) {
    // jeśli już są wiersze z items lub w cache – nie dociągam
    const row = rows.find(r => r.id === orderId);
    if ((row && row.items && row.items.length) || itemsCache[orderId]) return;

    try {
      setItemsLoading(prev => ({ ...prev, [orderId]: true }));
      setItemsError(prev => ({ ...prev, [orderId]: null }));

      const res = await api.get<OrderRow>(`${EMP_ORDERS_BASE}/${orderId}`);
      const withItems = res.data?.items ?? [];
      // cache
      setItemsCache(prev => ({ ...prev, [orderId]: withItems }));
      // wstrzyknięcie items także do rows (żeby drugi raz nie pytać)
      setRows(prev =>
        prev.map(r => (r.id === orderId ? { ...r, items: withItems } : r))
      );
    } catch (e: any) {
      console.error("GET order details failed:", e?.response?.status, e?.response?.data);
      setItemsError(prev => ({ ...prev, [orderId]: "Nie udało się pobrać pozycji zamówienia." }));
    } finally {
      setItemsLoading(prev => ({ ...prev, [orderId]: false }));
    }
  }

  function toggleDetails(orderId: number) {
    setExpanded(prev => {
      const next = { ...prev, [orderId]: !prev[orderId] };
      return next;
    });
    // jeśli rozwijam – dociągam pozycję (on-demand)
    const willExpand = !expanded[orderId];
    if (willExpand) ensureItemsLoaded(orderId);
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const sorted = [...rows].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        justifyContent: "center",
        alignItems: "start",
        rowGap: "0.75rem",
        padding: "1rem",
        width: "100vw",
        boxSizing: "border-box",
      }}
    >
      <div className="container mx-auto px-6 py-6">
        <h1 className="text-3xl font-bold mb-6">Panel pracownika</h1>

        {loading && <div>Ładowanie…</div>}
        {error && <div className="text-red-400">{error}</div>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full max-w-6xl border border-gray-700 rounded-lg">
              <thead className="bg-gray-800">
                <tr className="text-left">
                  <th className="py-2 px-4 border-b border-gray-600">#</th>
                  <th className="py-2 px-4 border-b border-gray-600">Data</th>
                  <th className="py-2 px-4 border-b border-gray-600">Klient</th>
                  <th className="py-2 px-4 border-b border-gray-600">Status</th>
                  <th className="py-2 px-4 border-b border-gray-600">Suma</th>
                  <th className="py-2 px-4 border-b border-gray-600">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((o) => {
                  const displayStatus = o.deleted ? "Usunięte" : statusPL(o.status);
                  const rowItems = o.items && o.items.length ? o.items : itemsCache[o.id];

                  return (
                    <>
                      <tr key={o.id} className="hover:bg-gray-800">
                        <td className="py-2 px-4 border-b border-gray-700">{o.id}</td>
                        <td className="py-2 px-4 border-b border-gray-700">
                          {formatOrderDate(o.orderDate)}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-700">
                          {o.clientName || o.clientEmail || "—"}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-700">
                          <span
                            className={
                              o.deleted
                                ? "inline-block rounded px-2 py-0.5 text-sm bg-red-800/40 border border-red-700"
                                : "inline-block rounded px-2 py-0.5 text-sm bg-gray-700/40 border border-gray-600"
                            }
                          >
                            {displayStatus}
                          </span>
                        </td>
                        <td className="py-2 px-4 border-b border-gray-700">
                          {formatPLN(o.total)}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-700 space-x-2">
                          <button
                            onClick={() => toggleDetails(o.id)}
                            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700"
                          >
                            {expanded[o.id] ? "Ukryj" : "Szczegóły"}
                          </button>
                          <button
                            onClick={() => softDelete(o.id)}
                            disabled={!!o.deleted}
                            className={`px-3 py-1 rounded text-white ${
                              o.deleted
                                ? "bg-gray-600 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700"
                            }`}
                            title={o.deleted ? "Już usunięte" : "Usuń"}
                          >
                            Usuń
                          </button>
                        </td>
                      </tr>

                      {expanded[o.id] && (
                        <tr>
                          <td colSpan={6} className="p-0 border-b border-gray-700">
                            <div className="p-3 bg-gray-900/40">
                              {itemsLoading[o.id] && <div>Ładowanie pozycji…</div>}
                              {itemsError[o.id] && (
                                <div className="text-red-400">{itemsError[o.id]}</div>
                              )}
                              {!itemsLoading[o.id] && !itemsError[o.id] && (
                                <>
                                  {rowItems && rowItems.length ? (
                                    <table className="table-auto w-full">
                                      <thead>
                                        <tr className="text-left">
                                          <th className="py-1 px-2">#</th>
                                          <th className="py-1 px-2">Produkt</th>
                                          <th className="py-1 px-2">Ilość</th>
                                          <th className="py-1 px-2">Cena</th>
                                          <th className="py-1 px-2">Suma</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {rowItems.map((it, idx) => (
                                          <tr key={it.id ?? idx} className="border-t border-gray-800">
                                            <td className="py-1 px-2">{idx + 1}</td>
                                            <td className="py-1 px-2">
                                              {it.productName ?? (it.productId ? `ID ${it.productId}` : "—")}
                                            </td>
                                            <td className="py-1 px-2">{it.quantity}</td>
                                            <td className="py-1 px-2">{formatPLN(it.price)}</td>
                                            <td className="py-1 px-2">
                                              {formatPLN((it.price ?? 0) * (it.quantity ?? 0))}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  ) : (
                                    <em>Brak pozycji.</em>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center opacity-70">
                      Brak zamówień do wyświetlenia.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
