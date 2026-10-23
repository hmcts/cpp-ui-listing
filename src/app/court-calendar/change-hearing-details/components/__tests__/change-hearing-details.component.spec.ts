import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ChangeHearingDetailsComponent,
  ChangeHearingDetailsFormValues
} from '../change-hearing-details.component';
import { reducers } from '../../../../core/reducers';
import {
  initialHearingFormValues,
  mockSelectedCourtCentre,
  selectedHearing
} from '../../../utils/mocks';
import { CourtSession, HearingSlot } from '@cpp/scheduling';
import { omit } from 'lodash-es';
import { ChangeDetectionStrategy } from '@angular/compiler';
import { provideStore } from '@ngrx/store';
import { provideRouter } from '@angular/router';
import { mockFixtureInputs } from '../../../../../mock-data/mock-fixture-inputs';

const sessionTimes: Record<CourtSession, { start: string; end: string }> = {
  AM: { start: '09:00', end: '12:00' },
  PM: { start: '13:00', end: '16:00' },
  AD: { start: '09:00', end: '16:00' }
};

const hearingSlot = (
  courtScheduleId: string,
  sessionDate: string,
  courtSession: CourtSession,
  slotBased = false
) =>
  ({
    courtScheduleId,
    sessionDate,
    courtSession,
    slotBased,
    businessType: 'LNG',
    sessionStartTime: `${sessionDate}T${sessionTimes[courtSession].start}:00.000Z`,
    sessionEndTime: `${sessionDate}T${sessionTimes[courtSession].end}:00.000Z`
  }) as HearingSlot;

