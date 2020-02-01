export interface I_Account {
  admin_user_ids: string[];
  updated_at: firebase.firestore.Timestamp;

  _id?: string;
}
