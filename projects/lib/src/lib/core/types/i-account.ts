export interface IAccount {
  user_ids: string[];
  image_url: string;
  created_at: firebase.firestore.Timestamp;
  updated_at: firebase.firestore.Timestamp;
  selected_at: firebase.firestore.Timestamp;

  _id?: string;
}
