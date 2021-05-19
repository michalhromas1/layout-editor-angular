import { InjectionToken } from '@angular/core';
import { EditorServiceModel } from './models/editor.service.model';

export const EDITOR_SERVICE: InjectionToken<EditorServiceModel> =
  new InjectionToken<EditorServiceModel>('EDITOR_SERVICE');
