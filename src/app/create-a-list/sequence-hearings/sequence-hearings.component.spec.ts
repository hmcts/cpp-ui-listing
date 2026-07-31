import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement, input, output } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AppConfigService } from '../../config';
import { SequenceHearingsComponent } from './sequence-hearings.component';
import {
  validHearingMock1,
  validHearingMock2,
  validHearingMock3
} from '../../../mock-data/test-fixtures';
import { Hearing } from '../../core/model';
import { CourtRestrictionEventType } from '../../core/model/court-restriction';
import { SequenceGroupComponent } from './sequence-group.component';
import { JudicialMemberNamePipe } from '@cpp/reference-data';
import { JsonPipe } from '@angular/common';
import { WofdWarningService } from '@cpp/application';

describe('Sequence Hearings', () => {
  let fixture: ComponentFixture<TestSequenceHearingsComponent>;
  let component: SequenceHearingsComponent;

  beforeEach(() => {
    fixture = TestBed.overrideComponent(SequenceHearingsComponent, {
      remove: {
        imports: [SequenceGroupComponent]
      },
      add: {
        imports: [MockSequenceGroup]
      }
    }).createComponent(TestSequenceHearingsComponent);
    const inner: DebugElement = fixture.debugElement.query(By.css('sequence-hearings'));
    component = inner.componentInstance;
    fixture.detectChanges();
  });

  it('should render correctly', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should not display the reorder component when the functionality is disabled', () => {
    fixture.componentInstance.reorderLists = false;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.reorder-btn'))).toBeFalsy();
  });

  it('should display the reorder component (reorder)', () => {
    fixture.debugElement.query(By.css('.reorder-btn')).nativeElement.click();
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should not display the reorder component (reorder then cancel)', () => {
    fixture.debugElement.query(By.css('.reorder-btn')).nativeElement.click();
    fixture.detectChanges();
    fixture.debugElement.query(By.css('.cancel-btn')).nativeElement.click();
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should not be able to save (reorder then save but nothing sequenced)', () => {
    fixture.debugElement.query(By.css('.reorder-btn')).nativeElement.click();
    fixture.detectChanges();
    fixture.debugElement.query(By.css('.save-btn')).nativeElement.click();
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.css('.save-btn')).nativeElement.getAttribute('disabled')
    ).toBeTruthy();
  });

  it('should updated the sequence and then call the save', () => {
    fixture.debugElement.query(By.css('.reorder-btn')).nativeElement.click();
    fixture.detectChanges();
    component.sequenceUpdated({
      name: '11:00 am',
      hearings: [validHearingMock1]
    });
    fixture.detectChanges();
    fixture.debugElement.query(By.css('.save-btn')).nativeElement.click();
    fixture.detectChanges();
    const expected = [
      {
        id: 'b1bfe644-15d3-46aa-bdeb-fe8d18c16a42',
        sequenceHearingDays: [
          {
            hearingDate: '2018-11-05',
            sequence: 1
          }
        ]
      }
    ];
    expect(fixture.componentInstance.save).toHaveBeenCalledWith(expected);
  });

  it('should emit court restriction for defendant', () => {
    spyOn(component.courtRestrictionCheckEvent, 'emit').and.callThrough();
    const restriction = {
      restrictionEventType: CourtRestrictionEventType.Defendant,
      defendantIds: ['1234'],
      hearingId: validHearingMock1.id,
      restrictCourtList: true
    };
    component.restrictionChanged(restriction);
    expect(component.courtRestrictionCheckEvent.emit).toHaveBeenCalledTimes(1);
    expect(component.courtRestrictionCheckEvent.emit).toHaveBeenLastCalledWith(restriction);
  });

  @Component({
    selector: 'test-sequence-hearings',
    template: `
      <sequence-hearings
        [hearings]="hearings"
        [reorderLists]="reorderLists"
        timeFormat="hh:mm a"
        (save)="save($event)"
        [selectedDate]="selectedDate"
        [judiciary]="judiciary"
      >
      </sequence-hearings>
    `,
    imports: [SequenceHearingsComponent],
    providers: [
      { provide: AppConfigService, useValue: { appUrl: 'http://baseUrl' } },
      JudicialMemberNamePipe,
      {
        provide: WofdWarningService,
        useValue: { isWofdApplication: () => false, showModal: () => {} }
      }
    ]
  })
  class TestSequenceHearingsComponent {
    hearings = [validHearingMock1, validHearingMock2, validHearingMock3];
    selectedDate = '2018-11-05';
    judiciary = validHearingMock1.judiciary;
    reorderLists = true;
    save = jest.fn();
  }

  @Component({
    selector: 'sequence-group',
    template: `
      <pre> {{ name() | json }}</pre>
      <pre> {{ hearings() | json }}</pre>
    `,
    imports: [JsonPipe]
  })
  class MockSequenceGroup {
    readonly name = input<string>(undefined);
    readonly hearings = input<Hearing[]>(undefined);
    readonly updated = output();
  }
});
