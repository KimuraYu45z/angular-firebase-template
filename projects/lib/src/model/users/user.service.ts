import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import * as firebase from 'firebase/app';
import { map, mergeMap } from 'rxjs/operators';
import { IUser } from './i-user.model';
import { IAccount } from '../accounts/i-account.model';
import { AccountService } from '../accounts/account.service';
import { isNotNull } from '../../lib/operators';
import { PrivateService } from '../accounts/privates/private.service';
import { IPrivate } from '../accounts/privates/i-private.model';

@Injectable({
  providedIn: 'root',
})
export class UserService<
  User extends IUser,
  Account extends IAccount,
  Private extends IPrivate
> {
  static readonly collectionPath = 'users';

  authorized$: Observable<boolean>;
  userID$: Observable<string | undefined>;
  currentUser$: Observable<User | undefined>;
  selectedAccountID$: Observable<string | undefined>;

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private account: AccountService<Account>,
    private accountPrivate: PrivateService<Private>,
  ) {
    this.authorized$ = this.auth.user.pipe(map((user) => user !== null));
    this.userID$ = this.auth.user.pipe(map((user) => user?.uid));
    this.currentUser$ = this.userID$.pipe(
      isNotNull(),
      mergeMap((userID) => this.get$(userID)),
    );
    this.selectedAccountID$ = this.currentUser$.pipe(
      map((user) => user?.selected_account_id),
    );
  }

  get(userID: string) {
    return this.firestore
      .collection<User>(UserService.collectionPath)
      .doc<User>(userID)
      .get()
      .pipe(map((doc) => doc.data() as User | undefined));
  }

  /**
   *
   * @param userID
   */
  get$(userID: string) {
    return this.firestore
      .collection<User>(UserService.collectionPath)
      .doc<User>(userID)
      .valueChanges();
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
   * `error.code`
   * - `auth/email-already-in-use`
   * - `auth/invalid-email`
   * - `auth/operation-not-allowed`
   * - `auth/weak-password`
   * - `auth/account-exists-with-different-credential`
   * - `auth/auth-domain-config-required`
   * - `auth/cancelled-popup-request`
   * - `auth/operation-not-allowed`
   * - `auth/operation-not-supported-in-this-environment`
   * - `auth/popup-blocked`
   * - `auth/popup-closed-by-user`
   * - `auth/unauthorized-domain`
   * - `aft/existing-user-signup`
   */
  async signUp(
    userFactory: (iuser: IUser) => Promise<User>,
    accountFactory: (iAccount: IAccount) => Promise<Account>,
    privateFactory: (iPrivate: IPrivate) => Promise<Private>,
    provider:
      | (firebase.auth.AuthProvider & {
          email?: undefined;
          password?: undefined;
        })
      | { email: string; password: string; providerId?: undefined },
  ): Promise<firebase.auth.UserCredential> {
    let credential: firebase.auth.UserCredential;

    if (provider.providerId === undefined) {
      credential = await this.auth.createUserWithEmailAndPassword(
        provider.email,
        provider.password,
      );
    } else {
      credential = await this.auth.signInWithPopup(provider);
    }

    if (credential.additionalUserInfo?.isNewUser) {
      await this.firestore.firestore.runTransaction(async (t) => {
        const userID = credential.user?.uid || '';

        const accountID = await this.account.pipeCreateTransaction(
          t,
          userID,
          accountFactory,
        );

        this.accountPrivate.pipeCreateTransaction(
          t,
          accountID,
          credential.user?.email || '',
          privateFactory,
        );

        const iUser: IUser = {
          selected_account_id: accountID,
          account_ids_order: [accountID],
        };
        t.set(
          this.firestore
            .collection<User>(UserService.collectionPath)
            .doc<User>(userID).ref,
          await userFactory(iUser),
        );
      });
    } else {
      await this.signOut();
      throw { code: 'aft/existing-user-signup' };
    }

    return credential;
  }

  /**
   * `error.code`
   * - `auth/invalid-email`
   * - `auth/user-disabled`
   * - `auth/user-not-found`
   * - `auth/wrong-password`
   * - `auth/account-exists-with-different-credential`
   * - `auth/auth-domain-config-required`
   * - `auth/cancelled-popup-request`
   * - `auth/operation-not-allowed`
   * - `auth/operation-not-supported-in-this-environment`
   * - `auth/popup-blocked`
   * - `auth/popup-closed-by-user`
   * - `auth/unauthorized-domain`
   * - `aft/user-not-found`
   * @param provider
   */
  async signIn(
    provider:
      | (firebase.auth.AuthProvider & {
          email?: undefined;
          password?: undefined;
        })
      | { email: string; password: string; providerId?: undefined },
  ): Promise<firebase.auth.UserCredential> {
    let credential: firebase.auth.UserCredential;

    if (provider.providerId === undefined) {
      credential = await this.auth.signInWithEmailAndPassword(
        provider.email,
        provider.password,
      );
    } else {
      credential = await this.auth.signInWithPopup(provider);
    }

    if (credential.additionalUserInfo?.isNewUser) {
      await this.auth.currentUser.then((user) => user?.delete());
      throw { code: 'aft/user-not-found' };
    }

    return credential;
  }

  /**
   *
   */
  async signOut() {
    await this.auth.signOut();
  }

  /**
   *
   * @param userID
   * @param accountFactory
   */
  async createNewAccount(
    userID: string,
    accountFactory: (iAccount: IAccount) => Promise<Account>,
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
