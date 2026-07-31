import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ReferenceDataService } from '@cpp/reference-data';
import { provideStore } from '@ngrx/store';
import { ExtendedJudicialRole, ListingService, reducers } from '../../../core';
import {
  extendedJudiciaryMember1,
  extendedJudiciaryMember2,
  extendedJudiciaryMember3,
  extendedJudiciaryMember4,
  extendedJudiciaryMemberMagistrate1,
  judicialmembers,
  singleDayHearing1
} from '../../../core/services/hearing-search/mock-data';
import { JudiciaryTypeaheadComponent } from '../judiciary-typeahead/judiciary-typeahead.component';
import { JudiciaryInputComponent } from './judiciary-input.component';

@Component({
  selector: 'judiciary-input-test',
  template: `
    <form>
      <judiciary-input name="judiciary" [judiciary]="judiciary"></judiciary-input>
    </form>
  `,
  imports: [JudiciaryInputComponent, FormsModule]
})
class TestHostComponent {
  judiciary: ExtendedJudicialRole[] = [];
}
describe('JudiciaryInputComponent', () => {
  let component: JudiciaryInputComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let getJudicialMembersByIds: jasmine.Spy;
  let getJudicialMembersByNamePattern: jasmine.Spy;
  function clickJudgeCheckbox(judgeType) {
    const checkbox = fixture.debugElement.query(By.css(`[value="${judgeType}"]`)).nativeElement;
    checkbox.click();
    fixture.detectChanges();
  }
  beforeEach(() => {
    getJudicialMembersByIds = jasmine.createSpy('getJudicialMembersByIds');
    getJudicialMembersByNamePattern = jasmine.createSpy('getJudicialMembersByNamePattern');
    TestBed.configureTestingModule({
      providers: [
        provideStore(reducers, { runtimeChecks: {} }),
        {
          provide: ReferenceDataService,
          useValue: {
            getJudicialMembersByNamePattern
          }
        },
        {
          provide: ListingService,
          useValue: {}
        }
      ],
      teardown: { destroyAfterEach: false }
    });
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.query(By.directive(JudiciaryInputComponent)).componentInstance;
    fixture.componentInstance.judiciary = [...singleDayHearing1.judiciary];
    fixture.detectChanges();
    getJudicialMembersByIds.and.returnValue([...judicialmembers]);
    getJudicialMembersByNamePattern.and.returnValue([[...judicialmembers]]);
  });

  it('should show expected component', () => {
    expect(component.judiciary).toEqual(singleDayHearing1.judiciary);
    expect(fixture).toMatchSnapshot();
  });
  it('should update judiciary after removing circuit judge', () => {
    fixture.detectChanges();
    clickJudgeCheckbox('CIRCUIT_JUDGE');
    expect(component.judiciary).toEqual([extendedJudiciaryMember2]);
    expect(fixture).toMatchSnapshot();
  });
  it('should update judiciary after adding recorder', () => {
    clickJudgeCheckbox('RECORDER');
    component.setJudge(extendedJudiciaryMember3.judicialMember, 'RECORDER');
    expect(component.judiciary).toEqual([
      extendedJudiciaryMember3,
      extendedJudiciaryMember2,
      extendedJudiciaryMember1
    ]);
    expect(fixture).toMatchSnapshot();
  });
  it('should update judiciary after adding deputy district jugde', () => {
    clickJudgeCheckbox('DEPUTY_DISTRICT_JUDGE');
    component.setJudge(extendedJudiciaryMember4.judicialMember, 'DEPUTY_DISTRICT_JUDGE');
    expect(component.judiciary).toEqual([
      extendedJudiciaryMember4,
      extendedJudiciaryMember2,
      extendedJudiciaryMember1
    ]);
    expect(fixture).toMatchSnapshot();
  });
  it('should update judiciary after adding magistrates', () => {
    clickJudgeCheckbox('MAGISTRATE');
    component.setMagistrate(extendedJudiciaryMemberMagistrate1.judicialMember, 0);
    expect(component.judiciary).toEqual([
      extendedJudiciaryMember2,
      extendedJudiciaryMember1,
      extendedJudiciaryMemberMagistrate1
    ]);
    expect(fixture).toMatchSnapshot();
  });
  it('should require Winger 2 if the user has typed in some free text', () => {
    component.winger2JudiciaryTypeaheadRef = {
      autoSuggest: {
        inputValue: 'Free text'
      }
    } as unknown as JudiciaryTypeaheadComponent;
    fixture.detectChanges();
    expect(component.isWinger2FieldRequired()).toBeTruthy();
  });
  it('should not require Winger 2 if the user has typed in some spaces', () => {
    component.winger2JudiciaryTypeaheadRef = {
      autoSuggest: {
        inputValue: '   '
      }
    } as unknown as JudiciaryTypeaheadComponent;
    fixture.detectChanges();
    expect(component.isWinger2FieldRequired()).toBeFalsy();
  });
  it('should not require Winger 2 if the user has not typed anything', () => {
    component.winger2JudiciaryTypeaheadRef = {
      autoSuggest: {
        inputValue: ''
      }
    } as unknown as JudiciaryTypeaheadComponent;
    fixture.detectChanges();
    expect(component.isWinger2FieldRequired()).toBeFalsy();
  });
});
