import {
  combineLatest as observableCombineLatest,
  zip as observableZip,
  Observable,
  Subject
} from 'rxjs';

import { map, tap, take, distinctUntilChanged } from 'rxjs/operators';
import { Component, OnDestroy, Inject, ElementRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import { AppConfigService } from '../config';

import {
  AppState,
  ClearLastAllocatedHearingAction,
  ListUnallocatedHearingsAction,
  ClearUnallocatedHearingsAction,
  ShowUnallocatedHearingsAction,
  getCourtCentres,
  getCourtSummaries,
  getProsecutors,
  getHearingTypes,
  getLastAllocatedHearing,
  getSelectedHearingFilters,
  showUnallocatedHearings,
  isUnallocatedPageVisited,
  CourtCentre,
  Hearing,
  CourtSummary,
  Prosecutor,
  HearingType,
  SaveHearingFiltersAction,
  ResetHearingFiltersAction,
  UnallocatedPageVisitedAction,
  Jurisdiction,
  ResetAvailableHearingsAction,
  ListUnallocatedFixedAndWeekCommencingHearings,
  getLastAllocatedMagsHearing,
  getMagsHearingSchedule,
  ClearHearingSlots,
  getUnallocatedHearingsByPage,
  splitHearingUnallocated
} from '../core';
import { jurisdiction$ } from '../core/util/constants';
import { SelectedFilterOptions, LastAllocatedHearing } from '../core/model/';
import { Breadcrumb } from '../core/model/shared/breadcrumb';
import {
  ValidationError,
  PdkErrorSummaryComponent,
  PdkMarginDirective,
  PdkBreadcrumbListComponent,
  PdkBreadcrumbListItemDirective,
  PdkBreadcrumbDirective,
  PdkGridComponent,
  PdkGridDirective,
  PdkPaddingDirective,
  PdkTypographyDirective,
  PdkWarningTextComponent
} from '@cpp/pdk';
import { HearingSchedule, UnallocatedHearings } from '../core/model/hearing';
import { HearingSlotAllocation } from '@cpp/scheduling';
import { getHasApiActivity } from '../core/selectors/api';
import { AsyncPipe } from '@angular/common';
import { SubMenuComponent } from '../shared/components/sub-menu/sub-menu.component';
import { AppNotificationComponent } from '../shared/components/notification/notification';
import { HearingFiltersComponent } from '../shared/components/hearing-filters/hearing-filters.component';
import { HearingListComponent } from '../shared/components/hearing-list/hearing-list.component';

@Component({
  selector: 'unallocated-hearings',
  templateUrl: './unallocated-hearings.container.html',
  imports: [
    PdkErrorSummaryComponent,
    PdkMarginDirective,
    SubMenuComponent,
    PdkBreadcrumbListComponent,
    PdkBreadcrumbListItemDirective,
    PdkBreadcrumbDirective,
    RouterLink,
    PdkGridComponent,
    PdkGridDirective,
    PdkPaddingDirective,
    AppNotificationComponent,
    PdkTypographyDirective,
    HearingFiltersComponent,
    HearingListComponent,
    PdkWarningTextComponent,
    AsyncPipe
  ]
})
export class UnallocatedHearingsContainer implements OnDestroy {
  unallocatedHearings$: Observable<UnallocatedHearings>;
  selectedCourtCentre$: Observable<CourtCentre>;
  lastAllocatedHearing$: Observable<LastAllocatedHearing>;
  courtCentres$: Observable<CourtCentre[]>;
  courtSummaries$: Observable<CourtSummary[]>;
  prosecutors$: Observable<Prosecutor[]>;
  hearingTypes$: Observable<HearingType[]>;
  jurisdictions$: Observable<Jurisdiction[]>;
  selectedHearingFilters$: Observable<SelectedFilterOptions>;
  showUnallocatedHearings$: Observable<boolean>;
  loading$: Observable<boolean>;
  pageVisited$: Observable<boolean>;
  showNoHearingsMessage$: Observable<boolean>;
  lastAllocatedMagsHearingsSlots$: Observable<LastAllocatedHearing>;
  hearingSchedule$: Observable<HearingSchedule>;

  EARLIEST_START_DATE = '1970-01-01';
  LATEST_END_DATE = '2100-12-31';
  CROWN_JURISDICTION = 'CROWN';
  pageSize = 50;

  destroy$: Subject<boolean> = new Subject<boolean>();

  errors: ValidationError[];

  breadcrumbs: Breadcrumb[] = [
    { title: 'Home', href: this.appConfig.getBaseUrl() },
    { title: 'Unallocated hearings' }
  ];
  showSubmenu = true;
  scheduledHearingsAllocated$: any;

  constructor(
    private appConfig: AppConfigService,
    private store: Store<AppState>,
    private router: Router,

    @Inject('Window') private window: Window,
    private elementRef: ElementRef<HTMLElement>
  ) {
    this.unallocatedHearings$ = this.store.select(getUnallocatedHearingsByPage);
    this.courtSummaries$ = this.store.select(getCourtSummaries);
    this.prosecutors$ = this.store.select(getProsecutors);
    this.hearingTypes$ = this.store.select(getHearingTypes);
    this.jurisdictions$ = jurisdiction$;
    this.selectedHearingFilters$ = this.store.select(getSelectedHearingFilters);
    this.lastAllocatedHearing$ = this.store.select(getLastAllocatedHearing);
    this.showUnallocatedHearings$ = this.store.select(showUnallocatedHearings);
    this.loading$ = this.store.select(getHasApiActivity);
    this.pageVisited$ = this.store.select(isUnallocatedPageVisited);
    this.courtCentres$ = this.store.select(getCourtCentres);
    this.lastAllocatedMagsHearingsSlots$ = this.store.select(getLastAllocatedMagsHearing);
    this.hearingSchedule$ = this.store.select(getMagsHearingSchedule);
    this.store.dispatch(new ClearUnallocatedHearingsAction());

    observableZip(this.pageVisited$, this.selectedHearingFilters$, this.unallocatedHearings$)
      .pipe(
        tap(([visited, selectedFilters, { pagination }]) => {
          if (visited) {
            this.store.dispatch(
              new ListUnallocatedHearingsAction({
                ...selectedFilters,
                pageNumber: pagination.currentPage,
                pageSize: this.pageSize
              })
            );
          } else {
            this.store.dispatch(new UnallocatedPageVisitedAction());
          }
        }),
        take(1)
      )
      .subscribe();

    this.showNoHearingsMessage$ = observableCombineLatest(
      this.showUnallocatedHearings$,
      this.unallocatedHearings$,
      this.loading$
    ).pipe(
      map(([showHearingList, unallocatedHearings, loading]) => {
        return showHearingList && !unallocatedHearings.hearings.length && !loading;
      }),
      distinctUntilChanged() // TODO - Angular 8 verify this works SL
    );
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
  getOptions(selectedFilters: SelectedFilterOptions) {
    // the existing endpoint has been modified so if we pass:
    // allocated = false;  weekCommencingStartDate;  weekCommencingEndDate  we can retrieve
    // all the week commencing and fixed date hearings
    const weekCommencingStartDate = this.EARLIEST_START_DATE;
    const weekCommencingEndDate = this.LATEST_END_DATE;
    const allocated = false;
    const startDate = null;
    const endDate = null;

    return {
      ...selectedFilters,
      allocated,
      weekCommencingStartDate,
      weekCommencingEndDate,
      startDate,
      endDate
    };
  }

  listHearings(selectedFilters: SelectedFilterOptions) {
    const options = this.getOptions(selectedFilters);

    this.store.dispatch(
      new ListUnallocatedFixedAndWeekCommencingHearings({
        ...options,
        pageNumber: 1,
        pageSize: this.pageSize
      })
    );
    this.store.dispatch(new SaveHearingFiltersAction(selectedFilters));
    this.store.dispatch(new ClearHearingSlots());
  }

  resetHearingFilters() {
    this.store.dispatch(new ShowUnallocatedHearingsAction(false));
    this.store.dispatch(new ClearUnallocatedHearingsAction());
    this.store.dispatch(new ResetHearingFiltersAction());
  }

  allocateHearing(hearing: Hearing) {
    this.store.dispatch(new ResetAvailableHearingsAction());
    this.router.navigate([`/unallocated/${hearing.id}`]).then(() => {
      this.window.scroll(0, 0);
    });
  }

  splitHearing(hearing: Hearing) {
    this.router.navigate([`/split/${hearing.id}`]).then(() => {
      this.window.scroll(0, 0);
    });
    this.store.dispatch(splitHearingUnallocated({ splitHearingUnallocated: true }));
  }

  clearNotification(): void {
    this.store.dispatch(new ClearLastAllocatedHearingAction());
    this.store.dispatch(new ClearHearingSlots());
  }

  getEarliestAllocation(allocations: HearingSlotAllocation[]): HearingSlotAllocation | undefined {
    return [...allocations].sort((a, b) => a.hearingSlotTime.localeCompare(b.hearingSlotTime))[0];
  }

  updatePageNumber(page: number) {
    if (page) {
      this.selectedHearingFilters$
        .pipe(
          take(1),
          map(selectedFilters => {
            const options = this.getOptions(selectedFilters);
            return new ListUnallocatedFixedAndWeekCommencingHearings({
              ...options,
              pageNumber: page,
              pageSize: this.pageSize
            });
          })
        )
        .subscribe(this.store);
      this.elementRef.nativeElement.scrollIntoView({ block: 'start' });
    }
  }

  getBaseUrl() {
    return this.appConfig.getBaseUrl();
  }
}
