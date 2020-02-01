import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AccountService } from '../account.service';
import { Balance } from './balance';

@Injectable({
  providedIn: 'root'
})
export class BalanceService {
  static readonly path = 'balances';

  constructor(private firestore: AngularFirestore) {}

  cusstomer$(accountID: string) {
    return this.firestore
      .collection(AccountService.path)
      .doc(accountID)
      .collection<Balance>(BalanceService.path)
      .doc<Balance>('_')
      .valueChanges();
  }
}
