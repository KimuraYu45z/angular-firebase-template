import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Transaction } from './transaction.model';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  static readonly collectionPath = 'transactions';

  constructor(private firestore: AngularFirestore) {}

  transactionsFrom$(accountID: string) {
    return this.firestore
      .collection<Transaction>(TransactionService.collectionPath, (ref) =>
        ref.where('from_account_id', '==', accountID),
      )
      .valueChanges({ idField: 'id' });
  }

  transactionsTo$(accountID: string) {
    return this.firestore
      .collection<Transaction>(TransactionService.collectionPath, (ref) =>
        ref.where('to_account_id', '==', accountID),
      )
      .valueChanges({ idField: 'id' });
  }
}
