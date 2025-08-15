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
