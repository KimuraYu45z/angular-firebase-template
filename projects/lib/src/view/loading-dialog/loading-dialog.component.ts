import { Component, OnInit, Input } from '@angular/core';

// @dynamic
@Component({
  selector: 'view-loading-dialog',
  templateUrl: './loading-dialog.component.html',
  styleUrls: ['./loading-dialog.component.css'],
})
export class ViewLoadingDialogComponent implements OnInit {
  @Input()
  message: string;

  constructor() {
    this.message = '';
  }

  ngOnInit() {}
}
