import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import {
  Component,
  HostListener,
  Inject,
  Input,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { EDITOR_SERVICE } from '../editor.service.token';
import { ContentPickerItemModel } from '../models/editor-content-picker.model';
import { EditorComponentModel } from '../models/editor.component.model';
import { EditorServiceModel } from '../models/editor.service.model';

@Component({
  selector: 'app-editor-column',
  templateUrl: './editor-column.component.html',
  styleUrls: ['./editor-column.component.scss'],
})
export class EditorColumnComponent implements EditorComponentModel {
  @Input() id: string;
  @Input() parentId: string;
  @Input() isRootComponent: boolean = false;
  @Input() isInnermost: boolean = false;

  isHovered: boolean = false;
  droppedItems: ContentPickerItemModel[] = [];

  private readonly CONTENT_PICKER_TAG_NAME = 'app-editor-content-picker';

  @ViewChild('slot', { read: ViewContainerRef, static: true })
  slot: ViewContainerRef;

  @HostListener('mouseover', ['$event']) onMouseEnter(e: MouseEvent) {
    e.stopPropagation();
    this.toggleIsHovered(true);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.toggleIsHovered(false);
  }

  constructor(
    @Inject(EDITOR_SERVICE) public editorService: EditorServiceModel
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
      const item = source.data[sourceIndex];

      this.droppedItems = [
        ...this.droppedItems.slice(0, targetIndex),
        item,
        ...this.droppedItems.slice(targetIndex),
      ];

      return;
    }

    transferArrayItem(source.data, this.droppedItems, sourceIndex, targetIndex);
  }
}
