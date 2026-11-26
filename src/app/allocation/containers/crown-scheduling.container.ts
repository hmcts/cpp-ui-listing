import { Component, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  getOrganisationUnits,
  getRotaBusinessTypesByJurisdiction,
  HearingType,
  OrganisationUnit,
  RotaBusinessType
} from '@cpp/reference-data';
import { select, Store } from '@ngrx/store';
import moment from 'moment';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap, take, withLatestFrom } from 'rxjs/operators';
import { AppState, getHearingById, getReferenceDataHearingTypes } from '../../core';
import {
  getSearchMetadata,
  getSearchParams,
  getSearchResults,
  sessionFilterFromParams,
  CrownSchedulingFilters,
  HearingSlot,
  SearchHearingSlotsParams
} from '@cpp/scheduling';
import { AllocationActions } from '../actions';
import { MagistratesSchedulingQueryParams } from '../guards/allocation.guard';
import { allocateSelectedHearingSlots } from '../../court-calendar/state/actions/court-calendar.actions';
import { AsyncPipe } from '@angular/common';
import { CrownSchedulingComponent } from '../components/crown-scheduling.component';
import { PdkPaddingDirective, PdkLinkDirective } from '@cpp/pdk';
import {
  AllocateHearingParams,
  buildSlotAllocatePayload,
  filtersForCrownAllocateSearch
} from '../utils/allocate-slot-payload';

