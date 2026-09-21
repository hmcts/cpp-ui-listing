import { Component, input } from '@angular/core';
import { CourtCentre, ExtendedJudicialRole, Hearing } from '../../core/';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ChangeJudiciaryForHearingsFormComponent } from './change-judiciary-for-hearings-form.component';
import { courtCentresMock, validHearingMock1 } from '../../../mock-data/test-fixtures';
import { By } from '@angular/platform-browser';
import { ReferenceDataService } from '@cpp/reference-data';
import { CppHttp } from '@cpp/core';

@Component({
  template: `
    <change-judiciary-for-hearings-form [hearings]="hearings()" [courtCentres]="courtCentres()">
    </change-judiciary-for-hearings-form>
  `,
  imports: [ChangeJudiciaryForHearingsFormComponent]
})
class TestHostComponent {
  readonly hearings = input<Hearing[]>([validHearingMock1]);
  readonly courtCentres = input<CourtCentre[]>(courtCentresMock);
}

describe('ChangeJudiciaryForHearingsFormComponent', () => {
  let component: ChangeJudiciaryForHearingsFormComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  const createComponent = (params = {}) => {
    TestBed.configureTestingModule({
      providers: [
        ReferenceDataService,
        {
          provide: CppHttp,
          useValue: {
            query: jasmine.createSpy(),
            commandSync: jasmine.createSpy()
          }
        }
      ],
      teardown: { destroyAfterEach: false }
    });
  };

  beforeEach(fakeAsync(() => {
    createComponent(false);
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.children[0].componentInstance;
    fixture.detectChanges();
    tick();
  }));

  describe('Normal behaviour', () => {
    it('should match Jest snapshot', () => {
      expect(fixture).toMatchSnapshot();
    });

    it('should emit an event when cancelling', fakeAsync(() => {
      jest.spyOn(component.onCancel, 'emit');
      const btn = fixture.debugElement.query(By.css('a'));
      btn.nativeElement.click();
      tick();

      expect(component.onCancel.emit).toHaveBeenCalled();
    }));

    it('should emit an event when submit', fakeAsync(() => {
      spyOn(component.onSubmit, 'emit');
      const btn = fixture.debugElement.query(By.css('button'));
      btn.nativeElement.click();
      tick();

      expect(component.onSubmit.emit).toHaveBeenCalled();
    }));
  });

  describe('johSource', () => {
    it('should not set johSource when the judiciary selection is not changed', () => {
      spyOn(component.onSubmit, 'emit');

      component.submit();

      expect(component.onSubmit.emit).toHaveBeenCalledWith({
        hearings: component.mapCourtCentresToHearings([validHearingMock1]),
        judiciary: component.data.judiciary,
        johSource: undefined
      });
    });

    it('should set johSource to MANUAL when the judiciary selection is changed', () => {
      spyOn(component.onSubmit, 'emit');
      const selectedJudiciary: ExtendedJudicialRole[] = [
        { judicialId: '1', judicialRoleType: { judiciaryType: 'RECORDER' } }
      ];
      component.selectedJudiciary = selectedJudiciary;

      component.submit();

      expect(component.onSubmit.emit).toHaveBeenCalledWith({
        hearings: component.mapCourtCentresToHearings([validHearingMock1]),
        judiciary: selectedJudiciary,
        johSource: 'MANUAL'
      });
    });

    it('should not set johSource when all judiciary are unchecked', () => {
      spyOn(component.onSubmit, 'emit');
      component.selectedJudiciary = [];

      component.submit();

      expect(component.onSubmit.emit).toHaveBeenCalledWith({
        hearings: component.mapCourtCentresToHearings([validHearingMock1]),
        judiciary: [],
        johSource: undefined
      });
    });
  });
});
