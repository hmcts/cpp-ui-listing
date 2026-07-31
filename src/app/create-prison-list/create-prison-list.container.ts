import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  AppState,
  CourtCentre,
  CreateListFilterOptions,
  getCourtCentres,
  getIsPrisonAdminOrHmctsUser,
  hasAllocatedHearingsByDateRange,
  Hearing,
  searchAllocatedHearingsForPrisonListAction
} from '../core';

import {
  ValidationError,
  PdkErrorSummaryComponent,
  PdkMarginDirective,
  PdkPaddingDirective,
  PdkTypographyDirective,
  PdkGridComponent,
  PdkGridDirective,
  PdkWarningTextComponent,
  PdkVisuallyHiddenDirective
} from '@cpp/pdk';
import { DEFAULT_PAGINATION_ITEMS_PER_PAGE } from '../core/model/hearing';
import { PublicHoliday, getPublicHolidays } from '@cpp/reference-data';
import { AsyncPipe } from '@angular/common';
import { CreatePrisonListFilterComponent } from './create-prison-list-filter/create-prison-list-filter.component';
import { DownloadPrisonListComponent } from './download-prison-list/download-prison-list.component';

@Component({
  selector: 'create-prison-list',
  templateUrl: './create-prison-list.html',
  styleUrls: ['./create-prison-list.container.scss'],
  imports: [
    PdkErrorSummaryComponent,
    PdkMarginDirective,
    PdkPaddingDirective,
    PdkTypographyDirective,
    CreatePrisonListFilterComponent,
    PdkGridComponent,
    PdkGridDirective,
    PdkWarningTextComponent,
    PdkVisuallyHiddenDirective,
    DownloadPrisonListComponent,
    AsyncPipe
  ]
})
export class CreatePrisonListContainer implements OnInit, OnDestroy {
  errors: ValidationError[];
  selectedCourtCentre: CourtCentre;

  isSubmitted: boolean;
  courtCentres: CourtCentre[];
  destroy$: Subject<boolean> = new Subject<boolean>();

  selectedHearings: Hearing[];
  selectedOptions: CreateListFilterOptions;
  crownCourtSelected: boolean;

  publicHolidays$: Observable<PublicHoliday[]>;
  isPrisonAdminOrHmctsUser$: Observable<boolean>;
  hasAllocatedHearingsByDateRange$: Observable<boolean>;

  get crownSelected() {
    return this.crownCourtSelected;
  }

  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    this.publicHolidays$ = this.store.select(getPublicHolidays);

    this.store
      .select(getCourtCentres)
      .pipe(takeUntil(this.destroy$))
      .subscribe((courtCentres) => {
        this.courtCentres = courtCentres;
      });
    this.isPrisonAdminOrHmctsUser$ = this.store.select(getIsPrisonAdminOrHmctsUser);
    this.hasAllocatedHearingsByDateRange$ = this.store.select(hasAllocatedHearingsByDateRange);
  }

  get pageTitle(): string {
    return `Download prison list`;
  }

  showValidationError(errors: ValidationError[]) {
    this.errors = errors;
  }

  onSelectCourtCentre(event?: { value: string; type?: string }) {
    if (event) {
      this.selectedCourtCentre = this.courtCentres.find(
        (courtCentre) => courtCentre.id === event.value
      );
      this.isSubmitted = false;
    } else {
      this.selectedCourtCentre = undefined;
    }
  }

  formErrors(errors) {
    this.errors = errors;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  filterSubmit(options: CreateListFilterOptions, resetCurrentPage = true) {
    options.pageNumber = resetCurrentPage ? 1 : options.pageNumber;
    options.pageSize = DEFAULT_PAGINATION_ITEMS_PER_PAGE;
    this.selectedOptions = options;
    this.isSubmitted = true;
    this.crownCourtSelected = options.isCrownCourt;

    this.store.dispatch(searchAllocatedHearingsForPrisonListAction({ options: options }));
  }
}
