import { ComponentRef } from '@angular/core';
import { EditorColumnComponent } from '../editor-column/editor-column.component';
import { EditorRowComponent } from '../editor-row/editor-row.component';
import { EditorComponentModel } from './editor.component.model';

export interface EditorServiceModel {
  editorTree: Readonly<TreeItemModel>;
  hoveredColumn: EditorColumnComponent;
  initRootRow(row: EditorRowComponent): void;
  addRow(column: EditorColumnComponent): void;
  addColumn(column: EditorColumnComponent): void;
  removeColumn(column: EditorColumnComponent): void;
}

export interface TreeItemModel {
  id: string;
  children: TreeItemModel[];
  component: EditorComponentModel;
  componentRef: ComponentRef<EditorComponentModel>;
  type: EditorComponentType;
}

export type EditorComponentType = 'row' | 'column';
