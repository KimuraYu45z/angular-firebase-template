export interface IPayment<Timestamp> {
  from_account_id: string;
  to_account_id: string;
  currency: string;
  amount: number;
  commission: number;
  created_at: Timestamp;
}