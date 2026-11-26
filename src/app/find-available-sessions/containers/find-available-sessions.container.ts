import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
  ValidationError,
  PdkGridComponent,
  PdkGridDirective,
  PdkMarginDirective,
  PdkErrorSummaryComponent,
  PdkTypographyDirective,
  PdkPaddingDirective,
  PdkInsetTextComponent,
  PdkBackLinkComponent,
  PdkBackLinkDirective
} from '@cpp/pdk';
import {
  getOrganisationUnits,
  getRotaBusinessTypes,
  getRotaBusinessTypesByJurisdiction,
  HearingType,
  OrganisationUnit,
  RotaBusinessType
} from '@cpp/reference-data';
import { select, Store } from '@ngrx/store';
import { forkJoin, Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import {
  CrownSchedulingFilters,
  CrownSchedulingFiltersComponent,
  CrownSchedulingSlotsComponent,
  CrownSessionStatus,
  getSearchMetadata,
  getSearchParams,
  getSearchResults,
  isCrownCourt,
  MagistratesSchedulingFilters,
  MagistratesSchedulingFiltersComponent,
  MagistratesSchedulingSlotsComponent,
  SearchHearingSlotsParams,
  sessionFilterFromParams
} from '@cpp/scheduling';
import { FindAvailableSessionsQueryParams } from '../guards/find-available-sessions.guard';
import { Breadcrumb } from '../../core/model/shared/breadcrumb';
import { AppConfigService } from '../../config';
import { AppState } from '../../core';
import moment from 'moment';
import { NgTemplateOutlet } from '@angular/common';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs/breadcrumbs.component';
import { SelectJurisdictionComponent } from '../components/select-jurisdiction/select-jurisdiction.component';

interface CourtQueryParams {
  courtId: string | null;
  jurisdictionType: string | null;
}

const DEFAULT_COURT_QUERY_PARAMS: CourtQueryParams = {
  courtId: null,
  jurisdictionType: null
};

const courtQueryParamsFromMap = (param: ParamMap): CourtQueryParams => ({
  courtId: param.get('courtId'),
  jurisdictionType: param.get('jurisdictionType')
});

@Component({
  selector: 'find-available-sessions-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './find-available-sessions.container.html',
  imports: [
    PdkGridComponent,
    PdkGridDirective,
    PdkMarginDirective,
    BreadcrumbsComponent,
    PdkErrorSummaryComponent,
    PdkTypographyDirective,
    PdkPaddingDirective,
    MagistratesSchedulingFiltersComponent,
    CrownSchedulingFiltersComponent,
    PdkInsetTextComponent,
    MagistratesSchedulingSlotsComponent,
    CrownSchedulingSlotsComponent,
    SelectJurisdictionComponent,
    PdkBackLinkComponent,
    PdkBackLinkDirective,
    NgTemplateOutlet
  ]
})
export class FindAvailableSessionsContainer {
  private readonly store = inject(Store<AppState>);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly appConfig = inject(AppConfigService);

  readonly CrownSessionStatus = CrownSessionStatus;

  readonly hearingTypePlaceholder: HearingType = {
    id: 'All',
    hearingCode: 'All',
    seqId: 0,
    defaultDurationMin: 0,
    welshHearingDescription: '',
    hearingDescription: 'All hearing types',
    magistratesFlag: true,
    crownFlag: true
  };

  readonly breadcrumbs: Breadcrumb[] = [
    { title: 'Home', href: this.appConfig.getBaseUrl() },
    { title: 'Find available sessions' }
  ];

  readonly errors = signal<ValidationError[]>([]);

  private readonly courtQueryParams = toSignal(
    this.route.queryParamMap.pipe(map(courtQueryParamsFromMap)),
    { initialValue: DEFAULT_COURT_QUERY_PARAMS }
  );

  readonly organisationUnits = toSignal(this.store.select(getOrganisationUnits), {
    initialValue: [] as OrganisationUnit[]
  });

  readonly showCourtSelection = computed(() => {
    const { courtId, jurisdictionType } = this.courtQueryParams();
    const organisationUnits = this.organisationUnits();
    if (!courtId || !jurisdictionType) {
      return true;
    }
    return !organisationUnits.some(ou => ou.id === courtId);
  });

  readonly jurisdictionType = computed(() => this.courtQueryParams().jurisdictionType);

  private readonly metadata$ = this.store.pipe(select(getSearchMetadata));

  private readonly defaultFilters$: Observable<
    Partial<MagistratesSchedulingFilters> | Partial<CrownSchedulingFilters>
  > = this.route.queryParamMap.pipe(
    switchMap(paramMap =>
      this.store.pipe(
        take(1),
        map(state => {
          const { courtId, jurisdictionType } = courtQueryParamsFromMap(paramMap);
          const organisationUnits = getOrganisationUnits(state);
          const organisationUnit = organisationUnits.find(ou => ou.id === courtId);
          const today = moment().format('YYYY-MM-DD');
          if (jurisdictionType === 'CROWN') {
            return {
              organisationUnit,
              sessionStartDate: today,
              sessionEndDate: moment(today)
                .add(3, 'months')
                .subtract(1, 'day')
                .format('YYYY-MM-DD'),
              panel: 'ADULT,YOUTH'
            } as Partial<CrownSchedulingFilters>;
          }
          return {
            organisationUnit,
            sessionStartDate: today,
            sessionEndDate: moment(today).add(6, 'weeks').subtract(1, 'day').format('YYYY-MM-DD'),
            hearingType: this.hearingTypePlaceholder
          } as Partial<MagistratesSchedulingFilters>;
        })
      )
    )
  );

  private readonly schedulingFilters$: Observable<
    Partial<MagistratesSchedulingFilters> | Partial<CrownSchedulingFilters> | null
  > = this.store.pipe(
    select(getSearchParams),
    switchMap(filters => {
      if (filters) {
        return forkJoin({
          state: this.store.pipe(take(1)),
          paramMap: this.route.queryParamMap.pipe(take(1))
        }).pipe(
          map(({ state, paramMap }) => {
            const { jurisdictionType } = courtQueryParamsFromMap(paramMap);
            const params = filters as SearchHearingSlotsParams;
            if (jurisdictionType === 'CROWN') {
              return {
                ...params,
                organisationUnit: getOrganisationUnits(state).find(
                  ou => ou.oucode === params.ouCode
                ),
                sessionStatusFilter: sessionFilterFromParams({
                  courtRoomId: params.courtRoomId,
                  status: params.status
                })
              } as Partial<CrownSchedulingFilters>;
            }
            const { oucodeL3Code: _omitL3, ...rest } = params;
            return {
              ...rest,
              hearingType: this.hearingTypePlaceholder,
              organisationUnit: getOrganisationUnits(state).find(ou => ou.oucode === params.ouCode)
            } as Partial<MagistratesSchedulingFilters>;
          })
        );
      }
      return this.defaultFilters$;
    })
  );

  readonly filters = toSignal(this.schedulingFilters$, { initialValue: null });

  readonly searchResult = toSignal(this.store.select(getSearchResults), { initialValue: null });

  readonly pageSize = toSignal(this.metadata$.pipe(map(m => m.pageSize)), { initialValue: 10 });

  readonly currentPage = toSignal(this.metadata$.pipe(map(m => m.currentPage)), {
    initialValue: 1
  });

  readonly totalResults = toSignal(this.metadata$.pipe(map(m => m.totalResults)), {
    initialValue: -1
  });

  readonly rotaBusinessTypes = toSignal(
    this.route.queryParamMap.pipe(
      switchMap(paramMap =>
        courtQueryParamsFromMap(paramMap).jurisdictionType === 'CROWN'
          ? this.store.select(getRotaBusinessTypesByJurisdiction('CROWN'))
          : this.store.select(getRotaBusinessTypes)
      )
    ),
    { initialValue: [] as RotaBusinessType[] }
  );

  handleMagistratesFiltersSubmit({ organisationUnit, ...filters }: MagistratesSchedulingFilters) {
    this.reloadWithQueryParams({
      ...filters,
      sessionEndDate:
        filters.sessionEndDate ||
        moment(filters.sessionStartDate).add(6, 'weeks').subtract(1, 'day').format('YYYY-MM-DD'),
      ouCode: organisationUnit?.oucode,
      pageNumber: 1,
      jurisdiction: 'MAGISTRATES'
    } as SearchHearingSlotsParams);
  }

  handleCrownFiltersSubmit({
    organisationUnit,
    sessionStatusFilter: _sessionStatusFilter,
    ...filters
  }: CrownSchedulingFilters) {
    this.reloadWithQueryParams({
      ...filters,
      sessionEndDate:
        filters.sessionEndDate ||
        moment(filters.sessionStartDate).add(3, 'months').subtract(1, 'day').format('YYYY-MM-DD'),
      ouCode: organisationUnit?.oucode,
      pageNumber: 1,
      panel: 'ADULT,YOUTH',
      jurisdiction: 'CROWN'
    } as SearchHearingSlotsParams);
  }

  onCourtSelected(organisationUnit: OrganisationUnit) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        courtId: organisationUnit.id,
        jurisdictionType: isCrownCourt(organisationUnit) ? 'CROWN' : 'MAGISTRATES',
        mf: undefined
      },
      queryParamsHandling: 'merge'
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

  reloadWithQueryParams(params: SearchHearingSlotsParams) {
    this.router.navigate(['.'], {
      relativeTo: this.route,
      fragment: '_',
      queryParams: {
        mf: JSON.stringify(params),
        ...(this.route.snapshot.queryParams.isUnscheduled ? { isUnscheduled: true } : {})
      } as FindAvailableSessionsQueryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  showValidationError(errors: ValidationError[] | null | undefined) {
    this.errors.set(errors ?? []);
  }

  backToJurisdictionSelection(): void {
    this.errors.set([]);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        courtId: undefined,
        jurisdictionType: undefined,
        mf: undefined
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}
