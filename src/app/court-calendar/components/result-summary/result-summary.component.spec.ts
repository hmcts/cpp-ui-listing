import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourtResultSummaryComponent } from './result-summary.component';
import { By } from '@angular/platform-browser';

import { mockSearchFormValues } from '../../utils/mocks';
import { mockFixtureInputs } from '../../../../mock-data/mock-fixture-inputs';

describe('CourtResultSummaryComponent', () => {
  let component: CourtResultSummaryComponent;
  let fixture: ComponentFixture<CourtResultSummaryComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CourtResultSummaryComponent);
    component = fixture.componentInstance;
    mockFixtureInputs(fixture, {
      totalNumber: 0,
      filterOptions: mockSearchFormValues
    });
  });

  it('should create the CourtResultSummaryComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct message when totalHearings > 0 and endDate is provided', () => {
    mockFixtureInputs(fixture, {
      totalNumber: 5,
      filterOptions: mockSearchFormValues,
      resultsDisplayed: 1
    });
    fixture.detectChanges();

    const paragraph = fixture.debugElement.query(By.css('p'));
    const textContent = paragraph.nativeElement.textContent.replace(/\s+/g, ' ').trim();
    expect(textContent).toContain(
      'Showing 1 of 5 hearings between 01/01/2024 and 07/01/2024 at Lavender hill court'
    );
  });

  it('should display correct message when totalHearings > 0 and endDate is not provided', () => {
    mockFixtureInputs(fixture, {
      totalNumber: 3,
      filterOptions: {
        ...mockSearchFormValues,
        endDate: null
      },
      resultsDisplayed: 1
    });
    fixture.detectChanges();

    const paragraph = fixture.debugElement.query(By.css('p'));
    const textContent = paragraph.nativeElement.textContent.replace(/\s+/g, ' ').trim();
    expect(textContent).toContain('Showing 1 of 3 hearings on 01/01/2024 at Lavender hill court');
  });

  it('should display "No hearings found for selected filters." when totalHearings is 0', () => {
    mockFixtureInputs(fixture, {
      filterOptions: mockSearchFormValues,
      resultsDisplayed: 0
    });
    fixture.detectChanges();

    const paragraph = fixture.debugElement.query(By.css('p'));
    expect(paragraph.nativeElement.textContent).toContain(
      'No hearings found for selected filters.'
    );
  });

  it('should correctly format the start date and end date when totalHearings > 0', () => {
    mockFixtureInputs(fixture, {
      filterOptions: mockSearchFormValues,
      resultsDisplayed: 1,
      totalNumber: 3
    });

    fixture.detectChanges();

    const textContent = fixture.debugElement.query(By.css('#resultSummary')).nativeElement
      .textContent;

    // Validating date is formatted as 'dd/MM/yyyy' or not
    expect(textContent).toContain(
      ' Showing  1 of 3  hearings  between 01/01/2024  and 07/01/2024  at  Lavender hill court '
    );
  });

  it('should not show the result summary when totalHearings is 0', () => {
    mockFixtureInputs(fixture, {
      filterOptions: mockSearchFormValues,
      resultsDisplayed: 0,
      totalNumber: 0
    });

    fixture.detectChanges();

    const resultSummary = fixture.debugElement.query(By.css('#resultSummary'));

    // Should not be present in the DOM
    expect(resultSummary).toBeNull();
  });
});
