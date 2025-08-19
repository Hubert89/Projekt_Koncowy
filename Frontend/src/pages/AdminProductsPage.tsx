
import { useEffect, useMemo, useState } from "react";
import api from "../lib/axios";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
};

type FormState = Omit<Product, "id"> & { id?: number };

const emptyForm: FormState = { name: "", description: "", price: 0, quantity: 0 };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");
  
  async function onUploadImage(id: number, file: File) {
  const fd = new FormData();
  fd.append("file", file);
  try {
    const res = await api.post(`/api/products/${id}/image`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    // zaktualizuj produkt na liście
    setProducts(prev => prev.map(p => (p.id === id ? res.data : p)));
  } catch (e: any) {
    alert(e?.response?.data?.message || "Nie udało się wgrać obrazu.");
  }
}



  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p =>
      [p.name, p.description].join(" ").toLowerCase().includes(q)
    );
  }, [products, filter]);

  async function fetchAll() {
    try {
      setLoading(true);
      const res = await api.get<Product[]>("/api/products");
      setProducts(res.data);
      setError(null);
    } catch (e:any) {
      setError(e?.response?.data?.message || "Nie udało się pobrać produktów.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  function onEdit(p: Product) {
    setForm({ ...p });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onCancel() {
    setForm(emptyForm);
  }

  async function onDelete(id: number) {
    if (!confirm("Na pewno usunąć ten produkt?")) return;
    try {
      await api.delete(`/api/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e:any) {
      alert(e?.response?.data?.message || "Nie udało się usunąć produktu.");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || "",
        price: Number(form.price),
        quantity: Number(form.quantity),
      };
      if (!form.name.trim()) {
        alert("Nazwa jest wymagana.");
        setSaving(false);
        return;
      }
      if (form.id != null) {
        const res = await api.put<Product>(`/api/products/${form.id}`, payload);
        setProducts(prev => prev.map(p => (p.id === form.id ? res.data : p)));
      } else {
        const res = await api.post<Product>("/api/products", payload);
        setProducts(prev => [res.data, ...prev]);
      }
      setForm(emptyForm);
    } catch (e:any) {
      alert(e?.response?.data?.message || "Błąd zapisu produktu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container py-3">
      <h2 className="mb-3">Zarządzanie produktami (ADMIN)</h2>

      {/* Form */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">{form.id ? "Edytuj produkt" : "Dodaj produkt"}</h5>
          <form className="row g-3" onSubmit={onSubmit}>
            <div className="col-md-4">
              <label className="form-label">Nazwa</label>
              <input
                className="form-control"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Cena</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Ilość</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label">Opis</label>
              <textarea
                className="form-control"
                rows={2}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="col-12 d-flex gap-2">
              <button className="btn btn-primary" disabled={saving} type="submit">
                {form.id ? "Zapisz zmiany" : "Dodaj produkt"}
              </button>
              {form.id && (
                <button className="btn btn-outline-secondary" onClick={onCancel} type="button">
                  Anuluj
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Lista produktów</h5>
        <input
          className="form-control"
          style={{ maxWidth: 360 }}
          placeholder="Szukaj po nazwie/opisie..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-responsive shadow-sm">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nazwa</th>
              <th>Cena</th>
              <th>Ilość</th>
              <th>Opis</th>
              <th>Obraz</th>
              <th>Obraz</th>
              <th style={{ width: 160 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}>Ładowanie...</td></tr>
            ) : error ? (
              <tr><td colSpan={6} className="text-danger">{error}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6}>Brak produktów.</td></tr>
            ) : (
              filtered.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.price.toFixed(2)} zł</td>
                  <td>{p.quantity}</td>
                  <td className="text-truncate" style={{ maxWidth: 420 }}>{p.description}</td>
                  <td>
                    {p.imageUrl ? (
                      <img
                        src={(p.imageUrl.startsWith("http") ? p.imageUrl : `http://localhost:8080${p.imageUrl}`)}
                        alt={p.name}
                        style={{ width: 72, height: 48, objectFit: "cover", borderRadius: 6 }}
                      />
                    ) : (
                      <span className="text-body-secondary">brak</span>
                    )}

                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) onUploadImage(p.id, f);
                          // wyczyść input, żeby dało się wgrać ten sam plik drugi raz
                          e.currentTarget.value = "";
                        }}
                      />
                    </div>
                  </td>

                  <td className="text-end">
                    <div className="btn-group">
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => onEdit(p)}>
                        Edytuj
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(p.id)}>
                        Usuń
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
