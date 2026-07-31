import { Component, ViewEncapsulation, input, output } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { PdkForm, PdkSelectComponent } from '@cpp/pdk';

@Component({
  selector: 'page-size-selector',
  imports: [FormsModule, PdkForm, PdkSelectComponent],
  template: `
    <pdk-form-field label="Page size" labelType="small">
      <pdk-select
        [ngModel]="pageSize()"
        [ngModelOptions]="{ standalone: true }"
        [options]="pageSizeOptions"
        [inputWidth]="4"
        (ngModelChange)="onPageSizeChange($event)"
      >
      </pdk-select>
    </pdk-form-field>
  `,
  styles: [
    `
      page-size-selector select {
        min-width: 0px !important;
      }
    `
  ],
  encapsulation: ViewEncapsulation.None
})
export class PageSizeSelectorComponent {
  readonly pageSize = input<number>(40);
  readonly pageSizeChange = output<number>();

  readonly pageSizeOptions = [
    { label: '40', value: 40 },
    { label: '60', value: 60 },
    { label: '80', value: 80 },
    { label: '100', value: 100 },
    { label: '150', value: 150 },
    { label: '200', value: 200 }
  ];

  onPageSizeChange(newPageSize: number): void {
    this.pageSizeChange.emit(newPageSize);
  }
}
