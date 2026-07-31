import { Component, Directive, input } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { JudiciaryTypesGroups } from '@cpp/reference-data';
import { Store } from '@ngrx/store';
import cleanDeep from 'clean-deep';
import { of } from 'rxjs';
import { AppConfigService } from '../config';
import {
  ApiState,
  AppState,
  ClearHearingSlots,
  ClearUnscheduledHearingsAction,
  CourtApplication,
  DisplayState,
  ExtendedJudicialRole,
  HearingState,
  ListUnscheduledHearingsAction,
  OnlineState,
  ResetUnscheduledFiltersAction,
  SaveUnscheduledFiltersAction,
  ShowUnscheduledHearingsAction,
  TypeOfListAction,
  UnscheduledPageVisitedAction
} from '../core/';
import { Hearing, ListedCase } from '../core/model';
import { Breadcrumb } from '../core/model/shared/breadcrumb';
import { mockFilterOptionsUnscheduled } from '../core/services/listing/mocks';
import { UnscheduledListingsContainer } from './unscheduled-listings.container';
import { TypeOfListSummary } from './unscheduled-listings.interfaces';

@Component({
  template: ` <unscheduled-listings-container></unscheduled-listings-container> `,
  imports: [UnscheduledListingsContainer]
})
class TestHostComponent {}
@Directive({
  selector: '[routerLink], [routerLinkActive]',
  host: {
    '(click)': 'onClick()'
  }
})
export class RouterLinkStubDirective {
  readonly linkParams = input<any>(undefined, { alias: 'routerLink' });
  navigatedTo: any = null;

  onClick() {
    this.navigatedTo = this.linkParams();
  }
}

