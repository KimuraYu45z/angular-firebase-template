import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  static readonly path = "customers";
  constructor(
    private firestore: AngularFirestore,
    private functions: AngularFireFunctions
  ) {}
}
