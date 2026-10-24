import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { Action, Store } from '@ngrx/store';
import { of, empty, Observable } from 'rxjs';

import {
  AppState,
  HearingState,
  getCourtCentres,
  getReferenceDataHearingTypes,
  CourtApplication,
  CourtCentre,
  SearchAllocatedHearingsByDateRangeAction
} from '../core/';
import {
  HearingsGroupedByDateAndRoom,
  HearingsGroupedByJudiciaryAndRoom,
  Hearing,
  UnallocatedHearings
} from '../core/model/hearing';
import { CreateAListContainer } from './create-a-list.container';
import { Title } from '@angular/platform-browser';
import { courtCentresMock } from '../../mock-data/test-fixtures';
import { Router } from '@angular/router';
import { validHearingMock1 } from '../../mock-data/test-fixtures';
import { Actions } from '@ngrx/effects';
import { AppConfigService } from '../../app/config';
import { CourtRestrictionEventType } from '../core/model/court-restriction';
import moment from 'moment';
import { cloneDeep } from 'lodash-es';
import { provideMockActions } from '@ngrx/effects/testing';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CourtListPublishService } from '../core/services/court-list-publish/court-list-publish.service';
import { CourtListType, MagsPublishStatus } from './models/mags-publish-list.dto';

const onHearingSelectedMock = jest.fn();

@Component({
  template: ` <create-a-list> </create-a-list> `,
  imports: [CreateAListContainer]
})
class TestHostComponent {
  onHearingSelected = onHearingSelectedMock;
  hearing = validHearingMock1;
}

