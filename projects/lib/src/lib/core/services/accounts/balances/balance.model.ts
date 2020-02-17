export type Balance = {
  [currency: string]: {
    amount: number;
    total: number;
  };
}
