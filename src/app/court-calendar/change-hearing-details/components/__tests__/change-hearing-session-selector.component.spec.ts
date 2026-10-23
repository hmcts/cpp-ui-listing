import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgModel } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { HearingSlot } from '@cpp/scheduling';
import { ChangeHearingSessionSelectorComponent } from '../change-hearing-session-selector.component';

const slot = (courtScheduleId: string, sessionDate: string, businessType: string) =>
  ({
    courtScheduleId,
    sessionDate,
    businessType,
    sessionStartTime: `${sessionDate}T10:00:00.000Z`,
    sessionEndTime: `${sessionDate}T16:00:00.000Z`
  }) as HearingSlot;

const slotsAcrossHearingRange = [
  slot('lng-12', '2026-10-12', 'LNG'),
  slot('nth-12', '2026-10-12', 'NTH'),
  slot('lng-13', '2026-10-13', 'LNG'),
  slot('nth-14', '2026-10-14', 'NTH')
];

const morningSession = {
  ...slot('morning-12', '2026-10-12', 'LNG'),
  sessionStartTime: '2026-10-12T09:00:00.000Z',
  sessionEndTime: '2026-10-12T12:00:00.000Z'
} as HearingSlot;

const afternoonSession = {
  ...slot('afternoon-12', '2026-10-12', 'NTH'),
  sessionStartTime: '2026-10-12T13:00:00.000Z',
  sessionEndTime: '2026-10-12T16:00:00.000Z'
} as HearingSlot;

@Component({
  imports: [FormsModule, ChangeHearingSessionSelectorComponent],
  template: `
    <form>
      <change-hearing-session-selector
        name="courtScheduleId"
        [ngModel]="selectedCourtScheduleId()"
        [hearingSlots]="hearingSlots()"
        [sessionDate]="sessionDate()"
        [startTime]="startTime()"
      ></change-hearing-session-selector>
    </form>
  `
})
class HostComponent {
  readonly hearingSlots = signal<HearingSlot[]>(slotsAcrossHearingRange);
  readonly sessionDate = signal<string>('2026-10-12');
  readonly selectedCourtScheduleId = signal<string>(undefined);
  readonly startTime = signal<string>(undefined);
}

describe('ChangeHearingSessionSelectorComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  const sessionSelector = (): ChangeHearingSessionSelectorComponent =>
    fixture.debugElement
      .query(By.directive(ChangeHearingSessionSelectorComponent))
      .injector.get(ChangeHearingSessionSelectorComponent);

  const optionValues = (): string[] =>
    sessionSelector()
      .sessionTimesOptions()
      .map(({ value }) => value);

  const courtScheduleIdErrors = () =>
    fixture.debugElement.query(By.directive(NgModel)).injector.get(NgModel).errors;

  const settle = async (): Promise<void> => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
  });

  it('offers only the sessions on the hearing start date', () => {
    fixture.detectChanges();

    expect(optionValues()).toEqual(['lng-12', 'nth-12']);
  });

  describe('form validity', () => {
    beforeEach(async () => {
      fixture.componentInstance.hearingSlots.set([morningSession, afternoonSession]);
      fixture.componentInstance.selectedCourtScheduleId.set('morning-12');
      fixture.componentInstance.startTime.set('11:00');
      await settle();
    });

    it('is valid when the start time is within the selected session', () => {
      expect(courtScheduleIdErrors()).toBeNull();
    });

    it('is invalid when the start time moves outside the selected session', async () => {
      fixture.componentInstance.startTime.set('20:00');
      await settle();

      expect(courtScheduleIdErrors()).toEqual({ startTimeInvalid: true });
    });

    it('is invalid when a session is selected that the start time is outside of', async () => {
      sessionSelector().control.setValue('afternoon-12');
      await settle();

      expect(courtScheduleIdErrors()).toEqual({ startTimeInvalid: true });
    });

    it('is valid again when the start time moves back inside the selected session', async () => {
      fixture.componentInstance.startTime.set('20:00');
      await settle();

      fixture.componentInstance.startTime.set('11:00');
      await settle();

      expect(courtScheduleIdErrors()).toBeNull();
    });
  });
});
