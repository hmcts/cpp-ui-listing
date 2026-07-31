import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { ValidationError, SelectOption } from '@cpp/pdk';

import { AllFutureHearingDaysSelectedContainer } from '../all-upcoming-hearing-days-selected/all-upcoming-hearingdays-selected.container';
import { ChangeCourtroomStateService } from '../../component-store/change-courtroom-state.service';
import { AppConfigService } from '../../../../config';
import { ChangeCourtroomVM, HearingDayVM, caseReferncesVM } from '../../../model';

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
  let mockChangeCourtroomStateService: any;
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
    courtRooms: mockCourtRooms,
    startDate: '2024-02-01',
    endDate: '2024-02-02'
  };

  const mockCourtRoomOptions: SelectOption<string>[] = [
    { label: 'Court Room 1', value: 'room1' },
    { label: 'Court Room 2', value: 'room2' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ChangeCourtroomStateService,
          useValue: {
            hearingVM$: of(mockHearingVM),
            getCourtRooms: of(mockCourtRoomOptions),
            updateSelectedHearingDays: jest.fn()
          }
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
    mockChangeCourtroomStateService = TestBed.inject(ChangeCourtroomStateService);
    mockAppConfigService = TestBed.inject(AppConfigService);

    jest.spyOn(mockRouter, 'navigate').mockImplementation(() => Promise.resolve(true));
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct default values', () => {
      expect(component.errors).toBeNull();
      expect(component.selectedCourtRoomId).toBeNull();
    });

    it('should inject all required services', () => {
      expect(component.router).toBe(mockRouter);
      expect(component.route).toBe(mockActivatedRoute);
      expect(component.changeCourtroomStateService).toBe(mockChangeCourtroomStateService);
      expect(component.appConfig).toBe(mockAppConfigService);
    });
  });

  describe('ngOnInit', () => {
    it('should set up observables correctly', () => {
      component.ngOnInit();

      expect(component.hearingVM$).toBe(mockChangeCourtroomStateService.hearingVM$);
      expect(component.courtRoomOptions$).toBe(mockChangeCourtroomStateService.getCourtRooms);
    });

    it('should get hearing VM data from service', (done) => {
      component.ngOnInit();

      component.hearingVM$.subscribe((hearingVM) => {
        expect(hearingVM).toEqual(mockHearingVM);
        done();
      });
    });

    it('should get court room options from service', (done) => {
      component.ngOnInit();

      component.courtRoomOptions$.subscribe((options) => {
        expect(options).toEqual(mockCourtRoomOptions);
        done();
      });
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
    beforeEach(() => {
      component.ngOnInit();
      jest.clearAllMocks();
    });

    it('should call updateSelectedHearingDays with correct HearingDayVM properties', () => {
      const courtRoomId = 'room2';
      const formValue = { courtRoomId };

      component.handleSubmit(formValue);

      const expectedHearingDays = mockHearingVM.upComingHearingDays;
      expect(mockChangeCourtroomStateService.updateSelectedHearingDays).toHaveBeenCalledWith({
        hearingDays: expectedHearingDays,
        courtRoomId: courtRoomId
      });

      const callArgs = mockChangeCourtroomStateService.updateSelectedHearingDays.mock.calls[0][0];
      expect(callArgs.hearingDays[0].hearingDate).toBe('2024-02-01');
      expect(callArgs.hearingDays[0].startTime).toBe('10:00');
      expect(callArgs.hearingDays[0].endTime).toBe('16:00');
      expect(callArgs.hearingDays[0].durationMinutes).toBe(360);
      expect(callArgs.hearingDays[0].sequence).toBe(1);
      expect(callArgs.hearingDays[0].position).toBe(1);
      expect(callArgs.hearingDays[0].matchedWithQuery).toBe(true);
      expect(callArgs.hearingDays[0].courtCentreId).toBe('centre1');
      expect(callArgs.hearingDays[0].courtScheduleId).toBe('schedule1');
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

      expect(mockChangeCourtroomStateService.updateSelectedHearingDays).toHaveBeenCalledWith({
        hearingDays: mockHearingVM.upComingHearingDays,
        courtRoomId: courtRoomId
      });
    });

    it('should handle empty future hearing days array', () => {
      const emptyHearingVM: ChangeCourtroomVM = {
        ...mockHearingVM,
        upComingHearingDays: []
      };

      mockChangeCourtroomStateService.hearingVM$ = of(emptyHearingVM);
      component.ngOnInit();

      const courtRoomId = 'room2';
      const formValue = { courtRoomId };

      component.handleSubmit(formValue);

      expect(mockChangeCourtroomStateService.updateSelectedHearingDays).toHaveBeenCalledWith({
        hearingDays: [],
        courtRoomId: courtRoomId
      });
    });
  });

  describe('getBaseUrl', () => {
    it('should get base URL from app config service', () => {
      const result = component.getBaseUrl();

      expect(result).toBe('test-app.com');
      expect(mockAppConfigService.getBaseUrl).toHaveBeenCalled();
    });

    it('should handle empty base URL', () => {
      mockAppConfigService.getBaseUrl.mockReturnValue('');

      const result = component.getBaseUrl();

      expect(result).toBe('');
    });
  });

  describe('Observable Data Flow', () => {
    it('should handle hearing VM observable changes', (done) => {
      const newHearingVM: ChangeCourtroomVM = {
        ...mockHearingVM,
        time: '2:00 PM',
        totalHearingDaysCount: 3,
        upComingHearingDays: [
          ...mockFutureHearingDays,
          {
            courtRoomId: 'room2',
            hearingDate: '2024-02-03',
            startTime: '14:00',
            endTime: '17:00',
            durationMinutes: 180,
            sequence: 3,
            matchedWithQuery: true,
            courtCentreId: 'centre1',
            courtScheduleId: 'schedule3',
            position: 3
          }
        ]
      };

      const hearingVMSubject = new Subject<ChangeCourtroomVM>();
      mockChangeCourtroomStateService.hearingVM$ = hearingVMSubject.asObservable();

      component.ngOnInit();

      component.hearingVM$.subscribe((hearingVM) => {
        expect(hearingVM).toEqual(newHearingVM);
        done();
      });

      hearingVMSubject.next(newHearingVM);
    });

    it('should handle court room options observable changes', (done) => {
      const newOptions: SelectOption<string>[] = [{ label: 'Court Room 3', value: 'room3' }];

      const courtRoomOptionsSubject = new Subject<SelectOption<string>[]>();
      mockChangeCourtroomStateService.getCourtRooms = courtRoomOptionsSubject.asObservable();

      component.ngOnInit();

      component.courtRoomOptions$.subscribe((options) => {
        expect(options).toEqual(newOptions);
        done();
      });

      courtRoomOptionsSubject.next(newOptions);
    });
  });

  describe('Error Handling', () => {
    it('should handle null hearing VM', (done) => {
      mockChangeCourtroomStateService.hearingVM$ = of(null);
      component.ngOnInit();

      component.hearingVM$.subscribe((hearingVM) => {
        expect(hearingVM).toBeNull();
        done();
      });
    });

    it('should handle empty court room options', (done) => {
      mockChangeCourtroomStateService.getCourtRooms = of([]);
      component.ngOnInit();

      component.courtRoomOptions$.subscribe((options) => {
        expect(options).toEqual([]);
        done();
      });
    });

    it('should handle submit with invalid form data', () => {
      component.ngOnInit();
      const invalidFormValue = { courtRoomId: '' };

      component.handleSubmit(invalidFormValue);

      expect(mockChangeCourtroomStateService.updateSelectedHearingDays).toHaveBeenCalledWith({
        hearingDays: mockHearingVM.upComingHearingDays,
        courtRoomId: ''
      });
    });

    it('should handle hearing VM with Welsh court room names', (done) => {
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

      mockChangeCourtroomStateService.hearingVM$ = of(hearingVMWithWelsh);
      component.ngOnInit();

      component.hearingVM$.subscribe((hearingVM) => {
        expect(hearingVM.courtRooms[0].welshCourtroomName).toBe('Ystafell Llys 3');
        expect(hearingVM.courtRooms[0].welshVenueName).toBe('Llys Caerdydd');
        done();
      });
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

    it('should handle case references correctly', (done) => {
      component.ngOnInit();

      component.hearingVM$.subscribe((hearingVM) => {
        expect(hearingVM.cases).toEqual(mockCases);
        expect(hearingVM.cases[0].caseId).toBe('1');
        expect(hearingVM.cases[0].caseUrn).toBe('CASE001');
        expect(hearingVM.cases[1].caseId).toBe('2');
        expect(hearingVM.cases[1].caseUrn).toBe('CASE002');
        done();
      });
    });
  });

  describe('Component State Management', () => {
    it('should update selectedCourtRoomId when changed', () => {
      component.selectedCourtRoomId = 'room2';
      expect(component.selectedCourtRoomId).toBe('room2');
    });

    it('should reset selectedCourtRoomId to null', () => {
      component.selectedCourtRoomId = 'room1';
      component.selectedCourtRoomId = null;
      expect(component.selectedCourtRoomId).toBeNull();
    });

    it('should handle court room data structure correctly', (done) => {
      component.ngOnInit();

      component.hearingVM$.subscribe((hearingVM) => {
        const courtRoom = hearingVM.courtRooms[0];
        expect(courtRoom.id).toBe('room1');
        expect(courtRoom.courtroomId).toBe(1);
        expect(courtRoom.venueName).toBe('Central Court');
        expect(courtRoom.welshVenueName).toBe('Llys Canolog');
        expect(courtRoom.courtroomName).toBe('Court Room 1');
        expect(courtRoom.welshCourtroomName).toBe('Ystafell Llys 1');
        done();
      });
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
});
