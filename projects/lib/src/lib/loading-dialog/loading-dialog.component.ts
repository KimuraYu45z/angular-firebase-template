import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Observable, timer } from 'rxjs';

@Component({
  selector: 'lib-loading-dialog',
  templateUrl: './loading-dialog.component.html',
  styleUrls: ['./loading-dialog.component.css'],
})
export class LoadingDialogComponent implements OnInit {
  message$: Observable<string>;
  error: string;
  isCompleted: boolean;
  progress: number;

  constructor(
    private dialogRef: MatDialogRef<LoadingDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    data: { message$: Observable<string> },
  ) {
    this.message$ = data.message$;
    this.error = '';
    this.isCompleted = false;
    this.progress = 0;
  }

  ngOnInit() {
    this.message$.subscribe(
      undefined,
      async error => {
        this.error = error.toString();

        await this.closeDialog();
      },
      async () => {
        this.isCompleted = true;

        await this.closeDialog();
      },
    );
  }

  async closeDialog() {
    await timer(100).toPromise();
    this.progress = 100;

    await timer(1000).toPromise();
    this.dialogRef.close();
  }
}
