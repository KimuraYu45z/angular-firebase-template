import { Injectable } from '@angular/core';
import { IAccount } from './i-account';
import { AngularFirestore } from '@angular/fire/firestore';
import { isNotNull } from '../../operators/is-not-null';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AccountService<Account extends IAccount> {
  static readonly path = 'accounts';

  constructor(private firestore: AngularFirestore) {}

  /**
   *
   * @param accountID
   */
  account$(accountID: string) {
    return this.firestore
      .collection<Account>(AccountService.path)
      .doc<Account>(accountID)
      .valueChanges()
      .pipe(isNotNull());
  }

  /**
   * 指定ユーザーが所属するアカウント一覧
   * @param userID
   */
  accounts$(userID: string) {
    return this.firestore
      .collection<Account>(AccountService.path, ref =>
        ref.where('user_ids', 'array-contains', userID)
      )
      .valueChanges({ idField: 'id' });
  }

  /**
   * 指定複数アカウントIDのアカウントを一括取得
   * @param accountIDs
   */
  accountsOfIDs(accountIDs: string[]) {
    return Promise.all(
      accountIDs.map(accountID =>
        this.firestore
          .collection<Account>(AccountService.path)
          .doc<Account>(accountID)
          .get()
          .toPromise()
          .then(snapshot => snapshot.data() as Account)
      )
    );
  }

  /**
   *
   * @param transaction
   * @param userID
   * @param imageURL
   * @param accountFactory
   * @returns accountID
   */
  createTransactionFactory(
    transaction: firebase.firestore.Transaction,
    userID: string,
    imageURL: string,
    accountFactory: (iAccount: IAccount) => Account
  ) {
    const now = firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp;
    const accountID = this.firestore.createId();

    const iAccount: IAccount = {
      user_ids: [userID],
      admin_user_ids: [userID],
      image_url: imageURL,
      created_at: now,
      updated_at: now,
      selected_at: now
    };
    transaction.set(
      this.firestore
        .collection<Account>(AccountService.path)
        .doc<Account>(accountID).ref,
      accountFactory(iAccount)
    );

    return accountID;
  }

  /**
   *
   * @param accountID
   * @param data
   */
  async update(accountID: string, data: Partial<Account>) {
    await this.firestore
      .collection<Account>(AccountService.path)
      .doc<Account>(accountID)
      .update(data);
  }

  /**
   *
   * @param accountID
   */
  getImagePath(accountID: string) {
    return `${AccountService.path}/${accountID}/image.jpg`;
  }
}
