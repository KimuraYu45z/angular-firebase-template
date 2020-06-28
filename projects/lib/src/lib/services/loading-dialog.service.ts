import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, BehaviorSubject } from 'rxjs';
import {
  LoadingDialogComponent,
  LoadingDialogComponentData,
} from '@lib/loading-dialog/loading-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class LoadingDialogService {
  constructor(private dialog: MatDialog) {}

  open(message: string) {
    const message$ = new BehaviorSubject<string>(message);

    const dialogRef = this.dialog.open<
      LoadingDialogComponent,
      LoadingDialogComponentData,
      undefined
    >(LoadingDialogComponent, { data: { message$ }, disableClose: true });

    return {
      next: (value: string) => message$.next(value),
      close: () => dialogRef.close(),
    };
  }
}