describe('CreateAListContainer', () => {
  let component: CreateAListContainer;
  let fixture: ComponentFixture<TestHostComponent>;
  let state;
  let dispatchSpy;
  let selectSpy;
  let titleServiceSpy;
  let navigateSpy;
  let getBaseUrlSpy;
  let scrollSpy;
  let createObjectURL: jasmine.Spy;
  let open: jasmine.Spy;
  let actions$ = new Observable<Action>();

  const store: Store<AppState> = null;
  const hearings: Hearing[] = [];

  const hearingState: HearingState = {
    unallocated: { hearings, pagination: { currentPage: 1 } } as UnallocatedHearings,
    allocated: hearings,
    lastAllocatedHearing: null,
    restrictedHearing: null,
    restrictListExpanded: null,
    weekcommencingHearing: null,
    publishCourtListStatuses: null,
    scheduledHearingForAllocation: null,
    hearingSchedule: null
  } as HearingState;
  const refefenceDataState = {
    applicationTypes: [],
    hearingTypes: [],
    organisationUnits: [
      {
        id: '9b583616-049b-30f9-a14f-028a53b7cfe8',
        oucodeL3Code: 'LCC',
        oucodeL3Name: 'Liverpool Crown Court',
        defaultStartTime: '10:30',
        defaultDurationHrs: '6',
        courtrooms: [
          {
            id: 'e7721a38-546d-4b56-9992-ebdd772a561b',
            courtroomName: 'Courtroom 3-1'
          },
          {
            id: '63c20849-89f7-4140-8bf3-96a13f57c446',
            courtroomName: 'Courtroom 3-2'
          }
        ]
      }
    ],
    prosecutors: []
  };

  const usersGroupsState = {
    permissionsMap: {},
    userGroups: []
  };

  beforeEach(fakeAsync(() => {
    state = {
      hearings: hearingState,
      referenceData: refefenceDataState,
      usersGroups: usersGroupsState
    };
    selectSpy = jasmine.createSpy('select').and.callFake(selectorFunc => {
      return of(selectorFunc.call(store, state));
    });
    titleServiceSpy = jasmine.createSpy('setTile');
    dispatchSpy = jasmine.createSpy('dispatch');
    navigateSpy = jasmine.createSpy('navigate').and.returnValue(
      new Promise<void>((resolve, reject) => {
        resolve();
      })
    );
    getBaseUrlSpy = jasmine.createSpy();
    scrollSpy = jasmine.createSpy('scroll');
    createObjectURL = jasmine.createSpy();
    open = jasmine.createSpy();
    const windowMock: Window = <any>{
      URL: { createObjectURL },
      open,
      scroll: scrollSpy
    };

    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockActions(() => actions$),
        {
          provide: Store,
          useValue: { select: selectSpy, dispatch: dispatchSpy, pipe: jest.fn }
        },
        { provide: Title, useValue: { setTitle: titleServiceSpy } },
        { provide: Router, useValue: { navigate: navigateSpy } },
        { provide: AppConfigService, useValue: { getBaseUrl: getBaseUrlSpy } },
        { provide: 'Window', useFactory: () => windowMock },
        BsModalService,
        {
          provide: CourtListPublishService,
          useValue: {
            retrieveCourtListPublishStatus: jest.fn().mockReturnValue(of([])),
            publishCourtList: jest.fn().mockReturnValue(
              of({
                courtListId: 'court-1',
                courtCentreId: 'centre-1',
                publishStatus: MagsPublishStatus.SUCCESSFUL,
                fileStatus: MagsPublishStatus.SUCCESSFUL,
                lastUpdated: '2026-01-01T00:00:00Z',
                courtListType: CourtListType.STANDARD,
                fileName: '',
                publishDate: '2026-01-01'
              })
            )
          }
        }
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

  describe('General', () => {
    it('should match Jest snapshot', () => {
      expect(fixture).toMatchSnapshot();
    });

    it('should call selectors to initialise the data', () => {
      expect(selectSpy).toHaveBeenCalledWith(getCourtCentres);
      expect(selectSpy).toHaveBeenCalledWith(getReferenceDataHearingTypes);
      expect(selectSpy).toBeCalledTimes(11);
      expect(component.courtCentres).toEqual(courtCentresMock);
    });

    it('should set the errors', () => {
      component.formErrors([{ test: 'Message' }]);
      expect(component.errors).toEqual([{ test: 'Message' }]);
    });

    it('should set the courtCentre selected', () => {
      component.onSelectCourtCentre({ value: courtCentresMock[0].id });
      expect(component.selectedCourtCentre).toEqual(courtCentresMock[0]);
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();

      component.onSelectCourtCentre({ value: '', type: 'change' });
      expect(component.selectedCourtCentre).toEqual(undefined);
    });
    it('should dispatch action when court restriction changes', () => {
      const restriction = {
        restrictionEventType: CourtRestrictionEventType.Defendant,
        defendantIds: ['1234'],
        hearingId: validHearingMock1.id,
        restrictCourtList: true
      };
      component.updateCourtRestrictions(restriction);
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
    });

    // TODO : fix this test after release: needs investigation
    // it('should listen to action DownloadListSuccessAction to trigger download the list', () => {
    // store = TestBed.inject(Store);
    // const testBlob =  new Blob(['textstream'], {type: 'application/pdf'});
    // spyOn(component , 'downloadDocumentList');
    // const dispatchSpyOv = jasmine.createSpy('dispatch').and.returnValue(
    //   new DownloadListSuccessAction(testBlob)
    // );
    // TestBed.overrideProvider( Store, { useValue: { select: selectSpy, dispatch: dispatchSpyOv } });
    // store.dispatch(new DownloadListSuccessAction(testBlob));
    // fixture.detectChanges();
    //
    // expect(component.downloadDocumentList).toHaveBeenCalledWith(testBlob);
    // });
  });

  describe('Restriction Tests', () => {
    describe('shadowListed restrictions', () => {
      let hearingsGroupedByDateAndRoom;

      beforeEach(() => {
        hearingsGroupedByDateAndRoom = [
          {
            hearingsGroupedByJudiciaryAndRoom: [
              {
                hearingsGroupedByJudiciary: [
                  {
                    hearings: [cloneDeep(validHearingMock1)]
                  }
                ]
              }
            ]
          } as HearingsGroupedByDateAndRoom
        ];
      });

      it('should be detected at case level', () => {
        hearingsGroupedByDateAndRoom[0].hearingsGroupedByJudiciaryAndRoom[0].hearingsGroupedByJudiciary[0].hearings[0].listedCases[0].shadowListed = true;
        expect(component.checkListForRestrictions(hearingsGroupedByDateAndRoom)).toBeTruthy();
      });

      it('should be detected at offence level', () => {
        hearingsGroupedByDateAndRoom[0].hearingsGroupedByJudiciaryAndRoom[0].hearingsGroupedByJudiciary[0].hearings[0].listedCases[0].defendants[0].offences[0].shadowListed = true;
        expect(component.checkListForRestrictions(hearingsGroupedByDateAndRoom)).toBeTruthy();
      });
    });

    it('should find a standalone restriction at application level ', () => {
      const application = { restrictFromCourtList: true } as CourtApplication;

      const hearing1 = {
        ...validHearingMock1,
        courtApplications: [application],
        listedCases: null
      };
      const hearingsGroupedByJudiciaryAndRoomStandalone = [
        {
          courtRoom: {
            id: '7cb09222-49e1-3622-a5a6-ad253d2b3c39',
            name: 'court 1'
          },
          hearingsGroupedByJudiciary: [
            {
              judiciary: 'test',
              hearings: [hearing1]
            }
          ]
        }
      ] as HearingsGroupedByJudiciaryAndRoom[];

      const hearingsGroupedByDateAndRoom = [
        {
          date: '2019-07-14',
          hearingsGroupedByJudiciaryAndRoom: hearingsGroupedByJudiciaryAndRoomStandalone
        }
      ];
      const isRestricted = component.checkListForRestrictions(hearingsGroupedByDateAndRoom);
      expect(isRestricted).toBeTruthy();
    });

    it('should find a standalone restriction at applicant level ', () => {
      const application = {
        applicant: { restrictFromCourtList: true }
      } as CourtApplication;

      const hearing1 = {
        ...validHearingMock1,
        courtApplications: [application],
        listedCases: null
      };
      const hearingsGroupedByJudiciaryAndRoomStandalone = [
        {
          courtRoom: {
            id: '7cb09222-49e1-3622-a5a6-ad253d2b3c39',
            name: 'court 1'
          },
          hearingsGroupedByJudiciary: [
            {
              judiciary: 'test',
              hearings: [hearing1]
            }
          ]
        }
      ] as HearingsGroupedByJudiciaryAndRoom[];

      const hearingsGroupedByDateAndRoom = [
        {
          date: '2019-07-14',
          hearingsGroupedByJudiciaryAndRoom: hearingsGroupedByJudiciaryAndRoomStandalone
        }
      ];
      const isRestricted = component.checkListForRestrictions(hearingsGroupedByDateAndRoom);
      expect(isRestricted).toBeTruthy();
    });

    it('should find a standalone restriction at respondent level ', () => {
      const application = {
        respondents: [{ restrictFromCourtList: true }]
      } as CourtApplication;

      const hearing1 = {
        ...validHearingMock1,
        courtApplications: [application],
        listedCases: null
      };
      const hearingsGroupedByJudiciaryAndRoomStandalone = [
        {
          courtRoom: {
            id: '7cb09222-49e1-3622-a5a6-ad253d2b3c39',
            name: 'court 1'
          },
          hearingsGroupedByJudiciary: [
            {
              judiciary: 'test',
              hearings: [hearing1]
            }
          ]
        }
      ] as HearingsGroupedByJudiciaryAndRoom[];

      const hearingsGroupedByDateAndRoom = [
        {
          date: '2019-07-14',
          hearingsGroupedByJudiciaryAndRoom: hearingsGroupedByJudiciaryAndRoomStandalone
        }
      ];
      const isRestricted = component.checkListForRestrictions(hearingsGroupedByDateAndRoom);
      expect(isRestricted).toBeTruthy();
    });

    it('should find a standalone restriction at application type level ', () => {
      const application = {
        restrictCourtApplicationType: true
      } as CourtApplication;

      const hearing1 = {
        ...validHearingMock1,
        courtApplications: [application],
        listedCases: null
      };
      const hearingsGroupedByJudiciaryAndRoomStandalone = [
        {
          courtRoom: {
            id: '7cb09222-49e1-3622-a5a6-ad253d2b3c39',
            name: 'court 1'
          },
          hearingsGroupedByJudiciary: [
            {
              judiciary: 'test',
              hearings: [hearing1]
            }
          ]
        }
      ] as HearingsGroupedByJudiciaryAndRoom[];

      const hearingsGroupedByDateAndRoom = [
        {
          date: '2019-07-14',
          hearingsGroupedByJudiciaryAndRoom: hearingsGroupedByJudiciaryAndRoomStandalone
        }
      ];
      const isRestricted = component.checkListForRestrictions(hearingsGroupedByDateAndRoom);
      expect(isRestricted).toBeTruthy();
    });
  });

  describe('Week Commencing Tests', () => {
    const validHearinWithWeekCommencing = {
      ...validHearingMock1,
      weekCommencingStartDate: '2018-10-05'
    };
    const validHearinFixed = { ...validHearingMock1, startDate: '2018-11-05' };

    it('should retrieve fixed hearings for crown if hearing is not week commencing', () => {
      const hearingItems = [validHearinFixed];
      component.selectedOptions = {
        courtCentreId: null,
        courtRoomId: '',
        startDate: null,
        isCrownCourt: null,
        courtCentre: null
      };
      component.selectedOptions.startDate = '2018-11-05';
      component.selectedOptions.endDate = '2018-11-05';
      component.selectedCourtCentre = {
        courtRooms: [{ id: 'e7721a38-546d-4b56-9992-ebdd772a561b', name: 'Court 1' }]
      } as CourtCentre;

      const fixedHearingGroupedByDate = component.getHearingsGroupedByDateAndRoom(hearingItems);
      expect(fixedHearingGroupedByDate.length).toBe(1);
      expect(fixedHearingGroupedByDate[0].date).toBe('2018-11-05');
      expect(fixedHearingGroupedByDate.length).toBe(1);
      expect(fixedHearingGroupedByDate[0].hearingsGroupedByJudiciaryAndRoom.length).toBe(1);

      const weeklyHearingGroupedByDate =
        component.getWeekCommencingHearingsGroupedByDateAndRoom(hearingItems);
      expect(weeklyHearingGroupedByDate.length).toBe(0);
    });

    it('should retrieve  week commencing hearings for crown if hearing is week commencing', () => {
      const hearingItems = [validHearinWithWeekCommencing];
      component.selectedOptions = {
        courtCentreId: null,
        courtRoomId: '',
        startDate: null,
        isCrownCourt: null,
        courtCentre: null
      };
      component.selectedOptions.startDate = '2018-10-05';
      component.selectedOptions.endDate = '2018-10-12';
      component.selectedCourtCentre = {
        courtRooms: [{ id: 'e7721a38-546d-4b56-9992-ebdd772a561b', name: 'Court 1' }]
      } as CourtCentre;

      const weeklyHearingGroupedByDate =
        component.getWeekCommencingHearingsGroupedByDateAndRoom(hearingItems);
      expect(weeklyHearingGroupedByDate[0].date).toBe(moment().format('YYYY-MM-DD'));
      expect(weeklyHearingGroupedByDate.length).toBe(1);
      expect(weeklyHearingGroupedByDate[0].hearingsGroupedByJudiciaryAndRoom.length).toBe(1);

      const fixedHearingGroupedByDate = component.getHearingsGroupedByDateAndRoom(hearingItems);
      expect(fixedHearingGroupedByDate.length).toBe(0);
    });

    it('should retrieve summary title info for week commencing search - showing working week range ', () => {
      const selectedOptions = {
        courtCentre: 'Liverpool Crown Court',
        courtCentreId: '9b583616-049b-30f9-a14f-028a53b7cfe8',
        courtRoomId: '',
        endDate: '2019-11-08',
        isCrownCourt: true,
        startDate: '2019-11-04'
      };
      component.filterSubmit(selectedOptions);
      fixture.detectChanges();
      expect(component.searchRangeText).toBe('Week commencing November 4, 2019');
      expect(component.weekCommencingRangeText).toBe('4 November  - November 8, 2019');
    });

    it('should not show courtrooms if crown and  week commencing selected', () => {
      const selectedOptions = {
        courtCentre: 'Liverpool Crown Court',
        courtCentreId: '9b583616-049b-30f9-a14f-028a53b7cfe8',
        courtRoomId: '',
        endDate: '2019-11-10',
        isCrownCourt: true,
        startDate: '2019-11-04'
      };
      component.filterSubmit(selectedOptions);
      fixture.detectChanges();
    });

    it('should submit the correct values if week commencing selected', () => {
      const selectedOptions = {
        courtCentreId: '1234',
        courtRoomId: '',
        startDate: '2018-10-05',
        endDate: '2018-10-05',
        isCrownCourt: true,
        courtCentre: 'Liverpool Crown'
      };

      component.filterSubmit(selectedOptions);
      expect(component.crownCourtSelected).toBeTruthy();
      expect(component.weekCommencingSelected).toBeFalsy();

      expect(dispatchSpy).toHaveBeenLastCalledWith(
        new SearchAllocatedHearingsByDateRangeAction({ options: { ...selectedOptions } })
      );
    });
  });

  describe('mags court list publish', () => {
    it('should have magsPublishStatusesWithAlert filtered to statuses with alert', fakeAsync(() => {
      component.selectedOptions = {
        courtCentreId: 'centre-1',
        courtRoomId: '',
        startDate: '2026-01-01',
        endDate: '2026-01-01',
        isCrownCourt: false,
        courtCentre: 'Test Court'
      };
      component.publishMagsCourtList(CourtListType.STANDARD);
      flush();
      expect(component.magsPublishStatusesWithAlert().length).toBe(1);
      expect(component.magsPublishStatusesWithAlert()[0].alert).toBe(true);
    }));

    it('should call store publishCourtList when publishMagsCourtList is called', fakeAsync(() => {
      component.selectedOptions = {
        courtCentreId: 'centre-1',
        courtRoomId: '',
        startDate: '2026-01-01',
        endDate: '2026-01-01',
        isCrownCourt: false,
        courtCentre: 'Test Court'
      };
      const courtListPublishService = TestBed.inject(
        CourtListPublishService
      ) as jest.Mocked<CourtListPublishService>;
      component.publishMagsCourtList(CourtListType.ONLINE_PUBLIC);
      flush();
      expect(courtListPublishService.publishCourtList).toHaveBeenCalledWith({
        courtCentreId: 'centre-1',
        startDate: '2026-01-01',
        endDate: '2026-01-01',
        courtListType: CourtListType.ONLINE_PUBLIC
      });
    }));
  });
});

export class TestActions extends Actions {
  constructor() {
    super(empty());
  }

  set stream(source: Observable<any>) {
    this.source = source;
  }
}
