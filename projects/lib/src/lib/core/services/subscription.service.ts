import { Injectable } from "@angular/core";
import { AngularFireFunctions } from "@angular/fire/functions";

@Injectable({
  providedIn: "root"
})
export class SubscriptionService {
  static readonly path = "subscriptions";
  constructor(private functions: AngularFireFunctions) {}

  async create(account_id: string, plan_id: string, is_test?: boolean) {
    return await this.functions
      .httpsCallable("payments_subscriptions_create")({
        account_id,
        plan_id,
        is_test
      })
      .toPromise();
  }

  async delete(account_id: string, plan_id: string, is_test?: boolean) {
    return await this.functions
      .httpsCallable("payments_subsciptions_delete")({
        account_id,
        plan_id,
        is_test
      })
      .toPromise();
  }
}
