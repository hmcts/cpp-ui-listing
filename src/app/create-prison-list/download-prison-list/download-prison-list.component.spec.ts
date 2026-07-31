import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import {
  selectedCourtCentreMock,
  selectedCrownCourtCentreMock,
  selectedOptionsMock
} from '../../../mock-data/test-fixtures';
import { CourtCentre, CreateListFilterOptions } from '../../core/model';
import { DownloadPrisonListComponent } from './download-prison-list.component';

describe('DownloadPrisonListComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  const dispatchSpy = jasmine.createSpy('dispatch');

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: Store, useValue: { dispatch: dispatchSpy } }],
      teardown: { destroyAfterEach: false }
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.selectedCourtCentre = selectedCourtCentreMock;
    hostComponent.selectedOptions = selectedOptionsMock;
    hostComponent.crownSelected = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture).toMatchSnapshot();
  });

  describe('prison list button', () => {
    it('should show Prison List button for Magistrate court', () => {
      hostComponent.selectedCourtCentre = selectedCourtCentreMock;
      fixture.detectChanges();
      const btns = fixture.debugElement.queryAll(By.css('.download-file'));
      expect(btns.length).toBe(1);
      expect(btns[0].nativeElement.textContent).toBe('Prison list');
      expect(fixture).toMatchSnapshot();
    });

    it('should show Prison List button for Crown court', () => {
      hostComponent.selectedCourtCentre = selectedCrownCourtCentreMock;
      fixture.detectChanges();
      const btns = fixture.debugElement.queryAll(By.css('.download-file'));
      expect(btns.length).toBe(1);
      expect(btns[0].nativeElement.textContent).toBe('Prison list');
      expect(fixture).toMatchSnapshot();
    });

    it('should not show Prison list button if -> isPrisonAdminUser=false', () => {
      hostComponent.isPrisonAdminOrHmctsUser = false;
      fixture.detectChanges();
      const btns = fixture.debugElement.queryAll(By.css('.download-file'));
      btns.forEach(btn => {
        expect(btn.nativeElement.textContent).not.toBe('Prison list');
      });
    });
  });

  describe('download Prison List', () => {
    it('should trigger DownloadListAction action when click on Prison list button ', () => {
      hostComponent.selectedOptions = {
        ...hostComponent.selectedOptions
      };
      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('.prison-list'));
      btn.nativeElement.dispatchEvent(new Event('click'));
      fixture.detectChanges();
      expect(dispatchSpy).toHaveBeenCalled();
    });

    it('should not show Prison list button if no hearings found', () => {
      hostComponent.selectedCourtCentre = selectedCrownCourtCentreMock;
      hostComponent.isPrisonAdminOrHmctsUser = true;
      hostComponent.hasAllocatedHearingsByDateRange = false;
      fixture.detectChanges();
      const btns = fixture.debugElement.queryAll(By.css('.download-file'));
      expect(btns.length).toBe(0);
      expect(fixture).toMatchSnapshot();
    });
  });
});

@Component({
  template: `
    <download-prison-list
      [selectedOptions]="selectedOptions"
      [selectedCourtCentre]="selectedCourtCentre"
      [crownSelected]="crownSelected"
      [isPrisonAdminOrHmctsUser]="isPrisonAdminOrHmctsUser"
      [hasAllocatedHearingsByDateRange]="hasAllocatedHearingsByDateRange"
    >
    </download-prison-list>
  `,
  imports: [DownloadPrisonListComponent]
})
class TestHostComponent {
  selectedCourtCentre: CourtCentre = null;
  selectedOptions: CreateListFilterOptions = null;
  crownSelected: boolean = null;
  isPrisonAdminOrHmctsUser: boolean = true;
  hasAllocatedHearingsByDateRange: boolean = true;
}
