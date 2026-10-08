import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { GroupCaseSummaryComponent } from './group-case-summary.component';

describe('GroupCaseSummaryComponent', () => {
  let fixture: ComponentFixture<GroupCaseSummaryComponent>;

  const textByTestId = (testId: string) =>
    fixture.debugElement
      .query(By.css(`[data-test-id="${testId}"]`))
      .nativeElement.textContent.trim();

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupCaseSummaryComponent);
    fixture.componentRef.setInput('groupCaseCount', 25);
    fixture.detectChanges();
  });

  it('should display the number of defendants', () => {
    expect(textByTestId('numberOfDefendants')).toBe('25 DEFENDANTS');
  });

  it('should display the number of cases', () => {
    expect(textByTestId('numberOfCases')).toBe('25 CASES');
  });
});
