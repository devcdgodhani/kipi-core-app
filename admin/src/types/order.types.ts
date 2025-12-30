export interface Order {
  id: string;
  userId: string;
  products: any[];
  total: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  createdAt: string;
}
