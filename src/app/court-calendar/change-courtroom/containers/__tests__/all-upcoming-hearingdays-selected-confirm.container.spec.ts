import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OutputEmitterRef } from '@angular/core';
import { of, Subject } from 'rxjs';
import { ValidationError, SelectOption } from '@cpp/pdk';
import { By } from '@angular/platform-browser';
import { AllFutureHearingDaysSelectedConfirmContainer } from '../all-upcoming-hearing-days-selected-confirm/all-upcoming-hearingdays-selected-confirm.container';
import { ChangeCourtroomStateService } from '../../component-store/change-courtroom-state.service';
import { ChangeCourtroomVM, ConfirmCourtRoomChangeEvent, caseReferncesVM } from '../../../model';
import { HearingDay } from '../../../../core';
import { provideRouter } from '@angular/router';

interface CourtRoom {
  id: string;
  courtroomId: number;
  venueName: string;
  welshVenueName?: string;
  courtroomName: string;
  welshCourtroomName?: string;
}

describe('AllFutureHearingDaysSelectedConfirmContainer', () => {
  let component: AllFutureHearingDaysSelectedConfirmContainer;
  let fixture: ComponentFixture<AllFutureHearingDaysSelectedConfirmContainer>;
  let mockChangeCourtroomStateService: any;

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

  const mockSelectedHearingDays: HearingDay[] = [
    {
      courtRoomId: 'room2',
      hearingDate: '2024-02-01',
      startTime: '10:00',
      endTime: '16:00',
      durationMinutes: 360,
      sequence: 1
    },
    {
      courtRoomId: 'room2',
      hearingDate: '2024-02-02',
      startTime: '10:00',
      endTime: '16:00',
      durationMinutes: 360,
      sequence: 2
    }
  ];

  const mockHearingVM: ChangeCourtroomVM = {
    time: '10:00 AM',
    hearingType: 'Trial',
    cases: mockCases,
    upComingHearingDays: [],
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
        {
          provide: ChangeCourtroomStateService,
          useValue: {
            hearingVM$: of(mockHearingVM),
            selectedHearingDays$: of(mockSelectedHearingDays),
            getCourtRooms: of(mockCourtRoomOptions),
            selectedCourtroom$: of('room2')
          }
        },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AllFutureHearingDaysSelectedConfirmContainer);
    component = fixture.componentInstance;

    mockChangeCourtroomStateService = TestBed.inject(ChangeCourtroomStateService);
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct default values', () => {
      expect(component.errors).toBeNull();
    });

    it('should have EventEmitter outputs', () => {
      expect(component.onConfirmation).toBeInstanceOf(OutputEmitterRef);
      expect(component.onSubmitForm).toBeInstanceOf(OutputEmitterRef);
    });

    it('should inject ChangeCourtroomStateService', () => {
      expect(component.changeCourtroomStateService).toBe(mockChangeCourtroomStateService);
    });
  });

  describe('ngOnInit', () => {
    it('should set up observables correctly', () => {
      component.ngOnInit();

      expect(component.hearingVM$).toBe(mockChangeCourtroomStateService.hearingVM$);
      expect(component.selectedHearingDays$).toBe(
        mockChangeCourtroomStateService.selectedHearingDays$
      );
      expect(component.courtRoomOptions$).toBe(mockChangeCourtroomStateService.getCourtRooms);
      expect(component.selectedCourtroom$).toBe(mockChangeCourtroomStateService.selectedCourtroom$);
    });

    it('should get hearing VM data from service', (done) => {
      component.ngOnInit();

      component.hearingVM$.subscribe((hearingVM) => {
        expect(hearingVM).toEqual(mockHearingVM);
        done();
      });
    });

    it('should get selected hearing days from service', (done) => {
      component.ngOnInit();

      component.selectedHearingDays$.subscribe((hearingDays) => {
        expect(hearingDays).toEqual(mockSelectedHearingDays);
        expect(hearingDays).toHaveLength(2);
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

    it('should get selected courtroom from service', (done) => {
      component.ngOnInit();

      component.selectedCourtroom$.subscribe((courtroom) => {
        expect(courtroom).toBe('room2');
        done();
      });
    });
  });

  describe('onValidationError', () => {
    it('should set errors property', () => {
      const validationErrors: ValidationError[] = [
        { message: 'Field is required' } as ValidationError
      ];

      component.onValidationError(validationErrors);

      expect(component.errors).toEqual(validationErrors);
    });

    it('should handle empty errors array', () => {
      const validationErrors: ValidationError[] = [];

      component.onValidationError(validationErrors);

      expect(component.errors).toEqual([]);
    });

    it('should handle null errors', () => {
      component.onValidationError(null);

      expect(component.errors).toBeNull();
    });
  });

  describe('handleFormSubmission', () => {
    it('should emit onConfirmation event when changeCourtRoom is true', () => {
      const emitSpy = jest.spyOn(component.onConfirmation, 'emit');
      const formData = { changeCourtRoom: true };

      component.handleFormSubmission(formData);

      const expectedEvent: ConfirmCourtRoomChangeEvent = {
        confirmed: true,
        clearSelection: false
      };

      expect(emitSpy).toHaveBeenCalledWith(expectedEvent);
    });

    it('should emit onConfirmation event when changeCourtRoom is false', () => {
      const emitSpy = jest.spyOn(component.onConfirmation, 'emit');
      const formData = { changeCourtRoom: false };

      component.handleFormSubmission(formData);

      const expectedEvent: ConfirmCourtRoomChangeEvent = {
        confirmed: false,
        clearSelection: true
      };

      expect(emitSpy).toHaveBeenCalledWith(expectedEvent);
    });

    it('should handle edge case with undefined changeCourtRoom', () => {
      const emitSpy = jest.spyOn(component.onConfirmation, 'emit');
      const formData = { changeCourtRoom: undefined as any };

      component.handleFormSubmission(formData);

      const expectedEvent: ConfirmCourtRoomChangeEvent = {
        confirmed: undefined,
        clearSelection: true
      };

      expect(emitSpy).toHaveBeenCalledWith(expectedEvent);
    });
  });

  describe('Template Integration', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should render back button with correct link', () => {
      const backButton = fixture.debugElement.query(By.css('back-button'));
      expect(backButton).toBeTruthy();
      expect(backButton.componentInstance.linkUrl()).toBe('../all-future-hearingdays-selected');
    });

    it('should hide error summary when no errors exist', () => {
      component.errors = null;
      fixture.detectChanges();

      const errorSummary = fixture.debugElement.query(By.css('pdk-error-summary'));
      expect(errorSummary).toBeFalsy();
    });

    it('should render main heading', () => {
      const heading = fixture.debugElement.nativeElement.querySelector('h1');
      expect(heading).toBeTruthy();
      expect(heading.textContent.trim()).toBe('Check courtroom change for upcoming hearing days');
    });

    it('should display number of selected hearing days', () => {
      const daysSpan = fixture.debugElement.nativeElement.querySelector('dd span');
      expect(daysSpan).toBeTruthy();
      expect(daysSpan.textContent.trim()).toBe('2 days');
    });

    it('should render courtroom change confirmation form', () => {
      const confirmationForm = fixture.debugElement.query(
        By.css('courtroom-change-confirmation-form')
      );
      expect(confirmationForm).toBeTruthy();
      expect(confirmationForm.componentInstance.confirmationLabel()).toBe(
        'Are you sure you want to change courtroom for upcoming hearing days?'
      );
    });
  });

  describe('Observable Data Flow', () => {
    it('should handle hearing VM observable changes', (done) => {
      const newHearingVM: ChangeCourtroomVM = {
        ...mockHearingVM,
        time: '2:00 PM',
        totalHearingDaysCount: 3
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

    it('should handle selected hearing days observable changes', (done) => {
      const newHearingDays: HearingDay[] = [
        {
          courtRoomId: 'room2',
          hearingDate: '2024-02-03',
          startTime: '09:00',
          endTime: '17:00',
          durationMinutes: 480,
          sequence: 1
        }
      ];

      const hearingDaysSubject = new Subject<HearingDay[]>();
      mockChangeCourtroomStateService.selectedHearingDays$ = hearingDaysSubject.asObservable();

      component.ngOnInit();

      component.selectedHearingDays$.subscribe((hearingDays) => {
        expect(hearingDays).toEqual(newHearingDays);
        expect(hearingDays).toHaveLength(1);
        done();
      });

      hearingDaysSubject.next(newHearingDays);
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

    it('should handle selected courtroom observable changes', (done) => {
      const newCourtroom = 'room3';

      const courtroomSubject = new Subject<string>();
      mockChangeCourtroomStateService.selectedCourtroom$ = courtroomSubject.asObservable();

      component.ngOnInit();

      component.selectedCourtroom$.subscribe((courtroom) => {
        expect(courtroom).toBe(newCourtroom);
        done();
      });

      courtroomSubject.next(newCourtroom);
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should call onValidationError when confirmation form emits validation error', () => {
      const onValidationErrorSpy = jest.spyOn(component, 'onValidationError');
      const validationErrors: ValidationError[] = [{ message: 'Error' } as ValidationError];

      const confirmationForm = fixture.debugElement.query(
        By.css('courtroom-change-confirmation-form')
      );
      confirmationForm.triggerEventHandler('onValidationError', validationErrors);

      expect(onValidationErrorSpy).toHaveBeenCalledWith(validationErrors);
    });

    it('should call handleFormSubmission when confirmation form is submitted', () => {
      const handleFormSubmissionSpy = jest.spyOn(component, 'handleFormSubmission');
      const formData = { changeCourtRoom: true };

      const confirmationForm = fixture.debugElement.query(
        By.css('courtroom-change-confirmation-form')
      );
      confirmationForm.triggerEventHandler('onFormSubmit', formData);

      expect(handleFormSubmissionSpy).toHaveBeenCalledWith(formData);
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

    it('should handle empty selected hearing days', (done) => {
      mockChangeCourtroomStateService.selectedHearingDays$ = of([]);
      component.ngOnInit();

      component.selectedHearingDays$.subscribe((hearingDays) => {
        expect(hearingDays).toEqual([]);
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

    it('should handle null selected courtroom', (done) => {
      mockChangeCourtroomStateService.selectedCourtroom$ = of(null);
      component.ngOnInit();

      component.selectedCourtroom$.subscribe((courtroom) => {
        expect(courtroom).toBeNull();
        done();
      });
    });

    it('should display 0 days when selectedHearingDays$ is null', () => {
      mockChangeCourtroomStateService.selectedHearingDays$ = of(null);
      component.ngOnInit();
      fixture.detectChanges();

      const daysSpan = fixture.debugElement.nativeElement.querySelector('dd span');
      expect(daysSpan.textContent.trim()).toBe('0 days');
    });
  });

  describe('Component Interface Implementation', () => {
    it('should implement ConfirmCourtRoomChange interface', () => {
      expect(component.onConfirmation).toBeDefined();
      expect(typeof component.handleFormSubmission).toBe('function');
    });

    it('should implement OnInit interface', () => {
      expect(typeof component.ngOnInit).toBe('function');
    });
  });

  describe('Data Structure Validation', () => {
    it('should handle hearing days with all properties', (done) => {
      const completeHearingDays: HearingDay[] = [
        {
          courtRoomId: 'room1',
          hearingDate: '2024-02-01',
          startTime: '10:00',
          endTime: '16:00',
          durationMinutes: 360,
          sequence: 1
        }
      ];

      mockChangeCourtroomStateService.selectedHearingDays$ = of(completeHearingDays);
      component.ngOnInit();

      component.selectedHearingDays$.subscribe((hearingDays) => {
        expect(hearingDays[0].courtRoomId).toBe('room1');
        expect(hearingDays[0].hearingDate).toBe('2024-02-01');
        expect(hearingDays[0].startTime).toBe('10:00');
        expect(hearingDays[0].endTime).toBe('16:00');
        expect(hearingDays[0].durationMinutes).toBe(360);
        expect(hearingDays[0].sequence).toBe(1);
        done();
      });
    });

    it('should handle court room options with correct structure', (done) => {
      component.ngOnInit();

      component.courtRoomOptions$.subscribe((options) => {
        expect(options[0].label).toBe('Court Room 1');
        expect(options[0].value).toBe('room1');
        expect(options[1].label).toBe('Court Room 2');
        expect(options[1].value).toBe('room2');
        done();
      });
    });
  });

  describe('Component State Management', () => {
    it('should maintain errors state correctly', () => {
      const initialErrors = [{ message: 'Initial error' } as ValidationError];
      component.onValidationError(initialErrors);
      expect(component.errors).toEqual(initialErrors);

      const newErrors = [{ message: 'New error' } as ValidationError];
      component.onValidationError(newErrors);
      expect(component.errors).toEqual(newErrors);

      component.onValidationError(null);
      expect(component.errors).toBeNull();
    });

    it('should handle multiple form submissions correctly', () => {
      const emitSpy = jest.spyOn(component.onConfirmation, 'emit');

      component.handleFormSubmission({ changeCourtRoom: true });
      expect(emitSpy).toHaveBeenCalledWith({ confirmed: true, clearSelection: false });

      component.handleFormSubmission({ changeCourtRoom: false });
      expect(emitSpy).toHaveBeenCalledWith({ confirmed: false, clearSelection: true });

      expect(emitSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Template Data Binding', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should correctly bind selected hearing days count in template', () => {
      const hearingDaysSubject = new Subject<HearingDay[]>();
      mockChangeCourtroomStateService.selectedHearingDays$ = hearingDaysSubject.asObservable();
      component.ngOnInit();
      fixture.detectChanges();

      const testCounts = [[], [{}], [{}, {}], [{}, {}, {}]];

      testCounts.forEach((hearingDays, index) => {
        hearingDaysSubject.next(hearingDays as HearingDay[]);
        fixture.detectChanges();

        const daysSpan = fixture.debugElement.nativeElement.querySelector('dd span');
        expect(daysSpan.textContent.trim()).toBe(`${index} days`);
      });
    });

    it('should pass correct props to child components', () => {
      const backButton = fixture.debugElement.query(By.css('back-button'));
      expect(backButton.componentInstance.linkUrl()).toBe('../all-future-hearingdays-selected');

      const confirmationForm = fixture.debugElement.query(
        By.css('courtroom-change-confirmation-form')
      );
      expect(confirmationForm.componentInstance.confirmationLabel()).toBe(
        'Are you sure you want to change courtroom for upcoming hearing days?'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle component destruction gracefully', () => {
      component.ngOnInit();
      expect(() => fixture.destroy()).not.toThrow();
    });
  });
});
