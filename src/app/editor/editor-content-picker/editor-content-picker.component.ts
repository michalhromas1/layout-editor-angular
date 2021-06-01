import {
  Component,
  Inject,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { EDITOR_SERVICE } from '../editor.service.token';
import { ContentPickerItemModel } from '../models/editor-content-picker.model';
import { EditorServiceModel } from '../models/editor.service.model';

@Component({
  selector: 'app-editor-content-picker',
  templateUrl: './editor-content-picker.component.html',
  styleUrls: ['./editor-content-picker.component.scss'],
})
export class EditorContentPickerComponent implements OnChanges {
  @Input() items: ContentPickerItemModel[] = [];

  constructor(
    @Inject(EDITOR_SERVICE) private editorService: EditorServiceModel
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['items']) {
      return;
    }

    this.editorService.createInputItems(this.items);
  }
}
