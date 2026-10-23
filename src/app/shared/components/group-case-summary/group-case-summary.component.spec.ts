import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { GroupCaseSummaryComponent } from './group-case-summary.component';

describe('GroupCaseSummaryComponent', () => {
  let fixture: ComponentFixture<GroupCaseSummaryComponent>;

  const elementByTestId = (testId: string) =>
    fixture.debugElement.query(By.css(`[data-test-id="${testId}"]`)).nativeElement;

  const textByTestId = (testId: string) => elementByTestId(testId).textContent.trim();

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupCaseSummaryComponent);
    fixture.componentRef.setInput('groupCaseCount', 25);
    fixture.componentRef.setInput('baseUrl', 'http://localhost');
    fixture.componentRef.setInput('caseId', 'case-123');
    fixture.componentRef.setInput('caseUrn', 'URN123');
    fixture.detectChanges();
  });

  it('should display the number of defendants', () => {
    expect(textByTestId('numberOfDefendants')).toBe('25 DEFENDANTS');
  });

  it('should display the number of cases', () => {
    expect(textByTestId('numberOfCases')).toBe('25 CASES');
  });

  it('should display the case reference linking to case at a glance', () => {
    const link = elementByTestId('hearingReference');

    expect(textByTestId('hearingReference')).toBe('Case reference URN123');
    expect(link.getAttribute('href')).toBe(
      'http://localhost/prosecution-casefile/case-at-a-glance/case-123'
    );
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('should display the bulk cases tag', () => {
    expect(textByTestId('bulkCasesTag')).toBe('Bulk Cases');
  });
});
