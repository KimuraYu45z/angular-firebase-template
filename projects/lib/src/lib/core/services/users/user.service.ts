import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import * as firebase from 'firebase/app';
import { map, mergeMap } from 'rxjs/operators';
import { IUser } from './i-user';
import { IAccount } from '../accounts/i-account';
import { AccountService } from '../accounts/account.service';

@Injectable({
  providedIn: 'root',
})
export class UserService<Account extends IAccount, User extends IUser> {
  static readonly collectionPath = 'users';

  authorized$: Observable<boolean>;
  userID$: Observable<string | null>;
  currentUser$: Observable<User | null>;
  selectedAccountID$: Observable<string | null>;

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private account: AccountService<Account>,
  ) {
    this.authorized$ = this.auth.user.pipe(map((user) => user !== null));
    this.userID$ = this.auth.user.pipe(map((user) => (user ? user.uid : null)));
    this.currentUser$ = this.userID$.pipe(
      mergeMap((userID) =>
        userID
          ? this.user$(userID).pipe(
              map((user) => (user !== undefined ? user : null)),
            )
          : of(null),
      ),
    );
    this.selectedAccountID$ = this.currentUser$.pipe(
      map((user) => (user ? user.selected_account_id : null)),
    );
  }

  /**
   *
   * @param userID
   */
  user$(userID: string) {
    return this.firestore
      .collection<User>(UserService.collectionPath)
      .doc<User>(userID)
      .valueChanges()
      .pipe();
  }

  /**
   *
   * @param userFactory
   * @param accountFactory
   * @param email
   * @param password
   */
  async signUp(
    userFactory: (iuser: IUser) => User,
    accountFactory: (iAccount: IAccount) => Account,
    email: string,
    password: string,
  ): Promise<firebase.auth.UserCredential>;

  /**
   *
   * @param userFactory
   * @param accountFactory
   * @param provider
   */
  async signUp(
    userFactory: (iuser: IUser) => User,
    accountFactory: (iAccount: IAccount) => Account,
    provider: firebase.auth.AuthProvider,
  ): Promise<firebase.auth.UserCredential>;

  async signUp(
    userFactory: (iuser: IUser) => User,
    accountFactory: (iAccount: IAccount) => Account,
    ...args: any[]
  ): Promise<firebase.auth.UserCredential> {
    let credential: firebase.auth.UserCredential;

    if (typeof args[0] === 'string') {
      const [email, password] = args as [string, string];

      credential = await this.auth.auth.createUserWithEmailAndPassword(
        email,
        password,
      );
    } else {
      const [provider] = args as [firebase.auth.AuthProvider];
      credential = await this.auth.auth.signInWithPopup(provider);
    }

    if (
      credential.additionalUserInfo &&
      credential.additionalUserInfo.isNewUser
    ) {
      const now = firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp;
      await this.firestore.firestore.runTransaction(async (t) => {
        const userID = credential.user!.uid;

        const accountID = this.account.pipeCreateTransaction(
          t,
          userID,
          accountFactory,
        );

        const iUser: IUser = {
          selected_account_id: accountID,
          account_ids_order: [accountID],
          updated_at: now,
        };
        t.set(
          this.firestore
            .collection<User>(UserService.collectionPath)
            .doc<User>(userID).ref,
          userFactory(iUser),
        );
      });
    }

    return credential;
  }

  /**
   *
   * @param userFactory
   * @param accountFactory
   * @param email
   * @param password
   */
  async signIn(
    email: string,
    password: string,
  ): Promise<firebase.auth.UserCredential>;

  /**
   *
   * @param userFactory
   * @param accountFactory
   * @param provider
   */
  async signIn(
    provider: firebase.auth.AuthProvider,
  ): Promise<firebase.auth.UserCredential>;

  async signIn(...args: any[]): Promise<firebase.auth.UserCredential> {
    let credential: firebase.auth.UserCredential;

    if (typeof args[0] === 'string') {
      const [email, password] = args as [string, string];

      credential = await this.auth.auth.signInWithEmailAndPassword(
        email,
        password,
      );
    } else {
      const [provider] = args as [firebase.auth.AuthProvider];
      credential = await this.auth.auth.signInWithPopup(provider);
    }

    if (
      credential.additionalUserInfo &&
      credential.additionalUserInfo.isNewUser
    ) {
      await this.auth.auth.currentUser!.delete();
      throw Error('user not found');
    }

    return credential;
  }

  /**
   *
   */
  async signOut() {
    await this.auth.auth.signOut();
  }

  /**
   *
   * @param userID
   * @param accountFactory
   */
  async createNewAccount(
    userID: string,
    accountFactory: (iAccount: IAccount) => Account,
  ) {
    const now = firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp;
    await this.firestore.firestore.runTransaction(async (t) => {
      const accountID = this.account.pipeCreateTransaction(
        t,
        userID,
        accountFactory,
      );

      t.update(
        this.firestore
          .collection<User>(UserService.collectionPath)
          .doc<User>(userID).ref,
        {
          account_ids_order: firebase.firestore.FieldValue.arrayUnion(
            accountID,
          ),
          updated_at: now,
        },
      );
    });
  }
}
