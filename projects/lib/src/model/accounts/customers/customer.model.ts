export type Customer = {
  customer_id: string;
  email: string;
  subscription_ids: { [plan_id: string]: string };
};
