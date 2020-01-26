import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Observable } from "rxjs";
import {
  LoadingDialogComponent,
  LoadingDialogComponentData
} from "../../loading-dialog/loading-dialog.component";

@Injectable({
  providedIn: "root"
})
export class LoadingDialogService {
  constructor(private dialog: MatDialog) {}

  open(message$: Observable<string>) {
    return this.dialog.open<
      LoadingDialogComponent,
      LoadingDialogComponentData,
      undefined
    >(LoadingDialogComponent, { data: { message$ }, disableClose: true });
  }
}
