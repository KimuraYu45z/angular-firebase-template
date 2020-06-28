import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingDialogComponent } from './loading-dialog.component';
import { LoadingDialogModule } from '@view/loading-dialog/loading-dialog.module';

@NgModule({
  declarations: [LoadingDialogComponent],
  imports: [CommonModule, LoadingDialogModule],
  exports: [LoadingDialogComponent],
})
export class AFTLoadingDialogModule {}
