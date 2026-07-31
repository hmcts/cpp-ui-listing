import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinnedNoteComponent } from './pinned-note.component';

describe('PinnedNoteComponent', () => {
  let component: TestPinnedNoteComponent;
  let fixture: ComponentFixture<TestPinnedNoteComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestPinnedNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should match the snapshot', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should display a note', () => {
    component.createdDateTime = '2020-11-12';
    component.firstName = 'Mock First Name';
    component.lastName = 'Mock Last Name';
    component.note = 'Mock note content';
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});

@Component({
  selector: 'pinned-note-test',
  template: ` <pinned-note
    [createdDateTime]="createdDateTime"
    [firstName]="firstName"
    [lastName]="lastName"
    [note]="note"
  ></pinned-note>`,
  imports: [PinnedNoteComponent]
})
class TestPinnedNoteComponent {
  firstName: string;
  lastName: string;
  note: string;
  createdDateTime: string;
}
