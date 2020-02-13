import { Injectable } from '@angular/core';
import { IAccount } from './i-account';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { AngularFireFunctions } from '@angular/fire/functions';
import { UserRecord } from './user-record';

@Injectable({
  providedIn: 'root',
})
export class AccountService<Account extends IAccount> {
  static readonly collectionPath = 'accounts';

  constructor(
    private firestore: AngularFirestore,
    private functions: AngularFireFunctions,
  ) {}

  /**
   *
   * @param accountID
   */
  account$(accountID: string) {
    return this.firestore
      .collection<Account>(AccountService.collectionPath)
      .doc<Account>(accountID)
      .valueChanges()
      .pipe();
  }

  /**
   * 指定ユーザーが所属するアカウント一覧
   * @param userID
   */
  accounts$(userID: string) {
    return this.firestore
      .collection<Account>(AccountService.collectionPath, (ref) =>
        ref.where('user_ids', 'array-contains', userID),
      )
      .valueChanges({ idField: 'id' });
  }

  /**
   * 指定複数アカウントIDのアカウントを一括取得
   * @param accountIDs
   */
  accountsOfIDs(accountIDs: string[]) {
    return Promise.all(
      accountIDs.map((accountID) =>
        this.firestore
          .collection<Account>(AccountService.collectionPath)
          .doc<Account>(accountID)
          .get()
          .toPromise()
          .then((snapshot) => snapshot.data() as Account),
      ),
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
  pipeCreateTransaction(
    transaction: firebase.firestore.Transaction,
    userID: string,
    accountFactory: (iAccount: IAccount) => Account,
  ) {
    const now = firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp;
    const accountID = this.firestore.createId();

    const iAccount: IAccount = {
      user_ids: [userID],
      admin_user_ids: [userID],
      created_at: now,
      updated_at: now,
      selected_at: now,
    };
    transaction.set(
      this.firestore
        .collection<Account>(AccountService.collectionPath)
        .doc<Account>(accountID).ref,
      accountFactory(iAccount),
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
      .collection<Account>(AccountService.collectionPath)
      .doc<Account>(accountID)
      .update(data);
  }

  /**
   *
   * @param accountID
   */
  getImagePath(accountID: string) {
    return `${AccountService.collectionPath}/${accountID}/image.jpg`;
  }

  /**
   *
   * @param accountID
   */
  async getUsers(accountID: string) {
    return await this.functions
      .httpsCallable('account_get_users')({
        account_id: accountID,
      })
      .toPromise<UserRecord[]>();
  }

  /**
   *
   * @param accountID
   * @param userID
   */
  async removeUser(accountID: string, userID: string) {
    return await this.functions
      .httpsCallable('account_remove_user')({
        account_id: accountID,
        user_id: userID,
      })
      .toPromise<void>();
  }
}
