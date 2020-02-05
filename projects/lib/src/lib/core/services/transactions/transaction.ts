export type Transaction = {
  from_account_id: string;
  to_account_id: string;
  denom: string;
  total: number;
  fee: number;
  description: string;
  created_at: firebase.firestore.Timestamp;
}
