import { JsonPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FindAvailableSessionsContainer } from './find-available-sessions.container';
import { provideStore, Store } from '@ngrx/store';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { AppState, reducers } from '../../core';
import {
  HearingSlot,
  loadHearingSlotsSuccess,
  MagistratesSchedulingFilters,
  MagistratesSchedulingFiltersComponent,
  MagistratesSchedulingSlotsComponent,
  SearchHearingSlotsParams
} from '@cpp/scheduling';
import {
  LocalJusticeArea,
  OrganisationUnit,
  ReferenceDataActions,
  RotaBusinessType
} from '@cpp/reference-data';
import { PdkPaginationComponent, ValidationError } from '@cpp/pdk';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { FindAvailableSessionsQueryParams } from '../guards/find-available-sessions.guard';
import { AppConfigService } from '../../config';
import { Component, input, output } from '@angular/core';

describe('FindAvailableSessionsContainer', () => {
  let activatedRoute;
  let fixture: ComponentFixture<FindAvailableSessionsContainer>;
  let router: Router;
  let store: Store<AppState>;

  const searchParams: SearchHearingSlotsParams = {
    ouCode: 'OUCODEL34',
    oucodeL2Code: '2',
    oucodeL3Code: 'OUCODEL34',
    courtSession: 'AM',
    sessionStartDate: '2019-01-01',
    sessionEndDate: '2019-01-31',
    panel: 'ADULT',
    businessType: 'HEARINGTYPE002',
    jurisdiction: 'MAGISTRATES'
  };

  beforeEach(() => {
    activatedRoute = new ActivatedRoute();
    activatedRoute = {
      params: of({ id: 'HEARING1' }),
      queryParamMap: of(
        convertToParamMap({
          courtId: 'COURT004',
          jurisdictionType: 'MAGISTRATES'
        })
      ),
      snapshot: {
        params: { id: 'HEARING1' },
        queryParams: {
          courtId: 'COURT004',
          jurisdictionType: 'MAGISTRATES'
        }
      }
    };

    TestBed.configureTestingModule({
      providers: [
        provideStore(reducers, { runtimeChecks: {} }),
        {
          provide: ActivatedRoute,
          useValue: activatedRoute
        },
        {
          provide: Router,
          useValue: {
            navigate: jest.fn()
          }
        },
        { provide: AppConfigService, useValue: { getBaseUrl: jest.fn() } }
      ],
      teardown: { destroyAfterEach: false }
    }).overrideComponent(FindAvailableSessionsContainer, {
      remove: {
        imports: [MagistratesSchedulingFiltersComponent, MagistratesSchedulingSlotsComponent]
      },
      add: {
        imports: [
          MagistratesSchedulingFiltersComponentMock,
          MagistratesSchedulingSlotsComponentMock
        ]
      }
    });

    router = TestBed.inject<Router>(Router);
    store = TestBed.inject<Store<AppState>>(Store);

    store.dispatch(
      ReferenceDataActions.loadOrganisationUnitsSuccess({
        organisationUnits: [
          {
            id: 'COURT004',
            oucode: 'OUCODEL34',
            oucodeL1Code: 'B',
            oucodeL2Code: '2',
            oucodeL2Name: 'ouL2 Y',
            oucodeL3Code: 'OUCODEL34',
            oucodeL3Name: 'D'
          }
        ] as OrganisationUnit[]
      })
    );

    store.dispatch(
      ReferenceDataActions.loadRotaBusinessTypesSuccess({
        rotaBusinessTypes: [
          { id: 'RBT001', typeCode: 'DVLA', typeDescription: 'DVLA' },
          { id: 'RBT002', typeCode: 'TFL', typeDescription: 'TFL' }
        ] as RotaBusinessType[]
      })
    );

    store.dispatch(
      ReferenceDataActions.loadLocalJusticeAreasSuccess({
        localJusticeAreas: [
          { clusterCode: 'RBT001', name: 'Wales' },
          { clusterCode: 'RBT002', name: 'L & C' }
        ] as LocalJusticeArea[]
      })
    );

    store.dispatch(
      loadHearingSlotsSuccess({
        hearingSlots: [{ courtScheduleId: '*' } as HearingSlot],
        totalResults: 25,
        params: {
          ...searchParams,
          pageSize: 10,
          pageNumber: 2
        }
      })
    );

    router.navigate = jest.fn();
    jest.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(FindAvailableSessionsContainer);
    fixture.detectChanges();
  });

  it('should compile correctly', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should handle submitting the form filters', () => {
    const filters = {
      courtRoomId: '*',
      sessionStartDate: '2019-01-01'
    } as MagistratesSchedulingFilters;
    fixture.debugElement
      .query(By.directive(MagistratesSchedulingFiltersComponentMock))
      .componentInstance.filtersSubmit.emit(filters);

    expect(router.navigate).toHaveBeenCalledWith(['.'], {
      relativeTo: activatedRoute,
      fragment: '_',
      queryParams: {
        mf: JSON.stringify({
          ...filters,
          sessionEndDate: '2019-02-11',
          pageNumber: 1,
          jurisdiction: 'MAGISTRATES'
        })
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  });

  it('should handle paginating the form filters', () => {
    fixture.componentInstance.handlePageChange(2);

    expect(router.navigate).toHaveBeenCalledWith(['.'], {
      relativeTo: activatedRoute,
      fragment: '_',
      queryParams: {
        mf: JSON.stringify({ ...searchParams, pageNumber: 2 })
      } as FindAvailableSessionsQueryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  });

  @Component({
    selector: 'magistrates-scheduling-filters',
    template: `
      <form (ngSubmit)="filtersSubmit.emit(filters)">
        <div>{{ defaultValues() | json }}</div>
        <button type="submit">Submit</button>
      </form>
    `,
    imports: [JsonPipe]
  })
  class MagistratesSchedulingFiltersComponentMock {
    readonly defaultValues = input<MagistratesSchedulingFilters | null>(null);
    readonly organisationUnits = input<OrganisationUnit[]>([]);
    readonly rotaBusinessTypes = input<RotaBusinessType[]>([]);
    readonly errors = output<ValidationError[] | null>();
    readonly filtersSubmit = output<MagistratesSchedulingFilters>();
    readonly filters = {} as MagistratesSchedulingFilters;
  }

  @Component({
    selector: 'magistrates-scheduling-slots',
    imports: [PdkPaginationComponent],
    template: `
      <div>{{ hearingSlots() }}</div>
      <pdk-pagination
        [currentPage]="currentPage()"
        [totalResults]="totalResults()"
        [pageSize]="pageSize()"
        (pageChange)="pageChange.emit($event)"
      />
    `
  })
  class MagistratesSchedulingSlotsComponentMock {
    readonly selectionMode = input('readonly');
    readonly currentPage = input(1);
    readonly totalResults = input(-1);
    readonly pageSize = input(10);
    readonly hearingSlots = input<HearingSlot[]>([]);
    readonly rotaBusinessTypes = input<RotaBusinessType[]>([]);
    readonly pageChange = output<number>();
    readonly errors = output<ValidationError[]>();
  }
});
