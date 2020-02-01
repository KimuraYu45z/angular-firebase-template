import { Injectable } from '@angular/core';
import { I_Account } from '../types/_accounts/i-_account';
import { IAccount } from '../types/accounts/i-account';
import { AngularFirestore } from '@angular/fire/firestore';
import { isNotNull } from '../operators/is-not-null';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AccountService<
  _Account extends I_Account,
  Account extends IAccount
> {
  static readonly path = 'accounts';
  static readonly _path = '_accounts';

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
   *
   * @param accountID
   */
  _account$(accountID: string) {
    return this.firestore
      .collection<_Account>(AccountService._path)
      .doc<_Account>(accountID)
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
  accountsOfIDs$(accountIDs: string[]) {
    return this.firestore
      .collection<Account>(AccountService.path, ref =>
        ref.where('_id', 'in', accountIDs)
      )
      .valueChanges({ idField: 'id' });
  }

  /**
   *
   * @param transaction
   * @param userID
   * @param imageURL
   * @param _accountFactory
   * @param accountFactory
   * @returns accountID
   */
  createTransactionFactory(
    transaction: firebase.firestore.Transaction,
    userID: string,
    imageURL: string,
    _accountFactory: (i_Account: I_Account) => _Account,
    accountFactory: (iAccount: IAccount) => Account
  ) {
    const now = firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp;
    const accountID = this.firestore.createId();

    const i_Account: I_Account = {
      admin_user_ids: [userID],
      updated_at: now
    };
    transaction.set(
      this.firestore
        .collection<_Account>(AccountService._path)
        .doc<_Account>(accountID).ref,
      _accountFactory(i_Account)
    );

    const iAccount: IAccount = {
      user_ids: [userID],
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
   * @param data
   */
  async _update(accountID: string, data: Partial<_Account>) {
    await this.firestore
      .collection<_Account>(AccountService._path)
      .doc<_Account>(accountID)
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
