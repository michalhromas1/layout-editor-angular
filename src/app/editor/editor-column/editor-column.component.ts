import {
  CdkDragDrop,
  CdkDropList,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  Input,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { EDITOR_SERVICE } from '../editor.service.token';
import { ContentPickerItemModel } from '../models/editor-content-picker.model';
import {
  ColumnComponentModel,
  EditorComponentModel,
} from '../models/editor.component.model';
import { EditorServiceModel } from '../models/editor.service.model';

interface ResizeDataModel {
  initClientX: number;
  initWidth: number;
  initFlexGrow: number;
  initNeighbourFlexGrow: number;
  neighbour: EditorColumnComponent;
  direction: Direction;
}

type Direction = 'left' | 'right';

@Component({
  selector: 'app-editor-column',
  templateUrl: './editor-column.component.html',
  styleUrls: ['./editor-column.component.scss'],
})
export class EditorColumnComponent
  implements EditorComponentModel, ColumnComponentModel
{
  @Input() id: string;
  @Input() parentId: string;
  @Input() isRootComponent: boolean = false;
  @Input() isInnermost: boolean = false;
  @Input() shouldDisplayLeftResizer: boolean = false;
  @Input() shouldDisplayRightResizer: boolean = false;

  @Input() set flexGrow(value: number) {
    this._flexGrow = value;
    (this.elementRef.nativeElement as HTMLElement).style.flexGrow = `${value}`;
  }

  get flexGrow(): number {
    return this._flexGrow;
  }

  isHovered: boolean = false;
  droppedItems: ContentPickerItemModel[] = [];

  private _flexGrow: number;
  private resizeData: ResizeDataModel;
  private readonly CONTENT_PICKER_TAG_NAME = 'app-editor-content-picker';
  private readonly CONTENT_ITEM_MIN_WIDTH = 126;

  @ViewChild('slot', { read: ViewContainerRef, static: true })
  slot: ViewContainerRef;

  @HostListener('mouseover', ['$event']) onMouseEnter(e: MouseEvent): void {
    e.stopPropagation();
    this.toggleIsHovered(true);
  }

  @HostListener('mouseleave') onMouseLeave(): void {
    this.toggleIsHovered(false);
  }

  @HostListener('document:mousedown', ['$event']) onDocumentClick(
    e: MouseEvent
  ): void {
    const didClickOnDroppedItem = (e.target as HTMLElement).classList.contains(
      'dropped-item'
    );

    if (didClickOnDroppedItem) {
      return;
    }

    this.resetSelectedItems();
  }

  @HostListener('window:selectstart', ['$event']) onWindowSelectStart(
    e: Event
  ) {
    if (this.resizeData) {
      e.preventDefault();
    }
  }

  @HostListener('window:mousemove', ['$event'])
  whileResizingColumn({ clientX }): void {
    if (!this.resizeData) {
      return;
    }

    const columnEl: HTMLElement = this.elementRef.nativeElement;
    const neighbourEl: HTMLElement =
      this.resizeData.neighbour.elementRef.nativeElement;

    const {
      initClientX,
      initWidth,
      initFlexGrow,
      initNeighbourFlexGrow,
      neighbour,
      direction,
    } = this.resizeData;

    const newWidth = initWidth + clientX - initClientX;
    let growth = (initFlexGrow / initWidth) * (newWidth - initWidth);
    growth *= direction === 'left' ? -1 : 1;

    const columnTargetFlexGrow = initFlexGrow + growth;
    const neighbourTargetFlexGrow = initNeighbourFlexGrow - growth;

    const hasColumnReachedMinWidth =
      growth < 0 &&
      columnEl.getBoundingClientRect().width <= this.CONTENT_ITEM_MIN_WIDTH;
    const hasNeighbourReachedMinWidth =
      growth > 0 &&
      neighbourEl.getBoundingClientRect().width <= this.CONTENT_ITEM_MIN_WIDTH;

    const hasColumnReachedMinFlexGrow = columnTargetFlexGrow <= 1;
    const hasNeighbourReachedMinFlexGrow = neighbourTargetFlexGrow <= 1;

    if (
      hasColumnReachedMinWidth ||
      hasNeighbourReachedMinWidth ||
      hasColumnReachedMinFlexGrow ||
      hasNeighbourReachedMinFlexGrow
    ) {
      return;
    }

    this.flexGrow = columnTargetFlexGrow;
    neighbour.flexGrow = neighbourTargetFlexGrow;
  }

  @HostListener('window:mouseleave', ['$event'])
  @HostListener('window:mouseup', ['$event'])
  @HostListener('window:blur', ['$event'])
  stopResizingColumn(): void {
    if (!this.resizeData) {
      return;
    }

    this.resizeData = null;
  }

  constructor(
    @Inject(EDITOR_SERVICE) public editorService: EditorServiceModel,
    public elementRef: ElementRef
  ) {}

  private toggleIsHovered(is: boolean): void {
    const hoveredColumn = this.editorService.hoveredColumn;

    if (is && hoveredColumn) {
      hoveredColumn.isHovered = false;
    }

    this.isHovered = is;
    this.editorService.hoveredColumn = is ? this : null;
  }

  addRow(): void {
    this.editorService.addRow(this);
    this.resetState();
  }

  addColumn(): void {
    this.editorService.addColumn(this);
    this.resetState();
  }

  private resetState(): void {
    this.isInnermost = false;
    this.droppedItems = [];
  }

  removeColumn(): void {
    this.editorService.removeColumn(this);
  }

  onItemDrop(event: CdkDragDrop<ContentPickerItemModel[]>): void {
    const {
      previousIndex: sourceIndex,
      currentIndex: targetIndex,
      previousContainer: source,
    } = event;

    const sourceElement = source.element.nativeElement;
    const isFromContentPicker =
      sourceElement.tagName.toLowerCase() === this.CONTENT_PICKER_TAG_NAME;

    if (isFromContentPicker) {
      const item = {
        ...source.data[sourceIndex],
        id: this.editorService.generateId(),
        selected: false,
      };

      this.droppedItems = [
        ...this.droppedItems.slice(0, targetIndex),
        item,
        ...this.droppedItems.slice(targetIndex),
      ];

      return;
    }

    const selectedItems = source.data.filter((item) => item.selected);

    if (!selectedItems.length) {
      this.moveItem(source, sourceIndex, targetIndex);
      return;
    }

    selectedItems.forEach((item, idx) => {
      this.moveItem(
        source,
        source.data.findIndex((i) => i.id === item.id),
        targetIndex + idx
      );
      this.resetSelectedItems();
    });
  }

  private moveItem(
    from: CdkDropList<ContentPickerItemModel[]>,
    fromIndex: number,
    toIndex: number
  ): void {
    transferArrayItem(from.data, this.droppedItems, fromIndex, toIndex);
  }

  onClickDroppedItem(e: MouseEvent, item: ContentPickerItemModel): void {
    const isModifierKeyPressed = e.metaKey || e.ctrlKey;

    if (
      !this.droppedItems.some((item) => item.selected) ||
      !isModifierKeyPressed
    ) {
      this.resetSelectedItems();
    }

    if (!isModifierKeyPressed) {
      return;
    }

    item.selected = !item.selected;
    this.editorService.selectedItems.push(item);
  }

  private resetSelectedItems(): void {
    for (const item of this.editorService.selectedItems) {
      item.selected = false;
    }

    this.editorService.selectedItems = [];
  }

  startResizingColumn(e: MouseEvent, direction: Direction): void {
    e.stopPropagation();

    const columnElement: HTMLElement = this.elementRef.nativeElement;
    const neighbour = this.getNeighbour(direction);

    this.resizeData = {
      initClientX: e.clientX,
      initWidth: columnElement.getBoundingClientRect().width,
      initFlexGrow: this.flexGrow,
      initNeighbourFlexGrow: neighbour.flexGrow,
      neighbour,
      direction,
    };
  }

  private getNeighbour(direction: Direction): EditorColumnComponent {
    const parentChildren = this.editorService.findInTree(
      this.parentId
    ).children;
    const columnIndex = parentChildren.findIndex((s) => s.id === this.id);

    return parentChildren[
      direction === 'left' ? columnIndex - 1 : columnIndex + 1
    ].component as EditorColumnComponent;
  }
}
