import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import {
  JudiciaryGroupType,
  OrganisationUnit,
  provideReferenceDataStore,
  ReferenceDataActions,
  ReferenceDataService,
  RotaBusinessType
} from '@cpp/reference-data';

import { provideMockActions } from '@ngrx/effects/testing';
import { Action, provideStore, Store } from '@ngrx/store';
import { cold, hot } from 'jasmine-marbles';
import { Observable } from 'rxjs';
import {
  AllocateHearingMagsAction,
  ApiError,
  AppState,
  Hearing as LocalHearing,
  ListingService,
  ListUnallocatedHearingsSuccessAction,
  PanelType,
  ScheduledAllocateHearingAction,
  reducers
} from '../../core';
import { AllocationActions } from '../actions';
import { SchedulingEffects } from './scheduling.effects';

describe('Scheduling effects', () => {
  let actions$ = new Observable<Action>();
  let effects: SchedulingEffects;
  let listingService: ListingService;
  let navigate: jest.Mock;
  let store: Store<AppState>;

  beforeEach(() => {
    navigate = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        provideStore(reducers, { runtimeChecks: {} }),
        provideReferenceDataStore(),
        provideMockActions(() => actions$),
        SchedulingEffects,
        {
          provide: ListingService,
          useValue: {
            allocateMagistratesHearing: jest.fn(),
            extractProsecutionCasesIdsFromHearing: jest.fn(() => [
              { caseId: 'caseId', defendants: [] }
            ])
          }
        },
        { provide: ReferenceDataService, useValue: {} },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: { isUnscheduled: false } } }
        },
        { provide: Router, useValue: { navigate } }
      ],
      teardown: { destroyAfterEach: false }
    });

    effects = TestBed.inject(SchedulingEffects);
    listingService = TestBed.inject(ListingService);
    store = TestBed.inject(Store);

    // Install unallocated hearings

    store.dispatch(
      new ListUnallocatedHearingsSuccessAction({
        hearings: [
          {
            id: 'hearingId',
            hearingLanguage: 'ENGLISH',
            type: { id: '*', description: '*' }
          } as LocalHearing
        ],
        pagination: {
          currentPage: 1,
          totalNumber: 2
        }
      })
    );

    store.dispatch(
      ReferenceDataActions.loadHearingTypesSuccess({
        hearingTypes: [
          {
            id: 'mock-type-id',
            seqId: 5,
            hearingCode: 'CSE',
            hearingDescription: 'Committal for Sentence',
            welshHearingDescription: 'Traddodi ar gyfer Dedfryd',
            defaultDurationMin: 30
          }
        ]
      })
    );

    // Install hearing scheduled to be allocated

    store.dispatch(
      new ScheduledAllocateHearingAction({
        id: 'hearingId',
        hearingLanguage: 'ENGLISH',
        type: { id: 'mock-type-id', description: '*' }
      } as LocalHearing)
    );

    // Install the reference data dependencies

    store.dispatch(
      ReferenceDataActions.loadOrganisationUnitsSuccess({
        organisationUnits: [
          { id: 'courtCentreId', oucode: 'WESTMINSTER', oucodeL1Code: 'B' },
          { id: 'courtCentreId2', oucode: 'WEMBLEY' }
        ] as OrganisationUnit[]
      })
    );

    store.dispatch(
      ReferenceDataActions.loadRotaBusinessTypesSuccess({
        rotaBusinessTypes: [
          { id: 'RBT001', typeCode: 'GEN' },
          { id: 'RBT002', typeCode: 'TRI', duration: 120 }
        ] as RotaBusinessType[]
      })
    );

    store.dispatch(
      ReferenceDataActions.loadJudiciaryGroupTypesSuccess({
        judiciaryGroupTypes: [
          {
            id: 'judi-mock-id-1',
            judiciaryGroup: 'Judge',
            judiciaryTypeDescription: 'Common Serjeant'
          }
        ] as JudiciaryGroupType[]
      })
    );
  });

  describe('allocateMagistratesHearing$', () => {
    const judiciary = {
      judiciaryId: 'mock-judiciary-id-1',
      courtScheduleId: 'mock-court-schedule-id-1',
      courtListingProfileId: 'mock-court-listing-profile-id-1',
      judiciaryType: 'COMMON_SERJEANT',
      deputy: false,
      benchChairman: false
    };

    const filters = {
      weekCommencingStartDate: '15-02-2022',
      weekCommencingEndDate: '22-02-2022',
      weekCommencingDurationInWeeks: 1
    };
    const allocateMagistratesHearing = AllocationActions.allocateMagistratesHearing({
      hearingId: 'hearingId',
      redirectTo: ['/redirecto'],
      filters,
      sendNotificationToParties: undefined,
      hearingSlotAllocations: [
        // Slot-based allocation
        {
          hearingSlotTime: '2020-01-01T12:00:00.000Z',
          hearingSlot: {
            courtScheduleId: 'A',
            sessionDate: '2020-01-01',
            courtHouseName: `Westminster Magistrates' Court`,
            courtRoomName: 'Courtroom 1',
            courtRoomId: 'courtRoomId',
            courtRoomNumber: 2900,
            courtSession: 'AM',
            ouCode: 'WESTMINSTER',
            businessType: 'GEN',
            availableDuration: 0,
            maxDuration: 0,
            availableSlots: 10,
            maxSlots: 20,
            judiciaries: [judiciary],
            panel: PanelType.ADULT,
            slotBased: true,
            sessionStartTime: '09:00',
            sessionEndTime: '17:00',
            minHearingTime: '0',
            maxHearingTime: '0',
            slotStartTimes: [
              {
                sessionStartTime: '2020-01-01T12:00:00.000Z',
                sessionEndTime: '2020-01-01T13:00:00.000Z',
                count: 1
              }
            ],
            maxDurationForAfternoon: 0,
            overbookingAllowed: false,
            createdOn: '',
            updatedOn: ''
          }
        },
        // Duration-based allocation with known duration
        {
          hearingSlotTime: '2020-01-05T10:00:00.000Z',
          duration: 90,
          hearingSlot: {
            courtScheduleId: 'B',
            sessionDate: '2020-01-05',
            courtHouseName: `Wembley Magistrates' Court`,
            courtRoomName: 'Courtroom 2',
            courtRoomNumber: 2900,
            courtRoomId: 'courtRoomId2',
            courtSession: 'AM',
            ouCode: 'WEMBLEY',
            businessType: 'TRI',
            availableDuration: 90,
            maxDuration: 180,
            availableSlots: 0,
            maxSlots: 0,
            judiciaries: [judiciary],
            panel: PanelType.ADULT,
            slotBased: false,
            sessionStartTime: '09:00',
            sessionEndTime: '17:00',
            minHearingTime: '0',
            maxHearingTime: '0',
            slotStartTimes: [
              {
                sessionStartTime: '2020-01-01T10:00:00.000Z',
                sessionEndTime: '2020-01-01T11:00:00.000Z',
                count: 1
              }
            ],
            maxDurationForAfternoon: 0,
            overbookingAllowed: false,
            createdOn: '',
            updatedOn: ''
          }
        },
        // Duration-based allocation with unknown duration (half-day)
        {
          hearingSlotTime: '2020-01-06T10:00:00.000Z',
          hearingSlot: {
            courtScheduleId: 'C',
            sessionDate: '2020-01-06',
            courtHouseName: `Westminster Magistrates' Court`,
            courtRoomName: 'Courtroom 1',
            courtRoomId: 'courtRoomId',
            courtRoomNumber: 2900,
            courtSession: 'AM',
            ouCode: 'WESTMINSTER',
            businessType: 'TRI',
            availableDuration: 90,
            maxDuration: 180,
            availableSlots: 0,
            maxSlots: 0,
            judiciaries: [judiciary],
            panel: PanelType.ADULT,
            slotBased: false,
            sessionStartTime: '09:00',
            sessionEndTime: '17:00',
            minHearingTime: '0',
            maxHearingTime: '0',
            slotStartTimes: [
              {
                sessionStartTime: '2020-01-01T10:00:00.000Z',
                sessionEndTime: '2020-01-01T11:00:00.000Z',
                count: 1
              }
            ],
            maxDurationForAfternoon: 0,
            overbookingAllowed: false,
            createdOn: '',
            updatedOn: ''
          }
        },
        // Duration-based allocation with unknown duration (all day)
        {
          hearingSlotTime: '2020-01-07T10:00:00.000Z',
          hearingSlot: {
            courtScheduleId: 'D',
            sessionDate: '2020-01-07',
            courtHouseName: `Westminster Magistrates' Court`,
            courtRoomName: 'Courtroom 1',
            courtRoomId: 'courtRoomId',
            courtRoomNumber: 2900,
            courtSession: 'AD',
            ouCode: 'WESTMINSTER',
            businessType: 'TRI',
            availableDuration: 90,
            maxDuration: 360,
            availableSlots: 0,
            maxSlots: 0,
            judiciaries: [judiciary],
            panel: PanelType.ADULT,
            slotBased: false,
            sessionStartTime: '09:00',
            sessionEndTime: '17:00',
            minHearingTime: '0',
            maxHearingTime: '0',
            slotStartTimes: [
              {
                sessionStartTime: '2020-01-01T10:00:00.000Z',
                sessionEndTime: '2020-01-01T11:00:00.000Z',
                count: 1
              }
            ],
            maxDurationForAfternoon: 0,
            overbookingAllowed: false,
            createdOn: '',
            updatedOn: ''
          }
        }
      ]
    });

    it('should allocate a magistrates hearing', () => {
      allocateMagistratesHearing.sendNotificationToParties = true;
      const allocateMagistratesHearingAction = new AllocateHearingMagsAction({
        hearingSlotAllocations: allocateMagistratesHearing.hearingSlotAllocations
      });

      actions$ = hot(' -a-----', { a: allocateMagistratesHearing });
      const allocate$ = cold(' -(b|)');
      const expected$ = cold('--(x)', {
        x: allocateMagistratesHearingAction
      });

      listingService.allocateHearing = jest.fn().mockReturnValueOnce(allocate$);

      expect(effects.allocateMagistratesHearing$).toBeObservable(expected$);
      expect(listingService.allocateHearing).toHaveBeenCalledWith(
        {
          courtCentreId: 'courtCentreId',
          courtRoomId: 'courtRoomId',
          hearingId: 'hearingId',
          hearingLanguage: 'ENGLISH',
          weekCommencingStartDate: '15-02-2022',
          weekCommencingEndDate: '22-02-2022',
          weekCommencingDurationInWeeks: 1,
          judiciary: [
            {
              isBenchChairman: false,
              isDeputy: false,
              judicialId: 'mock-judiciary-id-1',
              judicialRoleType: {
                judiciaryType: 'CIRCUIT_JUDGE'
              }
            }
          ],
          jurisdictionType: 'MAGISTRATES',
          hasVideoLink: false,
          publicListNote: '',
          nonDefaultDays: [
            {
              courtCentreId: 'courtCentreId',
              courtRoomId: 2900,
              courtScheduleId: 'A',
              duration: 30,
              oucode: 'WESTMINSTER',
              roomId: 'courtRoomId',
              session: 'AM',
              startTime: '2020-01-01T12:00:00.000Z'
            },
            {
              courtCentreId: 'courtCentreId2',
              courtRoomId: 2900,
              courtScheduleId: 'B',
              duration: 30,
              oucode: 'WEMBLEY',
              roomId: 'courtRoomId2',
              session: 'AM',
              startTime: '2020-01-05T10:00:00.000Z'
            },
            {
              courtCentreId: 'courtCentreId',
              courtRoomId: 2900,
              courtScheduleId: 'C',
              duration: 30,
              oucode: 'WESTMINSTER',
              roomId: 'courtRoomId',
              session: 'AM',
              startTime: '2020-01-06T10:00:00.000Z'
            },
            {
              courtCentreId: 'courtCentreId',
              courtRoomId: 2900,
              courtScheduleId: 'D',
              duration: 30,
              oucode: 'WESTMINSTER',
              roomId: 'courtRoomId',
              session: 'AD',
              startTime: '2020-01-07T10:00:00.000Z'
            }
          ],
          nonSittingDays: ['2020-01-02', '2020-01-03', '2020-01-04'],
          prosecutionCases: [
            {
              caseId: 'caseId',
              defendants: []
            }
          ],
          type: { id: 'mock-type-id', description: '*' },
          panel: PanelType.ADULT,
          sendNotificationToParties: true
        },
        false
      );
    });

    it('should allocate a magistrates hearing with WESTMINSTER allocation set to a duration of 1 when there are no matching hearing types', () => {
      store.dispatch(ReferenceDataActions.loadHearingTypesSuccess({ hearingTypes: [] }));
      const allocateMagistratesHearingAction = new AllocateHearingMagsAction({
        hearingSlotAllocations: allocateMagistratesHearing.hearingSlotAllocations
      });

      actions$ = hot(' -a-----', { a: allocateMagistratesHearing });
      const allocate$ = cold(' -(b|)');
      const expected$ = cold('--(x)', {
        x: allocateMagistratesHearingAction
      });

      listingService.allocateHearing = jest.fn().mockReturnValueOnce(allocate$);

      expect(effects.allocateMagistratesHearing$).toBeObservable(expected$);
      expect(listingService.allocateHearing).toHaveBeenCalledWith(
        {
          courtCentreId: 'courtCentreId',
          courtRoomId: 'courtRoomId',
          hearingId: 'hearingId',
          hearingLanguage: 'ENGLISH',
          weekCommencingStartDate: '15-02-2022',
          weekCommencingEndDate: '22-02-2022',
          weekCommencingDurationInWeeks: 1,
          sendNotificationToParties: true,
          judiciary: [
            {
              isBenchChairman: false,
              isDeputy: false,
              judicialId: 'mock-judiciary-id-1',
              judicialRoleType: {
                judiciaryType: 'CIRCUIT_JUDGE'
              }
            }
          ],
          jurisdictionType: 'MAGISTRATES',
          hasVideoLink: false,
          publicListNote: '',
          nonDefaultDays: [
            {
              courtCentreId: 'courtCentreId',
              courtRoomId: 2900,
              courtScheduleId: 'A',
              duration: 1,
              oucode: 'WESTMINSTER',
              roomId: 'courtRoomId',
              session: 'AM',
              startTime: '2020-01-01T12:00:00.000Z'
            },
            {
              courtCentreId: 'courtCentreId2',
              courtRoomId: 2900,
              courtScheduleId: 'B',
              duration: 1,
              oucode: 'WEMBLEY',
              roomId: 'courtRoomId2',
              session: 'AM',
              startTime: '2020-01-05T10:00:00.000Z'
            },
            {
              courtCentreId: 'courtCentreId',
              courtRoomId: 2900,
              courtScheduleId: 'C',
              duration: 1,
              oucode: 'WESTMINSTER',
              roomId: 'courtRoomId',
              session: 'AM',
              startTime: '2020-01-06T10:00:00.000Z'
            },
            {
              courtCentreId: 'courtCentreId',
              courtRoomId: 2900,
              courtScheduleId: 'D',
              duration: 1,
              oucode: 'WESTMINSTER',
              roomId: 'courtRoomId',
              session: 'AD',
              startTime: '2020-01-07T10:00:00.000Z'
            }
          ],
          nonSittingDays: ['2020-01-02', '2020-01-03', '2020-01-04'],
          prosecutionCases: [
            {
              caseId: 'caseId',
              defendants: []
            }
          ],
          type: { id: 'mock-type-id', description: '*' },
          panel: PanelType.ADULT
        },
        false
      );
    });

    it('should handle an error when allocating the hearing', () => {
      const error = { status: 500 };
      const apiError = new ApiError(error);

      actions$ = hot(' -a-----', { a: allocateMagistratesHearing });
      const allocate$ = cold(' -#   ', undefined, error);
      const expected$ = cold('--(x)', {
        x: apiError
      });

      listingService.allocateHearing = jest.fn().mockReturnValueOnce(allocate$);

      expect(effects.allocateMagistratesHearing$).toBeObservable(expected$);
    });
  });
});
