import { ComponentRef } from '@angular/core';
import { Observable } from 'rxjs';
import { EditorColumnComponent } from '../editor-column/editor-column.component';
import { EditorRowComponent } from '../editor-row/editor-row.component';
import {
  ContentPickerInputItemModel,
  ContentPickerItemModel,
} from './editor-content-picker.model';
import { EditorComponentModel } from './editor.component.model';

/*
Needed to resolve circular dependency
*/

export interface EditorServiceModel {
  editorTree: Readonly<TreeItemModel>;
  isPreviewMode$: Observable<boolean>;
  hoveredColumn: EditorColumnComponent;
  selectedItems: ContentPickerItemModel[];
  inputItems: ContentPickerInputItemModel[];
  createTree(
    rootRow: EditorRowComponent,
    treeCreator?: TreeCreatorItemModel
  ): void;
  createInputItems(items: ContentPickerItemModel[]): void;
  findInputItem(label: string): ContentPickerInputItemModel;
  addRow(column: EditorColumnComponent): void;
  addColumn(column: EditorColumnComponent): void;
  removeColumn(column: EditorColumnComponent): void;
  togglePreviewMode(): void;
  findInTree(id: string): TreeItemModel;
  generateId(): string;
}

export interface TreeItemModel {
  id: string;
  children: TreeItemModel[];
  component: EditorComponentModel;
  componentRef: ComponentRef<EditorComponentModel>;
  type: EditorComponentType;
}

export interface TreeCreatorItemModel {
  children: TreeCreatorItemModel[];
  items: ContentPickerItemModel[];
  type: EditorComponentType;
  flexGrow?: number;
}

export type EditorComponentType = 'row' | 'column';
