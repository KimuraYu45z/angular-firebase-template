import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable, of } from "rxjs";
import * as firebase from "firebase/app";
import { isNotNull } from "../operators/is-not-null";
import { map, mergeMap } from "rxjs/operators";
import { IUser } from "../types/i-user";
import { I_Account } from "../types/i-_account";
import { IAccount } from "../types/i-account";
import { AccountService } from "./account.service";

@Injectable({
  providedIn: "root"
})
export class UserService<
  _Account extends I_Account,
  Account extends IAccount,
  User extends IUser
> {
  static readonly path = "users";

  authorized$: Observable<boolean>;
  userID$: Observable<string | null>;
  currentUser$: Observable<User | null>;
  selectedAccountID$: Observable<string | null>;

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {
    this.authorized$ = this.auth.user.pipe(map(user => user !== null));
    this.userID$ = this.auth.user.pipe(map(user => (user ? user.uid : null)));
    this.currentUser$ = this.userID$.pipe(
      mergeMap(userID => (userID ? this.user$(userID) : of(null)))
    );
    this.selectedAccountID$ = this.currentUser$.pipe(
      map(user => (user ? user.selected_account_id : null))
    );
  }

  /**
   *
   * @param userID
   */
  user$(userID: string) {
    return this.firestore
      .collection<User>(UserService.path)
      .doc<User>(userID)
      .valueChanges()
      .pipe(isNotNull());
  }

  /**
   *
   * @param email
   * @param password
   */
  async login(
    email: string,
    password: string
  ): Promise<firebase.auth.UserCredential>;

  /**
   *
   * @param provider
   */
  async login(
    provider: firebase.auth.AuthProvider
  ): Promise<firebase.auth.UserCredential>;

  async login(...args: any[]): Promise<firebase.auth.UserCredential> {
    if (typeof args[0] === "string") {
      const [email, password] = args as [string, string];

      return await this.auth.auth.signInWithEmailAndPassword(email, password);
    } else {
      const [provider] = args as [firebase.auth.AuthProvider];
      return await this.auth.auth.signInWithPopup(provider);
    }
  }

  /**
   *
   * @param credential
   * @param _accountFactory
   * @param accountFactory
   * @param userFactory
   */
  async validateNewUser(
    credential: firebase.auth.UserCredential,
    _accountFactory: (i_Account: I_Account) => _Account,
    accountFactory: (iAccount: IAccount) => Account,
    userFactory: (iuser: IUser) => User
  ) {
    if (
      credential.additionalUserInfo &&
      credential.additionalUserInfo.isNewUser
    ) {
      const now = firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp;
      await this.firestore.firestore.runTransaction(async t => {
        const userID = credential.user!.uid;
        const accountID = this.firestore.createId();

        const i_Account: I_Account = {
          admin_user_ids: [userID],
          updated_at: now
        };
        t.set(
          this.firestore
            .collection<_Account>(AccountService._path)
            .doc(accountID).ref,
          _accountFactory(i_Account)
        );

        const iAccount: IAccount = {
          user_ids: [userID],
          image_url: credential.user!.photoURL || "",
          created_at: now,
          updated_at: now,
          selected_at: now
        };
        t.set(
          this.firestore.collection<Account>(AccountService.path).doc(accountID)
            .ref,
          accountFactory(iAccount)
        );

        const iUser: IUser = {
          selected_account_id: accountID,
          account_ids_order: [accountID],
          updated_at: now
        };
        t.set(
          this.firestore.collection<User>(UserService.path).doc<User>(userID)
            .ref,
          userFactory(iUser)
        );
      });
    }
  }

  /**
   *
   */
  async logout() {
    await this.auth.auth.signOut();
  }

  /**
   *
   * @param firebaseUser
   * @param type
   */
  async link(
    firebaseUser: firebase.User,
    provider: firebase.auth.AuthProvider
  ) {
    return await firebaseUser.linkWithPopup(provider);
  }
}
