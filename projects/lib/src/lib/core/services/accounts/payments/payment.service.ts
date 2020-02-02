import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Payment } from './payment';
import { AngularFireFunctions } from '@angular/fire/functions';
import { ChargeData } from '../../../types/charge-data';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  static readonly path = 'payments';
  constructor(
    private firestore: AngularFirestore,
    private functions: AngularFireFunctions
  ) {}

  payments$(accountID: string) {
    return this.firestore
      .collection(PaymentService.path)
      .doc(accountID)
      .collection<Payment>(PaymentService.path)
      .valueChanges();
  }

  chargeFactory<T>(name: string) {
    return async (data: T & { charge_data: ChargeData }) => {
      return await this.functions
        .httpsCallable(name)(data)
        .toPromise();
    };
  }
}
