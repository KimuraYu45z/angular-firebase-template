import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireFunctions } from "@angular/fire/functions";
import { AccountService } from "./account.service";
import { Customer } from "../types/accounts/customers/customer";

@Injectable({
  providedIn: "root"
})
export class CustomerService {
  static readonly path = "customers";
  constructor(
    private firestore: AngularFirestore,
    private functions: AngularFireFunctions
  ) {}

  cusstomer$(accountID: string) {
    return this.firestore
      .collection(AccountService.path)
      .doc(accountID)
      .collection<Customer>(CustomerService.path)
      .doc<Customer>("customer")
      .valueChanges();
  }

  async create(
    account_id: string,
    email: string,
    source: string,
    is_test?: boolean
  ) {
    return await this.functions
      .httpsCallable("payments_customers_create")({
        account_id,
        email,
        source,
        is_test
      })
      .toPromise();
  }

  async update(
    account_id: string,
    email?: string,
    source?: string,
    is_test?: boolean
  ) {
    return await this.functions
      .httpsCallable("payments_customers_update")({
        account_id,
        email,
        source,
        is_test
      })
      .toPromise();
  }
}
