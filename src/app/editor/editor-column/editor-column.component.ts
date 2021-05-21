import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  Input,
  OnInit,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { EDITOR_SERVICE } from '../editor.service.token';
import { EditorComponentModel } from '../models/editor.component.model';
import { EditorServiceModel } from '../models/editor.service.model';

@Component({
  selector: 'app-editor-column',
  templateUrl: './editor-column.component.html',
  styleUrls: ['./editor-column.component.scss'],
})
export class EditorColumnComponent implements EditorComponentModel, OnInit {
  @Input() id: string;
  @Input() parentId: string;
  @Input() isRootComponent: boolean = false;

  @ViewChild('slot', { read: ViewContainerRef, static: true })
  slot: ViewContainerRef;

  private readonly HOVERED_CLASS: string = 'hovered';

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
    @Inject(EDITOR_SERVICE) private editorService: EditorServiceModel,
    @Inject(DOCUMENT) private document: Document,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.nativeElement = this.elementRef.nativeElement;
  }

  addRow(): void {
    this.editorService.addRow(this);
  }

  addColumn(): void {
    this.editorService.addColumn(this);
  }

  deleteColumn(): void {
    this.editorService.removeColumn(this);
  }
}
