import { useEffect, useState } from "react";
import { api } from "./lib/axios";

type Product = { id: number; name: string; price: number };

export default function ProductList() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get<Product[]>("/api/products");
        if (mounted) setData(data);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Błąd pobierania danych");
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <p>⏳ Wczytywanie…</p>;
  if (error) return <p style={{ color: "tomato" }}>❌ {error}</p>;
  if (!data.length) return <p>Brak produktów.</p>;

  return (
    <div>
      <h3>📦 Lista produktów</h3>
      <ul>
        {data.map(p => (
          <li key={p.id}>
            {p.name} — {p.price.toFixed(2)} zł
          </li>
        ))}
      </ul>
    </div>
  );
}