describe('UnscheduledListingsContainer', () => {
  let component: UnscheduledListingsContainer;
  let fixture: ComponentFixture<TestHostComponent>;
  let navigateSpy;
  let scrollSpy;
  let selectSpy;
  let dispatchSpy;
  let nextSpy;
  let getBaseUrlSpy;
  let displayState: DisplayState;
  let state: AppState;

  let store: Store<AppState>;
  const paramMap = of({ get: (param) => 'id1' });
  const selectedCourtRoomId = 'courtRoomId1';
  const listedCase1: ListedCase = {
    id: 'listedCaseId',
    caseIdentifier: {
      authorityCode: 'authorityCode',
      authorityId: 'authorityId',
      caseReference: 'caseReference'
    },
    defendants: [
      {
        id: 'defendantId',
        firstName: 'firstName',
        lastName: 'lastName',
        dateOfBirth: '1983-09-28',
        offences: [],
        bailStatus: {
          id: 'bail-status-id',
          code: 'bail-status-code',
          description: 'bail-status-description',
          custodyTimeLimit: 'bail-status-ctl'
        }
      }
    ]
  };

  const listedCase2: ListedCase = {
    id: 'listedCaseId',
    caseIdentifier: {
      authorityCode: 'authorityCode',
      authorityId: 'authorityId',
      caseReference: 'caseReference'
    },
    defendants: [
      {
        id: 'defendantId',
        firstName: 'firstName',
        lastName: 'lastName',
        dateOfBirth: '1982-08-22',
        offences: [],
        bailStatus: {
          id: 'bail-status-id',
          code: 'bail-status-code',
          description: 'bail-status-description',
          custodyTimeLimit: 'bail-status-ctl'
        }
      }
    ]
  };

  const courtApplicationSingleRespondentMock: CourtApplication = {
    id: '8e8465df-779b-444e-80dc-15633b6c5fd8',
    applicant: {
      lastName: 'ApplicantLastName1',
      firstName: 'ApplicantFirstName1',
      isRespondent: false
    },
    respondents: [
      {
        lastName: 'ApplicationSingleRespondantLastName1',
        firstName: 'ApplicationSingleRespondantFirstName1',
        isRespondent: true
      }
    ],
    linkedCaseIds: ['d97a91d2-5d2c-4ad7-bb15-c6a653a599b8'],
    applicationType: 'Complaint for Attachment of Earnings Order',
    applicationReference: 'Test-application-reference'
  };

  const hearing1 = {
    id: 'id1',
    courtApplications: [],
    type: { id: 'someId', description: 'PTP' },
    allocated: true,
    startDate: '2017-10-10',
    estimatedMinutes: 15,
    courtCentreId: selectedCourtRoomId,
    courtRoomId: selectedCourtRoomId,
    judiciary: [
      <ExtendedJudicialRole>{
        judicialId: 'judicialId',
        judicialRoleType: { judiciaryType: JudiciaryTypesGroups.CIRCUIT_JUDGE }
      }
    ],
    listedCases: [listedCase1]
  } as Hearing;

  const hearing2 = {
    id: 'id2',
    courtApplications: [courtApplicationSingleRespondentMock],
    type: { id: 'someId', description: 'PTP' },
    allocated: true,
    startDate: '2017-10-10',
    estimatedMinutes: 15,
    courtCentreId: selectedCourtRoomId,
    courtRoomId: selectedCourtRoomId,
    judiciary: [
      <ExtendedJudicialRole>{
        judicialId: 'judicialId',
        judicialRoleType: { judiciaryType: JudiciaryTypesGroups.CIRCUIT_JUDGE }
      }
    ],
    listedCases: [listedCase2]
  } as Hearing;

  const hearings: Hearing[] = [hearing1, hearing2];

  const testTypeOfList: TypeOfListSummary[] = [
    {
      value: 'c98cb51f-8639-49c1-91f0-a7e820c34355',
      label: 'Warrant for arrest without bail'
    },
    {
      value: 'ed34136f-2a13-45a4-8d4f-27075ae3a8a9',
      label: 'Warrant for arrest for community penalty without bail'
    }
  ];

  const constructorDispatchedActions = [
    [new TypeOfListAction()],
    [new ClearUnscheduledHearingsAction()],
    [new UnscheduledPageVisitedAction()]
  ];

  const hearingState: HearingState = <HearingState>{
    unallocated: { hearings },
    unscheduled: { hearings, pagination: { currentPage: 1, totalNumber: 50, pageCount: 1 } },
    typeOfList: testTypeOfList,
    lastAllocatedHearing: null,
    allocated: [],
    restrictedHearing: hearing1
  };

  const refefenceDataState = {
    applicationTypes: [],
    hearingTypes: [],
    organisationUnits: [],
    prosecutors: []
  };
  const apiState: ApiState = {
    errors: [],
    requests: []
  };
  const onlineState: OnlineState = true;

  const usersGroups = { userGroups: [], userServices: [] };

  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = () => {};
  });

  beforeEach(fakeAsync(() => {
    displayState = <DisplayState>{
      showUnscheduledHearings: false,
      unscheduledFilters: {
        oucodeL2Code: 'ALL',
        courtCentreId: 'ALL',
        typeOfList: 'ALL',
        caseUrn: ''
      },
      unscheduledPageVisited: false
    };

    state = {
      hearings: hearingState,
      referenceData: refefenceDataState,
      api: apiState,
      display: displayState,
      online: onlineState,
      usersGroups
    } as AppState;

    navigateSpy = jasmine.createSpy('navigate').and.returnValue(
      new Promise<void>((resolve, reject) => {
        resolve();
      })
    );
    scrollSpy = jasmine.createSpy('scroll');
    selectSpy = jasmine.createSpy('select').and.callFake((selectorFunc) => {
      return of(selectorFunc.call(store, state));
    });
    dispatchSpy = jasmine.createSpy('dispatch');
    nextSpy = jasmine.createSpy('next');
    getBaseUrlSpy = jasmine.createSpy().and.returnValue('http://url.com');

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: Store, useValue: { select: selectSpy, dispatch: dispatchSpy, next: nextSpy } },
        { provide: ActivatedRoute, useValue: { paramMap: paramMap } },
        { provide: AppConfigService, useValue: { getBaseUrl: getBaseUrlSpy } },
        { provide: Router, useValue: { navigate: navigateSpy } },
        { provide: 'Window', useValue: { scroll: scrollSpy } }
      ],
      teardown: { destroyAfterEach: false }
    });
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.children[0].componentInstance;
    component.showSubmenu = false;
    fixture.detectChanges();
  }));

  it('should match snapshot with hearings', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should match snapshot without hearings', () => {
    const storeCopy: Store<AppState> = TestBed.inject(Store);
    state.hearings.unscheduled.hearings = [];
    state.display.showUnscheduledHearings = true;
    storeCopy.select = jasmine.createSpy('select').and.callFake((selectorFunc) => {
      return of(selectorFunc.call(store, state));
    });

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.children[0].componentInstance;
    component.showSubmenu = false;
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should dispatch ListUnscheduledHearingsAction if page is visited', () => {
    state.display.unscheduledPageVisited = true;
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.children[0].componentInstance;
    component.showSubmenu = false;
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should match snapshot with hearings', () => {
    const storeCopy: Store<AppState> = TestBed.inject(Store);
    state.display.showUnscheduledHearings = false;
    storeCopy.select = jasmine.createSpy('select').and.callFake((selectorFunc) => {
      return of(selectorFunc.call(store, state));
    });

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.children[0].componentInstance;
    component.showSubmenu = false;
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should have the correct breadcrumb set for this component', fakeAsync(() => {
    const breadcrumbs: Breadcrumb[] = [
      { title: 'Home', href: 'http://url.com' },
      { title: 'Unscheduled list' }
    ];

    expect(component.breadcrumbs).toEqual(breadcrumbs);
  }));

  it('#resetUnscheduledHearingFilters()', fakeAsync(() => {
    const expectedActions = [
      ...constructorDispatchedActions,
      [new ShowUnscheduledHearingsAction(false)],
      [new ClearUnscheduledHearingsAction()],
      [new ResetUnscheduledFiltersAction()]
    ];

    component.resetUnscheduledHearingFilters();

    expect(dispatchSpy.calls.allArgs()).toEqual(expectedActions);
  }));

  it('#listHearings()', fakeAsync(() => {
    const unscheduledFilterOptions = {
      ...mockFilterOptionsUnscheduled,
      pageNumber: 1,
      pageSize: 50
    };
    const expectedActions = [
      ...constructorDispatchedActions,
      [new ListUnscheduledHearingsAction(cleanDeep({ ...unscheduledFilterOptions }))],
      [new SaveUnscheduledFiltersAction(mockFilterOptionsUnscheduled)],
      [new ClearHearingSlots()]
    ];

    component.listHearings(mockFilterOptionsUnscheduled);

    expect(dispatchSpy.calls.allArgs()).toEqual(expectedActions);
  }));

  it('#unscheduledListings updatePageNumber', fakeAsync(() => {
    component.updatePageNumber(2);

    expect(nextSpy).toHaveBeenCalledWith(
      new ListUnscheduledHearingsAction({
        oucodeL2Code: 'ALL',
        courtCentreId: 'ALL',
        typeOfList: 'ALL',
        pageNumber: 2,
        pageSize: 50
      })
    );
  }));

  it('#unscheduledListings() with CROWN', fakeAsync(() => {
    hearing1.jurisdictionType = 'CROWN';
    component.allocateUnscheduledHearing(hearing1);
    tick();

    expect(navigateSpy).toHaveBeenCalledWith([`/unallocated/${hearing1.id}`], {
      queryParams: { isUnscheduled: true }
    });
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  }));

  it('#unscheduledListings() with MAGISTRATES', fakeAsync(() => {
    hearing1.jurisdictionType = 'MAGISTRATES';
    component.allocateUnscheduledHearing(hearing1);
    tick();

    expect(navigateSpy).toHaveBeenCalledWith([`/unallocated/${hearing1.id}`], {
      queryParams: { isUnscheduled: true }
    });
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  }));

  it('#clearNotification()', fakeAsync(() => {
    component.clearNotification();

    const allArgs = dispatchSpy.calls.allArgs() as Array<[{ type: string }]>;
    const actions = allArgs.map((p) => p[0].type);

    expect(actions).toContain('CLEAR_UNSCHEDULED_HEARINGS');
    expect(actions).toContain('CLEAR_HEARING_SLOTS');
  }));
});
