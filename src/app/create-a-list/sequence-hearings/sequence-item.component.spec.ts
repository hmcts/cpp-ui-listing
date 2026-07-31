import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { validHearingMock1 } from '../../../mock-data/test-fixtures';
import { SequenceItemComponent } from './sequence-item.component';

describe('Sequence Item', () => {
  let fixture: ComponentFixture<TestSequenceItemComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestSequenceItemComponent);
    fixture.detectChanges();
  });

  it('should render correctly', () => {
    expect(fixture).toMatchSnapshot();
  });

  @Component({
    selector: 'test-sequence-item',
    template: `<sequence-item [hearing]="hearing"></sequence-item>`,
    imports: [SequenceItemComponent]
  })
  class TestSequenceItemComponent {
    hearing = validHearingMock1;
  }
});
