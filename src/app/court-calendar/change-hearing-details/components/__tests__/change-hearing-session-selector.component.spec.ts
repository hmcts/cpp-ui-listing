import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
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

@Component({
  imports: [FormsModule, ChangeHearingSessionSelectorComponent],
  template: `
    <form>
      <change-hearing-session-selector
        name="courtScheduleId"
        ngModel
        [hearingSlots]="hearingSlots()"
        [sessionDate]="sessionDate()"
      ></change-hearing-session-selector>
    </form>
  `
})
class HostComponent {
  readonly hearingSlots = signal<HearingSlot[]>(slotsAcrossHearingRange);
  readonly sessionDate = signal<string>('2026-10-12');
}

describe('ChangeHearingSessionSelectorComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  const optionValues = (): string[] =>
    fixture.debugElement
      .query(By.directive(ChangeHearingSessionSelectorComponent))
      .injector.get(ChangeHearingSessionSelectorComponent)
      .sessionTimesOptions()
      .map(({ value }) => value);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
  });

  it('offers only the sessions on the hearing start date', () => {
    fixture.detectChanges();

    expect(optionValues()).toEqual(['lng-12', 'nth-12']);
  });
});
