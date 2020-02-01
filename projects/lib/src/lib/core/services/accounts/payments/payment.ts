export interface Payment {
  currency: string;
  amount: number;
  description: string;
  created_at: firebase.firestore.Timestamp;
}
