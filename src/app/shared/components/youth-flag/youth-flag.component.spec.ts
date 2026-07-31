import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Defendant } from '../../../core/model';
import { YouthFlagComponent } from './youth-flag.component';

describe('Youth Flag Component', () => {
  const youthDefendant1: Defendant = {
    lastName: 'aaa',
    isYouth: true
  } as Defendant;
  const youthDefendant2: Defendant = {
    lastName: 'zzz',
    isYouth: true
  } as Defendant;

  const nonYouthDefendant1: Defendant = {
    lastName: 'bbb'
  } as Defendant;

  const nonYouthDefendant2: Defendant = {
    isYouth: false,
    lastName: 'ccc'
  } as Defendant;

  let fixture: ComponentFixture<TestYouthFlagComponent>;
  let testInstance: TestYouthFlagComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestYouthFlagComponent);
    testInstance = fixture.componentInstance;
  });

  it('should show youth marker when any defendant is a youth', () => {
    testInstance.defendants = [nonYouthDefendant1, youthDefendant1, nonYouthDefendant2];
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should show youth marker when all defendants are youths', () => {
    testInstance.defendants = [youthDefendant1, youthDefendant2];
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should not show youth marker when there are no youth defendants', () => {
    testInstance.defendants = [nonYouthDefendant1, nonYouthDefendant2];
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });
});

@Component({
  selector: 'test-youth-flag',
  template: ` <youth-flag [defendants]="defendants"> </youth-flag> `,
  imports: [YouthFlagComponent]
})
class TestYouthFlagComponent {
  defendants: Defendant[];
}
