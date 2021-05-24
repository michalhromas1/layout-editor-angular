import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Inject, Input } from '@angular/core';
import { getNestedProperties } from '../helpers';
import { EditorColumnComponent } from './editor-column/editor-column.component';
import { EDITOR_SERVICE } from './editor.service.token';
import { ContentPickerItemModel } from './models/editor-content-picker.model';
import {
  EditorServiceModel,
  TreeCreatorItemModel,
} from './models/editor.service.model';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent {
  @Input() treeCreator: TreeCreatorItemModel;
  @Input() contentPickerItems: ContentPickerItemModel[] = [];

  constructor(
    @Inject(EDITOR_SERVICE) public editorService: EditorServiceModel
  ) {}

  logTree(): void {
    console.dir(
      getNestedProperties(this.editorService.editorTree, 'children', [
        { key: 'type' },
        {
          key: 'items',
          fn: (child) =>
            child.type === 'column'
              ? (child.component as EditorColumnComponent).droppedItems
              : [],
        },
      ])
    );
  }

  onDropInContentPicker(event: CdkDragDrop<ContentPickerItemModel[]>): void {
    const { container, previousContainer, previousIndex } = event;

    if (container === previousContainer) {
      return;
    }

    previousContainer.data.splice(previousIndex, 1);
  }
}
