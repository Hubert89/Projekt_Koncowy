// src/cart/CartContext.tsx
import { createContext, useContext, useMemo, useState } from "react";
import type { CartItem, Product } from "../types/shop";

type CartCtx = {
  items: CartItem[];
  total: number;
  add: (product: Product, qty?: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  setQuantity: (productId: number, qty: number) => void; // ⬅️ brakująca funkcja
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const total = useMemo(
    () => items.reduce((sum, it) => sum + it.product.price * it.quantity, 0),
    [items]
  );

  const add: CartCtx["add"] = (product, qty = 1) => {
    setItems(curr => {
      const i = curr.findIndex(ci => ci.product.id === product.id);
      if (i === -1) return [...curr, { product, quantity: Math.max(1, Math.min(qty, product.quantity)) }];
      const next = [...curr];
      const newQty = Math.max(1, Math.min(next[i].quantity + qty, product.quantity));
      next[i] = { ...next[i], quantity: newQty };
      return next;
    });
  };

  const remove: CartCtx["remove"] = (productId) => {
    setItems(curr => curr.filter(ci => ci.product.id !== productId));
  };

  const clear: CartCtx["clear"] = () => setItems([]);

  const setQuantity: CartCtx["setQuantity"] = (productId, qty) => {
    setItems(curr => {
      if (qty <= 0) return curr.filter(ci => ci.product.id !== productId);
      return curr.map(ci =>
        ci.product.id === productId
          ? {
              ...ci,
              quantity: Math.max(1, Math.min(qty, ci.product.quantity)),
            }
          : ci
      );
    });
  };

  return (
    <Ctx.Provider value={{ items, total, add, remove, clear, setQuantity }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used within CartProvider");
  return v;
}
