import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectionTableRendererComponent } from '../section-table-renderer.component';
import { DebugElement } from '@angular/core';
import { HearingsTableSectionConfig } from '../../../../model/hearing-table-renderer.interfaces';
import { defineHearingsGroupLevels } from '../../../../utils/hearing-table-renderer.utils';
import {
  AllocatedTableColumnConfig,
  allocatedTableSectionConfig
} from '../../../../utils/table-configs/allocated-table-configs';

describe('SectionTableRendererComponent', () => {
  let component: SectionTableRendererComponent;
  let fixture: ComponentFixture<SectionTableRendererComponent>;
  let el: DebugElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(SectionTableRendererComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement;
    fixture.componentRef.setInput('columnConfig', AllocatedTableColumnConfig);
    fixture.componentRef.setInput('sectionConfig', allocatedTableSectionConfig);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('sectionHeaderSpan calculation', () => {
    it('should set sectionHeaderSpan to columnConfig.length only if not actionable & not expandable', () => {
      fixture.detectChanges();
      expect(component.sectionHeaderSpan()).toBe(8);
    });

    it('should add 1 if actionable is false', () => {
      fixture.componentRef.setInput('sectionConfig', {
        ...allocatedTableSectionConfig,
        actionable: false,
        rowsAreExpandable: false
      } as HearingsTableSectionConfig);

      fixture.detectChanges();
      expect(component.sectionHeaderSpan()).toBe(7);
    });

    it('should rowsAreExpandable is false', () => {
      fixture.componentRef.setInput('sectionConfig', {
        ...allocatedTableSectionConfig,
        actionable: false,
        rowsAreExpandable: false
      } as HearingsTableSectionConfig);

      fixture.detectChanges();
      expect(component.sectionHeaderSpan()).toBe(7);
    });
  });

  describe('Rendering row groups', () => {
    it('should render `row-group-body` if `sectionConfig.groupLevels` is defined', () => {
      fixture.componentRef.setInput('sectionConfig', {
        actionable: false,
        hasTableSectionHeader: false,
        groupLevels: defineHearingsGroupLevels<{ rowGroups: { rows: unknown[] }[] }>()
          .group('rowGroups')
          .rows('rows')
      } as HearingsTableSectionConfig);

      fixture.componentRef.setInput('columnConfig', []);

      fixture.componentRef.setInput('sections', [
        {
          sectionIdentifier: 'test-section',
          courtCentre: null,
          rowGroups: [
            {
              rows: [{ id: 'abc', title: 'Test title' }]
            }
          ]
        }
      ]);

      fixture.detectChanges();
      const rowGroupBodyEls = el.nativeElement.querySelectorAll('tbody[row-group-body]');
      expect(rowGroupBodyEls.length).toBeGreaterThan(0);
    });
  });
});
