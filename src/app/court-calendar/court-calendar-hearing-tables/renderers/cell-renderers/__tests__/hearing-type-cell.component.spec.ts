import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { HearingTypeCellComponent } from '../hearing-type-cell.component';
import { HearingTypeVM } from '../../../../../court-calendar/model';

describe('HearingTypeCellComponent', () => {
  let component: HearingTypeCellComponent;
  let fixture: ComponentFixture<HearingTypeCellComponent>;

  const mockHearingType: HearingTypeVM = {
    description: 'Criminal Trial',
    markers: [
      {
        id: 'marker-1',
        markerTypeid: 'mt-1',
        markerTypeCode: 'HIGH_RISK',
        markerTypeDescription: 'High Risk'
      },
      {
        id: 'marker-2',
        markerTypeid: 'mt-2',
        markerTypeCode: 'VULNERABLE',
        markerTypeDescription: 'Vulnerable Defendant'
      }
    ],
    hasReportingRestriction: false
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(HearingTypeCellComponent);
    component = fixture.componentInstance;

    component.hearingType = mockHearingType;
    component.isMaster = true;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have correct data-test-id', () => {
      fixture.detectChanges();
      const container = fixture.debugElement.query(By.css('[data-test-id="hearing-type-cell"]'));
      expect(container).toBeTruthy();
    });
  });

  describe('Hearing Type Description', () => {
    it('should display description when isMaster is true', () => {
      component.isMaster = true;
      fixture.detectChanges();

      const spans = fixture.debugElement.queryAll(By.css('span'));
      const descriptionSpan = spans.find(
        (span) => span.nativeElement.textContent.trim() === 'Criminal Trial'
      );

      expect(descriptionSpan).toBeTruthy();
      expect(descriptionSpan.nativeElement.textContent.trim()).toBe('Criminal Trial');
    });

    it('should not display description when isMaster is false', () => {
      component.isMaster = false;
      fixture.detectChanges();

      const spans = fixture.debugElement.queryAll(By.css('span'));
      const descriptionSpan = spans.find(
        (span) => span.nativeElement.textContent.trim() === 'Criminal Trial'
      );

      expect(descriptionSpan).toBeFalsy();
    });
  });

  describe('Case Markers', () => {
    it('should display single marker as tag when only one marker exists', () => {
      component.hearingType = {
        ...mockHearingType,
        markers: [
          {
            id: 'single-marker',
            markerTypeid: 'mt-single',
            markerTypeCode: 'SINGLE',
            markerTypeDescription: 'Single Marker'
          }
        ]
      };
      fixture.detectChanges();

      const singleTag = fixture.debugElement.query(By.css('pdk-tag:not([ng-reflect-ng-for-of])'));
      expect(singleTag).toBeTruthy();
      expect(singleTag.nativeElement.textContent.trim()).toBe('Single Marker');
    });

    it('should display details element when multiple markers exist', () => {
      component.hearingType = {
        ...mockHearingType,
        markers: [
          {
            id: 'marker-1',
            markerTypeid: 'mt-1',
            markerTypeCode: 'MARKER_1',
            markerTypeDescription: 'Marker 1'
          },
          {
            id: 'marker-2',
            markerTypeid: 'mt-2',
            markerTypeCode: 'MARKER_2',
            markerTypeDescription: 'Marker 2'
          }
        ]
      };
      fixture.detectChanges();

      const details = fixture.debugElement.query(By.css('details'));
      const summary = fixture.debugElement.query(By.css('summary'));

      expect(details).toBeTruthy();
      expect(summary).toBeTruthy();
      expect(summary.nativeElement.textContent.trim()).toBe('2 case markers');
    });

    it('should display all markers as tags within details', () => {
      component.hearingType = {
        ...mockHearingType,
        markers: [
          {
            id: 'marker-1',
            markerTypeid: 'mt-1',
            markerTypeCode: 'MARKER_1',
            markerTypeDescription: 'Marker 1'
          },
          {
            id: 'marker-2',
            markerTypeid: 'mt-2',
            markerTypeCode: 'MARKER_2',
            markerTypeDescription: 'Marker 2'
          },
          {
            id: 'marker-3',
            markerTypeid: 'mt-3',
            markerTypeCode: 'MARKER_3',
            markerTypeDescription: 'Marker 3'
          }
        ]
      };
      fixture.detectChanges();

      const markerTags = fixture.debugElement.queryAll(By.css('pdk-details-text pdk-tag'));
      expect(markerTags).toHaveLength(3);
      expect(markerTags[0].nativeElement.textContent.trim()).toBe('Marker 1');
      expect(markerTags[1].nativeElement.textContent.trim()).toBe('Marker 2');
      expect(markerTags[2].nativeElement.textContent.trim()).toBe('Marker 3');
    });

    it('should not display any marker elements when no markers exist', () => {
      component.hearingType = {
        ...mockHearingType,
        markers: []
      };
      fixture.detectChanges();

      const singleTag = fixture.debugElement.query(By.css('pdk-tag:not([ng-reflect-ng-for-of])'));
      const details = fixture.debugElement.query(By.css('details'));

      expect(singleTag).toBeNull();
      expect(details).toBeNull();
    });
  });

  describe('Reporting Restriction', () => {
    it('should display RR tag when hasReportingRestriction is true', () => {
      component.hearingType = {
        ...mockHearingType,
        hasReportingRestriction: true
      };
      fixture.detectChanges();

      const rrTags = fixture.debugElement.queryAll(By.css('pdk-tag'));
      const rrTag = rrTags.find((tag) => tag.nativeElement.textContent.trim() === 'RR');

      expect(rrTag).toBeTruthy();
      expect(rrTag.componentInstance.color).toBe('red');
    });

    it('should not display RR tag when hasReportingRestriction is false', () => {
      component.hearingType = {
        ...mockHearingType,
        hasReportingRestriction: false
      };
      fixture.detectChanges();

      const rrTags = fixture.debugElement.queryAll(By.css('pdk-tag'));
      const rrTag = rrTags.find((tag) => tag.nativeElement.textContent.trim() === 'RR');

      expect(rrTag).toBeFalsy();
    });
  });

  describe('Event Handling', () => {
    it('should stop event propagation on click', () => {
      const mockEvent = {
        stopPropagation: jest.fn()
      } as any;

      component.preventDefault(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null markers gracefully', () => {
      component.hearingType = {
        ...mockHearingType,
        markers: null as any
      };

      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle undefined hearingType', () => {
      component.hearingType = undefined as any;

      expect(() => fixture.detectChanges()).toThrow();
    });
  });
});
