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
  _Account extends I_Account<firebase.firestore.Timestamp>,
  Account extends IAccount<firebase.firestore.Timestamp>,
  User extends IUser<firebase.firestore.Timestamp>
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
   * @param type 
   * @param email 
   * @param password 
   */
  async login(
    type: "email",
    email: string,
    password: string
  ): Promise<firebase.auth.UserCredential>;

  /**
   * 
   * @param type 
   */
  async login(
    type: "google" | "twitter"
  ): Promise<firebase.auth.UserCredential>;

  async login(...args: any[]): Promise<firebase.auth.UserCredential> {
    const type: "email" | "google" | "twitter" = args[0];

    if (type === "email") {
      const email: string = args[2];
      const password: string = args[3];

      return await this.auth.auth.signInWithEmailAndPassword(email, password);
    } else {
      const provider = this.getAuthProvider(type);
      return await this.auth.auth.signInWithPopup(provider);
    }
  }

  /**
   * 
   * @param credential 
   * @param _account 
   * @param account 
   * @param user 
   */
  async validateNewUser(
    credential: firebase.auth.UserCredential,
    _account: (i_Account: I_Account<firebase.firestore.Timestamp>) => _Account,
    account: (iAccount: IAccount<firebase.firestore.Timestamp>) => Account,
    user: (iuser: IUser<firebase.firestore.Timestamp>) => User
  ) {
    if (
      credential.additionalUserInfo &&
      credential.additionalUserInfo.isNewUser
    ) {
      const now = firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp;
      await this.firestore.firestore.runTransaction(async t => {
        const userID = credential.user!.uid;
        const accountID = this.firestore.createId();

        const i_Account: I_Account<firebase.firestore.Timestamp> = {
          admin_user_ids: [userID],
          updated_at: now
        };
        t.set(
          this.firestore
            .collection<_Account>(AccountService._path)
            .doc(accountID).ref,
          _account(i_Account)
        );

        const iAccount: IAccount<firebase.firestore.Timestamp> = {
          user_ids: [userID],
          image_url: credential.user!.photoURL || "",
          created_at: now,
          updated_at: now,
          selected_at: now
        };
        t.set(
          this.firestore.collection<Account>(AccountService.path).doc(accountID)
            .ref,
          account(iAccount)
        );

        const iUser: IUser<firebase.firestore.Timestamp> = {
          selected_account_id: accountID,
          account_ids_order: [accountID],
          updated_at: now
        };
        t.set(
          this.firestore.collection<User>(UserService.path).doc<User>(userID)
            .ref,
          user(iUser)
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
  async link(firebaseUser: firebase.User, type: "google" | "twitter") {
    const provider = this.getAuthProvider(type);
    return await firebaseUser.linkWithPopup(provider);
  }

  /**
   * 
   * @param type 
   */
  private getAuthProvider(type: "google" | "twitter") {
    switch (type) {
      case "google":
        return new firebase.auth.GoogleAuthProvider();
      case "twitter":
        return new firebase.auth.TwitterAuthProvider();
    }
  }
}
