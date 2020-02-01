export interface IUser {
  selected_account_id: string;
  account_ids_order: string[];
  updated_at: firebase.firestore.Timestamp;

  is_admin?: boolean;
}
