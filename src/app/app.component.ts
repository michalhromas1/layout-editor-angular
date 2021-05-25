import { Component } from '@angular/core';
import { ContentPickerItemModel } from './editor/models/editor-content-picker.model';
import { TreeCreatorItemModel } from './editor/models/editor.service.model';

@Component({
  selector: 'app-root',
  template: `<app-editor
    [treeCreator]="treeCreator"
    [contentPickerItems]="contentPickerItems"
  ></app-editor>`,
})
export class AppComponent {
  contentPickerItems: ContentPickerItemModel[] = [
    {
      value: '1',
    },
    {
      value: '2',
    },
    {
      value: '3',
    },
  ];

  treeCreator: TreeCreatorItemModel = {
    type: 'column',
    items: [],
    children: [
      {
        type: 'row',
        items: [],
        children: [
          {
            type: 'column',
            items: [{ value: '2' }],
            children: [],
          },
          {
            type: 'column',
            items: [{ value: '1' }],
            children: [],
          },
        ],
      },
    ],
  };
}
