import { Injectable } from "@angular/core";
import { I_Account } from "../types/i-_account";
import { IAccount } from "../types/i-account";
import { AngularFirestore } from "@angular/fire/firestore";
import { isNotNull } from "../operators/is-not-null";

@Injectable({
  providedIn: "root"
})
export class AccountService<
  _Account extends I_Account,
  Account extends IAccount
> {
  static readonly path = "accounts";
  static readonly _path = "_accounts";

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
        ref.where("user_ids", "array-contains", userID)
      )
      .valueChanges({ idField: "id" });
  }

  /**
   * 指定複数アカウントIDのアカウントを一括取得
   * @param accountIDs
   */
  accountsOfIDs$(accountIDs: string[]) {
    return this.firestore
      .collection<Account>(AccountService.path, ref =>
        ref.where("_id", "in", accountIDs)
      )
      .valueChanges({ idField: "id" });
  }

  /**
   *
   * @param accountID
   */
  getImagePath(accountID: string) {
    return `${AccountService.path}/${accountID}/image.jpg`;
  }
}
