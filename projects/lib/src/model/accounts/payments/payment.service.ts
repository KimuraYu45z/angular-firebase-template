import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Payment } from './payment.model';
import { AccountService } from '../account.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  static readonly collectionPath = 'payments';

  constructor(private firestore: AngularFirestore) {}

  payments$(accountID: string) {
    return this.firestore
      .collection(AccountService.collectionPath)
      .doc(accountID)
      .collection<Payment>(PaymentService.collectionPath)
      .valueChanges();
  }

  add(accountID: string, data: Payment) {
    return this.firestore
      .collection(AccountService.collectionPath)
      .doc(accountID)
      .collection<Payment>(PaymentService.collectionPath)
      .add(data);
  }
}
