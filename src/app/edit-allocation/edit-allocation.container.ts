import { takeUntil } from 'rxjs/operators';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import moment from 'moment';
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
  PdkLinkDirective
} from '@cpp/pdk';

import {
  AllocatingHearingDetails,
  AppState,
  ChangeJudicaryForHearingsAction,
  ClearHearingSlots,
  ClearLastAllocatedHearingAction,
  CourtCentre,
  CourtroomsFilter,
  getCourtCentres,
  getEditAllocationError,
  getHearingTypes,
  getLastAllocatedHearing,
  getLastAllocatedMagsHearing,
  getMagsHearingSchedule,
  getTrialTypesFilteredByType,
  Hearing,
  HearingType,
  SearchAllocatedHearingsAction,
  setEditAllocationError,
  setHearingToEditAllocation,
  splitHearingUnallocated,
  UpdateAllocatedHearingAction
} from '../core/';
import { FilterOption, HearingSchedule, LastAllocatedHearing } from '../core/model/';
import { AppConfigService } from '../config';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DailyCourtRoomCalendarContainer } from '../daily-court-room-calendar/daily-court-room-calendar.container';
import { CPPDate, getCPPDate } from '../core/util';
import { Breadcrumb } from '../core/model/shared/breadcrumb';
import { TrialType } from '@cpp/reference-data';
import { AsyncPipe } from '@angular/common';
import { SubMenuComponent } from '../shared/components/sub-menu/sub-menu.component';
import { AppNotificationComponent } from '../shared/components/notification/notification';
import { CourtroomsFilterComponent } from '../allocate-hearing/courtrooms-filter/courtrooms-filter.component';
import { HearingDetailsFormComponent } from '../shared/components/hearing-details-form/hearing-details-form.component';
import { ChangeJudiciaryForHearingsFormComponent } from './change-judiciary-for-hearings-form/change-judiciary-for-hearings-form.component';

@Component({
  selector: 'edit-allocation',
  templateUrl: './edit-allocation.html',
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
    CourtroomsFilterComponent,
    DailyCourtRoomCalendarContainer,
    PdkLinkDirective,
    HearingDetailsFormComponent,
    ChangeJudiciaryForHearingsFormComponent,
    AsyncPipe
  ]
})
export class EditAllocationContainer implements OnDestroy, OnInit {
  @ViewChild('dailyCourtRoomCalendarContainer')
  dailyCourtRoomCalendarContainer: DailyCourtRoomCalendarContainer;

  selectedCourtCentre$: Observable<CourtCentre>;
  startDate: Date;
  selectedHearing: Hearing;
  hearingTypes$: Observable<HearingType[]>;
  trialTypes$: Observable<TrialType[]>;
  courtCentres: CourtCentre[];
  selectedCourtCentre;
  filterOptions: CourtroomsFilter;
  destroy$: Subject<boolean> = new Subject<boolean>();
  selectedHearingId: string;
  showJudiciaryForm: boolean;
  selectedJudiciaryHearings: Hearing[];
  showSubmenu = true;
  courtCentres$: Observable<CourtCentre[]>;
  lastAllocatedHearing$: Observable<LastAllocatedHearing>;
  lastAllocatedMagsHearingsSlots$: Observable<LastAllocatedHearing>;
  hearingSchedule$: Observable<HearingSchedule>;
  errors: ValidationError[];

  breadcrumbs: Breadcrumb[] = [
    { title: 'Home', href: this.appConfig.getBaseUrl() },
    { title: 'Allocated hearings' }
  ];

  private readonly dateUtil: CPPDate;

