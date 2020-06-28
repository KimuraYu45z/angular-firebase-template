import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewLoadingDialogComponent } from './loading-dialog.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [ViewLoadingDialogComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  exports: [ViewLoadingDialogComponent],
})
export class ViewLoadingDialogModule {}
