import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaseNotesComponent } from './case-notes.component';
import { CaseNote } from '../../../../allocate-hearing/allocate-hearing.interfaces';
import { mockFixtureInputs } from '../../../../../mock-data/mock-fixture-inputs';

describe('CaseNotesComponent', () => {
  let component: CaseNotesComponent;
  let fixture: ComponentFixture<CaseNotesComponent>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(CaseNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set caseNotes with pinned notes first then unpinned notes', () => {
    const notes = [
      { id: '2', isPinned: false, note: 'Unpinned Note 1' },
      { id: '1', isPinned: true, note: 'Pinned Note 1' }
    ] as CaseNote[];
    mockFixtureInputs(fixture, {
      caseNotes: notes
    });
    expect(component.caseNotes().length).toBe(2);
    expect(component.caseNotes()[0].isPinned).toBe(true);
    expect(component.caseNotes()[1].isPinned).toBe(false);
  });

  it('should return true if there are pinned notes', () => {
    const notes = [
      { id: '1', isPinned: true, note: 'Pinned Note 1' },
      { id: '2', isPinned: true, note: 'Unpinned Note 1' }
    ] as CaseNote[];

    mockFixtureInputs(fixture, {
      caseNotes: notes
    });
    expect(component.hasPinnedNotes()).toBe(true);
  });

  it('should return false if there are no pinned notes', () => {
    const notes = [
      { id: '1', isPinned: false, note: 'Pinned Note 1' },
      { id: '2', isPinned: false, note: 'Unpinned Note 1' }
    ] as CaseNote[];

    mockFixtureInputs(fixture, {
      caseNotes: notes
    });
    expect(component.hasPinnedNotes()).toBe(false);
  });
});
