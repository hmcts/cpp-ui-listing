import { PdkTabComponent } from '@cpp/pdk/tabs/tab.component';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { SearchAvailableHearingsAction } from '../core/actions';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { AppConfigService } from '../config';
import { validHearingMock1 } from '../../mock-data/test-fixtures';
import {
  AllocateHearingAction,
  AppState,
  HearingState,
  ListingService,
  SearchAllocatedHearingsAction
} from '../core/';
import {
  Hearing,
  SearchAvailableHearingsFormOptions,
  CourtCentre,
  CourtroomsFilter,
  PaginatedHearings,
  FilterOption
} from '../core/model';
import { Breadcrumb } from '../core/model/shared/breadcrumb';
import { AllocateHearingContainer } from './allocate-hearing.container';
import { hearingTypeMockOne, hearingTypeMockTwo, OrganisationUnit } from '@cpp/reference-data';
import { provideCppCoreHttpServices } from '@cpp/core';

@Component({
  template: ` <allocate-hearing></allocate-hearing> `,
  imports: [AllocateHearingContainer]
})
class TestHostComponent {}

describe('AllocateHearingContainer', () => {
  let component: AllocateHearingContainer;
  let fixture: ComponentFixture<TestHostComponent>;
  let state;
  let selectSpy;
  let dispatchSpy;
  let getBaseUrlSpy;

  const store: Store<AppState> = null;
  const paramMap = of({ get: (param) => 'mockHearingId' });
  const testHearing: Hearing = validHearingMock1;
  const hearings: Hearing[] = [testHearing];
  const hearingState: HearingState = {
    unscheduled: { hearings } as PaginatedHearings,
    typeOfList: [],
    unallocated: { hearings } as PaginatedHearings,
    lastAllocatedHearing: null,
    allocated: [],
    restrictedHearing: null,
    restrictListExpanded: null,
    available: null,
    scheduledHearingForAllocation: null,
    hearingSchedule: null,
    weekcommencingHearing: null,
    publishCourtListStatuses: null
  } as HearingState;
  const filterOptions: CourtroomsFilter = {
    courtCentreId: 'courtCentreId',
    courtRoomId: 'courtRoomId',
    searchDate: '2018-11-10'
  };
  const courtCentreName = 'Court centre name';
  const courtCentre: CourtCentre = {
    courtRooms: [
      { id: 'courtRoomId1', name: 'Court room 1' },
      { id: 'courtRoomId2', name: 'Court room 2' }
    ],
    id: '23b33e9c-92cb-40e5-9b7b-75f0d98522b0',
    name: courtCentreName,
    defaultDuration: '15',
    defaultStartTime: '10:30',
    courtCode: 'B'
  };
  const referenceDataState = {
    applicationTypes: [],
    hearingTypes: [hearingTypeMockOne, hearingTypeMockTwo],
    organisationUnits: [
      {
        id: 'courtCentreId',
        oucodeL1Code: 'C'
      }
    ],
    prosecutors: [],
    trialTypes: []
  };

  const listingReferenceDataState = {
    trialTypes: []
  };

  const mockHearingId = 'test-hearing-id';
  let router: Router;
  const queryParamMap = of({ get: (param) => false });

  beforeEach(fakeAsync(() => {
    state = {
      hearings: hearingState,
      referenceData: referenceDataState,
      listingReferenceData: listingReferenceDataState,
      display: { loading: false }
    };
    selectSpy = jasmine.createSpy('select').and.callFake((selectorFunc) => {
      return of(selectorFunc.call(store, state));
    });
    dispatchSpy = jasmine.createSpy('dispatch');
    getBaseUrlSpy = jasmine.createSpy().and.returnValue('http://url.com');

    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideCppCoreHttpServices(),
        provideRouter([{ path: 'unallocated', component: AllocateHearingContainer }]),
        ListingService,
        {
          provide: Store,
          useValue: { select: selectSpy, dispatch: dispatchSpy }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap,
            queryParamMap,
            snapshot: {
              params: { id: mockHearingId },
              queryParams: {
                split: false,
                isUnscheduled: false,
                courtId: 'courtCentreId'
              }
            }
          }
        },
        { provide: AppConfigService, useValue: { getBaseUrl: getBaseUrlSpy } },
        { provide: 'Window', useValue: window }
      ],
      teardown: { destroyAfterEach: false }
    });
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.children[0].componentInstance;
    router = TestBed.inject<Router>(Router);
    router.navigate = jest.fn();
    component.isUnscheduledHearing = false;
    component.hasCourtSelectionStep = true;
    fixture.detectChanges();
  }));

  it('should have the correct breadcrumb set for this component', fakeAsync(() => {
    const breadcrumbs: Breadcrumb[] = [
      { title: 'Home', href: 'http://url.com' },
      { title: 'Allocate hearing' }
    ];

    expect(component.breadcrumbs).toEqual(breadcrumbs);
  }));

  it('#allocateHearing and navigate to /unallocated', fakeAsync(() => {
    const expectedAllocateHearingAction = new AllocateHearingAction({
      originHearing: testHearing,
      updatedHearing: testHearing
    });
    component.navigate = jasmine.createSpy('navigate').and.returnValue(
      new Promise<void>((resolve, reject) => {
        resolve();
      })
    );
    dispatchSpy.calls.reset();
    component.allocateHearing({ originHearing: testHearing, updatedHearing: testHearing });
    tick();

    expect(dispatchSpy.calls.count()).toEqual(1);
    expect(dispatchSpy.calls.mostRecent().args[0]).toEqual(expectedAllocateHearingAction);
  }));

  it('#allocateHearing and navigate to /unscheduled', fakeAsync(() => {
    const expectedAllocateHearingAction = new AllocateHearingAction({
      originHearing: testHearing,
      updatedHearing: testHearing
    });
    component.isUnscheduledHearing = true;
    component.navigate = jasmine.createSpy('navigate').and.returnValue(
      new Promise<void>((resolve, reject) => {
        resolve();
      })
    );
    dispatchSpy.calls.reset();
    component.allocateHearing({ originHearing: testHearing, updatedHearing: testHearing });
    tick();

    expect(dispatchSpy.calls.count()).toEqual(1);
    expect(dispatchSpy.calls.mostRecent().args[0]).toEqual(expectedAllocateHearingAction);
  }));

  it('#onSelectCourtCentre', fakeAsync(() => {
    component.courtCentres = [courtCentre];
    component.onSelectCourtCentre({
      value: '23b33e9c-92cb-40e5-9b7b-75f0d98522b0'
    } as FilterOption);
    tick();
    expect(component.selectedCourtCentre).toEqual(courtCentre);
  }));

  it('#filterSubmit', fakeAsync(() => {
    const expectedAction = new SearchAllocatedHearingsAction({
      options: filterOptions
    });

    component.filterSubmit(filterOptions);

    expect(component.filterOptions).toEqual(filterOptions);
    expect(dispatchSpy.calls.mostRecent().args[0]).toEqual(expectedAction);
  }));

  it('should match Jest snapshot', () => {
    component.courtCentres = [courtCentre];

    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('#findAvailableHearings', () => {
    const mockFormData = {
      hearingId: 'mock-hearing-id',
      returnAllHearings: true
    } as SearchAvailableHearingsFormOptions;
    const expectedAction = new SearchAvailableHearingsAction(mockFormData);
    component.findAvailableHearings(mockFormData);
    expect(dispatchSpy.calls.mostRecent().args[0]).toEqual(expectedAction);
  });

  it('#onSelectedTabChange', () => {
    component.onSelectedTabChange({ heading: 'mock-heading' } as PdkTabComponent);
    expect(component.selectedTab).toEqual('mock-heading');
  });

  it('should viewHearingDetails', () => {
    const windowOpenSpy = spyOn(window, 'open');
    component.courtCentres = [courtCentre];
    fixture.detectChanges();
    testHearing.courtCentreId = '23b33e9c-92cb-40e5-9b7b-75f0d98522b0';
    testHearing.courtRoomId = 'courtRoomId1';
    component.viewHearingDetails(testHearing);

    expect(windowOpenSpy).toHaveBeenCalledTimes(1);
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'undefined/hearing/list?hearingDate=2018-11-05&courtCentreName=Court centre name&courtCentreId=23b33e9c-92cb-40e5-9b7b-75f0d98522b0&courtRoomName=Court room 1&courtRoomId=courtRoomId1&hearingId=b1bfe644-15d3-46aa-bdeb-fe8d18c16a42',
      '_blank'
    );
  });

  it('#onCourtSelected with non hmi', () => {
    const court = { id: 'courtCentreId', oucode: 'oucode' } as OrganisationUnit;

    component.onCourtSelected(court);

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: {
        paramMap: paramMap,
        queryParamMap,
        snapshot: {
          params: { id: mockHearingId },
          queryParams: {
            split: false,
            isUnscheduled: false,
            courtId: 'courtCentreId'
          }
        }
      },
      queryParams: {
        courtId: 'courtCentreId',
        jurisdictionType: 'CROWN'
      },
      queryParamsHandling: 'merge'
    });
  });
});
