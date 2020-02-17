import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import * as firebase from 'firebase/app';
import { map, mergeMap } from 'rxjs/operators';
import { IUser } from './i-user.model';
import { IAccount } from '../accounts/i-account.model';
import { AccountService } from '../accounts/account.service';
import {
  ErrorUnExistingUserSignIn,
  ErrorExistingUserSignUp,
} from '../../types';
import { isNotNull } from '../../operators';

@Injectable({
  providedIn: 'root',
})
export class UserService<Account extends IAccount, User extends IUser> {
  static readonly collectionPath = 'users';

  authorized$: Observable<boolean>;
  userID$: Observable<string | undefined>;
  currentUser$: Observable<User | undefined>;
  selectedAccountID$: Observable<string | undefined>;

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private account: AccountService<Account>,
  ) {
    this.authorized$ = this.auth.user.pipe(map((user) => user !== null));
    this.userID$ = this.auth.user.pipe(map((user) => user?.uid));
    this.currentUser$ = this.userID$.pipe(
      isNotNull(),
      mergeMap((userID) => this.user$(userID)),
    );
    this.selectedAccountID$ = this.currentUser$.pipe(
      map((user) => user?.selected_account_id),
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
   * @param userID
   * @param data
   */
  async update(userID: string, data: Partial<User>) {
    await this.firestore
      .collection<User>(UserService.collectionPath)
      .doc<User>(userID)
      .update(data);
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

    if (credential.additionalUserInfo?.isNewUser) {
      await this.firestore.firestore.runTransaction(async (t) => {
        const userID = credential.user?.uid || '';

        const accountID = this.account.pipeCreateTransaction(
          t,
          userID,
          accountFactory,
        );

        const iUser: IUser = {
          selected_account_id: accountID,
          account_ids_order: [accountID],
        };
        t.set(
          this.firestore
            .collection<User>(UserService.collectionPath)
            .doc<User>(userID).ref,
          userFactory(iUser),
        );
      });
    } else {
      await this.signOut();
      throw new ErrorExistingUserSignUp();
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

    if (credential.additionalUserInfo?.isNewUser) {
      await this.auth.auth.currentUser?.delete();
      throw new ErrorUnExistingUserSignIn();
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
