import { useEffect, useState } from 'react';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
};

type OrderItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/products')
      .then(res => {
        if (!res.ok) throw new Error('Błąd pobierania danych');
        return res.json();
      })
      .then(data => setProducts(data))
      .catch(err => setError(err.message));
  }, []);

  const addToCart = (product: Product) => {
    setCart(prevCart => [...prevCart, product]);
  };

  const removeFromCart = (index: number) => {
    setCart(prevCart => prevCart.filter((_, i) => i !== index));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const submitOrder = () => {
    const order = {
      clientName: customerName,
      clientEmail: customerEmail,
      items: cart.map(item => ({
      productId: item.id,
      productName: item.name,
      price: item.price,
      quantity: item.quantity 
      }))
    };

    fetch('http://localhost:8080/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(order)
    })
      .then(res => res.text())
      .then(msg => {
        setConfirmationMessage(msg);
        setCart([]);
        setShowOrderForm(false);
        setCustomerName('');
        setCustomerEmail('');
      })
      .catch(() => setConfirmationMessage('Błąd przy składaniu zamówienia'));
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h2>🛍 Lista produktów</h2>
      {error && <p style={{ color: 'red' }}>❌ {error}</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {products.map(product => (
          <li key={product.id} style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
            <strong>{product.name}</strong><br />
            {product.description}<br />
            Cena: {product.price} zł<br />
            Dostępna ilość: {product.quantity}<br />
            <button onClick={() => addToCart(product)}>🛒 Dodaj do koszyka</button>
          </li>
        ))}
      </ul>

      <h3>🧺 Koszyk ({cart.length})</h3>
      <ul>
        {cart.map((item, index) => (
          <li key={index}>
            {item.name} – {item.price} zł
            <button style={{ marginLeft: '1rem' }} onClick={() => removeFromCart(index)}>❌ Usuń</button>
          </li>
        ))}
      </ul>

      {cart.length > 0 && (
        <>
          <p><strong>Łącznie do zapłaty:</strong> {totalPrice.toFixed(2)} zł</p>
          <button onClick={() => setShowOrderForm(true)}>🧾 Przejdź do zamówienia</button>
        </>
      )}

      {showOrderForm && (
        <div style={{ marginTop: '2rem', borderTop: '2px solid #000', paddingTop: '1rem' }}>
          <h3>📦 Formularz zamówienia</h3>
          <label>
            Imię i nazwisko:<br />
            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} />
          </label><br /><br />
          <label>
            E-mail:<br />
            <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
          </label><br /><br />
          <button onClick={submitOrder}>✅ Złóż zamówienie</button>
        </div>
      )}

      {confirmationMessage && (
        <p style={{ marginTop: '2rem', color: 'green' }}>
          {confirmationMessage}
        </p>
      )}
    </div>
  );
}
