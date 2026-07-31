import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HearingDetailsSectionComponent } from '../hearing-details-section/hearing-details-section.component';
import { ChangeCourtroomVM } from '../../../model';
import { JurisdictionType } from '../../../../core';

interface CaseReference {
  caseId?: string;
  applicationId?: string;
  caseUrn?: string;
  applicationReference?: string;
}

describe('HearingDetailsSectionComponent', () => {
  let component: HearingDetailsSectionComponent;
  let fixture: ComponentFixture<HearingDetailsSectionComponent>;

  const mockCasesWithCaseId: CaseReference[] = [
    { caseId: 'case-123', caseUrn: 'URN001' },
    { caseId: 'case-456', caseUrn: 'URN002' }
  ];

  const mockHearingVM: ChangeCourtroomVM = {
    time: '2024-02-01T10:30:00',
    hearingType: 'Trial',
    cases: mockCasesWithCaseId as any,
    upComingHearingDays: [],
    totalHearingDaysCount: 3,
    hasReportingRestriction: false,
    courtCentre: 'Central Court',
    courtRooms: [],
    startDate: '2024-02-01',
    endDate: '2024-02-03',
    ouCode: 'OU001',
    jurisdictionType: 'CROWN' as JurisdictionType
  };

  const mockBaseUrl = 'https://test-app.com';

  beforeEach(async () => {
    fixture = TestBed.createComponent(HearingDetailsSectionComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.hearingVM()).toBeNull();
      expect(component.baseUrl()).toBeUndefined();
    });

    it('should accept hearingVM input', () => {
      fixture.componentRef.setInput('hearingVM', mockHearingVM);
      expect(component.hearingVM()).toEqual(mockHearingVM);
    });

    it('should accept baseUrl input', () => {
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);
      expect(component.baseUrl()).toBe(mockBaseUrl);
    });
  });

  describe('Template Rendering - Basic Structure', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('hearingVM', mockHearingVM);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);
      fixture.detectChanges();
    });

    it('should render the heading', () => {
      const heading = fixture.debugElement.nativeElement.querySelector('h2');
      expect(heading).toBeTruthy();
      expect(heading.textContent.trim()).toBe('Hearing details');
    });

    it('should render hearing details when hearingVM is provided', () => {
      const dlElement = fixture.debugElement.nativeElement.querySelector('dl');
      expect(dlElement).toBeTruthy();
    });

    it('should render all detail sections', () => {
      const detailSections = fixture.debugElement.nativeElement.querySelectorAll('dl > div');
      expect(detailSections).toHaveLength(4);
    });
  });

  describe('Template Rendering - Null hearingVM', () => {
    it('should not render details when hearingVM is null', () => {
      fixture.componentRef.setInput('hearingVM', null);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);
      fixture.detectChanges();

      const dlElement = fixture.debugElement.nativeElement.querySelector('dl');
      expect(dlElement).toBeFalsy();
    });

    it('should only render heading when hearingVM is null', () => {
      fixture.componentRef.setInput('hearingVM', null);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);
      fixture.detectChanges();

      const heading = fixture.debugElement.nativeElement.querySelector('h2');
      expect(heading).toBeTruthy();
      expect(heading.textContent.trim()).toBe('Hearing details');

      const content = fixture.debugElement.nativeElement.querySelector(
        'div[pdk-margin-bottom="5"]'
      );
      expect(content).toBeFalsy();
    });
  });

  describe('Time Display', () => {
    it('should display formatted time', () => {
      fixture.componentRef.setInput('hearingVM', mockHearingVM);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);
      fixture.detectChanges();

      const timeSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[0];
      const timeValue = timeSection.querySelector('dd');

      expect(timeValue.textContent.trim()).toMatch(/^\d{2}:\d{2}[ap]m$/);
    });

    it('should handle different time formats', () => {
      const hearingVMWithDifferentTime = {
        ...mockHearingVM,
        time: '2024-02-01T14:15:00'
      };
      fixture.componentRef.setInput('hearingVM', hearingVMWithDifferentTime);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);
      fixture.detectChanges();

      const timeSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[0];
      const timeValue = timeSection.querySelector('dd');

      expect(timeValue.textContent.trim()).toMatch(/^\d{2}:\d{2}[ap]m$/);
    });

    it('should display time label', () => {
      fixture.componentRef.setInput('hearingVM', mockHearingVM);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);
      fixture.detectChanges();

      const timeSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[0];
      const timeLabel = timeSection.querySelector('dt b');

      expect(timeLabel.textContent.trim()).toBe('Time');
    });
  });

  describe('Duration Display', () => {
    it('should display total hearing days count', () => {
      fixture.componentRef.setInput('hearingVM', mockHearingVM);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);
      fixture.detectChanges();

      const durationSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[1];
      const durationValue = durationSection.querySelector('dd span');

      expect(durationValue.textContent.trim()).toBe('3 days');
    });

    it('should handle different day counts', () => {
      const hearingVMWithDifferentCount = {
        ...mockHearingVM,
        totalHearingDaysCount: 1
      };
      fixture.componentRef.setInput('hearingVM', hearingVMWithDifferentCount);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);
      fixture.detectChanges();

      const durationSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[1];
      const durationValue = durationSection.querySelector('dd span');

      expect(durationValue.textContent.trim()).toBe('1 days');
    });

    it('should display duration label', () => {
      fixture.componentRef.setInput('hearingVM', mockHearingVM);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);
      fixture.detectChanges();

      const durationSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[1];
      const durationLabel = durationSection.querySelector('dt b');

      expect(durationLabel.textContent.trim()).toBe('Duration');
    });
  });

  describe('Hearing Type Display', () => {
    it('should display hearing type', () => {
      fixture.componentRef.setInput('hearingVM', mockHearingVM);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);
      fixture.detectChanges();

      const hearingTypeSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[2];
      const hearingTypeValue = hearingTypeSection.querySelector('dd span');

      expect(hearingTypeValue.textContent.trim()).toBe('Trial');
    });

    it('should not show reporting restriction tag when hasReportingRestriction is false', () => {
      fixture.componentRef.setInput('hearingVM', mockHearingVM);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);
      fixture.detectChanges();

      const hearingTypeSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[2];
      const rrTag = hearingTypeSection.querySelector('pdk-tag');

      expect(rrTag).toBeFalsy();
    });

    it('should show reporting restriction tag when hasReportingRestriction is true', () => {
      const hearingVMWithRR = {
        ...mockHearingVM,
        hasReportingRestriction: true
      };
      fixture.componentRef.setInput('hearingVM', hearingVMWithRR);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);

      fixture.detectChanges();

      const hearingTypeSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[2];
      const rrTag = hearingTypeSection.querySelector('pdk-tag');

      expect(rrTag).toBeTruthy();
      expect(rrTag.textContent.trim()).toBe('RR');
    });

    it('should configure RR tag with correct properties', () => {
      const hearingVMWithRR = {
        ...mockHearingVM,
        hasReportingRestriction: true
      };

      fixture.componentRef.setInput('hearingVM', hearingVMWithRR);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);
      fixture.detectChanges();

      const rrTagComponent = fixture.debugElement.query(By.css('pdk-tag'));

      expect(rrTagComponent.componentInstance.condensed).toBe(true);
      expect(rrTagComponent.componentInstance.color).toBe('red');
    });

    it('should display hearing type label', () => {
      fixture.componentRef.setInput('hearingVM', mockHearingVM);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);
      fixture.detectChanges();

      const hearingTypeSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[2];
      const hearingTypeLabel = hearingTypeSection.querySelector('dt b');

      expect(hearingTypeLabel.textContent.trim()).toBe('Hearing type');
    });
  });

  describe('Cases Display', () => {
    it('should display cases label', () => {
      fixture.componentRef.setInput('hearingVM', mockHearingVM);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);
      fixture.detectChanges();

      const casesSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[3];
      const casesLabel = casesSection.querySelector('dt b');

      expect(casesLabel.textContent.trim()).toBe('Case(s)');
    });

    it('should add commas between multiple cases except for the last one', () => {
      const hearingVMWithCases = {
        ...mockHearingVM,
        cases: mockCasesWithCaseId as any
      };

      fixture.componentRef.setInput('hearingVM', hearingVMWithCases);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);
      fixture.detectChanges();

      const casesSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[3];
      const separators = casesSection.querySelectorAll('span span');

      expect(separators).toHaveLength(1);
      expect(separators[0].textContent.trim()).toBe(',');
    });

    it('should not add comma after single case', () => {
      const singleCase: CaseReference[] = [{ caseId: 'case-123', caseUrn: 'URN001' }];

      const hearingVMWithSingleCase = {
        ...mockHearingVM,
        cases: singleCase as any
      };
      fixture.componentRef.setInput('hearingVM', hearingVMWithSingleCase);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);
      fixture.detectChanges();

      const casesSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[3];
      const separators = casesSection.querySelectorAll('span span');

      expect(separators).toHaveLength(0);
    });

    it('should handle empty cases array', () => {
      const hearingVMWithNoCases = {
        ...mockHearingVM,
        cases: [] as any
      };

      fixture.componentRef.setInput('hearingVM', hearingVMWithNoCases);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);
      fixture.detectChanges();

      const casesSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[3];
      const caseLinks = casesSection.querySelectorAll('a');

      expect(caseLinks).toHaveLength(0);
    });

    it('should set correct link attributes', () => {
      const hearingVMWithCases = {
        ...mockHearingVM,
        cases: mockCasesWithCaseId as any
      };
      fixture.componentRef.setInput('hearingVM', hearingVMWithCases);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);
      fixture.detectChanges();

      const casesSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[3];
      const caseLink = casesSection.querySelector('a');

      expect(caseLink.target).toBe('_blank');
      expect(caseLink.hasAttribute('pdk-link')).toBe(true);
      expect(caseLink.hasAttribute('unvisited')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined hearingVM', () => {
      fixture.componentRef.setInput('hearingVM', undefined);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);

      expect(() => fixture.detectChanges()).not.toThrow();

      const dlElement = fixture.debugElement.nativeElement.querySelector('dl');
      expect(dlElement).toBeFalsy();
    });

    it('should handle missing baseUrl', () => {
      fixture.componentRef.setInput('hearingVM', mockHearingVM);
      fixture.componentRef.setInput('baseUrl', undefined);

      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle case without caseUrn or applicationReference', () => {
      const caseWithoutLabels: CaseReference[] = [{ caseId: 'case-123' }];

      const hearingVMWithIncompleteCases = {
        ...mockHearingVM,
        cases: caseWithoutLabels as any
      };
      fixture.componentRef.setInput('hearingVM', hearingVMWithIncompleteCases);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);

      expect(() => fixture.detectChanges()).not.toThrow();

      const casesSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[3];
      const caseLink = casesSection.querySelector('a');

      expect(caseLink.textContent.trim()).toBe('');
    });

    it('should handle case without caseId or applicationId', () => {
      const caseWithoutIds: CaseReference[] = [{ caseUrn: 'URN001' }];

      const hearingVMWithIncompleteCases = {
        ...mockHearingVM,
        cases: caseWithoutIds as any
      };

      fixture.componentRef.setInput('hearingVM', hearingVMWithIncompleteCases);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);
      fixture.detectChanges();

      const casesSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[3];
      const caseLink = casesSection.querySelector('a');

      expect(caseLink).toBeTruthy();
      expect(caseLink.textContent.trim()).toBe('URN001');
    });

    it('should handle zero hearing days count', () => {
      const hearingVMWithZeroDays = {
        ...mockHearingVM,
        totalHearingDaysCount: 0
      };
      fixture.componentRef.setInput('hearingVM', hearingVMWithZeroDays);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);
      fixture.detectChanges();

      const durationSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[1];
      const durationValue = durationSection.querySelector('dd span');

      expect(durationValue.textContent.trim()).toBe('0 days');
    });

    it('should handle missing hearing type', () => {
      const hearingVMWithoutType = {
        ...mockHearingVM,
        hearingType: null as any
      };

      fixture.componentRef.setInput('hearingVM', hearingVMWithoutType);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);
      fixture.detectChanges();

      const hearingTypeSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[2];
      const hearingTypeValue = hearingTypeSection.querySelector('dd span');

      expect(hearingTypeValue.textContent.trim()).toBe('');
    });
  });

  describe('Data Binding', () => {
    it('should update when hearingVM changes', () => {
      fixture.componentRef.setInput('hearingVM', mockHearingVM);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);

      fixture.detectChanges();

      let hearingTypeSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[2];
      let hearingTypeValue = hearingTypeSection.querySelector('dd span');
      expect(hearingTypeValue.textContent.trim()).toBe('Trial');

      const updatedHearingVM = {
        ...mockHearingVM,
        hearingType: 'Sentencing'
      };

      fixture.componentRef.setInput('hearingVM', updatedHearingVM);

      fixture.detectChanges();

      hearingTypeSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[2];
      hearingTypeValue = hearingTypeSection.querySelector('dd span');
      expect(hearingTypeValue.textContent.trim()).toBe('Sentencing');
    });

    it('should update when baseUrl changes', () => {
      const hearingVMWithCases = {
        ...mockHearingVM,
        cases: mockCasesWithCaseId as any
      };
      fixture.componentRef.setInput('hearingVM', hearingVMWithCases);
      fixture.componentRef.setInput('baseUrl', 'https://old-url.com');
      fixture.detectChanges();

      let casesSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[3];
      let caseLink = casesSection.querySelector('a');
      expect(caseLink.href).toBe(
        'https://old-url.com/prosecution-casefile/case-at-a-glance/case-123'
      );
      fixture.componentRef.setInput('baseUrl', 'https://new-url.com');
      fixture.detectChanges();

      casesSection = fixture.debugElement.nativeElement.querySelectorAll('dl > div')[3];
      caseLink = casesSection.querySelector('a');
      expect(caseLink.href).toBe(
        'https://new-url.com/prosecution-casefile/case-at-a-glance/case-123'
      );
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('hearingVM', mockHearingVM);
      fixture.componentRef.setInput('baseUrl', mockBaseUrl);

      fixture.detectChanges();
    });

    it('should use proper semantic HTML structure', () => {
      const dlElement = fixture.debugElement.nativeElement.querySelector('dl');
      const dtElements = fixture.debugElement.nativeElement.querySelectorAll('dt');
      const ddElements = fixture.debugElement.nativeElement.querySelectorAll('dd');

      expect(dlElement).toBeTruthy();
      expect(dtElements).toHaveLength(4);
      expect(ddElements).toHaveLength(4);
    });

    it('should have external links open in new tab', () => {
      const hearingVMWithCases = {
        ...mockHearingVM,
        cases: mockCasesWithCaseId as any
      };
      fixture.componentRef.setInput('hearingVM', hearingVMWithCases);
      fixture.detectChanges();

      const caseLinks = fixture.debugElement.nativeElement.querySelectorAll('a');

      caseLinks.forEach((link: HTMLAnchorElement) => {
        expect(link.target).toBe('_blank');
      });
    });
  });

  describe('Component Styling', () => {
    it('should have component-specific styles defined', () => {
      expect(component).toBeTruthy();
    });
  });
});
