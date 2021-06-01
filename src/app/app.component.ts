import { Component } from '@angular/core';
import { ContentPickerItemModel } from './editor/models/editor-content-picker.model';
import { TreeCreatorItemModel } from './editor/models/editor.service.model';

@Component({
  selector: 'app-root',
  template: ` <app-editor
    [treeCreator]="treeCreator"
    [contentPickerItems]="contentPickerItems"
  ></app-editor>`,
})
export class AppComponent {
  contentPickerItems: ContentPickerItemModel[] = [
    {
      label: '1',
    },
    {
      label: '2',
    },
    {
      label: '3',
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
            items: [{ label: '2' }],
            children: [],
            flexGrow: 30,
          },
          {
            type: 'column',
            items: [],
            children: [
              {
                type: 'row',
                items: [],
                children: [
                  {
                    type: 'column',
                    items: [{ label: '2' }],
                    children: [],
                    flexGrow: 30,
                  },
                  {
                    type: 'column',
                    items: [{ label: '1' }, { label: '2' }],
                    children: [],
                    flexGrow: 70,
                  },
                ],
              },
            ],
            flexGrow: 70,
          },
        ],
      },
    ],
  };
}
