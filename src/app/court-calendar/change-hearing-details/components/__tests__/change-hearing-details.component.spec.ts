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
import { HearingSlot } from '@cpp/scheduling';
import { ChangeDetectionStrategy } from '@angular/compiler';
import { provideStore } from '@ngrx/store';
import { provideRouter } from '@angular/router';
import { mockFixtureInputs } from '../../../../../mock-data/mock-fixture-inputs';

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
  });
});
