export interface IPayment {
  from_account_id: string;
  to_account_id: string;
  currency: string;
  amount: number;
  commission: number;
  created_at: firebase.firestore.Timestamp;
}
