import { DOCUMENT } from '@angular/common';
import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { EditorRowComponent } from '../editor-row.component';

@Component({
  selector: 'app-editor-column',
  templateUrl: './editor-column.component.html',
  styleUrls: ['./editor-column.component.scss'],
})
export class EditorColumnComponent implements OnInit {
  @ViewChild('rowSlot', { read: ViewContainerRef, static: true })
  rowSlot: ViewContainerRef;

  private readonly HOVERED_CLASS: string = 'hovered';

  private rows: ComponentRef<EditorRowComponent>[] = [];
  private nativeElement: Element;

  @HostListener('mouseover', ['$event']) onMouseEnter(e: MouseEvent) {
    e.stopPropagation();

    const hoveredColumn = this.document.querySelector(`.${this.HOVERED_CLASS}`);

    if (hoveredColumn) {
      this.renderer.removeClass(hoveredColumn, this.HOVERED_CLASS);
    }

    this.renderer.addClass(this.nativeElement, this.HOVERED_CLASS);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.removeClass(this.nativeElement, this.HOVERED_CLASS);
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private componentFactoryResolver: ComponentFactoryResolver,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.nativeElement = this.elementRef.nativeElement;
  }

  addRow(): void {
    const hasRows = !!this.rows.length;

    if (!hasRows) {
      this.createRow();
    }

    this.createRow();
  }

  addColumn(): void {
    if (!this.rows.length) {
      const row = this.createRow();
      this.createColumn(row.instance.columnSlot);
      return;
    }

    if (this.rows.length === 1) {
      this.createColumn(this.rows[0].instance.columnSlot);
      return;
    }

    this.splitNonEmptyInHalf();
  }

  private splitNonEmptyInHalf(): void {
    const rows = [...this.rows];
    this.rows = [];

    const wrapperRow = this.createRow(true);
    const firstColumn = this.createColumn(wrapperRow.instance.columnSlot);
    this.createColumn(wrapperRow.instance.columnSlot);

    for (const row of rows) {
      const index = this.rowSlot.indexOf(row.hostView);
      this.rowSlot.detach(index);
      firstColumn.instance.rowSlot.insert(row.hostView);
    }
  }

  private createRow(
    disableFirstColumn: boolean = false
  ): ComponentRef<EditorRowComponent> {
    const componentFactory =
      this.componentFactoryResolver.resolveComponentFactory(EditorRowComponent);
    const row = this.rowSlot.createComponent(componentFactory);
    row.instance.disableFirstColumn = disableFirstColumn;
    this.rows.push(row);
    return row;
  }

  private createColumn(
    rowViewContainerRef: ViewContainerRef
  ): ComponentRef<EditorColumnComponent> {
    const componentFactory =
      this.componentFactoryResolver.resolveComponentFactory(
        EditorColumnComponent
      );
    return rowViewContainerRef.createComponent(componentFactory);
  }
}
