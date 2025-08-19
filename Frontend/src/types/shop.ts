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
export type OrderItemDto = {
  id: number;
  productName: string;
  price: number;
  quantity: number;
};

export type OrderDto = {
  id: number;
  orderDate: string;
  clientName: string;
  clientEmail: string;
  status?: string;
  notes?: string | null;
  total: number;
  items: OrderItemDto[];
};
