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
          key: 'flexGrow',
          fn: (child) =>
            child.type === 'column'
              ? (child.component as EditorColumnComponent).flexGrow
              : null,
        },
        {
          key: 'items',
          fn: (child) =>
            child.type === 'column'
              ? (child.component as EditorColumnComponent).droppedItems.map(
                  (item) => ({
                    label: item.label,
                    value: item.control.value,
                  })
                )
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

    if (!this.editorService.selectedItems.length) {
      previousContainer.data.splice(previousIndex, 1);
      return;
    }

    for (const item of this.editorService.selectedItems) {
      const idx = previousContainer.data.findIndex((i) => i.id === item.id);
      previousContainer.data.splice(idx, 1);
    }

    this.editorService.selectedItems = [];
  }
}
