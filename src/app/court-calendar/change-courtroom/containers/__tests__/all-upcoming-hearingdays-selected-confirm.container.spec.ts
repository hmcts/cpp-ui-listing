import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ValidationError } from '@cpp/pdk';
import { By } from '@angular/platform-browser';
import { AllFutureHearingDaysSelectedConfirmContainer } from '../all-upcoming-hearing-days-selected-confirm/all-upcoming-hearingdays-selected-confirm.container';
import { ChangeCourtroomStore } from '../../component-store/change-courtroom.store';
import { ChangeCourtroomVM, caseReferncesVM } from '../../../model';
import { HearingDayVM } from '../../../model';
import { provideRouter, Router } from '@angular/router';
import { JurisdictionType } from '../../../../core';
import { provideMockStore } from '@ngrx/store/testing';
import { getSelectedHearing } from '../../../state/selectors/court-calendar.selectors';

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
  let mockChangeCourtroomStore: any;
  let mockRouter: Router;

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

  const mockSelectedHearingDays: HearingDayVM[] = [
    {
      courtRoomId: 'room2',
      hearingDate: '2024-02-01',
      startTime: '10:00',
      endTime: '16:00',
      durationMinutes: 360,
      sequence: 1,
      position: 1
    },
    {
      courtRoomId: 'room2',
      hearingDate: '2024-02-02',
      startTime: '10:00',
      endTime: '16:00',
      durationMinutes: 360,
      sequence: 2,
      position: 2
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
    courtRooms: mockCourtRooms as any,
    startDate: '2024-02-01',
    endDate: '2024-02-02',
    ouCode: 'OU001',
    jurisdictionType: 'CROWN' as JurisdictionType
  };

  const mockSelectedHearing = { id: 'hearing-1', courtCentreId: 'cc-1' } as any;

  beforeEach(async () => {
    mockChangeCourtroomStore = {
      hearingVM: signal(mockHearingVM),
      selectedCourtroom: signal('room2'),
      selectedHearingDays: signal(mockSelectedHearingDays),
      hearingSlots: signal([]),
      courtRooms: signal(mockCourtRooms.map(r => ({ label: r.courtroomName, value: r.id }))),
      upcomingHearingDays: signal([]),
      setSelectedHearingDays: jest.fn(),
      updateSelectedHearingDays: jest.fn(),
      loadHearingSlots: jest.fn(),
      confirmChange: jest.fn(),
      reset: jest.fn()
    };

    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideMockStore({
          selectors: [{ selector: getSelectedHearing, value: mockSelectedHearing }]
        }),
        {
          provide: ChangeCourtroomStore,
          useValue: mockChangeCourtroomStore
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AllFutureHearingDaysSelectedConfirmContainer);
    component = fixture.componentInstance;

    mockChangeCourtroomStore = TestBed.inject(ChangeCourtroomStore);
    mockRouter = TestBed.inject(Router);
    jest.spyOn(mockRouter, 'navigate').mockImplementation(() => Promise.resolve(true));
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct default values', () => {
      expect(component.errors).toBeNull();
    });

    it('should inject ChangeCourtroomStore', () => {
      expect(component.changeCourtroomStore).toBe(mockChangeCourtroomStore);
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
    it('should call confirmChange with selectedHearing and onSuccess callback when changeCourtRoom is true', () => {
      const formData = { changeCourtRoom: true };

      component.handleFormSubmission(formData);

      expect(mockChangeCourtroomStore.confirmChange).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedHearing: mockSelectedHearing,
          onSuccess: expect.any(Function)
        })
      );
      expect(mockChangeCourtroomStore.setSelectedHearingDays).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should call setSelectedHearingDays and cancelChange when changeCourtRoom is false', () => {
      const formData = { changeCourtRoom: false };

      component.handleFormSubmission(formData);

      expect(mockChangeCourtroomStore.confirmChange).not.toHaveBeenCalled();
      expect(mockChangeCourtroomStore.setSelectedHearingDays).toHaveBeenCalledWith([]);
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['../all-hearing-days'],
        expect.objectContaining({ relativeTo: expect.anything() })
      );
    });

    it('should handle edge case with undefined changeCourtRoom', () => {
      const formData = { changeCourtRoom: undefined as any };

      component.handleFormSubmission(formData);

      expect(mockChangeCourtroomStore.confirmChange).not.toHaveBeenCalled();
      expect(mockChangeCourtroomStore.setSelectedHearingDays).toHaveBeenCalledWith([]);
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['../all-hearing-days'],
        expect.objectContaining({ relativeTo: expect.anything() })
      );
    });
  });

  describe('Template Integration', () => {
    beforeEach(() => {
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

  describe('Store Signal Access', () => {
    it('should access selectedHearingDays from store', () => {
      expect(component.changeCourtroomStore.selectedHearingDays()).toEqual(mockSelectedHearingDays);
      expect(component.changeCourtroomStore.selectedHearingDays()).toHaveLength(2);
    });

    it('should access selectedCourtroom from store', () => {
      expect(component.changeCourtroomStore.selectedCourtroom()).toBe('room2');
    });

    it('should access hearingVM from store', () => {
      expect(component.changeCourtroomStore.hearingVM()).toEqual(mockHearingVM);
    });

    it('should access courtRooms from store', () => {
      const rooms = component.changeCourtroomStore.courtRooms();
      expect(rooms).toEqual([
        { label: 'Court Room 1', value: 'room1' },
        { label: 'Court Room 2', value: 'room2' }
      ]);
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
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

  describe('Template Data Binding', () => {
    beforeEach(() => {
      fixture.detectChanges();
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
      jest.clearAllMocks();

      component.handleFormSubmission({ changeCourtRoom: true });
      expect(mockChangeCourtroomStore.confirmChange).toHaveBeenCalledTimes(1);

      component.handleFormSubmission({ changeCourtRoom: false });
      expect(mockChangeCourtroomStore.setSelectedHearingDays).toHaveBeenCalledWith([]);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle component destruction gracefully', () => {
      fixture.detectChanges();
      expect(() => fixture.destroy()).not.toThrow();
    });

    it('should display 0 days when selectedHearingDays store signal is empty', () => {
      mockChangeCourtroomStore.selectedHearingDays = signal([]);
      fixture.detectChanges();

      const daysSpan = fixture.debugElement.nativeElement.querySelector('dd span');
      expect(daysSpan.textContent.trim()).toBe('0 days');
    });

    it('should implement OnInit interface', () => {
      expect(typeof component.onValidationError).toBe('function');
      expect(typeof component.handleFormSubmission).toBe('function');
    });

    it('should handle hearing days with all properties', () => {
      const completeHearingDays: HearingDayVM[] = [
        {
          courtRoomId: 'room1',
          hearingDate: '2024-02-01',
          startTime: '10:00',
          endTime: '16:00',
          durationMinutes: 360,
          sequence: 1,
          position: 1
        }
      ];

      mockChangeCourtroomStore.selectedHearingDays = signal(completeHearingDays);

      const days = mockChangeCourtroomStore.selectedHearingDays();
      expect(days[0].courtRoomId).toBe('room1');
      expect(days[0].hearingDate).toBe('2024-02-01');
      expect(days[0].startTime).toBe('10:00');
      expect(days[0].endTime).toBe('16:00');
      expect(days[0].durationMinutes).toBe(360);
      expect(days[0].sequence).toBe(1);
    });
  });
});
