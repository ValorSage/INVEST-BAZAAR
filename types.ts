
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
  category: 'counter' | 'transactions' | 'games' | 'chat' | 'general';
}

export interface User {
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  hashedPassword?: string; // Stored hashed, not plaintext
  isVerified?: boolean;
  nameChangeCount?: number;
  profilePictureChangeCount?: number;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'public' | 'private';
  icon: string | null;
  members: string[];
  entryFee?: number;
  feeCurrency?: 'points' | 'jewels';
  creatorId: string;
}

export interface ChatMessage {
    id: string;
    roomId: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: number;
    type: 'message' | 'notification';
}