import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnDestroy } from '@angular/core';
import { Observable, Subject, zip as observableZip } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import {
  ValidationError,
  PdkErrorSummaryComponent,
  PdkMarginDirective,
  PdkGridComponent,
  PdkGridDirective,
  PdkPaddingDirective,
  PdkTypographyDirective,
  PdkInsetTextComponent,
  PdkWarningTextComponent
} from '@cpp/pdk';
import {
  ClearHearingSlots,
  ClearLastAllocatedHearingAction,
  ClearUnscheduledHearingsAction,
  ListUnscheduledHearingsAction,
  ResetAvailableHearingsAction,
  ResetUnscheduledFiltersAction,
  SaveUnscheduledFiltersAction,
  ShowUnscheduledHearingsAction,
  TypeOfListAction,
  UnscheduledPageVisitedAction
} from '../core/actions';
import {
  TypeOfListSummary,
  UnscheduledHearingsForAllApplications,
  UnscheduledHearingsForAllDefendants
} from './unscheduled-listings.interfaces';
import { CourtCentre, Hearing, LastAllocatedHearing, SelectedFilterOptions } from '../core/model';
import {
  getCourtCentres,
  getLastAllocatedHearing,
  getLastAllocatedMagsHearing,
  getMagsHearingSchedule,
  getSelectedUnscheduledHearingFilters,
  getTypeOfList,
  getUnscheduledHearings,
  isUnscheduledPageVisited,
  showUnscheduledHearings
} from '../core/selectors';
import cleanDeep from 'clean-deep';
import { Breadcrumb } from '../core/model/shared/breadcrumb';
import { AppConfigService } from '../config';
import {
  getUnscheduledHearingsCount,
  getUnscheduledHearingsForAllApplications,
  getUnscheduledHearingsForAllDefendants,
  showNoHearingsMessage
} from './unscheduled-listings.selector';
import { HearingSchedule, PaginatedHearings } from '../core/model/hearing';
import { HearingSlotAllocation } from '@cpp/scheduling';
import { getOrganisationUnits, OrganisationUnit } from '@cpp/reference-data';
import { getHasApiActivity } from '../core/selectors/api';
import { AppState } from '../core';
import { AsyncPipe } from '@angular/common';
import { SubMenuComponent } from '../shared/components/sub-menu/sub-menu.component';
import { BreadcrumbsComponent } from '../shared/components/breadcrumbs/breadcrumbs.component';
import { AppNotificationComponent } from '../shared/components/notification/notification';
import { UnscheduledListingsFiltersComponent } from './components/unscheduled-listings-filter/unscheduled-listings-filters.component';
import { UnscheduledListingsTableComponent } from './components/unscheduled-listings-table/unscheduled-listings-table.component';

@Component({
  selector: 'unscheduled-listings-container',
  templateUrl: './unscheduled-listings.container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PdkErrorSummaryComponent,
    PdkMarginDirective,
    SubMenuComponent,
    BreadcrumbsComponent,
    PdkGridComponent,
    PdkGridDirective,
    PdkPaddingDirective,
    AppNotificationComponent,
    PdkTypographyDirective,
    UnscheduledListingsFiltersComponent,
    PdkInsetTextComponent,
    UnscheduledListingsTableComponent,
    PdkWarningTextComponent,
    AsyncPipe
  ]
})
export class UnscheduledListingsContainer implements OnDestroy {
  courtCentres$: Observable<CourtCentre[]>;
  operationalUnitOptions$: Observable<OrganisationUnit[]>;
  unscheduledHearings$: Observable<UnscheduledHearingsForAllDefendants[]>;
  unscheduledHearingsForApplications$: Observable<UnscheduledHearingsForAllApplications[]>;
  unscheduledHearingsCount$: Observable<number>;
  typeOfListCodeOptions$: Observable<TypeOfListSummary[]>;
  selectedHearingFilters$: Observable<SelectedFilterOptions>;
  showUnscheduledHearings$: Observable<boolean>;
  pageVisited$: Observable<boolean>;
  hearingSchedule$: Observable<HearingSchedule>;
  lastAllocatedMagsHearingsSlots$: Observable<LastAllocatedHearing>;
  lastAllocatedHearing$: Observable<LastAllocatedHearing>;
  showNoHearingsMessage$: Observable<boolean>;
  loading$: Observable<boolean>;
  destroy$: Subject<boolean> = new Subject<boolean>();
  unscheduledHearingsWithPagination$: Observable<PaginatedHearings>;

  errors: ValidationError[];

