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
import {
  ErrorInvalidEmail,
  ErrorEmailAlreadyInUse,
  ErrorOperationNotAllowed,
  ErrorWeakPassword,
  ErrorAccountExistsWithDifferentCredential,
  ErrorAuthDomainConfigRequired,
  ErrorCancelledPopupRequest,
  ErrorOperationNotSupportedInThisEnvironment,
  ErrorPopupBlocked,
  ErrorPopupClosedByUser,
  ErrorUnauthorizedDomain,
  ErrorExistingUserSignUp,
  ErrorUserDisabled,
  ErrorUserNotFound,
  ErrorWrongPassword,
} from './errors';

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
   * - `ErrorEmailAlreadyInUse`
   * - `ErrorInvalidEmail`
   * - `ErrorOperationNotAllowed`
   * - `ErrorWeakPassword`
   * - `ErrorAccountExistsWithDifferentCredential`
   * - `ErrorAuthDomainConfigRequired`
   * - `ErrorCancelledPopupRequest`
   * - `ErrorOperationNotAllowed`
   * - `ErrorOperationNotSupportedInThisEnvironment`
   * - `ErrorPopupBlocked`
   * - `ErrorPopupClosedByUser`
   * - `ErrorUnauthorizedDomain`
   */
  async signUp(
    userFactory: (iuser: IUser) => User,
    accountFactory: (iAccount: IAccount) => Account,
    privateFactory: (iPrivate: IPrivate) => Private,
    provider:
      | (firebase.auth.AuthProvider & {
          email?: undefined;
          password?: undefined;
        })
      | { email: string; password: string; providerId?: undefined },
  ): Promise<firebase.auth.UserCredential> {
    let credential: firebase.auth.UserCredential;

    if (provider.providerId === undefined) {
      credential = await this.auth.auth
        .createUserWithEmailAndPassword(provider.email, provider.password)
        .catch((error) => {
          switch (error.code) {
            case 'auth/email-already-in-use':
              throw new ErrorEmailAlreadyInUse();
            case 'auth/invalid-email':
              throw new ErrorInvalidEmail();
            case 'auth/operation-not-allowed':
              throw new ErrorOperationNotAllowed();
            case 'auth/weak-password':
              throw new ErrorWeakPassword();
            default:
              throw error;
          }
        });
    } else {
      credential = await this.auth.auth
        .signInWithPopup(provider)
        .catch((error) => {
          switch (error.code) {
            case 'auth/account-exists-with-different-credential':
              throw new ErrorAccountExistsWithDifferentCredential();
            case 'auth/auth-domain-config-required':
              throw new ErrorAuthDomainConfigRequired();
            case 'auth/cancelled-popup-request':
              throw new ErrorCancelledPopupRequest();
            case 'auth/operation-not-allowed':
              throw new ErrorOperationNotAllowed();
            case 'auth/operation-not-supported-in-this-environment':
              throw new ErrorOperationNotSupportedInThisEnvironment();
            case 'auth/popup-blocked':
              throw new ErrorPopupBlocked();
            case 'auth/popup-closed-by-user':
              throw new ErrorPopupClosedByUser();
            case 'auth/unauthorized-domain':
              throw new ErrorUnauthorizedDomain();
            default:
              throw error;
          }
        });
    }

    if (credential.additionalUserInfo?.isNewUser) {
      await this.firestore.firestore.runTransaction(async (t) => {
        const userID = credential.user?.uid || '';

        const accountID = this.account.pipeCreateTransaction(
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
   * - `ErrorInvalidEmail`
   * - `ErrorUserDisabled`
   * - `ErrorUserNotFound`
   * - `ErrorWrongPassword`
   * - `ErrorAccountExistsWithDifferentCredential`
   * - `ErrorAuthDomainConfigRequired`
   * - `ErrorCancelledPopupRequest`
   * - `ErrorOperationNotAllowed`
   * - `ErrorOperationNotSupportedInThisEnvironment`
   * - `ErrorPopupBlocked`
   * - `ErrorPopupClosedByUser`
   * - `ErrorUnauthorizedDomain`
   * @param provider
   */
  async signIn(
    provider:
      | (firebase.auth.AuthProvider & {
          email?: undefined;
          password?: undefined;
        })
      | { email: string; password: string; providerId: undefined },
  ): Promise<firebase.auth.UserCredential> {
    let credential: firebase.auth.UserCredential;

    if (provider.providerId === undefined) {
      credential = await this.auth.auth
        .signInWithEmailAndPassword(provider.email, provider.password)
        .catch((error) => {
          switch (error.code) {
            case 'auth/invalid-email':
              throw new ErrorInvalidEmail();
            case 'auth/user-disabled':
              throw new ErrorUserDisabled();
            case 'auth/user-not-found':
              throw new ErrorUserNotFound();
            case 'auth/wrong-password':
              throw new ErrorWrongPassword();
            default:
              throw Error();
          }
        });
    } else {
      credential = await this.auth.auth
        .signInWithPopup(provider)
        .catch((error) => {
          switch (error.code) {
            case 'auth/account-exists-with-different-credential':
              throw new ErrorAccountExistsWithDifferentCredential();
            case 'auth/auth-domain-config-required':
              throw new ErrorAuthDomainConfigRequired();
            case 'auth/cancelled-popup-request':
              throw new ErrorCancelledPopupRequest();
            case 'auth/operation-not-allowed':
              throw new ErrorOperationNotAllowed();
            case 'auth/operation-not-supported-in-this-environment':
              throw new ErrorOperationNotSupportedInThisEnvironment();
            case 'auth/popup-blocked':
              throw new ErrorPopupBlocked();
            case 'auth/popup-closed-by-user':
              throw new ErrorPopupClosedByUser();
            case 'auth/unauthorized-domain':
              throw new ErrorUnauthorizedDomain();
            default:
              throw Error();
          }
        });
    }

    if (credential.additionalUserInfo?.isNewUser) {
      await this.auth.auth.currentUser?.delete();
      throw new ErrorUserNotFound();
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
