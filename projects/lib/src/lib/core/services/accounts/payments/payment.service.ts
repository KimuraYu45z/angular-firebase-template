import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Payment } from './payment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  static readonly path = 'payments';
  constructor(private firestore: AngularFirestore) {}

  payments$(accountID: string) {
    return this.firestore
      .collection(PaymentService.path)
      .doc(accountID)
      .collection<Payment>(PaymentService.path)
      .valueChanges();
  }
}
