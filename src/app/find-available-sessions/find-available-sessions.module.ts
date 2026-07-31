import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  PdkAutosuggestModule,
  PdkCoreModule,
  PdkErrorSummaryModule,
  PdkFormModule
} from '@cpp/pdk';
import { routes } from './find-available-session.routes';
import { SharedModule } from '../shared';
import { CommonModule } from '@angular/common';
import { FindAvailableSessionsContainer } from './containers/find-available-sessions.container';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FindSessionFiltersComponent } from './components/find-sessions-filters/find-sessions-filters.component';
import { ReferenceDataModule } from '@cpp/reference-data';
import { FindSessionSlotsComponent } from './components/find-sessions-slots/find-sessions-slots.component';
import { FindAvailableSessionService } from './services/find-available-sessions.service';
import { StoreModule } from '@ngrx/store';
import { availableSessionsFeatureReducer } from './state';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    FormsModule,
    PdkCoreModule,
    ReactiveFormsModule,
    PdkFormModule,
    PdkErrorSummaryModule,
    PdkAutosuggestModule,
    ReferenceDataModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('availableSessions', availableSessionsFeatureReducer)
  ],
  declarations: [
    FindAvailableSessionsContainer,
    FindSessionFiltersComponent,
    FindSessionSlotsComponent
  ],
  providers: [FindAvailableSessionService, { provide: 'Window', useValue: window }]
})
export class FindAvailableSessionsModule {}
