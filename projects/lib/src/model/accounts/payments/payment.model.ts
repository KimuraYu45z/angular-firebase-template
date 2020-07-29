export type Payment = {
  email: string;
  items: {
    amount: number;
    currency: string;
    /**
     * Optional, defaults to 1.
     */
    quantity?: number;
    description: string;
  }[];
  created_at: firebase.firestore.Timestamp;
};
