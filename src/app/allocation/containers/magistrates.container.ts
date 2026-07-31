import { Component, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BookingType,
  getOrganisationUnits,
  getRotaBusinessTypes,
  HearingPriority,
  HearingType,
  OrganisationUnit,
  RotaBusinessType
} from '@cpp/reference-data';
import { select, Store } from '@ngrx/store';
import moment from 'moment';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap, take, withLatestFrom } from 'rxjs/operators';
import { AppState, getHearingById } from '../../core';
import {
  getSearchMetadata,
  getSearchParams,
  getSearchResults,
  HearingSlot,
  HearingSlotAllocation,
  SchedulingFilters,
  SearchHearingSlotsParams
} from '@cpp/scheduling';
import { AllocationActions } from '../actions';
import { MagistratesSchedulingQueryParams } from '../guards/allocation.guard';
import { magistratesSplitHearings } from '../../court-calendar/state/actions/court-calendar.actions';
import { CourtCalendarFeature } from '../../court-calendar/model';
import { AsyncPipe } from '@angular/common';
import { MagistratesSchedulingComponent } from '../components/magistrates.component';
import { PdkPaddingDirective, PdkLinkDirective } from '@cpp/pdk';

export interface AllocateHearingParams {
  hearingSlotAllocations?: HearingSlotAllocation[];
  priority?: HearingPriority;
  bookingType?: BookingType;
  startDate?: string;
  endDate?: string;
  weekCommencingStartDate?: string;
  weekCommencingEndDate?: string;
  weekCommencingDurationInWeeks?: number;
  sendNotificationToParties?: boolean;
}

