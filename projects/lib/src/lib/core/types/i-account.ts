export interface IAccount<Timestamp> {
  user_ids: string[];
  image_url: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  selected_at: Timestamp;

  _id?: string;
}
