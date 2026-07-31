import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ValidationError,
  PdkGridComponent,
  PdkGridDirective,
  PdkMarginDirective,
  PdkErrorSummaryComponent,
  PdkTypographyDirective,
  PdkPaddingDirective,
  PdkInsetTextComponent
} from '@cpp/pdk';
import {
  getOrganisationUnits,
  getRotaBusinessTypes,
  HearingType,
  OrganisationUnit,
  RotaBusinessType
} from '@cpp/reference-data';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import {
  getSearchMetadata,
  getSearchParams,
  getSearchResults,
  HearingSlot,
  SchedulingFilters,
  SearchHearingSlotsParams,
  SchedulingFiltersComponent,
  SchedulingSlotsComponent
} from '@cpp/scheduling';
import { FindAvailableSessionsQueryParams } from '../guards/find-available-sessions.guard';
import { Breadcrumb } from '../../core/model/shared/breadcrumb';
import { AppConfigService } from '../../config';
import { AppState } from '../../core';
import moment from 'moment';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs/breadcrumbs.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'find-available-sessions-container',
  templateUrl: './find-available-sessions.container.html',
  imports: [
    PdkGridComponent,
    PdkGridDirective,
    PdkMarginDirective,
    BreadcrumbsComponent,
    PdkErrorSummaryComponent,
    PdkTypographyDirective,
    PdkPaddingDirective,
    SchedulingFiltersComponent,
    PdkInsetTextComponent,
    SchedulingSlotsComponent,
    AsyncPipe
  ]
})
export class FindAvailableSessionsContainer {
  currentPage$: Observable<number>;
  errors: ValidationError[];
  filters$: Observable<Partial<SchedulingFilters>>;
  searchResult$: Observable<HearingSlot[] | null>;
  organisationUnits$: Observable<OrganisationUnit[]>;
  pageSize$: Observable<number>;
  rotaBusinessTypes$: Observable<RotaBusinessType[]>;
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

  breadcrumbs: Breadcrumb[] = [
    { title: 'Home', href: this.appConfig.getBaseUrl() },
    { title: 'Find available sessions' }
  ];

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router,
    private appConfig: AppConfigService
  ) {
    const metadata$ = this.store.pipe(select(getSearchMetadata));
    this.currentPage$ = metadata$.pipe(map((metadata) => metadata.currentPage));

    this.filters$ = this.store.pipe(select(getSearchParams)).pipe(
      switchMap((filters) => {
        if (filters) {
          return this.store.pipe(
            take(1),
            map((state) => {
              const { oucodeL3Code, ...params } = filters as SearchHearingSlotsParams;
              let hearingType = this.hearingTypePlaceholder;

              return {
                ...params,
                hearingType,
                organisationUnit: getOrganisationUnits(state).find(
                  (organisationUnit) => organisationUnit.oucode === params.ouCode
                )
              };
            })
          );
        }
        return of(null);
      })
    );

    this.searchResult$ = this.store.pipe(select(getSearchResults));
    this.organisationUnits$ = this.store.pipe(select(getOrganisationUnits));
    this.pageSize$ = metadata$.pipe(map((metadata) => metadata.pageSize));
    this.rotaBusinessTypes$ = this.store.pipe(select(getRotaBusinessTypes));
    this.totalResults$ = metadata$.pipe(map((metadata) => metadata.totalResults));
  }

  handleFiltersSubmit({ organisationUnit, ...filters }: SchedulingFilters) {
    this.reloadWithQueryParams({
      ...filters,
      sessionEndDate:
        filters.sessionEndDate ||
        moment(filters.sessionStartDate).add(6, 'weeks').subtract(1, 'day').format('YYYY-MM-DD'),
      ouCode: organisationUnit ? organisationUnit.oucode : undefined,
      pageNumber: 1
    });
  }

  handlePageChange(pageNumber: number) {
    this.store
      .pipe(
        select(getSearchParams),
        take(1),
        map((params) => ({ ...params, pageNumber }))
      )
      .subscribe((queryParams) => {
        this.reloadWithQueryParams(queryParams);
      });
  }

  reloadWithQueryParams(params: SearchHearingSlotsParams) {
    this.router.navigate(['.'], {
      relativeTo: this.route,
      fragment: '_',
      queryParams: {
        mf: JSON.stringify(params),
        ...(this.route.snapshot.queryParams.isUnscheduled ? { isUnscheduled: true } : {})
      } as FindAvailableSessionsQueryParams,
      queryParamsHandling: 'merge'
    });
  }

  showValidationError(errors: ValidationError[]) {
    this.errors = errors;
  }
}
