import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgModel } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CourtSession, HearingSlot } from '@cpp/scheduling';
import { RequiresAllDayDurationBasedSessionDirective } from '../requires-all-day-duration-based-session-validator.directive';

const startDate = '2025-01-28';

const slot = (
  courtScheduleId: string,
  sessionDate: string,
  courtSession: CourtSession,
  slotBased = false
) => ({ courtScheduleId, sessionDate, courtSession, slotBased }) as HearingSlot;

@Component({
  imports: [FormsModule, RequiresAllDayDurationBasedSessionDirective],
  template: `
    <input
      type="checkbox"
      [ngModel]="isMultiDay()"
      [requiresAllDayDurationBasedSession]="startDate"
      [hearingSlots]="hearingSlots()"
    />
  `
})
class HostComponent {
  readonly startDate = startDate;
  readonly isMultiDay = signal(false);
  readonly hearingSlots = signal<HearingSlot[]>([]);
}

describe('RequiresAllDayDurationBasedSessionDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  const renderWith = async (isMultiDay: boolean, hearingSlots: HearingSlot[]) => {
    fixture.componentInstance.isMultiDay.set(isMultiDay);
    fixture.componentInstance.hearingSlots.set(hearingSlots);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const multiDayErrors = () =>
    fixture.debugElement.query(By.directive(NgModel)).injector.get(NgModel).errors;

  const noAllDayDurationBasedSessionError = {
    noAllDayDurationBasedSession: { startDate: '28-01-2025' }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
  });

  it('is valid when the hearing is not multi-day', async () => {
    await renderWith(false, [slot('am-28', startDate, 'AM')]);

    expect(multiDayErrors()).toBeNull();
  });

  it('is valid when there is an all day duration based session on the start date', async () => {
    await renderWith(true, [slot('am-28', startDate, 'AM'), slot('ad-28', startDate, 'AD')]);

    expect(multiDayErrors()).toBeNull();
  });

  it('is invalid when the only all day session on the start date is slot based', async () => {
    await renderWith(true, [slot('ad-28', startDate, 'AD', true)]);

    expect(multiDayErrors()).toEqual(noAllDayDurationBasedSessionError);
  });

  it('is invalid when the only all day duration based session is on a different date', async () => {
    await renderWith(true, [slot('am-28', startDate, 'AM'), slot('ad-29', '2025-01-29', 'AD')]);

    expect(multiDayErrors()).toEqual(noAllDayDurationBasedSessionError);
  });

  it('becomes valid when an all day duration based session arrives after the hearing slots load', async () => {
    await renderWith(true, []);
    expect(multiDayErrors()).not.toBeNull();

    await renderWith(true, [slot('ad-28', startDate, 'AD')]);

    expect(multiDayErrors()).toBeNull();
  });
});