describe('ChangeHearingDetailsComponent', () => {
  let component: ChangeHearingDetailsComponent;
  let fixture: ComponentFixture<ChangeHearingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideStore(reducers, { runtimeChecks: {} }), provideRouter([])]
    })
      .overrideComponent(ChangeHearingDetailsComponent, {
        set: {
          changeDetection: ChangeDetectionStrategy.Default
        }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeHearingDetailsComponent);
    component = fixture.componentInstance;
    mockFixtureInputs(fixture, {
      selectedHearing: selectedHearing,
      initialValues: initialHearingFormValues,
      selectedCourtCentre: mockSelectedCourtCentre
    });
  });

  describe('Change Hearing Screen Rendering', () => {
    it('should render the component correctly with initial state', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should render correct controls for a Magistrate hearing', async () => {
      mockFixtureInputs(fixture, {
        selectedHearing: {
          ...selectedHearing,
          jurisdictionType: 'MAGISTRATES',
          hearingDays: [
            {
              ...selectedHearing.hearingDays[0],
              courtScheduleId: 'court-schedule-id'
            }
          ]
        },
        hearingSlots: [
          {
            courtScheduleId: 'court-schedule-id',
            businessType: 'test-business-type',
            sessionDate: selectedHearing.startDate,
            sessionStartTime: `${selectedHearing.startDate}T09:00:00.000Z`,
            sessionEndTime: `${selectedHearing.startDate}T12:00:00.000Z`
          } as HearingSlot
        ]
      });
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should render correct controls for a Crown hearing', async () => {
      mockFixtureInputs(fixture, {
        selectedHearing: { ...selectedHearing, jurisdictionType: 'CROWN' }
      });
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should render the session dropdown for a Crown hearing', async () => {
      mockFixtureInputs(fixture, {
        selectedHearing: {
          ...selectedHearing,
          jurisdictionType: 'CROWN',
          hearingDays: [
            {
              ...selectedHearing.hearingDays[0],
              courtScheduleId: 'court-schedule-id'
            }
          ]
        },
        hearingSlots: [
          {
            courtScheduleId: 'court-schedule-id',
            businessType: 'test-business-type',
            sessionDate: selectedHearing.startDate,
            sessionStartTime: `${selectedHearing.startDate}T09:00:00.000Z`,
            sessionEndTime: `${selectedHearing.startDate}T12:00:00.000Z`
          } as HearingSlot
        ]
      });
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });
  });

  describe('Jurisdiction type control routing', () => {
    it('should render change-hearing-crown-control for CROWN jurisdiction', async () => {
      mockFixtureInputs(fixture, {
        selectedHearing: { ...selectedHearing, jurisdictionType: 'CROWN' }
      });
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('change-hearing-crown-control')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('change-hearing-mags-control')).toBeFalsy();
    });

    it('should render change-hearing-mags-control for MAGISTRATES jurisdiction', async () => {
      mockFixtureInputs(fixture, {
        selectedHearing: { ...selectedHearing, jurisdictionType: 'MAGISTRATES' }
      });
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('change-hearing-mags-control')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('change-hearing-crown-control')).toBeFalsy();
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      jest.spyOn(component.onSubmit, 'emit');
    });

    it('should emit correct payload when submitting a single-day hearing', async () => {
      const mockFormValue = {
        dateRange: { startDate: '2025-01-01', endDate: '2025-01-01' },
        selectedHearingType: { id: '123', hearingDescription: 'Mock Hearing' },
        startTime: '10:00',
        duration: '4:00',
        hasVideoLink: true,
        sendNotificationToParties: false,
        hearingLanguage: 'ENGLISH',
        nonDefaultDays: [],
        nonSittingDays: []
      } as Omit<ChangeHearingDetailsFormValues, 'duration'> & { duration: string };

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      component.submit({ value: mockFormValue });
      expect(component.onSubmit.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          originHearing: selectedHearing,
          updatedHearing: expect.objectContaining({
            startDate: '2025-01-01',
            endDate: '2025-01-01',
            type: expect.objectContaining({ id: '123', description: 'Mock Hearing' }),
            hasVideoLink: true,
            hearingLanguage: 'ENGLISH'
          })
        })
      );
      expect(fixture).toMatchSnapshot();
    });

    it('should emit correct payload when submitting multi-day hearing', async () => {
      const multiDayValues = {
        ...initialHearingFormValues,
        dateRange: {
          startDate: '2025-01-01',
          endDate: '2025-01-03'
        },
        nonDefaultDays: [
          {
            startTime: '2025-02-03T10:00:00.000Z',
            courtCentreId: 'f8254db1-1683-483e-afb3-b87fde5a0a26',
            roomId: '9e4932f7-97b2-3010-b942-ddd2624e4dd8',
            duration: 1080,
            virtual: true
          },
          {
            startTime: '2025-02-03T10:00:00.000Z',
            courtCentreId: 'f8254db1-1683-483e-afb3-b87fde5a0a26',
            roomId: '9e4932f7-97b2-3010-b942-ddd2624e4dd8',
            duration: 360
          }
        ]
      } as unknown as Omit<ChangeHearingDetailsFormValues, 'duration'> & { duration: string };
      mockFixtureInputs(fixture, {
        hearingSlots: [hearingSlot('ad-01', '2025-01-01', 'AD')]
      });

      component.submit({ value: multiDayValues });

      expect(component.onSubmit.emit).toHaveBeenCalledTimes(1);
      expect(component.onSubmit.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          originHearing: selectedHearing,
          updatedHearing: expect.objectContaining({
            startDate: multiDayValues.dateRange.startDate,
            endDate: multiDayValues.dateRange.endDate,
            nonDefaultDays: [
              expect.objectContaining({ duration: 1080, virtual: true }),
              expect.objectContaining({ duration: 360 })
            ]
          })
        })
      );
    });

    it('sends no non-default day for a Magistrates multi-day hearing', () => {
      mockFixtureInputs(fixture, {
        selectedHearing: {
          ...selectedHearing,
          jurisdictionType: 'MAGISTRATES',
          startDate: '2025-01-28',
          endDate: '2025-01-30'
        }
      });
      const magistratesMultiDayValues = omit(initialHearingFormValues, [
        'dateRange',
        'startTime',
        'duration'
      ]) as Omit<ChangeHearingDetailsFormValues, 'duration'> & { duration: string };

      component.submit({ value: magistratesMultiDayValues });

      expect(component.onSubmit.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          updatedHearing: expect.objectContaining({
            startDate: '2025-01-28',
            endDate: '2025-01-30',
            nonDefaultDays: []
          })
        })
      );
    });

    describe('court schedule sent with the hearing', () => {
      const formValuesWithoutTimings = omit(initialHearingFormValues, ['startTime', 'duration']);

      const singleDayValues = {
        ...formValuesWithoutTimings,
        dateRange: { startDate: '2025-01-28', endDate: '2025-01-28' },
        startTime: '10:00',
        duration: '1:00'
      } as Omit<ChangeHearingDetailsFormValues, 'duration'> & { duration: string };

      const multiDayValues = {
        ...formValuesWithoutTimings,
        dateRange: { startDate: '2025-01-28', endDate: '2025-01-30' }
      } as Omit<ChangeHearingDetailsFormValues, 'duration'> & { duration: string };

      const singleDayHearingOn = (courtScheduleId: string) => ({
        ...selectedHearing,
        hearingDays: [{ ...selectedHearing.hearingDays[0], courtScheduleId }]
      });

      const existingMultiDayHearing = (firstDayCourtScheduleId: string) => ({
        ...selectedHearing,
        startDate: '2025-01-28',
        endDate: '2025-01-30',
        hearingDays: [
          { ...selectedHearing.hearingDays[0], courtScheduleId: firstDayCourtScheduleId },
          { ...selectedHearing.hearingDays[1], courtScheduleId: 'ad-29-room-2' },
          { ...selectedHearing.hearingDays[2], courtScheduleId: 'ad-30-room-2' }
        ]
      });

      const scheduleSentToFactory = () => {
        const [, { courtScheduleId, courtSession }] = jest.mocked(
          component.allocateHearingFactory.updateAllocatedHearing
        ).mock.calls[0];
        return { courtScheduleId, courtSession };
      };

      beforeEach(() => {
        jest.spyOn(component.allocateHearingFactory, 'updateAllocatedHearing');
      });

      it('sends the selected session for a single day hearing', () => {
        mockFixtureInputs(fixture, {
          selectedHearing: singleDayHearingOn('am-28'),
          hearingSlots: [
            hearingSlot('am-28', '2025-01-28', 'AM'),
            hearingSlot('pm-28', '2025-01-28', 'PM')
          ]
        });

        component.submit({ value: { ...singleDayValues, courtScheduleId: 'pm-28' } });

        expect(scheduleSentToFactory()).toEqual({ courtScheduleId: 'pm-28', courtSession: 'PM' });
      });

      it('keeps the existing all day duration based session when editing a multi-day hearing', () => {
        mockFixtureInputs(fixture, {
          selectedHearing: existingMultiDayHearing('ad-28-room-2'),
          hearingSlots: [
            hearingSlot('ad-28-room-1', '2025-01-28', 'AD'),
            hearingSlot('ad-28-room-2', '2025-01-28', 'AD')
          ]
        });

        component.submit({ value: multiDayValues });

        expect(scheduleSentToFactory()).toEqual({
          courtScheduleId: 'ad-28-room-2',
          courtSession: 'AD'
        });
      });

      it('moves a multi-day hearing off an all day slot based session to the first all day duration based session', () => {
        mockFixtureInputs(fixture, {
          selectedHearing: existingMultiDayHearing('ad-28-slot-based'),
          hearingSlots: [
            hearingSlot('ad-28-slot-based', '2025-01-28', 'AD', true),
            hearingSlot('ad-28', '2025-01-28', 'AD')
          ]
        });

        component.submit({ value: multiDayValues });

        expect(scheduleSentToFactory()).toEqual({ courtScheduleId: 'ad-28', courtSession: 'AD' });
      });

      it('moves a single day hearing on an AM session to the first all day duration based session when it becomes multi-day', () => {
        mockFixtureInputs(fixture, {
          selectedHearing: singleDayHearingOn('am-28'),
          hearingSlots: [
            hearingSlot('am-28', '2025-01-28', 'AM'),
            hearingSlot('ad-27', '2025-01-27', 'AD'),
            hearingSlot('ad-28-slot-based', '2025-01-28', 'AD', true),
            hearingSlot('ad-28', '2025-01-28', 'AD')
          ]
        });

        component.submit({ value: multiDayValues });

        expect(scheduleSentToFactory()).toEqual({ courtScheduleId: 'ad-28', courtSession: 'AD' });
      });
    });
  });

  describe('Cancel', () => {
    it('clears the validation errors and cancels when Cancel is clicked', () => {
      jest.spyOn(component.onValidationError, 'emit');
      jest.spyOn(component.onCancel, 'emit');
      fixture.detectChanges();

      fixture.nativeElement.querySelector('a[pdk-link]').click();

      expect(component.onValidationError.emit).toHaveBeenCalledWith(null);
      expect(component.onCancel.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Multi-day All Day duration based session validation', () => {
    const noAllDayDurationBasedSessionMessage =
      'Cannot change to a multi-day hearing. There is no All Day duration based session on 28-01-2025';

    const renderCrownHearingWith = async (hearingSlots: HearingSlot[]): Promise<void> => {
      mockFixtureInputs(fixture, {
        selectedHearing: {
          ...selectedHearing,
          jurisdictionType: 'CROWN',
          hearingDays: [{ ...selectedHearing.hearingDays[0], courtScheduleId: 'am-28' }]
        },
        initialValues: {
          ...initialHearingFormValues,
          dateRange: { startDate: '2025-01-28', endDate: '2025-01-28' }
        },
        hearingSlots
      });
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };

    const makeMultiDayAndSave = async (): Promise<void> => {
      fixture.nativeElement.querySelector('pdk-checkbox input[type="checkbox"]').click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      fixture.nativeElement.querySelector('[data-role="save-hearing-changes-btn"]').click();
      fixture.detectChanges();
    };

    beforeEach(() => {
      jest.spyOn(component.onSubmit, 'emit');
    });

    it('blocks saving and shows the start date when there is no All Day session on it', async () => {
      await renderCrownHearingWith([hearingSlot('am-28', '2025-01-28', 'AM')]);

      await makeMultiDayAndSave();

      expect(component.onSubmit.emit).not.toHaveBeenCalled();
      expect(fixture.nativeElement.textContent).toContain(noAllDayDurationBasedSessionMessage);
    });

    it('blocks saving when the only All Day session on the start date is slot based', async () => {
      await renderCrownHearingWith([
        hearingSlot('am-28', '2025-01-28', 'AM'),
        hearingSlot('ad-28-slot-based', '2025-01-28', 'AD', true)
      ]);

      await makeMultiDayAndSave();

      expect(component.onSubmit.emit).not.toHaveBeenCalled();
      expect(fixture.nativeElement.textContent).toContain(noAllDayDurationBasedSessionMessage);
    });

    it('saves when there is an All Day duration based session on the start date', async () => {
      await renderCrownHearingWith([
        hearingSlot('am-28', '2025-01-28', 'AM'),
        hearingSlot('ad-28', '2025-01-28', 'AD')
      ]);

      await makeMultiDayAndSave();

      expect(component.onSubmit.emit).toHaveBeenCalledTimes(1);
      expect(fixture.nativeElement.textContent).not.toContain(noAllDayDurationBasedSessionMessage);
    });
  });

  describe('Duration Validation', () => {
    const maxDurationMessage =
      'Hearing duration cannot be more than 6 hours. Enter a duration of 6 hours or less.';

    const typeInto = (name: string, value: string): void => {
      const input: HTMLInputElement = fixture.nativeElement.querySelector(
        `pdk-time-input[name="duration"] input[name="${name}"]`
      );
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };

    const saveChanges = async (): Promise<void> => {
      fixture.nativeElement.querySelector('[data-role="save-hearing-changes-btn"]').click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };

    beforeEach(async () => {
      jest.spyOn(component.onSubmit, 'emit');
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    });

    it('should block saving and show an error when the duration is more than 6 hours', async () => {
      typeInto('timeHours', '06');
      typeInto('timeMinutes', '01');
      await saveChanges();

      expect(component.onSubmit.emit).not.toHaveBeenCalled();
      expect(fixture.nativeElement.textContent).toContain(maxDurationMessage);
    });

    it('should save when the duration is exactly 6 hours', async () => {
      typeInto('timeHours', '06');
      typeInto('timeMinutes', '00');
      await saveChanges();

      expect(component.onSubmit.emit).toHaveBeenCalledTimes(1);
      expect(fixture.nativeElement.textContent).not.toContain(maxDurationMessage);
    });
  });
});
