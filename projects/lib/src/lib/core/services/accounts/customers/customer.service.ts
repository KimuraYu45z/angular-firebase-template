import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { AccountService } from '../account.service';
import { Customer } from './customer.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  static readonly collectionPath = 'customers';
  static readonly documentID = 'customer';

  constructor(
    private firestore: AngularFirestore,
    private functions: AngularFireFunctions,
  ) {}

  cusstomer$(accountID: string) {
    return this.firestore
      .collection(AccountService.collectionPath)
      .doc(accountID)
      .collection<Customer>(CustomerService.collectionPath)
      .doc<Customer>(CustomerService.documentID)
      .valueChanges();
  }

  async create(
    account_id: string,
    email: string,
    source: string,
    is_test?: boolean,
  ) {
    return await this.functions
      .httpsCallable('payment_customer_create')({
        account_id,
        email,
        source,
        is_test,
      })
      .toPromise();
  }

  async update(
    account_id: string,
    email?: string,
    source?: string,
    is_test?: boolean,
  ) {
    return await this.functions
      .httpsCallable('payment_customer_update')({
        account_id,
        email,
        source,
        is_test,
      })
      .toPromise();
  }
}
