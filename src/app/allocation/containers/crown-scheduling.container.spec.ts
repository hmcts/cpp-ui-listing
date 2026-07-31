import { JsonPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
  HearingType,
  OrganisationUnit,
  ReferenceDataActions,
  RotaBusinessType,
  RotaBusinessTypeCode
} from '@cpp/reference-data';
import { provideStore, Store } from '@ngrx/store';
import { firstValueFrom, of } from 'rxjs';
import { AppState, Hearing, ListUnallocatedHearingsSuccessAction, reducers } from '../../core';
import {
  CrownSchedulingFilters,
  HearingSlot,
  HearingSlotAllocation,
  loadHearingSlotsSuccess,
  SearchHearingSlotsParams
} from '@cpp/scheduling';
import { CrownSchedulingContainer } from './crown-scheduling.container';
import { UnallocatedHearings } from '../../core/model/hearing';
import { allocateHearing } from '../actions/allocation.actions';
import { CrownSchedulingComponent } from '../components/crown-scheduling.component';
import { filtersForCrownAllocateSearch } from '../utils/allocate-slot-payload';

describe('CrownSchedulingContainer', () => {
  let activatedRoute: ActivatedRoute;
  let fixture: ComponentFixture<CrownSchedulingContainer>;
  let router: Router;
  let store: Store<AppState>;

  const searchParams: SearchHearingSlotsParams = {
    oucodeL2Code: '1',
    oucodeL3Code: 'OUCODEL32',
    courtSession: 'AM',
    sessionStartDate: '2019-01-01',
    sessionEndDate: '2019-03-31',
    panel: 'ADULT,YOUTH',
    businessType: 'HEARINGTYPE002',
    jurisdiction: 'CROWN'
  };

  const crownRotaType: RotaBusinessType = {
    id: 'RBT001',
    seqNum: 1,
    typeCode: RotaBusinessTypeCode.crownCourt,
    typeDescription: 'Crown Court',
    slot: true,
    duration: true,
    jurisdiction: 'CROWN'
  };

  const organisationUnitsFixture = [
    {
      id: 'COURT004',
      oucode: 'OUCODEL34',
      oucodeL2Code: '2',
      oucodeL2Name: 'ouL2 Y',
      oucodeL3Code: 'OUCODEL34',
      oucodeL3Name: 'D'
    }
  ] as OrganisationUnit[];

  const mockHearing: Hearing = {
    id: 'HEARING1',
    startDate: '2019-01-01',
    courtCentreId: 'COURT004',
    courtRoomId: 'C1',
    type: { id: 'HT1' },
    jurisdictionType: 'CROWN',
    estimatedMinutes: 60
  } as Hearing;

  beforeEach(() => {
    activatedRoute = {
      params: of({ id: 'HEARING1' }),
      queryParams: of({ isUnscheduled: false, courtId: 'COURT004' }),
      snapshot: {
        params: { id: 'HEARING1' },
        queryParams: {
          isUnscheduled: false,
          courtId: 'COURT004'
        }
      }
    } as unknown as ActivatedRoute;

    TestBed.configureTestingModule({
      providers: [
        provideStore(reducers, { runtimeChecks: {} }),
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: Router, useValue: { navigate: jest.fn() } }
      ],
      teardown: { destroyAfterEach: false }
    }).overrideComponent(CrownSchedulingContainer, {
      remove: { imports: [CrownSchedulingComponent] },
      add: { imports: [MockCrownSchedulingComponent] }
    });

    fixture = TestBed.createComponent(CrownSchedulingContainer);
    router = TestBed.inject<Router>(Router);
    store = TestBed.inject<Store<AppState>>(Store);

    store.dispatch(
      new ListUnallocatedHearingsSuccessAction({ hearings: [mockHearing] } as UnallocatedHearings)
    );

    store.dispatch(
      ReferenceDataActions.loadOrganisationUnitsSuccess({
        organisationUnits: organisationUnitsFixture
      })
    );

    store.dispatch(
      ReferenceDataActions.loadHearingTypesSuccess({
        hearingTypes: [
          {
            id: 'HT1',
            hearingCode: 'TRI',
            seqId: 1,
            defaultDurationMin: 60,
            welshHearingDescription: '',
            hearingDescription: 'Trial',
            magistratesFlag: false,
            crownFlag: true
          }
        ] as HearingType[]
      })
    );

    store.dispatch(
      ReferenceDataActions.loadRotaBusinessTypesSuccess({
        rotaBusinessTypes: [crownRotaType]
      })
    );

    store.dispatch(
      loadHearingSlotsSuccess({
        hearingSlots: [{ courtScheduleId: '*' } as HearingSlot],
        totalResults: 12,
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

  it('should prepopulate the start date from the store search params', () => {
    const scheduling = fixture.debugElement.query(By.css('crown-scheduling'));
    expect(scheduling.componentInstance.filters().sessionStartDate).toBe('2019-01-01');
  });

  it('should handle submitting the form filters', () => {
    const filters = {
      courtRoomId: '*',
      sessionStartDate: '2019-01-01',
      organisationUnit: {
        oucode: 'OUCODEL32'
      } as OrganisationUnit,
      sessionStatusFilter: { courtRoomId: undefined, status: undefined }
    } as unknown as CrownSchedulingFilters;

    const scheduling = fixture.debugElement.query(By.css('crown-scheduling'));
    scheduling.componentInstance.filtersSubmit.emit(filters);

    const mf = (router.navigate as jest.Mock).mock.calls[0][1].queryParams.mf;
    expect(JSON.parse(mf).jurisdiction).toBe('CROWN');

    expect(router.navigate).toHaveBeenCalledWith(['.'], {
      relativeTo: activatedRoute,
      fragment: '_',
      queryParams: {
        mf: JSON.stringify({
          courtRoomId: '*',
          sessionStartDate: '2019-01-01',
          sessionEndDate: '2019-03-31',
          ouCode: 'OUCODEL32',
          pageNumber: 1,
          panel: 'ADULT,YOUTH',
          jurisdiction: 'CROWN'
        })
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  });

  it('should handle paginating the form filters', fakeAsync(() => {
    const scheduling = fixture.debugElement.query(By.css('crown-scheduling'));
    scheduling.componentInstance.pageChange.emit(2);
    tick(1);

    const mf = (router.navigate as jest.Mock).mock.calls[0][1].queryParams.mf;
    expect(JSON.parse(mf).jurisdiction).toBe('CROWN');

    expect(router.navigate).toHaveBeenCalledWith(['.'], {
      relativeTo: activatedRoute,
      fragment: '_',
      queryParams: {
        mf: JSON.stringify({ ...searchParams, pageNumber: 2 })
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }));

  describe('defaultFilters$', () => {
    async function defaultFiltersForHearing(estimatedMinutes: number) {
      activatedRoute.queryParams = of({ courtId: 'COURT004' });
      store.dispatch(
        new ListUnallocatedHearingsSuccessAction({
          hearings: [{ ...mockHearing, estimatedMinutes }]
        } as UnallocatedHearings)
      );
      return firstValueFrom(fixture.componentInstance.defaultFilters$);
    }

    it.each([
      [240, false, 240],
      [720, true, 720],
      [500, true, undefined]
    ])(
      'should compute duration defaults for %i mins',
      async (mins, isMultiday, availableDurationMins) => {
        const filters = await defaultFiltersForHearing(mins);
        expect(filters.isSlotBased).toBe(false);
        expect(filters.isMultiday).toBe(isMultiday);
        expect(filters.availableDurationMins).toBe(availableDurationMins);
      }
    );
  });

  it('should handle submitting hearing slot allocations', () => {
    const scheduling = fixture.debugElement.query(By.css('crown-scheduling'));
    const hearingSlotAllocations = [
      {
        hearingSlotTime: new Date().toISOString(),
        hearingSlot: { courtScheduleId: '*' }
      }
    ] as HearingSlotAllocation[];

    scheduling.componentInstance.hearingSlotAllocationsSubmit.emit({ hearingSlotAllocations });

    expect(store.dispatch).toHaveBeenCalledWith(
      allocateHearing({
        hearingId: 'HEARING1',
        hearingSlotAllocations,
        filters: filtersForCrownAllocateSearch(searchParams),
        redirectTo: ['/unallocated'],
        sendNotificationToParties: false
      })
    );
  });
});

@Component({
  selector: 'crown-scheduling',
  template: `
    currentPage: {{ currentPage() }}<br />
    filters: {{ filters() | json }}<br />
    hearingSlots: {{ hearingSlots() | json }}<br />
    hearingTypes: {{ hearingTypes() | json }}<br />
    organisationUnits: {{ organisationUnits() | json }}<br />
    pageSize: {{ pageSize() }}<br />
    rotaBusinessTypes: {{ rotaBusinessTypes() | json }}<br />
    totalResults: {{ totalResults() }}
  `,
  imports: [JsonPipe]
})
class MockCrownSchedulingComponent {
  readonly currentPage = input(0);
  readonly filters = input<Partial<CrownSchedulingFilters>>(undefined);
  readonly hearingTypes = input<HearingType[]>([]);
  readonly hearingSlots = input<HearingSlot[]>([]);
  readonly organisationUnits = input<OrganisationUnit[]>([]);
  readonly pageSize = input(10);
  readonly rotaBusinessTypes = input<RotaBusinessType[]>([]);
  readonly totalResults = input(-1);
  readonly filtersSubmit = output<CrownSchedulingFilters>();
  readonly hearingSlotsCancel = output<unknown>();
  readonly hearingSlotAllocationsSubmit = output<{
    hearingSlotAllocations: HearingSlotAllocation[];
  }>();
  readonly pageChange = output<number>();
}
