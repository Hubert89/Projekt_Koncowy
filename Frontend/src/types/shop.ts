export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;      // stan z backendu
  imageUrl?: string;     // opcjonalnie (może nie być w DB)
};

export type CartItem = { product: Product; quantity: number; };

export type CreateOrderRequest = { items: { productId: number; quantity: number }[]; };
export type CreateOrderResponse = { orderId: number; total: number; };
// types/shop.ts
export type OrderItemDto = {
  id: number;
  productId: number | null;
  productName: string | null;
  quantity: number;
  price: number;
};

export type OrderDto = {
  id: number;
  clientEmail: string;
  clientName: string;
  clientId: number;
  orderDate: string;
  deleted: boolean;
  status: string;
  notes?: string | null;
  total: number;
  items: OrderItemDto[];
};