@Component({
  selector: 'magistrates-scheduling-container',
  template: `
    <magistrates-scheduling
      [currentPage]="currentPage$ | async"
      [filters]="filters$ | async"
      [hearingSlots]="searchResult$ | async"
      [organisationUnits]="organisationUnits$ | async"
      [pageSize]="pageSize$ | async"
      [rotaBusinessTypes]="rotaBusinessTypes$ | async"
      [totalResults]="totalResults$ | async"
      (filtersSubmit)="handleFiltersSubmit($event)"
      (hearingSlotsCancel)="handleHearingSlotsCancel()"
      (hearingSlotAllocationsSubmit)="handleSubmitHearingSlotAllocations($event)"
      (pageChange)="handlePageChange($event)"
    >
    </magistrates-scheduling>

    <a pdk-padding-left="6" href="javascript:void(0)" (click)="handleHearingSlotsCancel()" pdk-link
      >Cancel</a
    >
  `,
  imports: [MagistratesSchedulingComponent, PdkPaddingDirective, PdkLinkDirective, AsyncPipe]
})
export class MagistratesSchedulingContainerComponent {
  readonly courtId = input<string>(undefined);
  currentPage$: Observable<number>;
  defaultFilters$: Observable<Partial<SchedulingFilters>>;
  filters$: Observable<Partial<SchedulingFilters>>;
  organisationUnits$: Observable<OrganisationUnit[]>;
  pageSize$: Observable<number>;
  rotaBusinessTypes$: Observable<RotaBusinessType[]>;
  searchResult$: Observable<HearingSlot[]>;
  totalResults$: Observable<number>;
  hearingTypePlaceholder: HearingType = {
    id: 'All',
    hearingCode: 'All',
    seqId: 0,
    defaultDurationMin: 0,
    welshHearingDescription: '',
    hearingDescription: 'All hearing types',
    magistratesFlag: true,
    crownFlag: true
  };

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router
  ) {
    const metadata$ = this.store.pipe(select(getSearchMetadata));
    this.currentPage$ = metadata$.pipe(map(metadata => metadata.currentPage));

    this.defaultFilters$ = combineLatest([this.route.params, this.route.queryParams]).pipe(
      withLatestFrom(this.store),
      map(([[params, queryParams], state]) => {
        const { courtId } = queryParams;
        const organisationUnits = getOrganisationUnits(state);
        const hearing = getHearingById(params.id)(state);
        const courtCentreId = courtId;
        const organisationUnit = organisationUnits.find(ou => ou.id === courtCentreId);

        const courtRoomId =
          hearing.courtCentreId === courtCentreId ? hearing.courtRoomId : undefined;

        const today = moment().format('YYYY-MM-DD');
        const hearingStartDate = hearing?.startDate || today;
        const sessionStartDate = moment(hearingStartDate).isSameOrAfter(moment(), 'day')
          ? hearingStartDate
          : today;

        return {
          courtRoomId,
          organisationUnit,
          sessionStartDate,
          sessionEndDate: moment(sessionStartDate)
            .add(6, 'weeks')
            .subtract(1, 'day')
            .format('YYYY-MM-DD')
        } as Partial<SearchHearingSlotsParams>;
      })
    );

    this.filters$ = this.store.pipe(select(getSearchParams)).pipe(
      switchMap(filters => {
        if (filters) {
          return this.store.pipe(
            take(1),
            map(state => {
              const { ...params } = filters as SearchHearingSlotsParams;
              let hearingType = this.hearingTypePlaceholder;
              return {
                ...params,
                hearingType,
                organisationUnit: getOrganisationUnits(state).find(
                  organisationUnit => organisationUnit.oucode === params.ouCode
                )
              };
            })
          );
        }
        return this.defaultFilters$;
      })
    );
    this.organisationUnits$ = this.store.pipe(select(getOrganisationUnits));
    this.pageSize$ = metadata$.pipe(map(metadata => metadata.pageSize));
    this.rotaBusinessTypes$ = this.store.pipe(select(getRotaBusinessTypes));
    this.searchResult$ = this.store.pipe(select(getSearchResults));
    this.totalResults$ = metadata$.pipe(map(metadata => metadata.totalResults));
  }

  handleFiltersSubmit({ hearingType, organisationUnit, ...filters }: SchedulingFilters) {
    let hearingTypeId;

    if (hearingType && hearingType.id && hearingType.id !== this.hearingTypePlaceholder.id) {
      hearingTypeId = hearingType.id;
    }
    this.reloadWithQueryParams({
      ...filters,
      sessionEndDate:
        filters.sessionEndDate ||
        moment(filters.sessionStartDate).add(6, 'weeks').subtract(1, 'day').format('YYYY-MM-DD'),
      ouCode: organisationUnit ? organisationUnit.oucode : undefined,
      hearingTypeId,
      pageNumber: 1
    });
  }

  handlePageChange(pageNumber: number) {
    this.store
      .pipe(
        select(getSearchParams),
        take(1),
        map(params => ({ ...params, pageNumber }))
      )
      .subscribe(queryParams => {
        this.reloadWithQueryParams(queryParams);
      });
  }

  handleHearingSlotsCancel() {
    let { referrer, isUnscheduled } = this.route.snapshot.queryParams;
    referrer === CourtCalendarFeature.calendar
      ? this.router.navigate(['/court-calendar'])
      : this.router.navigate(isUnscheduled ? ['/unscheduled'] : ['/unallocated']);
  }

  handleSubmitHearingSlotAllocations({
    hearingSlotAllocations,
    bookingType,
    priority,
    sendNotificationToParties,
    ...params
  }: AllocateHearingParams) {
    this.filters$
      .pipe(
        take(1),
        map(filters => {
          return {
            hearingId: this.route.snapshot.params.id,
            hearingSlotAllocations,
            sendNotificationToParties,
            filters: {
              ...params,
              bookingType: bookingType ? bookingType.typeCode : undefined,
              priority: priority ? priority.priorityCode : undefined
            },
            redirectTo: this.route.snapshot.queryParams.isUnscheduled
              ? ['/unscheduled']
              : this.route.snapshot.queryParams.allocated === 'true'
                ? ['/allocated']
                : ['/unallocated']
          };
        })
      )
      .subscribe(payload => {
        if (this.route.snapshot?.queryParams?.referrer === CourtCalendarFeature.calendar) {
          this.store.dispatch(
            magistratesSplitHearings({
              hearingSlotAllocations,
              sendNotificationToParties
            })
          );
        } else {
          this.store.dispatch(AllocationActions.allocateMagistratesHearing(payload));
        }
      });
  }

  reloadWithQueryParams(params: SearchHearingSlotsParams) {
    this.router.navigate(['.'], {
      relativeTo: this.route,
      fragment: '_',
      queryParams: {
        mf: JSON.stringify(params),
        ...(this.route.snapshot.queryParams.isUnscheduled ? { isUnscheduled: true } : {})
      } as MagistratesSchedulingQueryParams,
      queryParamsHandling: 'merge'
    });
  }
}
