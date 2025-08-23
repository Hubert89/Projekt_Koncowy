import { Link } from "react-router-dom";
import { useCart } from "../cart/CartContext";
import { useAuth } from "../auth/AuthContext";

export default function MiniCartBar() {
  const { items, total } = useCart();
  const { user } = useAuth();   // <-- pobieramy usera
  const role = user?.role;      // <-- wyciągamy rolę z usera

  if (role !== "CLIENT" || !items.length) return null;

  const itemCount = items.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div
      className="alert alert-dark d-flex justify-content-between align-items-center mb-4"
      role="status"
      style={{ position: "sticky", top: 0, zIndex: 10 }}
    >
      <div>
        🛒 Masz <strong>{itemCount}</strong>{" "}
        {itemCount === 1 ? "pozycję" : "pozycje/pozycji"} w koszyku — razem{" "}
        <strong>{total.toFixed(2)} zł</strong>.
      </div>
      <div className="d-flex gap-2">
        <Link to="/client/cart" className="btn btn-primary btn-sm">Przejdź do koszyka</Link>
        <Link to="/client/orders" className="btn btn-outline-secondary btn-sm">Moje zamówienia</Link>
      </div>
    </div>
  );
}
