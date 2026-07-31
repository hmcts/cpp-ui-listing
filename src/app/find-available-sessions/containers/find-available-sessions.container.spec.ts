import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FindAvailableSessionsContainer } from './find-available-sessions.container';
import { provideStore, Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { AppState, reducers } from '../../core';
import {
  HearingSlot,
  loadHearingSlotsSuccess,
  SchedulingFilters,
  SchedulingFiltersComponent,
  SchedulingSlotsComponent,
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
    oucodeL2Code: '1',
    oucodeL3Code: 'OUCODEL32',
    courtSession: 'AM',
    sessionStartDate: '2019-01-01',
    sessionEndDate: '2019-01-31',
    panel: 'ADULT',
    businessType: 'HEARINGTYPE002'
  };

  beforeEach(() => {
    activatedRoute = new ActivatedRoute();
    activatedRoute = {
      params: of({ id: 'HEARING1' }),
      snapshot: {
        params: { id: 'HEARING1' },
        queryParams: {
          isUnscheduled: false
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
        imports: [SchedulingFiltersComponent, SchedulingSlotsComponent]
      },
      add: {
        imports: [SchedulingFiltersComponentMock, SchedulingSlotsComponentMock]
      }
    });

    fixture = TestBed.createComponent(FindAvailableSessionsContainer);
    router = TestBed.inject<Router>(Router);
    store = TestBed.inject<Store<AppState>>(Store);

    store.dispatch(
      ReferenceDataActions.loadOrganisationUnitsSuccess({
        organisationUnits: [
          {
            id: 'COURT001',
            oucodeL2Code: '3',
            oucodeL2Name: 'OUL2 Z',
            oucodeL3Code: 'OUCODEL31',
            oucodeL3Name: 'A'
          },
          {
            id: 'COURT002',
            oucodeL2Code: '1',
            oucodeL2Name: 'OUL2 X',
            oucodeL3Code: 'OUCODEL32',
            oucodeL3Name: 'B'
          },
          {
            id: 'COURT003',
            oucodeL2Code: '1',
            oucodeL2Name: 'OUL2 X',
            oucodeL3Code: 'OUCODEL33',
            oucodeL3Name: 'C'
          },
          {
            id: 'COURT004',
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

    fixture.detectChanges();
  });

  it('should compile correctly', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should handle submitting the form filters', () => {
    const filters = { courtRoomId: '*', sessionStartDate: '2019-01-01' } as SchedulingFilters;
    fixture.debugElement
      .query(By.directive(SchedulingFiltersComponentMock))
      .componentInstance.filtersSubmit.emit(filters);

    expect(router.navigate).toHaveBeenCalledWith(['.'], {
      relativeTo: activatedRoute,
      fragment: '_',
      queryParams: {
        mf: JSON.stringify({ ...filters, sessionEndDate: '2019-02-11', pageNumber: 1 })
      },
      queryParamsHandling: 'merge'
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
      queryParamsHandling: 'merge'
    });
  });

  @Component({
    selector: 'scheduling-filters',
    template: `
      <form (ngSubmit)="filtersSubmit.emit(filters)">
        <div>{{ defaultValues() }}</div>
        <button type="submit">Submit</button>
      </form>
    `
  })
  class SchedulingFiltersComponentMock {
    readonly defaultValues = input<SchedulingFilters>(undefined);
    readonly organisationUnits = input<OrganisationUnit[]>([]);
    readonly rotaBusinessTypes = input<RotaBusinessType[]>([]);
    readonly errors = output<ValidationError[] | null>();
    readonly filtersSubmit = output<SchedulingFilters>();
  }

  @Component({
    selector: 'scheduling-slots',
    imports: [PdkPaginationComponent],
    template: `
      <div>{{ hearingSlots() }}</div>
      <pdk-pagination
        [currentPage]="currentPage()"
        [totalResults]="totalResults()"
        [pageSize]="pageSize()"
        [maxPages]="maxPages()"
        (pageChange)="pageChange.emit($event)"
      />
    `
  })
  class SchedulingSlotsComponentMock {
    readonly selectionMode = input('readonly');
    readonly currentPage = input(1);
    readonly totalResults = input(-1);
    readonly pageSize = input(10);
    readonly maxPages = input(9);
    readonly hearingSlots = input<HearingSlot[]>([]);
    readonly rotaBusinessTypes = input<RotaBusinessType[]>([]);
    readonly pageChange = output<number>();
    readonly errors = output<ValidationError[]>();
  }
});
