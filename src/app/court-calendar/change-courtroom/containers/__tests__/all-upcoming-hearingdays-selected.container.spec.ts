import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ValidationError } from '@cpp/pdk';

import { AllFutureHearingDaysSelectedContainer } from '../all-upcoming-hearing-days-selected/all-upcoming-hearingdays-selected.container';
import { ChangeCourtroomStore } from '../../component-store/change-courtroom.store';
import { AppConfigService } from '../../../../config';
import { ChangeCourtroomVM, HearingDayVM, caseReferncesVM } from '../../../model';
import { JurisdictionType } from '../../../../core';

interface CourtRoom {
  id: string;
  courtroomId: number;
  venueName: string;
  welshVenueName?: string;
  courtroomName: string;
  welshCourtroomName?: string;
}

describe('AllFutureHearingDaysSelectedContainer', () => {
  let component: AllFutureHearingDaysSelectedContainer;
  let fixture: ComponentFixture<AllFutureHearingDaysSelectedContainer>;
  let mockRouter: any;
  let mockActivatedRoute: any;
  let mockChangeCourtroomStore: any;
  let mockAppConfigService: any;

  const mockCases: caseReferncesVM[] = [
    { caseId: '1', caseUrn: 'CASE001' },
    { caseId: '2', caseUrn: 'CASE002' }
  ];

  const mockCourtRooms: CourtRoom[] = [
    {
      id: 'room1',
      courtroomId: 1,
      venueName: 'Central Court',
      welshVenueName: 'Llys Canolog',
      courtroomName: 'Court Room 1',
      welshCourtroomName: 'Ystafell Llys 1'
    },
    {
      id: 'room2',
      courtroomId: 2,
      venueName: 'Central Court',
      welshVenueName: 'Llys Canolog',
      courtroomName: 'Court Room 2',
      welshCourtroomName: 'Ystafell Llys 2'
    }
  ];

  const mockFutureHearingDays: HearingDayVM[] = [
    {
      courtRoomId: 'room1',
      hearingDate: '2024-02-01',
      startTime: '10:00',
      endTime: '16:00',
      durationMinutes: 360,
      sequence: 1,
      matchedWithQuery: true,
      courtCentreId: 'centre1',
      courtScheduleId: 'schedule1',
      position: 1
    },
    {
      courtRoomId: 'room1',
      hearingDate: '2024-02-02',
      startTime: '10:00',
      endTime: '16:00',
      durationMinutes: 360,
      sequence: 2,
      matchedWithQuery: true,
      courtCentreId: 'centre1',
      courtScheduleId: 'schedule2',
      position: 2
    }
  ];

  const mockHearingVM: ChangeCourtroomVM = {
    time: '10:00 AM',
    hearingType: 'Trial',
    cases: mockCases,
    upComingHearingDays: mockFutureHearingDays,
    totalHearingDaysCount: 2,
    hasReportingRestriction: false,
    courtCentre: 'Central Court',
    courtRooms: mockCourtRooms as any,
    startDate: '2024-02-01',
    endDate: '2024-02-02',
    ouCode: 'OU001',
    jurisdictionType: 'CROWN' as JurisdictionType
  };

  beforeEach(async () => {
    mockChangeCourtroomStore = {
      hearingVM: signal(mockHearingVM),
      selectedCourtroom: signal(''),
      selectedHearingDays: signal([]),
      hearingSlots: signal([]),
      courtRooms: signal(mockCourtRooms.map(r => ({ label: r.courtroomName, value: r.id }))),
      upcomingHearingDays: signal(mockFutureHearingDays),
      setSelectedHearingDays: jest.fn(),
      updateSelectedHearingDays: jest.fn(),
      loadHearingSlots: jest.fn(),
      cancelChange: jest.fn(),
      confirmChange: jest.fn(),
      reset: jest.fn()
    };

    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ChangeCourtroomStore,
          useValue: mockChangeCourtroomStore
        },
        {
          provide: AppConfigService,
          useValue: {
            getBaseUrl: jest.fn().mockReturnValue('test-app.com')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AllFutureHearingDaysSelectedContainer);
    component = fixture.componentInstance;

    mockRouter = TestBed.inject(Router);
    mockActivatedRoute = TestBed.inject(ActivatedRoute);
    mockAppConfigService = TestBed.inject(AppConfigService);

    jest.spyOn(mockRouter, 'navigate').mockImplementation(() => Promise.resolve(true));
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct default values', () => {
      expect(component.errors).toBeNull();
      expect(component.selectedCourtRoomId()).toBeNull();
    });

    it('should inject all required services', () => {
      expect(component.router).toBe(mockRouter);
      expect(component.route).toBe(mockActivatedRoute);
      expect(component.store).toBe(mockChangeCourtroomStore);
      expect(component.appConfig).toBe(mockAppConfigService);
    });
  });

  describe('Store signal access', () => {
    it('should expose hearingVM from store', () => {
      expect(component.store.hearingVM()).toEqual(mockHearingVM);
    });

    it('should expose upcomingHearingDays from store', () => {
      expect(component.store.upcomingHearingDays()).toEqual(mockFutureHearingDays);
    });

    it('should expose courtRooms from store', () => {
      const rooms = component.store.courtRooms();
      expect(rooms).toEqual([
        { label: 'Court Room 1', value: 'room1' },
        { label: 'Court Room 2', value: 'room2' }
      ]);
    });
  });

  describe('showValidationError', () => {
    it('should set errors property', () => {
      const validationErrors: ValidationError[] = [
        { message: 'Field is required' } as ValidationError
      ];

      component.showValidationError(validationErrors);

      expect(component.errors).toEqual(validationErrors);
    });

    it('should handle empty errors array', () => {
      const validationErrors: ValidationError[] = [];

      component.showValidationError(validationErrors);

      expect(component.errors).toEqual([]);
    });

    it('should handle null errors', () => {
      component.showValidationError(null);

      expect(component.errors).toBeNull();
    });
  });

  describe('handleSubmit', () => {
    it('should call updateSelectedHearingDays with correct HearingDayVM properties', () => {
      const courtRoomId = 'room2';
      const formValue = { courtRoomId };

      component.handleSubmit(formValue);

      expect(mockChangeCourtroomStore.updateSelectedHearingDays).toHaveBeenCalledWith({
        hearingDays: mockHearingVM.upComingHearingDays,
        courtRoomId
      });
    });

    it('should navigate to confirmation page', () => {
      const courtRoomId = 'room2';
      const formValue = { courtRoomId };

      component.handleSubmit(formValue);

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['../all-future-hearingdays-selected-confirm'],
        { relativeTo: mockActivatedRoute }
      );
    });

    it('should handle submission with different court room IDs', () => {
      const courtRoomId = 'room1';
      const formValue = { courtRoomId };

      component.handleSubmit(formValue);

      expect(mockChangeCourtroomStore.updateSelectedHearingDays).toHaveBeenCalledWith({
        hearingDays: mockHearingVM.upComingHearingDays,
        courtRoomId
      });
    });

    it('should handle empty future hearing days array', () => {
      const emptyHearingVM: ChangeCourtroomVM = {
        ...mockHearingVM,
        upComingHearingDays: []
      };

      mockChangeCourtroomStore.hearingVM = signal(emptyHearingVM);

      const courtRoomId = 'room2';
      const formValue = { courtRoomId };

      component.handleSubmit(formValue);

      expect(mockChangeCourtroomStore.updateSelectedHearingDays).toHaveBeenCalledWith({
        hearingDays: [],
        courtRoomId
      });
    });
  });

  describe('getBaseUrl', () => {
    it('should get base URL from app config service', () => {
      const result = component.appConfig.getBaseUrl();

      expect(result).toBe('test-app.com');
      expect(mockAppConfigService.getBaseUrl).toHaveBeenCalled();
    });

    it('should handle empty base URL', () => {
      mockAppConfigService.getBaseUrl.mockReturnValue('');

      const result = component.appConfig.getBaseUrl();

      expect(result).toBe('');
    });
  });

  describe('Component State Management', () => {
    it('should update selectedCourtRoomId when changed', () => {
      component.selectedCourtRoomId.set('room2');
      expect(component.selectedCourtRoomId()).toBe('room2');
    });

    it('should reset selectedCourtRoomId to null', () => {
      component.selectedCourtRoomId.set('room1');
      component.selectedCourtRoomId.set(null);
      expect(component.selectedCourtRoomId()).toBeNull();
    });

    it('should handle court room data structure correctly', () => {
      const hearingVM = component.store.hearingVM();
      const courtRoom = hearingVM.courtRooms[0] as any;
      expect(courtRoom.id).toBe('room1');
      expect(courtRoom.courtroomId).toBe(1);
      expect(courtRoom.venueName).toBe('Central Court');
      expect(courtRoom.welshVenueName).toBe('Llys Canolog');
      expect(courtRoom.courtroomName).toBe('Court Room 1');
      expect(courtRoom.welshCourtroomName).toBe('Ystafell Llys 1');
    });

    it('should handle hearing days with optional properties missing', () => {
      const minimalHearingDay: HearingDayVM = {
        hearingDate: '2024-02-01',
        startTime: '10:00',
        endTime: '16:00',
        durationMinutes: 360,
        sequence: 1,
        position: 1
      };

      expect(minimalHearingDay.courtRoomId).toBeUndefined();
      expect(minimalHearingDay.matchedWithQuery).toBeUndefined();
      expect(minimalHearingDay.courtCentreId).toBeUndefined();
      expect(minimalHearingDay.courtScheduleId).toBeUndefined();
    });
  });

  describe('Store Data Access', () => {
    it('should access hearing VM cases from store', () => {
      const hearingVM = component.store.hearingVM();
      expect(hearingVM.cases).toEqual(mockCases);
      expect(hearingVM.cases[0].caseId).toBe('1');
      expect(hearingVM.cases[0].caseUrn).toBe('CASE001');
      expect(hearingVM.cases[1].caseId).toBe('2');
      expect(hearingVM.cases[1].caseUrn).toBe('CASE002');
    });

    it('should handle hearing days with all optional properties', () => {
      const completeHearingDay: HearingDayVM = {
        courtRoomId: 'room1',
        hearingDate: '2024-02-01',
        startTime: '10:00',
        endTime: '16:00',
        durationMinutes: 360,
        sequence: 1,
        matchedWithQuery: true,
        courtCentreId: 'centre1',
        courtScheduleId: 'schedule1',
        position: 1
      };

      expect(completeHearingDay.courtRoomId).toBe('room1');
      expect(completeHearingDay.matchedWithQuery).toBe(true);
      expect(completeHearingDay.courtCentreId).toBe('centre1');
      expect(completeHearingDay.courtScheduleId).toBe('schedule1');
      expect(completeHearingDay.position).toBe(1);
    });

    it('should handle hearing VM with Welsh court room names', () => {
      const welshCourtRooms: CourtRoom[] = [
        {
          id: 'room3',
          courtroomId: 3,
          venueName: 'Cardiff Court',
          welshVenueName: 'Llys Caerdydd',
          courtroomName: 'Court Room 3',
          welshCourtroomName: 'Ystafell Llys 3'
        }
      ];

      const hearingVMWithWelsh: ChangeCourtroomVM = {
        ...mockHearingVM,
        courtRooms: welshCourtRooms
      };

      mockChangeCourtroomStore.hearingVM = signal(hearingVMWithWelsh);

      const hearingVM = mockChangeCourtroomStore.hearingVM();
      expect(hearingVM.courtRooms[0].welshCourtroomName).toBe('Ystafell Llys 3');
      expect(hearingVM.courtRooms[0].welshVenueName).toBe('Llys Caerdydd');
    });
  });

  describe('Error Handling', () => {
    it('should handle submit with empty courtRoomId', () => {
      const invalidFormValue = { courtRoomId: '' };

      component.handleSubmit(invalidFormValue);

      expect(mockChangeCourtroomStore.updateSelectedHearingDays).toHaveBeenCalledWith({
        hearingDays: mockHearingVM.upComingHearingDays,
        courtRoomId: ''
      });
    });
  });
});
