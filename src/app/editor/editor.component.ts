import { Component, Inject } from '@angular/core';
import { getNestedProperties } from '../helpers';
import { EDITOR_SERVICE } from './editor.service.token';
import { EditorServiceModel } from './models/editor.service.model';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
})
export class EditorComponent {
  constructor(
    @Inject(EDITOR_SERVICE) private editorService: EditorServiceModel
  ) {}

  logTree(): void {
    console.dir(
      getNestedProperties(this.editorService.editorTree, 'items', ['type'])
    );
  }
}
