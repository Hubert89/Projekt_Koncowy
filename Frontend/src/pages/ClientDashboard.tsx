import ProductGrid from "../components/ProductGrid";
import MiniCartBar from "../components/MiniCartBar";

export default function ClientDashboard() {
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
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">Sklep</h1>
        {/* tu mogę dodać link do koszyka, np. <Link to="/client/cart" className="btn btn-outline-primary">Koszyk</Link> */}
      </div>
      <MiniCartBar />
      <ProductGrid />
    </div>
    </main>
  );
}
