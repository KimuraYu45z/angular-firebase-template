import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AccountService } from '../account.service';
import { Balance } from './balance';

@Injectable({
  providedIn: 'root',
})
export class BalanceService {
  static readonly collectionPath = 'balances';
  static readonly documentID = 'balance';

  constructor(private firestore: AngularFirestore) {}

  balance$(accountID: string) {
    return this.firestore
      .collection(AccountService.collectionPath)
      .doc(accountID)
      .collection<Balance>(BalanceService.collectionPath)
      .doc<Balance>(BalanceService.documentID)
      .valueChanges();
  }
}
