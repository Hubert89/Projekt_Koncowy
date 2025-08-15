import ProductGrid from "../components/ProductGrid";

export default function ClientDashboard() {
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">Sklep</h1>
        {/* tu możesz dodać link do koszyka, np. <Link to="/client/cart" className="btn btn-outline-primary">Koszyk</Link> */}
      </div>
      <ProductGrid />
    </div>
  );
}
