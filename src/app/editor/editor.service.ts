import {
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  Type,
  ViewContainerRef,
  ViewRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { makeImmutable } from '../helpers';
import { EditorColumnComponent } from './editor-column/editor-column.component';
import { EditorRowComponent } from './editor-row/editor-row.component';
import {
  ContentPickerInputItemModel,
  ContentPickerItemModel,
} from './models/editor-content-picker.model';
import {
  ColumnComponentModel,
  EditorComponentModel,
} from './models/editor.component.model';
import {
  EditorServiceModel,
  TreeCreatorItemModel,
  TreeItemModel,
} from './models/editor.service.model';

@Injectable()
export class EditorService implements EditorServiceModel {
  hoveredColumn: EditorColumnComponent;
  selectedItems: ContentPickerItemModel[] = [];
  inputItems: ContentPickerInputItemModel[] = [];

  get editorTree(): Readonly<TreeItemModel> {
    return makeImmutable({ ...this._editorTree.children[0] });
  }

  private _editorTree: TreeItemModel = {} as TreeItemModel;

  private _isPreviewMode$ = new BehaviorSubject<boolean>(false);
  isPreviewMode$ = this._isPreviewMode$.asObservable();

  private readonly GRID_SIZE: number = 100;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  createTree(
    rootRow: EditorRowComponent,
    treeCreator?: TreeCreatorItemModel
  ): void {
    this.initRootRow(rootRow);
    const rootColumn = this.createColumn(rootRow, true, {
      flexGrow: this.GRID_SIZE,
      isInnermost: !treeCreator?.children?.length,
      shouldDisplayLeftResizer: false,
      shouldDisplayRightResizer: false,
    });

    if (!treeCreator) {
      return;
    }

    this.createNestedTreeItem(rootColumn.instance, treeCreator);
  }

  private initRootRow(row: EditorRowComponent): void {
    row.id = this.generateId();
    this.addToTree(row);
  }

  private createNestedTreeItem(
    parent: EditorComponentModel,
    parentTreeCreatorItem: TreeCreatorItemModel
  ): void {
    if (parentTreeCreatorItem.type === 'column') {
      this.createInputItems(parentTreeCreatorItem.items);

      (parent as EditorColumnComponent).droppedItems =
        parentTreeCreatorItem.items.map((i) => ({
          ...i,
          id: this.generateId(),
          selected: false,
          control: this.findInputItem(i.label).control,
        })) || [];
    }

    parentTreeCreatorItem.children.forEach((child, idx) => {
      const created =
        child.type === 'row'
          ? this.createRow(parent as EditorColumnComponent)
          : this.createColumn(parent as EditorRowComponent, false, {
              flexGrow:
                child.flexGrow ||
                this.GRID_SIZE / parentTreeCreatorItem.children.length,
              isInnermost: !child.children?.length,
              shouldDisplayLeftResizer: idx !== 0,
              shouldDisplayRightResizer:
                idx !== parentTreeCreatorItem.children.length - 1,
            });

      this.createNestedTreeItem(created.instance, child);
    });
  }

  createInputItems(items: ContentPickerItemModel[]): void {
    const uniqueItems = items.filter((item) => !this.findInputItem(item.label));

    this.inputItems = [
      ...this.inputItems,
      ...uniqueItems.map((item) => {
        const existingItem = this.findInputItem(item.label);

        return existingItem
          ? existingItem
          : {
              label: item.label,
              control: new FormControl(item.label),
            };
      }),
    ];
  }

  findInputItem(label: string): ContentPickerInputItemModel {
    return this.inputItems.find((item) => item.label === label);
  }

  addRow(column: EditorColumnComponent): void {
    const hasRows = !!this.findInTree(column.id).children.length;

    if (!hasRows) {
      const row = this.createRow(column);
      const newColumn = this.createColumn(row.instance, false, {
        flexGrow: this.GRID_SIZE,
        isInnermost: true,
        shouldDisplayLeftResizer: false,
        shouldDisplayRightResizer: false,
      });
      newColumn.instance.droppedItems = column.droppedItems;
    }

    const row = this.createRow(column);
    this.createColumn(row.instance, false, {
      flexGrow: this.GRID_SIZE,
      isInnermost: true,
      shouldDisplayLeftResizer: false,
      shouldDisplayRightResizer: false,
    });
  }

  addColumn(column: EditorColumnComponent): void {
    const rows = this.findInTree(column.id).children;

    if (!rows.length) {
      const row = this.createRow(column);

      const firstColumn = this.createColumn(row.instance, false, {
        flexGrow: this.GRID_SIZE / 2,
        isInnermost: true,
        shouldDisplayLeftResizer: false,
        shouldDisplayRightResizer: true,
      });
      firstColumn.instance.droppedItems = column.droppedItems;

      this.createColumn(row.instance, false, {
        flexGrow: this.GRID_SIZE / 2,
        isInnermost: true,
        shouldDisplayLeftResizer: true,
        shouldDisplayRightResizer: false,
      });
      return;
    }

    if (rows.length === 1) {
      const firstRow = rows[0];

      if (firstRow.children.length === this.GRID_SIZE) {
        return;
      }

      const targetChildrenCount = firstRow.children.length + 1;
      const targetFlexGrow = this.GRID_SIZE / targetChildrenCount;

      let isChildLessThanMininum = false;

      for (const child of firstRow.children) {
        const childComponent = child.component as EditorColumnComponent;
        const targetChildFlexGrow =
          ((this.GRID_SIZE - targetFlexGrow) / this.GRID_SIZE) *
          childComponent.flexGrow;

        if ((isChildLessThanMininum = targetChildFlexGrow < 1)) {
          break;
        }

        childComponent.flexGrow = targetChildFlexGrow;
      }

      if (isChildLessThanMininum) {
        for (const child of firstRow.children) {
          const childComponent = child.component as EditorColumnComponent;
          childComponent.flexGrow = 1;
        }
      }

      (
        firstRow.children[firstRow.children.length - 1]
          .component as EditorColumnComponent
      ).shouldDisplayRightResizer = true;

      this.createColumn(firstRow.component as EditorRowComponent, false, {
        flexGrow: targetFlexGrow,
        isInnermost: true,
        shouldDisplayLeftResizer: true,
        shouldDisplayRightResizer: false,
      });

      return;
    }

    this.splitColumnWithRows(column);
  }

  private splitColumnWithRows(column: EditorColumnComponent): void {
    const columnTreeItem = this.findInTree(column.id);
    const rows = [...columnTreeItem.children];
    columnTreeItem.children = [];

    const wrapperRow = this.createRow(column);
    const firstColumn = this.createColumn(wrapperRow.instance, false, {
      flexGrow: this.GRID_SIZE / 2,
      isInnermost: true,
      shouldDisplayLeftResizer: false,
      shouldDisplayRightResizer: true,
    });
    firstColumn.instance.isInnermost = false;
    this.createColumn(wrapperRow.instance, false, {
      flexGrow: this.GRID_SIZE / 2,
      isInnermost: true,
      shouldDisplayLeftResizer: true,
      shouldDisplayRightResizer: false,
    });

    for (const row of rows) {
      this.move(
        row.componentRef.hostView,
        column.slot,
        firstColumn.instance.slot
      );

      row.componentRef.instance.parentId = firstColumn.instance.id;
    }

    this.findInTree(firstColumn.instance.id).children = [...rows];
  }

  removeColumn(column: EditorColumnComponent): void {
    const row = this.findInTree(column.parentId);
    const columnRef = row.children.find((i) => i.id === column.id).componentRef;

    row.children = row.children.filter((i) => i.id !== column.id);

    const destroyedFlexGrow = (columnRef.instance as EditorColumnComponent)
      .flexGrow;

    this.destroy(columnRef);

    if (row.children.length) {
      row.children.forEach((child, idx) => {
        const childComponent = child.component as EditorColumnComponent;

        childComponent.shouldDisplayLeftResizer = idx !== 0;
        childComponent.shouldDisplayRightResizer =
          idx !== row.children.length - 1;

        childComponent.flexGrow = Math.round(
          childComponent.flexGrow + destroyedFlexGrow / row.children.length
        );
      });

      return;
    }

    this.destroy(row.componentRef);
    const parentColumn = this.findInTree(row.component.parentId);
    parentColumn.children = parentColumn.children.filter(
      (i) => i.id !== row.id
    );

    if (parentColumn.children.length) {
      return;
    }

    (parentColumn.componentRef.instance as EditorColumnComponent).isInnermost =
      true;
  }

  togglePreviewMode(): void {
    this._isPreviewMode$.next(!this._isPreviewMode$.getValue());
  }

  private createColumn(
    parent: EditorRowComponent,
    isRootComponent: boolean,
    config: ColumnComponentModel
  ): ComponentRef<EditorColumnComponent> {
    const column = this.create<EditorColumnComponent>(
      EditorColumnComponent,
      parent,
      isRootComponent
    );

    const instance = column.instance;

    instance.isInnermost = config.isInnermost;
    instance.shouldDisplayLeftResizer = config.shouldDisplayLeftResizer;
    instance.shouldDisplayRightResizer = config.shouldDisplayRightResizer;
    instance.flexGrow = config.flexGrow >= 1 ? config.flexGrow : 1;

    return column;
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
      children: [],
      component,
      componentRef: componentRef || null,
      type: component instanceof EditorRowComponent ? 'row' : 'column',
    };

    if (!componentRef) {
      this._editorTree = item;
      return;
    }

    this.findInTree(component.parentId).children.push(item);
  }

  findInTree(id: string): TreeItemModel {
    return traverse(this._editorTree);

    function traverse(current: TreeItemModel): TreeItemModel {
      if (current.id === id) {
        return current;
      }

      let found;

      for (const item of current.children) {
        if ((found = traverse(item))) {
          return found;
        }
      }

      return null;
    }
  }

  generateId(): string {
    return uuidv4();
  }
}
