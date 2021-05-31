import { ViewContainerRef } from '@angular/core';

export interface EditorComponentModel {
  id: string;
  parentId: string;
  isRootComponent: boolean;
  slot: ViewContainerRef;
}

export interface ColumnComponentModel {
  shouldDisplayLeftResizer: boolean;
  shouldDisplayRightResizer: boolean;
  isInnermost: boolean;
  flexGrow: number;
}
