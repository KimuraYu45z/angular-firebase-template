export interface Balance {
  [currency: string]: {
    amount: number;
    total: number;
  };
}
