export interface Counter {
  id: number;
  name: string;
  points?: number;
  jewels?: number;
  price: number;
  priceCurrency: 'points' | 'jewels';
}

export interface Notification {
  id: string;
  message: string;
  timestamp: number;
  read: boolean;
}
