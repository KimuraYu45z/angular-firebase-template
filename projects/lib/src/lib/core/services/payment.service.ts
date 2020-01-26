import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireFunctions } from "@angular/fire/functions";
import { IPayment } from "../types/i-payment";

@Injectable({
  providedIn: "root"
})
export class PaymentService<
  Payment extends IPayment
> {
  static readonly path = "payments";
  constructor(
    private firestore: AngularFirestore,
    private functions: AngularFireFunctions
  ) {}

  paymentsFrom$(accountID: string) {
    return this.firestore
      .collection<Payment>(PaymentService.path, ref =>
        ref.where("from_account_id", "==", accountID)
      )
      .valueChanges({ idField: "id" });
  }

  paymentsTo$(accountID: string) {
    return this.firestore
      .collection<Payment>(PaymentService.path, ref =>
        ref.where("to_account_id", "==", accountID)
      )
      .valueChanges({ idField: "id" });
  }

  async charge(
    amount: number,
    currency: string,
    description: string,
    email: string,
    token: string,
    from_account_id: string,
    to_account_id: string,
    commision: number
  ) {
    return await this.functions
      .httpsCallable("payments_charge")({
        amount,
        currency,
        description,
        email,
        token,
        from_account_id,
        to_account_id,
        commision
      })
      .toPromise();
  }
}