@Component({
  selector: 'crown-scheduling-container',
  template: `
    <crown-scheduling
      [currentPage]="currentPage$ | async"
      [filters]="filters$ | async"
      [hearingTypes]="hearingTypes$ | async"
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
    </crown-scheduling>

    <a pdk-padding-left="6" href="javascript:void(0)" (click)="handleHearingSlotsCancel()" pdk-link
      >Cancel</a
    >
  `,
  imports: [CrownSchedulingComponent, PdkPaddingDirective, PdkLinkDirective, AsyncPipe]
})
export class CrownSchedulingContainer {
  readonly courtId = input<string>(undefined);
  currentPage$: Observable<number>;
  defaultFilters$: Observable<Partial<CrownSchedulingFilters>>;
  filters$: Observable<Partial<CrownSchedulingFilters>>;
  hearingTypes$: Observable<HearingType[]>;
  organisationUnits$: Observable<OrganisationUnit[]>;
  pageSize$: Observable<number>;
  rotaBusinessTypes$: Observable<RotaBusinessType[]>;
  searchResult$: Observable<HearingSlot[]>;
  totalResults$: Observable<number>;

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router
  ) {
    const metadata$ = this.store.pipe(select(getSearchMetadata));
    this.currentPage$ = metadata$.pipe(map(metadata => metadata.currentPage));
    this.hearingTypes$ = this.store.select(getReferenceDataHearingTypes);
    this.defaultFilters$ = combineLatest([this.route.params, this.route.queryParams]).pipe(
      withLatestFrom(this.store),
      map(([[params, queryParams], state]) => {
        const { courtId, isUnscheduled } = queryParams;
        const organisationUnits = getOrganisationUnits(state);
        const hearing = getHearingById(params.id)(state);
        const courtCentreId = courtId;
        const organisationUnit = organisationUnits.find(ou => ou.id === courtCentreId);

        const courtRoomId =
          hearing.courtCentreId === courtCentreId ? hearing.courtRoomId : undefined;

        const today = moment().format('YYYY-MM-DD');
        const hearingStart = moment(hearing.startDate).format('YYYY-MM-DD');
        const sessionStartDate = isUnscheduled
          ? today
          : hearingStart >= today
            ? hearing.startDate
            : today;

        const hearingTypes = getReferenceDataHearingTypes(state);
        const hearingType = hearingTypes.find(t => t.id === hearing?.type?.id);

        const SINGLE_DAY_MAX_MINUTES = 360;
        const mins = hearing.estimatedMinutes;
        const isMultiday = mins > SINGLE_DAY_MAX_MINUTES;
        const isDurationExact = mins % SINGLE_DAY_MAX_MINUTES === 0;
        const schedulingDefaults: Partial<CrownSchedulingFilters> = {
          isSlotBased: false,
          isMultiday,
          ...((!isMultiday || isDurationExact) && { availableDurationMins: mins })
        };

        return {
          courtRoomId,
          organisationUnit,
          sessionStartDate,
          ...(!isUnscheduled && {
            sessionEndDate: moment(sessionStartDate)
              .add(3, 'months')
              .subtract(1, 'day')
              .format('YYYY-MM-DD')
          }),
          panel: 'ADULT,YOUTH',
          hearingType,
          ...schedulingDefaults
        } as Partial<CrownSchedulingFilters>;
      })
    );

    this.filters$ = combineLatest([
      this.store.pipe(select(getSearchParams)),
      this.route.params
    ]).pipe(
      switchMap(([filters, routeParams]) => {
        if (filters) {
          return this.store.pipe(
            take(1),
            map(state => {
              const params = filters as SearchHearingSlotsParams;
              const hearing = getHearingById(routeParams['id'])(state);
              const hearingTypes = getReferenceDataHearingTypes(state);
              const hearingType = hearingTypes.find(t => t.id === hearing?.type?.id);
              return {
                ...params,
                organisationUnit: getOrganisationUnits(state).find(
                  organisationUnit => organisationUnit.oucode === params.ouCode
                ),
                sessionStatusFilter: sessionFilterFromParams({
                  courtRoomId: params.courtRoomId,
                  status: params.status
                }),
                hearingType
              };
            })
          );
        }
        return this.defaultFilters$;
      })
    );
    this.organisationUnits$ = this.store.pipe(select(getOrganisationUnits));
    this.pageSize$ = metadata$.pipe(map(metadata => metadata.pageSize));
    this.rotaBusinessTypes$ = this.store.pipe(select(getRotaBusinessTypesByJurisdiction('CROWN')));
    this.searchResult$ = this.store.pipe(select(getSearchResults));
    this.totalResults$ = metadata$.pipe(map(metadata => metadata.totalResults));
  }

  handleFiltersSubmit({
    organisationUnit,
    sessionStatusFilter,

    ...filters
  }: CrownSchedulingFilters) {
    this.reloadWithQueryParams({
      ...filters,
      sessionEndDate:
        filters.sessionEndDate ||
        moment(filters.sessionStartDate).add(3, 'months').subtract(1, 'day').format('YYYY-MM-DD'),
      ouCode: organisationUnit ? organisationUnit.oucode : undefined,
      pageNumber: 1,
      panel: 'ADULT,YOUTH'
    } as SearchHearingSlotsParams);
  }

  handlePageChange(pageNumber: number) {
    this.store
      .pipe(
        select(getSearchParams),
        take(1),
        map(params => ({ ...params, pageNumber }))
      )
      .subscribe(queryParams => {
        this.reloadWithQueryParams(queryParams as SearchHearingSlotsParams);
      });
  }

  handleHearingSlotsCancel() {
    const { referrer, isUnscheduled } = this.route.snapshot.queryParams;
    referrer === 'CALENDAR'
      ? this.router.navigate(['/court-calendar'])
      : this.router.navigate(isUnscheduled ? ['/unscheduled'] : ['/unallocated']);
  }

  handleSubmitHearingSlotAllocations(allocateHearingParams: AllocateHearingParams) {
    if (this.route.snapshot?.queryParams?.referrer === 'CALENDAR') {
      this.store.dispatch(
        allocateSelectedHearingSlots({
          hearingSlotAllocations: allocateHearingParams.hearingSlotAllocations,
          sendNotificationToParties: allocateHearingParams.sendNotificationToParties,
          hearingType: allocateHearingParams.hearingType
            ? {
                id: allocateHearingParams.hearingType.id,
                description: allocateHearingParams.hearingType.hearingDescription
              }
            : undefined
        })
      );
      return;
    }

    this.filters$.pipe(take(1)).subscribe(search => {
      const payload = buildSlotAllocatePayload({
        submit: allocateHearingParams,
        hearingId: this.route.snapshot.params.id,
        queryParams: this.route.snapshot.queryParams,
        filters: filtersForCrownAllocateSearch(search)
      });
      this.store.dispatch(AllocationActions.allocateHearing(payload));
    });
  }

  reloadWithQueryParams(params: Omit<SearchHearingSlotsParams, 'jurisdiction'>) {
    const searchParams: SearchHearingSlotsParams = { ...params, jurisdiction: 'CROWN' };
    this.router.navigate(['.'], {
      relativeTo: this.route,
      fragment: '_',
      queryParams: {
        mf: JSON.stringify(searchParams),
        ...(this.route.snapshot.queryParams.isUnscheduled ? { isUnscheduled: true } : {})
      } as MagistratesSchedulingQueryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}