  breadcrumbs: Breadcrumb[] = [
    { title: 'Home', href: this.appConfig.getBaseUrl() },
    { title: 'Unscheduled list' }
  ];
  pageSize = 50;

  showSubmenu = true;

  constructor(
    private appConfig: AppConfigService,
    private store: Store<AppState>,
    private router: Router,
    @Inject('Window') private window: Window,
    private elementRef: ElementRef<HTMLElement>
  ) {
    this.store.dispatch(new TypeOfListAction());

    this.courtCentres$ = this.store.select(getCourtCentres);
    this.unscheduledHearingsWithPagination$ = this.store.select(getUnscheduledHearings);
    this.courtCentres$ = this.store.select(getCourtCentres);
    this.unscheduledHearings$ = this.store.select(getUnscheduledHearingsForAllDefendants);
    this.unscheduledHearingsForApplications$ = this.store.select(
      getUnscheduledHearingsForAllApplications
    );
    this.unscheduledHearingsCount$ = this.store.select(getUnscheduledHearingsCount);
    this.showUnscheduledHearings$ = this.store.select(showUnscheduledHearings);
    this.selectedHearingFilters$ = this.store.select(getSelectedUnscheduledHearingFilters);
    this.operationalUnitOptions$ = this.store.select(getOrganisationUnits);
    this.typeOfListCodeOptions$ = this.store.select(getTypeOfList);
    this.pageVisited$ = this.store.select(isUnscheduledPageVisited);
    this.loading$ = this.store.select(getHasApiActivity);
    this.hearingSchedule$ = this.store.select(getMagsHearingSchedule);
    this.lastAllocatedMagsHearingsSlots$ = this.store.select(getLastAllocatedMagsHearing);
    this.lastAllocatedHearing$ = this.store.select(getLastAllocatedHearing);
    this.showNoHearingsMessage$ = this.store.select(showNoHearingsMessage);

    this.store.dispatch(new ClearUnscheduledHearingsAction());

    observableZip(
      this.pageVisited$,
      this.selectedHearingFilters$,
      this.unscheduledHearingsWithPagination$
    )
      .pipe(
        tap(([visited, selectedFilters, { pagination }]) => {
          if (visited) {
            this.store.dispatch(
              new ListUnscheduledHearingsAction(
                cleanDeep({
                  ...selectedFilters,
                  pageNumber: pagination.currentPage,
                  pageSize: this.pageSize
                })
              )
            );
          } else {
            this.store.dispatch(new UnscheduledPageVisitedAction());
          }
        }),
        take(1)
      )
      .subscribe();
  }

  listHearings(selectedFilters: SelectedFilterOptions): void {
    this.store.dispatch(
      new ListUnscheduledHearingsAction(
        cleanDeep({ ...selectedFilters, pageNumber: 1, pageSize: this.pageSize })
      )
    );
    this.store.dispatch(new SaveUnscheduledFiltersAction(selectedFilters));
    this.store.dispatch(new ClearHearingSlots());
  }

  resetUnscheduledHearingFilters(): void {
    this.store.dispatch(new ShowUnscheduledHearingsAction(false));
    this.store.dispatch(new ClearUnscheduledHearingsAction());
    this.store.dispatch(new ResetUnscheduledFiltersAction());
  }

  allocateUnscheduledHearing(hearing: Hearing): void {
    if (hearing.jurisdictionType === 'CROWN') {
      this.store.dispatch(new ResetAvailableHearingsAction());
    }

    this.router
      .navigate([`/unallocated/${hearing.id}`], { queryParams: { isUnscheduled: true } })
      .then(() => {
        this.window.scroll(0, 0);
      });
  }

  clearNotification(): void {
    this.store.dispatch(new ClearLastAllocatedHearingAction());
    this.store.dispatch(new ClearHearingSlots());
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  getBaseUrl() {
    return this.appConfig.getBaseUrl();
  }

  updatePageNumber(page: number) {
    if (page) {
      this.selectedHearingFilters$
        .pipe(
          take(1),
          map(selectedFilters => {
            return new ListUnscheduledHearingsAction(
              cleanDeep({ ...selectedFilters, pageNumber: page, pageSize: this.pageSize })
            );
          })
        )
        .subscribe(this.store);
      this.elementRef.nativeElement.scrollIntoView({ block: 'start' });
    }
  }

  getEarliestAllocation(allocations: HearingSlotAllocation[]): HearingSlotAllocation | undefined {
    return [...allocations].sort((a, b) => a.hearingSlotTime.localeCompare(b.hearingSlotTime))[0];
  }
}
