# AngularFirebaseTemplate

## Firestore Rules

```JavaScript
function isInAccount(accountID) {
  return request.auth.uid in get(/databases/$(database)/documents/accounts/$(accountID)).data["user_ids"];
}

function isInAccountAdmin(accountID) {
  return request.auth.uid in get(/databases/$(database)/documents/accounts/$(accountID)).data["admin_user_ids"];
}

match /accounts/{accountID} {
  allow read;
  allow create: if request.auth.uid in request.resource.data["admin_user_ids"];
  allow update: if isInAccountAdmin(accountID);

  match /balances/_ {
    allow read: if isInAccount(accountID);
  }

  match /customers/_ {
    allow read: if isInAccount(accountID);
  }

  match /payments/_ {
    allow read: if isInAccount(accountID);
  }
}

match /transactions/{transactionID} {
  allow read: if isInAccount(resource.data["from_account_id"]) || isInAccount(resource.data["to_account_id"]);
}

match /users/{userID} {
  allow read;
  allow write: if request.auth.uid == userID;
}
```
