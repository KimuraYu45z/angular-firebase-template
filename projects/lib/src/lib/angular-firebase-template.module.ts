import { NgModule } from '@angular/core';
import { LoadingDialogComponent } from './loading-dialog/loading-dialog.component';
import { MaterialModule } from './material/material.module';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [LoadingDialogComponent],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [LoadingDialogComponent]
})
export class AngularFirebaseTemplateModule { }
