import { useEffect, useState } from "react";
import { api } from "../lib/axios";

type OrderRow = {
  id: number;
  orderDate: any;
  clientName?: string | null;
  clientEmail?: string | null;
  status?: string | null;
  total?: number | null;
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

// --- component ---
export default function EmployeeOrdersPage() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await api.get<any>("/api/orders");
      const raw = res.data;
      const list: OrderRow[] = Array.isArray(raw) ? raw : raw?.content ?? [];
      setRows(list);
    } catch (e: any) {
      console.error("GET /api/orders failed:", e?.response?.status, e?.response?.data);
      setError("Nie udało się pobrać listy zamówień.");
    } finally {
      setLoading(false);
    }
  }

  async function softDelete(id: number) {
    if (!window.confirm("Czy na pewno chcesz oznaczyć to zamówienie jako usunięte?")) return;
    try {
      await api.patch(`/api/orders/${id}/delete`);
      // Po usunięciu odświeżamy listę
      await fetchOrders();
    } catch (e: any) {
      console.error("PATCH delete failed:", e?.response?.status, e?.response?.data);
      alert("Nie udało się usunąć zamówienia.");
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const sorted = [...rows].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));

  return (
     <main 
     style={{
      minHeight: "100vh",       // pełny ekran
      display: "grid",          // siatka
      justifyContent: "center",  
      alignItems: "start",
      rowGap: "0.75rem", 
      padding: "1rem",
      width: "100vw",           // pełna szerokość okna
      boxSizing: "border-box",
     }}>
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
              {sorted.map((o) => (
                <tr key={o.id} className="hover:bg-gray-800">
                  <td className="py-2 px-4 border-b border-gray-700">{o.id}</td>
                  <td className="py-2 px-4 border-b border-gray-700">{formatOrderDate(o.orderDate)}</td>
                  <td className="py-2 px-4 border-b border-gray-700">{o.clientName || o.clientEmail || "—"}</td>
                  <td className="py-2 px-4 border-b border-gray-700">{o.status ?? "—"}</td>
                  <td className="py-2 px-4 border-b border-gray-700">{formatPLN(o.total)}</td>
                  <td className="py-2 px-4 border-b border-gray-700">
                    <button
                      onClick={() => softDelete(o.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}
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
