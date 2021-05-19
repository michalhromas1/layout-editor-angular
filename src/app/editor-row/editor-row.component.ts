import { Component, Input, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-editor-row',
  templateUrl: './editor-row.component.html',
  styleUrls: ['./editor-row.component.scss'],
})
export class EditorRowComponent {
  @Input() disableFirstColumn: boolean = false;

  @ViewChild('columnSlot', { read: ViewContainerRef, static: true })
  columnSlot: ViewContainerRef;
}
