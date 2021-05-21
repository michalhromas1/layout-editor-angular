import {
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  Type,
  ViewContainerRef,
  ViewRef,
} from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { makeImmutable } from '../helpers';
import { EditorColumnComponent } from './editor-column/editor-column.component';
import { EditorRowComponent } from './editor-row/editor-row.component';
import { EditorComponentModel } from './models/editor.component.model';
import {
  EditorServiceModel,
  TreeItemModel,
} from './models/editor.service.model';

@Injectable()
export class EditorService implements EditorServiceModel {
  private _editorTree: TreeItemModel = {} as TreeItemModel;

  public get editorTree(): Readonly<TreeItemModel> {
    return makeImmutable(this._editorTree);
  }

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  public initRootRow(row: EditorRowComponent): void {
    row.id = this.generateId();
    this.addToTree(row);
    this.createColumn(row, true);
  }

  public addRow(column: EditorColumnComponent): void {
    const hasRows = !!this.findInTree(column.id).items.length;

    if (!hasRows) {
      const row = this.createRow(column);
      this.createColumn(row.instance);
    }

    const row = this.createRow(column);
    this.createColumn(row.instance);
  }

  public addColumn(column: EditorColumnComponent): void {
    const rows = this.findInTree(column.id).items;

    if (!rows.length) {
      const row = this.createRow(column);
      this.createColumn(row.instance);
      this.createColumn(row.instance);
      return;
    }

    if (rows.length === 1) {
      this.createColumn(rows[0].component as EditorRowComponent);
      return;
    }

    this.splitColumnWithRows(column);
  }

  private splitColumnWithRows(column: EditorColumnComponent): void {
    const columnTreeItem = this.findInTree(column.id);
    const rows = [...columnTreeItem.items];
    columnTreeItem.items = [];

    const wrapperRow = this.createRow(column);
    const firstColumn = this.createColumn(wrapperRow.instance);
    this.createColumn(wrapperRow.instance);

    for (const row of rows) {
      this.move(
        row.componentRef.hostView,
        column.slot,
        firstColumn.instance.slot
      );

      row.componentRef.instance.parentId = firstColumn.instance.id;
    }

    this.findInTree(firstColumn.instance.id).items = [...rows];
  }

  public removeColumn(column: EditorColumnComponent): void {
    const row = this.findInTree(column.parentId);
    const columnRef = row.items.find((i) => i.id === column.id).componentRef;

    row.items = row.items.filter((i) => i.id !== column.id);
    this.destroy(columnRef);

    if (row.items.length) {
      return;
    }

    this.destroy(row.componentRef);
    const parentColumn = this.findInTree(row.component.parentId);
    parentColumn.items = parentColumn.items.filter((i) => i.id !== row.id);
  }

  private createColumn(
    parent: EditorRowComponent,
    isRootComponent: boolean = false
  ): ComponentRef<EditorColumnComponent> {
    return this.create<EditorColumnComponent>(
      EditorColumnComponent,
      parent,
      isRootComponent
    );
  }

  private createRow(
    parent: EditorColumnComponent
  ): ComponentRef<EditorRowComponent> {
    return this.create<EditorRowComponent>(EditorRowComponent, parent);
  }

  private create<T extends EditorComponentModel>(
    what: Type<T>,
    parent: EditorComponentModel,
    isRootComponent: boolean = false
  ): ComponentRef<T> {
    const componentFactory =
      this.componentFactoryResolver.resolveComponentFactory<T>(what);
    const component = parent.slot.createComponent(componentFactory);

    component.instance.parentId = parent.id;
    component.instance.id = this.generateId();
    component.instance.isRootComponent = isRootComponent;

    this.addToTree(component.instance, component);
    return component;
  }

  private move(
    what: ViewRef,
    from: ViewContainerRef,
    to: ViewContainerRef
  ): void {
    const index = from.indexOf(what);
    from.detach(index);
    to.insert(what);
  }

  private destroy(what: ComponentRef<EditorComponentModel>): void {
    what.destroy();
  }

  private addToTree(
    component: EditorComponentModel,
    componentRef?: ComponentRef<EditorComponentModel>
  ): void {
    const item: TreeItemModel = {
      id: component.id,
      items: [],
      component,
      componentRef: componentRef || null,
      type: component instanceof EditorRowComponent ? 'row' : 'column',
    };

    if (!componentRef) {
      this._editorTree = item;
      return;
    }

    this.findInTree(component.parentId).items.push(item);
  }

  private findInTree(id: string): TreeItemModel {
    return traverse(this._editorTree);

    function traverse(current: TreeItemModel): TreeItemModel {
      if (current.id === id) {
        return current;
      }

      let found;

      for (const item of current.items) {
        if ((found = traverse(item))) {
          return found;
        }
      }

      return null;
    }
  }

  private generateId(): string {
    return uuidv4();
  }
}