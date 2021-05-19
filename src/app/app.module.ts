import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { EditorColumnComponent } from './editor-row/editor-column/editor-column.component';
import { EditorRowComponent } from './editor-row/editor-row.component';

@NgModule({
  declarations: [AppComponent, EditorRowComponent, EditorColumnComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
