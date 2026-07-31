import { Component, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PinnedNotesComponent } from './pinned-notes.component';
import {
  aggregatedCaseNotesMock,
  aggregatedCaseNotesMultipleDefendantsMock,
  mock_defendant3
} from '../../../mock-data/test-fixtures';
import { AggregatedCaseNotes } from '../../core/selectors';
import { PinnedNoteComponent } from './pinned-note.component';
import { CPPDatePipe } from '../../shared/pipes';

@Pipe({ name: 'cppDate' })
export class MockCPPDatePipe implements PipeTransform {
  transform(utcDate: string, format = 'D MMMM YYYY'): string {
    if (!utcDate || utcDate.trim() === '') {
      return '';
    }
    return new Date(utcDate).toISOString();
  }
}

describe('PinnedNotesComponent', () => {
  let component: TestPinnedNotesComponent;
  let fixture: ComponentFixture<TestPinnedNotesComponent>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.overrideComponent(PinnedNoteComponent, {
      remove: {
        imports: [CPPDatePipe]
      },
      add: {
        imports: [MockCPPDatePipe]
      }
    }).createComponent(TestPinnedNotesComponent);
    component = fixture.componentInstance;
    component.pinnedCaseNotes = aggregatedCaseNotesMock;
    fixture.detectChanges();
  }));

  it('should match the snapshot', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should display a title with + 1 other', () => {
    component.pinnedCaseNotes = aggregatedCaseNotesMultipleDefendantsMock;
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should display a title with + 2 others', () => {
    component.pinnedCaseNotes = aggregatedCaseNotesMultipleDefendantsMock;
    component.pinnedCaseNotes[0].caseDetails.defendants.push(mock_defendant3);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});

@Component({
  selector: 'pinned-notes-test',
  template: '<pinned-notes [pinnedCaseNotes]="pinnedCaseNotes"></pinned-notes>',
  imports: [PinnedNotesComponent]
})
class TestPinnedNotesComponent {
  pinnedCaseNotes: AggregatedCaseNotes[];
  plusOtherDefendants = jest.fn();
}
