import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingDialogComponent } from './loading-dialog.component';
import { ViewLoadingDialogModule } from '../../view/loading-dialog/loading-dialog.module';

@NgModule({
  declarations: [LoadingDialogComponent],
  imports: [CommonModule, ViewLoadingDialogModule],
  exports: [LoadingDialogComponent],
})
export class LoadingDialogModule {}
