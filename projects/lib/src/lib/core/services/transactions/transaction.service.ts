import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Transaction } from './transaction';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  static readonly path = 'transactions';

  constructor(private firestore: AngularFirestore) {}

  transactionssFrom$(accountID: string) {
    return this.firestore
      .collection<Transaction>(TransactionService.path, ref =>
        ref.where('from_account_id', '==', accountID)
      )
      .valueChanges({ idField: 'id' });
  }

  transactionsTo$(accountID: string) {
    return this.firestore
      .collection<Transaction>(TransactionService.path, ref =>
        ref.where('to_account_id', '==', accountID)
      )
      .valueChanges({ idField: 'id' });
  }
}
