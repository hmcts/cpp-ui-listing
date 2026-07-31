import { JsonPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LocalJusticeArea,
  OrganisationUnit,
  ReferenceDataActions,
  RotaBusinessType
} from '@cpp/reference-data';
import { provideStore, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { AppState, Hearing, ListUnallocatedHearingsSuccessAction, reducers } from '../../core';
import {
  HearingSlot,
  HearingSlotAllocation,
  loadHearingSlotsSuccess,
  SearchHearingSlotsParams,
  SchedulingFilters
} from '@cpp/scheduling';
import { MagistratesSchedulingContainerComponent } from './magistrates.container';
import { UnallocatedHearings } from '../../core/model/hearing';
import { allocateMagistratesHearing } from '../actions/allocation.actions';
import { MagistratesSchedulingComponent } from '../components/magistrates.component';

describe('MagistratesSchedulingContainerComponent', () => {
  let activatedRoute;
  let fixture: ComponentFixture<MagistratesSchedulingContainerComponent>;
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
          isUnscheduled: false,
          courtId: 'COURT004'
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
        }
      ],
      teardown: { destroyAfterEach: false }
    }).overrideComponent(MagistratesSchedulingContainerComponent, {
      remove: {
        imports: [MagistratesSchedulingComponent]
      },
      add: {
        imports: [MockMagistratesSchedulingComponent]
      }
    });

    fixture = TestBed.createComponent(MagistratesSchedulingContainerComponent);
    router = TestBed.inject<Router>(Router);
    store = TestBed.inject<Store<AppState>>(Store);

    store.dispatch(
      new ListUnallocatedHearingsSuccessAction({
        hearings: [
          {
            id: 'HEARING1',
            startDate: '2019-01-01',
            courtCentreId: 'COURT004',
            courtRoomId: 'C1'
          } as Hearing
        ]
      } as UnallocatedHearings)
    );

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
    const filters = {
      courtRoomId: '*',
      sessionStartDate: '2019-01-01'
    } as Partial<SchedulingFilters>;
    fixture.debugElement
      .query(By.directive(MockMagistratesSchedulingComponent))
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
    fixture.debugElement
      .query(By.directive(MockMagistratesSchedulingComponent))
      .componentInstance.pageChange.emit(2);

    expect(router.navigate).toHaveBeenCalledWith(['.'], {
      relativeTo: activatedRoute,
      fragment: '_',
      queryParams: {
        mf: JSON.stringify({ ...searchParams, pageNumber: 2 })
      },
      queryParamsHandling: 'merge'
    });
  });

  it('should handle submitting hearing slot allocations', () => {
    const child: MockMagistratesSchedulingComponent = fixture.debugElement.query(
      By.directive(MockMagistratesSchedulingComponent)
    ).componentInstance;
    const hearingSlotAllocations = [
      {
        hearingSlotTime: new Date().toISOString(),
        hearingSlot: {
          courtScheduleId: '*'
        }
      }
    ] as HearingSlotAllocation[];

    child.hearingSlotAllocationsSubmit.emit({ hearingSlotAllocations });

    expect(store.dispatch).toHaveBeenCalledWith(
      allocateMagistratesHearing({
        hearingId: 'HEARING1',
        hearingSlotAllocations,
        filters: {},
        redirectTo: ['/unallocated'],
        sendNotificationToParties: undefined
      })
    );
  });
});

@Component({
  selector: 'magistrates-scheduling',
  template: `
    currentPage: {{ currentPage() }}<br />
    defaultFilters: {{ defaultFilters() | json }}<br />
    filters: {{ filters() | json }}<br />
    hearingSlots: {{ hearingSlots() | json }}<br />
    organisationUnits: {{ organisationUnits() | json }}<br />
    pageSize: {{ pageSize() }}<br />
    rotaBusinessTypes: {{ rotaBusinessTypes() | json }}<br />
    totalResults: {{ totalResults() }}
  `,
  imports: [JsonPipe]
})
class MockMagistratesSchedulingComponent {
  readonly currentPage = input(0);
  readonly defaultFilters = input<Partial<SchedulingFilters>>(undefined);
  readonly filters = input<Partial<SchedulingFilters>>(undefined);
  readonly hearingSlots = input<HearingSlot[]>([]);
  readonly organisationUnits = input<OrganisationUnit[]>([]);
  readonly pageSize = input(10);
  readonly rotaBusinessTypes = input<RotaBusinessType[]>([]);
  readonly totalResults = input(-1);
  readonly filtersSubmit = output<Partial<SchedulingFilters>>();
  readonly hearingSlotsCancel = output<unknown>();
  readonly hearingSlotAllocationsSubmit = output<{
    hearingSlotAllocations: HearingSlotAllocation[];
  }>();
  readonly pageChange = output<number>();
}
