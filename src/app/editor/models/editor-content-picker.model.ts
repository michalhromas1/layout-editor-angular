import { FormControl } from '@angular/forms';

export interface ContentPickerItemModel {
  label: string;
  id?: string;
  selected?: boolean;
  control?: FormControl;
}

export interface ContentPickerInputItemModel {
  control: FormControl;
  label: string;
}
