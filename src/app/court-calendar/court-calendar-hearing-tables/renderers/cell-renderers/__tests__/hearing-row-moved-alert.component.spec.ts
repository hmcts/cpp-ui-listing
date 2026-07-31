import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { HearingRowMovedAlertComponent } from '../hearing-row-moved-alert.component';
import { HearingRowVM } from '../../../../../court-calendar/model';

describe('HearingRowMovedAlertComponent', () => {
  let component: HearingRowMovedAlertComponent;
  let fixture: ComponentFixture<HearingRowMovedAlertComponent>;

  const mockHearingRow: HearingRowVM = {
    id: 'hearing-123',
    rowIdentifier: 'row-123',
    hearingDate: '2024-01-15',
    dateTime: '2024-01-15T10:30:00Z',
    duration: 120,
    sequence: 1,
    isMaster: true,
    isChild: false,
    isLastChild: false,
    isDisabled: false,
    checkSplit: false,
    instances: 1,
    judiciary: [],
    hearingType: {
      id: 'type-1',
      name: 'Trial',
      description: 'Criminal Trial'
    } as any,
    defendants: {
      caseUrn: 'URN123456789',
      defendantNames: ['John Doe'],
      defendantCount: 1
    } as any,
    offences: ['Theft', 'Assault'],
    publicListNote: 'Public note',
    details: {
      hearingDayCount: 1,
      startDate: '2024-01-15'
    } as any
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(HearingRowMovedAlertComponent);
    component = fixture.componentInstance;

    component.hearingRow = mockHearingRow;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have OnPush change detection strategy', () => {
      expect(component).toBeTruthy();
    });

    it('should accept hearingRow input', () => {
      expect(component.hearingRow).toEqual(mockHearingRow);
    });
  });

  describe('Template Rendering', () => {
    it('should render pdk-alert component', () => {
      fixture.detectChanges();

      const alert = fixture.debugElement.query(By.css('pdk-alert'));
      expect(alert).toBeTruthy();
    });

    it('should have correct alert properties', () => {
      fixture.detectChanges();

      const alert = fixture.debugElement.query(By.css('pdk-alert'));
      expect(alert.nativeElement.getAttribute('icon')).toBe('true');
      expect(alert.nativeElement.getAttribute('type')).toBe('success');
    });

    it('should display success message', () => {
      fixture.detectChanges();

      const alert = fixture.debugElement.query(By.css('pdk-alert'));
      const messageText = alert.nativeElement.textContent;

      expect(messageText).toContain('Hearing');
      expect(messageText).toContain('moved successfully');
    });

    it('should include visually hidden accessibility information', () => {
      fixture.detectChanges();

      const visuallyHiddenSpan = fixture.debugElement.query(By.css('span[pdk-visually-hidden]'));
      expect(visuallyHiddenSpan).toBeTruthy();
    });

    it('should display case URN in visually hidden text', () => {
      fixture.detectChanges();

      const visuallyHiddenSpan = fixture.debugElement.query(By.css('span[pdk-visually-hidden]'));
      const hiddenText = visuallyHiddenSpan.nativeElement.textContent;

      expect(hiddenText).toContain('URN123456789');
      expect(hiddenText).toContain('for case urn URN123456789');
    });

    it('should display formatted date in visually hidden text', () => {
      fixture.detectChanges();

      const visuallyHiddenSpan = fixture.debugElement.query(By.css('span[pdk-visually-hidden]'));
      const hiddenText = visuallyHiddenSpan.nativeElement.textContent;

      expect(hiddenText).toContain('15 January 2024');
      expect(hiddenText).toContain('holding on 15 January 2024');
    });

    it('should display formatted time in visually hidden text', () => {
      fixture.detectChanges();

      const visuallyHiddenSpan = fixture.debugElement.query(By.css('span[pdk-visually-hidden]'));
      const hiddenText = visuallyHiddenSpan.nativeElement.textContent;

      expect(hiddenText).toContain('10:30 AM');
      expect(hiddenText).toContain('at 10:30 AM');
    });

    it('should have complete visually hidden message structure', () => {
      fixture.detectChanges();

      const visuallyHiddenSpan = fixture.debugElement.query(By.css('span[pdk-visually-hidden]'));
      const hiddenText = visuallyHiddenSpan.nativeElement.textContent.trim();

      const expectedPattern =
        /for case urn URN123456789 holding on \d{2} \w+ \d{4} at \d{2}:\d{2} [AP]M has been/;
      expect(hiddenText).toMatch(expectedPattern);
    });
  });

  describe('Date and Time Formatting', () => {
    it('should handle different date formats', () => {
      component.hearingRow = {
        ...mockHearingRow,
        dateTime: '2024-12-25T14:15:00Z'
      };
      fixture.detectChanges();

      const visuallyHiddenSpan = fixture.debugElement.query(By.css('span[pdk-visually-hidden]'));
      const hiddenText = visuallyHiddenSpan.nativeElement.textContent;

      expect(hiddenText).toContain('25 December 2024');
      expect(hiddenText).toContain('14:15 PM');
    });

    it('should handle midnight time', () => {
      component.hearingRow = {
        ...mockHearingRow,
        dateTime: '2024-01-15T00:00:00Z'
      };
      fixture.detectChanges();

      const visuallyHiddenSpan = fixture.debugElement.query(By.css('span[pdk-visually-hidden]'));
      const hiddenText = visuallyHiddenSpan.nativeElement.textContent;

      expect(hiddenText).toContain('00:00 AM');
    });

    it('should handle noon time', () => {
      component.hearingRow = {
        ...mockHearingRow,
        dateTime: '2024-01-15T12:00:00Z'
      };
      fixture.detectChanges();

      const visuallyHiddenSpan = fixture.debugElement.query(By.css('span[pdk-visually-hidden]'));
      const hiddenText = visuallyHiddenSpan.nativeElement.textContent;

      expect(hiddenText).toContain('12:00 PM');
    });

    it('should handle single digit hours and minutes', () => {
      component.hearingRow = {
        ...mockHearingRow,
        dateTime: '2024-01-15T09:05:00Z'
      };
      fixture.detectChanges();

      const visuallyHiddenSpan = fixture.debugElement.query(By.css('span[pdk-visually-hidden]'));
      const hiddenText = visuallyHiddenSpan.nativeElement.textContent;

      expect(hiddenText).toContain('09:05 AM');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null hearingRow by throwing error', () => {
      component.hearingRow = null as any;

      expect(() => fixture.detectChanges()).toThrow();
    });

    it('should handle undefined hearingRow by throwing error', () => {
      component.hearingRow = undefined as any;

      expect(() => fixture.detectChanges()).toThrow();
    });

    it('should handle missing defendants by throwing error', () => {
      component.hearingRow = {
        ...mockHearingRow,
        defendants: null as any
      };

      expect(() => fixture.detectChanges()).toThrow();
    });

    it('should handle missing caseUrn gracefully', () => {
      component.hearingRow = {
        ...mockHearingRow,
        defendants: {
          ...mockHearingRow.defendants,
          caseUrn: null as any
        }
      };

      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle invalid dateTime by throwing error', () => {
      component.hearingRow = {
        ...mockHearingRow,
        dateTime: 'invalid-date'
      };

      expect(() => fixture.detectChanges()).toThrow();
    });

    it('should handle null dateTime gracefully', () => {
      component.hearingRow = {
        ...mockHearingRow,
        dateTime: null as any
      };

      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA structure', () => {
      fixture.detectChanges();

      const alert = fixture.debugElement.query(By.css('pdk-alert'));
      const visuallyHiddenSpan = fixture.debugElement.query(By.css('span[pdk-visually-hidden]'));

      expect(alert).toBeTruthy();
      expect(visuallyHiddenSpan).toBeTruthy();
    });

    it('should provide complete context for screen readers', () => {
      fixture.detectChanges();

      const visuallyHiddenSpan = fixture.debugElement.query(By.css('span[pdk-visually-hidden]'));
      const hiddenText = visuallyHiddenSpan.nativeElement.textContent;

      expect(hiddenText).toContain('case urn');
      expect(hiddenText).toContain('holding on');
      expect(hiddenText).toContain('at');
      expect(hiddenText).toContain('has been');
    });

    it('should have meaningful text for sighted users', () => {
      fixture.detectChanges();

      const alert = fixture.debugElement.query(By.css('pdk-alert'));

      const spans = alert.queryAll(By.css('span'));
      const visibleSpans = spans.filter(
        (span) => !span.nativeElement.hasAttribute('pdk-visually-hidden')
      );
      const visibleOnlyText = visibleSpans
        .map((span) => span.nativeElement.textContent.trim())
        .join(' ');

      expect(visibleOnlyText).toContain('Hearing');
      expect(visibleOnlyText).toContain('moved successfully');
    });
  });

  describe('Integration Tests', () => {
    it('should integrate properly with PdkModule alert component', () => {
      fixture.detectChanges();

      const alert = fixture.debugElement.query(By.css('pdk-alert'));
      expect(alert).toBeTruthy();
      expect(alert.componentInstance).toBeTruthy();
    });

    it('should work with CommonModule date pipes', () => {
      fixture.detectChanges();

      const visuallyHiddenSpan = fixture.debugElement.query(By.css('span[pdk-visually-hidden]'));
      const hiddenText = visuallyHiddenSpan.nativeElement.textContent;

      expect(hiddenText).toMatch(/\d{2} \w+ \d{4}/);
      expect(hiddenText).toMatch(/\d{2}:\d{2} [AP]M/);
    });
  });
});
