import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  PdkAlertModule,
  PdkDateInputModule,
  PdkDatePickerModule,
  PdkErrorSummaryModule,
  PdkFormModule,
  PdkGridModule,
  PdkRelatedModule,
  PdkTimeInputModule
} from '@cpp/pdk';
import { ReferenceDataModule } from '@cpp/reference-data';
import { SharedModule } from '../shared';
import { CreatePrisonListContainer } from './create-prison-list.container';
import { routes } from './create-prison-list.routes';
import { CreatePrisonListFilterComponent } from './create-prison-list-filter/create-prison-list-filter.component';
import { DownloadPrisonListComponent } from './download-prison-list/download-prison-list.component';

@NgModule({
  imports: [
    PdkFormModule,
    PdkDateInputModule,
    PdkTimeInputModule,
    PdkAlertModule,
    PdkDatePickerModule,
    PdkGridModule,
    ReferenceDataModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    SharedModule,
    CommonModule,
    PdkErrorSummaryModule,
    RouterModule.forChild(routes),
    PdkRelatedModule
  ],
  declarations: [
    CreatePrisonListContainer,
    CreatePrisonListFilterComponent,
    DownloadPrisonListComponent
  ],
  providers: [{ provide: 'Window', useValue: window }]
})
export class CreatePrisonListModule {}
