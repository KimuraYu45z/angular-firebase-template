import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireFunctions } from "@angular/fire/functions";

@Injectable({
  providedIn: "root"
})
export class SubscriptionService {
  static readonly path = "subscriptions";
  constructor(
    private firestore: AngularFirestore,
    private functions: AngularFireFunctions
  ) {}
}
