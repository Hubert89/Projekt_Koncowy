import { useEffect, useMemo, useState } from "react";
import api from "../lib/axios";
import type { OrderDto } from "../types/shop";

type EditState = { id: number; status: string; notes: string };

export default function EmployeeDashboard() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditState | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<OrderDto[]>("/api/orders");
        setOrders(data);
      } catch (e: any) {
        setError(e?.response?.data?.message || e.message || "Błąd pobierania zamówień");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sorted = useMemo(() => {
    return [...orders].sort((a, b) => {
      // najnowsze na górze (po id lub dacie)
      const ad = a.orderDate ? new Date(a.orderDate).getTime() : 0;
      const bd = b.orderDate ? new Date(b.orderDate).getTime() : 0;
      if (bd !== ad) return bd - ad;
      return (b.id ?? 0) - (a.id ?? 0);
    });
  }, [orders]);

  const beginEdit = (o: OrderDto) => {
    setEditing({ id: o.id, status: o.status ?? "NEW", notes: o.notes ?? "" });
  };

  const cancelEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const { data } = await api.put<OrderDto>(`/api/orders/${editing.id}`, {
        status: editing.status,
        notes: editing.notes || null,
      });
      setOrders(prev => prev.map(o => (o.id === data.id ? data : o)));
      setEditing(null);
    } catch (e: any) {
      alert(e?.response?.data?.message || e.message || "Nie udało się zapisać zmian");
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Czy na pewno oznaczyć to zamówienie jako usunięte?")) return;
    try {
      await api.delete(`/api/orders/${id}`);
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (e: any) {
      alert(e?.response?.data?.message || e.message || "Nie udało się usunąć (soft-delete)");
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Ładowanie…</div>;
  if (error) return <div className="alert alert-danger m-3">{error}</div>;

  return (
    <div className="container py-3">
      <h2 className="mb-3">Panel Pracownika — Zamówienia</h2>

      <div className="table-responsive bg-white rounded shadow-sm">
        <table className="table table-striped align-middle mb-0">
          <thead>
            <tr>
              <th style={{width: 70}}>ID</th>
              <th>Data</th>
              <th>Klient</th>
              <th>Pozycje</th>
              <th>Status</th>
              <th>Notatki</th>
              <th className="text-end">Suma</th>
              <th style={{width: 180}}></th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-4">Brak zamówień</td></tr>
            ) : (
              sorted.map(o => {
                const isEditing = editing?.id === o.id;
                return (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.orderDate ?? "-"}</td>
                    <td>
                      <div className="fw-semibold">{o.clientName || "(brak nazwy)"}</div>
                      <div className="text-body-secondary small">{o.clientEmail}</div>
                    </td>
                    <td>
                      <ul className="mb-0">
                        {o.items?.map(i => (
                          <li key={i.id}>{i.productName} × {i.quantity} — {i.price?.toFixed(2)} zł</li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      {isEditing ? (
                        <input className="form-control form-control-sm" value={editing.status}
                               onChange={e => setEditing(s => s ? ({ ...s, status: e.target.value }) : s)} />
                      ) : (
                        <span className="badge text-bg-secondary">{o.status ?? "NEW"}</span>
                      )}
                    </td>
                    <td style={{minWidth: 200}}>
                      {isEditing ? (
                        <input className="form-control form-control-sm" value={editing.notes ?? ""}
                               onChange={e => setEditing(s => s ? ({ ...s, notes: e.target.value }) : s)} />
                      ) : (
                        <span className="text-body-secondary small">{o.notes ?? "—"}</span>
                      )}
                    </td>
                    <td className="text-end fw-semibold">{o.total?.toFixed(2)} zł</td>
                    <td className="text-end">
                      {isEditing ? (
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-success" onClick={saveEdit}>Zapisz</button>
                          <button className="btn btn-outline-secondary" onClick={cancelEdit}>Anuluj</button>
                        </div>
                      ) : (
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" onClick={() => beginEdit(o)}>Edytuj</button>
                          <button className="btn btn-outline-danger" onClick={() => onDelete(o.id)}>Usuń</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
