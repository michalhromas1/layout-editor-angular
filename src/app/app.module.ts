import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { EditorColumnComponent } from './editor/editor-column/editor-column.component';
import { EditorRowComponent } from './editor/editor-row/editor-row.component';
import { EditorComponent } from './editor/editor.component';
import { EditorService } from './editor/editor.service';
import { EDITOR_SERVICE } from './editor/editor.service.token';

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    EditorRowComponent,
    EditorColumnComponent,
  ],
  imports: [BrowserModule],
  providers: [{ provide: EDITOR_SERVICE, useClass: EditorService }],
  bootstrap: [AppComponent],
})
export class AppModule {}