  constructor(
    private store: Store<AppState>,
    private appConfig: AppConfigService,
    private router: Router,
    @Inject('Window') private window: Window,
    private activatedRoute: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {
    this.dateUtil = getCPPDate();
    this.startDate = moment().toDate();

    this.hearingTypes$ = this.store.select(getHearingTypes);
    this.courtCentres$ = this.store.select(getCourtCentres);
    this.lastAllocatedHearing$ = this.store.select(getLastAllocatedHearing);
    this.lastAllocatedMagsHearingsSlots$ = this.store.select(getLastAllocatedMagsHearing);
    this.hearingSchedule$ = this.store.select(getMagsHearingSchedule);
  }

  ngOnInit() {
    this.store.dispatch(splitHearingUnallocated({ splitHearingUnallocated: false }));
    this.trialTypes$ = this.store.select(getTrialTypesFilteredByType);
    this.store
      .select(getCourtCentres)
      .pipe(takeUntil(this.destroy$))
      .subscribe(courtCentres => {
        this.courtCentres = courtCentres;
        this.fetchQueryParams();
        this.cd.detectChanges();
      });

    this.store
      .select(getEditAllocationError)
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        if (error) {
          this.errors = [error];
        }
      });
  }

  async navigate(url: string) {
    await this.router.navigate([url]);
    this.window.scroll(0, 0);
  }

  onHearingSelected(hearing: Hearing) {
    this.selectedHearing = undefined;
    this.errors = null;
    this.showJudiciaryForm = false;
    setTimeout(() => {
      this.selectedHearing = hearing;
      this.store.dispatch(setHearingToEditAllocation({ hearingToEditAllocation: hearing }));
    });
  }

  canActivateSplit(hearing: Hearing): boolean {
    return (hearing.listedCases || []).some(
      kase =>
        kase.defendants.length > 1 ||
        kase.defendants.some(defendant => defendant.offences.length > 1)
    );
  }

  splitHearing(hearing: Hearing) {
    this.router.navigate([`/split/${hearing.id}`]).then(e => {
      this.window.scroll(0, 0);
    });
  }

  onSelectCourtCentre(event: { type: 'change' } | FilterOption) {
    if ('value' in event && this.eventIsCourtCentreSelection(event)) {
      this.selectedCourtCentre = this.courtCentres.find(
        courtCentre => courtCentre.id === event.value
      );
    } else if ('type' in event && event.type && event.type === 'change') {
      this.selectedCourtCentre = undefined;
    }
  }

  updateHearing({ originHearing, updatedHearing }: AllocatingHearingDetails) {
    this.store.dispatch(new UpdateAllocatedHearingAction({ originHearing, updatedHearing }));
    this.clearSelectedHearing();
  }

  changeJudiciary({ hearings, judiciary }) {
    this.showJudiciaryForm = false;
    this.store.dispatch(
      new ChangeJudicaryForHearingsAction({
        hearings,
        judiciary: judiciary.filter(judic => !!judic) // this is to handle gaps in magistrates (eg Winger 2 present but not Winger 1, etc)
      })
    );
  }

  filterSubmit(options: CourtroomsFilter) {
    this.filterOptions = options;
    this.store.dispatch(
      new SearchAllocatedHearingsAction({
        options: {
          ...options,
          startTime: options.startTime
            ? this.convertToUTC(options.searchDate, options.startTime)
            : undefined,
          endTime: options.endTime
            ? this.convertToUTC(options.searchDate, options.endTime)
            : undefined
        }
      })
    );
  }

  clearSelectedHearing() {
    this.selectedHearing = undefined;
    this.cd.detectChanges();
    this.dailyCourtRoomCalendarContainer.clearSelectedHearing();
    this.window.scroll(0, 0);
  }

  clearNotification(): void {
    this.store.dispatch(new ClearLastAllocatedHearingAction());
    this.store.dispatch(new ClearHearingSlots());
  }

  formErrors(errors) {
    this.errors = errors;
  }

  ngOnDestroy() {
    this.store.dispatch(setEditAllocationError({ editAllocationError: null }));

    this.destroy$.next(true);
    this.destroy$.complete();
  }

  private eventIsCourtCentreSelection(event: any): boolean {
    return event.value && event.value.length === 36;
  }

  fetchQueryParams() {
    if (
      this.activatedRoute.snapshot.queryParams &&
      this.activatedRoute.snapshot.queryParams.courtCenterId
    ) {
      this.filterOptions = {
        courtCentreId: this.activatedRoute.snapshot.queryParams.courtCenterId,
        courtRoomId: this.activatedRoute.snapshot.queryParams.courtRoomId,
        searchDate: this.activatedRoute.snapshot.queryParams.searchDate,
        startTime: this.activatedRoute.snapshot.queryParams.startTime,
        endTime: this.activatedRoute.snapshot.queryParams.endTime
      };
      this.selectedCourtCentre = this.courtCentres.find(
        courtCentre => courtCentre.id === this.filterOptions.courtCentreId
      );
      this.selectedHearingId = this.activatedRoute.snapshot.queryParams.hearingId;
      this.filterSubmit(this.filterOptions);
    }
  }

  clearSidebar() {
    this.showJudiciaryForm = false;
    this.clearSelectedHearing();
  }

  private convertToUTC(date: string, time: string): string {
    return this.dateUtil.toUtcISO(`${date} ${time}`, this.dateUtil.HOURS_MINUTES_24H);
  }
}
