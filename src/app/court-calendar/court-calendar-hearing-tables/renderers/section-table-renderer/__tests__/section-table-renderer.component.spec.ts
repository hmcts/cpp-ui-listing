import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectionTableRendererComponent } from '../section-table-renderer.component';
import { DebugElement } from '@angular/core';
import { HearingTableSectionConfig } from '../../../../model/hearing-table-renderer.vm';
import {
  AllocatedTableColumnConfig,
  allocatedTableSectionConfig
} from '../../../../utils/table-configs/allocated-table-configs';

describe('SectionTableRendererComponent', () => {
  let component: SectionTableRendererComponent<any, any>;
  let fixture: ComponentFixture<SectionTableRendererComponent<any, any>>;
  let el: DebugElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(SectionTableRendererComponent<any, any>); // generic();
    component = fixture.componentInstance;
    el = fixture.debugElement;
    component.columnConfig = AllocatedTableColumnConfig;
    component.sectionConfig = allocatedTableSectionConfig as Partial<
      HearingTableSectionConfig<any, keyof any, any>
    > as any;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('sectionHeaderSpan calculation', () => {
    it('should set sectionHeaderSpan to columnConfig.length only if not actionable & not expandable', () => {
      fixture.detectChanges();
      expect(component.sectionHeaderSpan).toBe(8);
    });

    it('should add 1 if actionable is false', () => {
      component.sectionConfig = {
        ...component.sectionConfig,
        actionable: false,
        rowsAreExpandable: false
      } as Partial<HearingTableSectionConfig<any, keyof any, any>> as any;

      fixture.detectChanges();
      expect(component.sectionHeaderSpan).toBe(7);
    });

    it('should rowsAreExpandable is false', () => {
      component.sectionConfig = {
        ...component.sectionConfig,
        actionable: false,
        rowsAreExpandable: false
      } as Partial<HearingTableSectionConfig<any, keyof any, any>> as any;

      fixture.detectChanges();
      expect(component.sectionHeaderSpan).toBe(7);
    });
  });

  describe('Rendering row groups', () => {
    it('should render `row-group-body` if `sectionConfig.rowGroups` is defined', () => {
      component.sectionConfig = {
        rowGroups: {
          rowGroupsPath: 'rowGroups',
          dataConfig: {
            rowGroupDataPath: 'rows'
          }
        }
      } as any;
      component.columnConfig = [];
      component.sections = [
        {
          rowGroups: [
            {
              rows: [{ id: 'abc', title: 'Test title' }]
            }
          ]
        }
      ];

      fixture.detectChanges();
      const rowGroupBodyEls = el.nativeElement.querySelectorAll('tbody[row-group-body]');
      expect(rowGroupBodyEls.length).toBeGreaterThan(0);
    });
  });
});
