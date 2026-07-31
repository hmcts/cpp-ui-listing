import { Directive, input } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { JudiciaryTypesGroups } from '@cpp/reference-data';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { AppConfigService } from '../../app/config';
import {
  ApiState,
  AppState,
  BailStatus,
  ClearUnallocatedHearingsAction,
  DisplayState,
  ExtendedJudicialRole,
  HearingState,
  ListUnallocatedFixedAndWeekCommencingHearings,
  OnlineState,
  ResetHearingFiltersAction,
  ShowUnallocatedHearingsAction
} from '../core/';
import { Hearing, ListedCase, UnallocatedHearings } from '../core/model/hearing';
import { Breadcrumb } from '../core/model/shared/breadcrumb';
import { UnallocatedHearingsContainer } from './unallocated-hearings.container';
import { WofdWarningService } from '@cpp/application';
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

describe('UnallocateHearingsContainer', () => {
  let component: UnallocatedHearingsContainer;
  let fixture: ComponentFixture<UnallocatedHearingsContainer>;
  let navigateSpy;
  let scrollSpy;
  let selectSpy;
  let dispatchSpy;
  let nextSpy;
  let getBaseUrlSpy;
  let displayState: DisplayState;
  let state: AppState;

  const store: Store<AppState> = null;
  const paramMap = of({ get: param => 'id1' });
  const selectedCourtRoomId = 'courtRoomId1';
  const listedCase: ListedCase = {
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
        bailStatus: {
          code: 'C',
          description: 'Custody or remanded into cusotdy'
        } as BailStatus,
        offences: [
          {
            id: 'offenceId',
            offenceCode: 'offenceCode',
            startDate: '2018-10-10',
            count: 1,
            orderIndex: 1,
            statementOfOffence: { legislation: 'legislation', title: 'title' },
            reportingRestrictions: [
              {
                id: ':id',
                judicialResultId: ':judicialResultId',
                label: ':label',
                orderedDate: ':orderedDate'
              }
            ]
          },
          {
            id: 'offenceId2',
            offenceCode: 'offenceCode',
            startDate: '2018-10-10',
            count: 1,
            orderIndex: 1,
            statementOfOffence: { legislation: 'legislation', title: 'title' },
            reportingRestrictions: [
              {
                id: ':id',
                judicialResultId: ':judicialResultId',
                label: ':label',
                orderedDate: ':orderedDate'
              }
            ]
          }
        ]
      }
    ]
  };

  const hearing = {
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
    listedCases: [listedCase]
  } as Hearing;
  const hearings: any[] = [hearing];

  const hearingState: HearingState = {
    unallocated: {
      hearings,
      pagination: { currentPage: 1, totalNumber: hearings.length }
    } as UnallocatedHearings,
    lastAllocatedHearing: null,
    allocated: [],
    restrictedHearing: hearing
  } as HearingState;

  const referenceDataState = {
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
      showUnallocatedHearings: false,
      hearingFilters: {
        courtCentreId: 'ALL',
        authorityId: 'ALL',
        hearingTypeId: 'ALL',
        jurisdictionType: 'ALL'
      },
      unallocatedPageVisited: false
    };

    state = {
      hearings: hearingState,
      referenceData: referenceDataState,
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
    selectSpy = jasmine.createSpy('select').and.callFake(selectorFunc => {
      return of(selectorFunc.call(store, state));
    });
    dispatchSpy = jasmine.createSpy('dispatch');
    nextSpy = jasmine.createSpy('next');
    getBaseUrlSpy = jasmine.createSpy().and.returnValue('http://url.com');

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: Store,
          useValue: { select: selectSpy, dispatch: dispatchSpy, next: nextSpy, pipe: jest.fn }
        },
        { provide: ActivatedRoute, useValue: { paramMap: paramMap } },
        { provide: AppConfigService, useValue: { getBaseUrl: getBaseUrlSpy } },
        { provide: Router, useValue: { navigate: navigateSpy } },
        { provide: 'Window', useValue: { scroll: scrollSpy } },
        {
          provide: WofdWarningService,
          useValue: { isWofdApplication: () => false, showModal: () => {} }
        }
      ],
      teardown: { destroyAfterEach: false }
    });
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(UnallocatedHearingsContainer);
    component = fixture.componentInstance;
    component.showSubmenu = false;
    fixture.detectChanges();
    tick();
  }));

  it('should have the correct breadcrumb set for this component', () => {
    const breadcrumbs: Breadcrumb[] = [
      { title: 'Home', href: 'http://url.com' },
      { title: 'Unallocated hearings' }
    ];
    expect(component.breadcrumbs).toEqual(breadcrumbs);
  });

  it('#resetHearingFilters()', () => {
    const expectedActions = [
      [new ShowUnallocatedHearingsAction(false)],
      [new ClearUnallocatedHearingsAction()],
      [new ResetHearingFiltersAction()]
    ];

    dispatchSpy.calls.reset();
    component.resetHearingFilters();

    expect(dispatchSpy.calls.allArgs()).toEqual(expectedActions);
  });

  it('#allocateHearing()', fakeAsync(() => {
    hearing.jurisdictionType = 'CROWN';
    component.allocateHearing(hearing);
    tick();

    expect(navigateSpy).toHaveBeenCalledWith([`/unallocated/${hearing.id}`]);
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  }));

  it('#clearNotification()', () => {
    component.clearNotification();

    const allArgs = dispatchSpy.calls.allArgs() as Array<[{ type: string }]>;
    const actions = allArgs.map(p => p[0].type);

    expect(actions).toContain('CLEAR_UNALLOCATED_HEARINGS');
    expect(actions).toContain('CLEAR_HEARING_SLOTS');
  });

  it('should match Jest snapshot with hearings', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should match Jest snapshot without hearings', () => {
    const storeCopy: Store<AppState> = TestBed.inject(Store);
    state.hearings.unallocated.hearings = [];
    state.display.showUnallocatedHearings = true;
    storeCopy.select = jasmine.createSpy('select').and.callFake(selectorFunc => {
      return of(selectorFunc.call(store, state));
    });

    fixture = TestBed.createComponent(UnallocatedHearingsContainer);
    component = fixture.componentInstance;
    component.showSubmenu = false;
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  describe('updatePageNumber, when executed, ', () => {
    it('should updatePageNumber', () => {
      component.updatePageNumber(2);

      expect(nextSpy).toHaveBeenCalledWith(
        new ListUnallocatedFixedAndWeekCommencingHearings({
          allocated: false,
          startDate: null,
          endDate: null,
          weekCommencingEndDate: '2100-12-31',
          weekCommencingStartDate: '1970-01-01',
          authorityId: 'ALL',
          courtCentreId: 'ALL',
          hearingTypeId: 'ALL',
          jurisdictionType: 'ALL',
          pageNumber: 2,
          pageSize: 50
        })
      );
    });

    it('should not dispatch action if page number is undefined', () => {
      const pageNumber = undefined;

      component.updatePageNumber(pageNumber);

      expect(nextSpy).not.toHaveBeenCalledWith();
    });
  });
});
