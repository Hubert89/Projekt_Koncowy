import { useEffect, useMemo, useState } from "react";
import api from "../lib/axios";

// Sprzęg z backendem: obsługa zarówno quantity, jak i stock + wsparcie uploadu obrazów
// Zachowana stylistyka Bootstrap jak na Twoim screenie

type ProductApi = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  quantity?: number;   // wariant 1 w backendzie
  stock?: number;      // wariant 2 w backendzie
  imageUrl?: string | null;
};

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

const BASE_URL = (api as any)?.defaults?.baseURL || "";

function normalize(p: ProductApi): Product {
  return {
    id: p.id,
    name: p.name,
    description: (p.description ?? "") as string,
    price: p.price,
    quantity: typeof p.quantity === "number" ? p.quantity : (p.stock ?? 0),
    imageUrl: p.imageUrl ?? null,
  };
}

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
      const res = await api.post<ProductApi>(`/api/products/${id}/image`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProducts(prev => prev.map(p => (p.id === id ? normalize(res.data) : p)));
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
      const res = await api.get<ProductApi[] | { content: ProductApi[] }>("/api/products");
      const raw = Array.isArray(res.data) ? res.data : (res.data as any)?.content ?? [];
      setProducts(raw.map(normalize));
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
      const payload: any = {
        name: form.name.trim(),
        description: form.description?.trim() || "",
        price: Number(form.price),
        quantity: Number(form.quantity),
        stock: Number(form.quantity), // dla backendu ze 'stock'
      };
      if (!form.name.trim()) {
        alert("Nazwa jest wymagana.");
        setSaving(false);
        return;
      }
      if (form.id != null) {
        const res = await api.put<ProductApi>(`/api/products/${form.id}`, payload);
        setProducts(prev => prev.map(p => (p.id === form.id ? normalize(res.data) : p)));
      } else {
        const res = await api.post<ProductApi>("/api/products", payload);
        setProducts(prev => [normalize(res.data), ...prev]);
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

      {/* Formularz */}
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

      {/* Tabela */}
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
              <th style={{ width: 160 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}>Ładowanie...</td></tr>
            ) : error ? (
              <tr><td colSpan={7} className="text-danger">{error}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7}>Brak produktów.</td></tr>
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
                        src={(p.imageUrl.startsWith("http") ? p.imageUrl : `${BASE_URL}${p.imageUrl}`)}
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
                          e.currentTarget.value = ""; // reset, by móc wgrać ten sam plik ponownie
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
