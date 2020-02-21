import { Injectable } from '@angular/core';
import { IPrivate } from './i-private.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { AccountService } from '../account.service';

@Injectable({
  providedIn: 'root',
})
export class PrivateService<Private extends IPrivate> {
  static readonly collectionPath = 'privates';
  static readonly documentID = 'private';

  constructor(private firestore: AngularFirestore) {}

  /**
   *
   * @param accountID
   */
  private$(accountID: string) {
    return this.firestore
      .collection(AccountService.collectionPath)
      .doc(accountID)
      .collection(PrivateService.collectionPath)
      .doc<Private>(PrivateService.documentID)
      .valueChanges()
      .pipe();
  }

  /**
   *
   * @param accountID
   * @param data
   */
  async update(accountID: string, data: Partial<Private>) {
    await this.firestore
      .collection(AccountService.collectionPath)
      .doc(accountID)
      .collection(PrivateService.collectionPath)
      .doc<Private>(PrivateService.documentID)
      .update(data);
  }

  /**
   *
   * @param transaction
   * @param email
   * @param accountFactory
   */
  pipeCreateTransaction(
    transaction: firebase.firestore.Transaction,
    accountID: string,
    email: string,
    privateFactory: (iPrivate: IPrivate) => Private,
  ) {
    const iPrivate: IPrivate = {
      email,
    };
    transaction.set(
      this.firestore
        .collection(AccountService.collectionPath)
        .doc(accountID)
        .collection(PrivateService.collectionPath)
        .doc<Private>(PrivateService.documentID).ref,
      privateFactory(iPrivate),
    );
  }
}
