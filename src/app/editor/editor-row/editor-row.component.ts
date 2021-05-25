import {
  Component,
  Inject,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { EDITOR_SERVICE } from '../editor.service.token';
import { EditorComponentModel } from '../models/editor.component.model';
import {
  EditorServiceModel,
  TreeCreatorItemModel,
} from '../models/editor.service.model';

@Component({
  selector: 'app-editor-row',
  templateUrl: './editor-row.component.html',
  styleUrls: ['./editor-row.component.scss'],
})
export class EditorRowComponent implements EditorComponentModel, OnInit {
  @Input() id: string;
  @Input() parentId: string;
  @Input() isRootComponent: boolean = false;
  @Input() treeCreator: TreeCreatorItemModel;

  @ViewChild('slot', { read: ViewContainerRef, static: true })
  slot: ViewContainerRef;

  constructor(
    @Inject(EDITOR_SERVICE) private editorService: EditorServiceModel
  ) {}

  ngOnInit(): void {
    if (this.isRootComponent) {
      this.editorService.createTree(this, this.treeCreator);
    }
  }
}
