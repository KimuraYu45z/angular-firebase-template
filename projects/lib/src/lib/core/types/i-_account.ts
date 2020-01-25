export interface I_Account<Timestamp> {
  admin_user_ids: string[];
  updated_at: Timestamp;

  _id?: string;
}