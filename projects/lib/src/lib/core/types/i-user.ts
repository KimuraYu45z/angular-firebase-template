export interface IUser<Timestamp> {
  selected_account_id: string;
  account_ids_order: string[];
  updated_at: Timestamp;
  
  _is_admin?: boolean;
}
