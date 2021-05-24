import { Component, Input, OnInit } from '@angular/core';
import { ContentPickerItemModel } from '../models/editor-content-picker.model';

@Component({
  selector: 'app-editor-content-picker',
  templateUrl: './editor-content-picker.component.html',
  styleUrls: ['./editor-content-picker.component.scss'],
})
export class EditorContentPickerComponent implements OnInit {
  @Input() items: ContentPickerItemModel[] = [];

  constructor() {}

  ngOnInit(): void {}
}
