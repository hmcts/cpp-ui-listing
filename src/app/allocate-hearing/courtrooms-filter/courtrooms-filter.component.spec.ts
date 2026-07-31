import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { courtCentresMock } from '../../../mock-data/test-fixtures';
import { reducers } from '../../core';
import { CourtroomsFilterComponent } from './courtrooms-filter.component';

const formErrorsMock = jest.fn();
const onSelectCourtCentreMock = jest.fn().mockReturnValue(courtCentresMock[0].courtRooms[0]);
const onSubmitMock = jest.fn();
const preselectedOptions = {
  courtCentreId: courtCentresMock[0].id,
  courtRoomId: courtCentresMock[0].courtRooms[0].id,
  searchDate: '2000-01-01',
  startTime: '10:00',
  endTime: '10:00'
};
@Component({
  template: `
    <courtrooms-filter
      (onSelectCourtCentre)="onSelectCourtCentre($event)"
      [courtCentres]="courtCentres"
      [preselectedOptions]="preselectedValues"
      (formErrors)="formErrors($event)"
      [courtRooms]="courtCentres[0].courtRooms"
      (onSubmit)="filterSubmit($event)"
    >
    </courtrooms-filter>
  `,
  imports: [CourtroomsFilterComponent]
})
class TestHostComponent {
  formErrors = formErrorsMock;
  onSelectCourtCentre = onSelectCourtCentreMock;
  onSubmit = onSubmitMock;
  courtCentres = courtCentresMock;
  preselectedValues = {};
}

describe('CourtroomsFilterComponent', () => {
  let component: CourtroomsFilterComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore(reducers, { runtimeChecks: {} })],
      schemas: [NO_ERRORS_SCHEMA],
      teardown: { destroyAfterEach: false }
    }).configureCompiler({ preserveWhitespaces: false } as any);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.debugElement.children[0].componentInstance;
    fixture.detectChanges();
  });

  it('should create the right templates with actions', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should build the options for the courtCentre autosuggest', () => {
    const result = component.buildOptions(courtCentresMock);
    expect(result).toEqual([{ label: courtCentresMock[0].name, value: courtCentresMock[0].id }]);
  });

  it('should build the options for the courtRoom autosuggest', () => {
    const result = component.buildOptions(courtCentresMock[0].courtRooms);
    expect(result).toEqual([
      {
        label: courtCentresMock[0].courtRooms[0].name,
        value: courtCentresMock[0].courtRooms[0].id
      },
      { label: courtCentresMock[0].courtRooms[1].name, value: courtCentresMock[0].courtRooms[1].id }
    ]);
  });

  it('should call reset forms and emit the values', () => {
    component.selectedOptions = {
      courtCentreId: courtCentresMock[0].id,
      courtRoomId: courtCentresMock[0].courtRooms[0].id,
      searchDate: '2000-01-01'
    };

    component.clearFilters();
    expect(formErrorsMock).toHaveBeenCalledWith(null);
  });

  it('should set options with the preselected values', () => {
    component.ngOnChanges({
      courtCentres: {
        previousValue: undefined,
        isFirstChange: () => true,
        firstChange: true,
        currentValue: courtCentresMock
      },
      courtRooms: {
        previousValue: undefined,
        isFirstChange: () => true,
        firstChange: true,
        currentValue: courtCentresMock[0].courtRooms
      },
      preselectedOptions: {
        previousValue: undefined,
        isFirstChange: () => true,
        firstChange: true,
        currentValue: preselectedOptions
      }
    });

    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
    expect(component.selectedOptions).toEqual(preselectedOptions);
    expect(component.currentCourtCentreOption.value).toEqual(preselectedOptions.courtCentreId);
    expect(component.currentRoomOption.value).toEqual(preselectedOptions.courtRoomId);
  });
});
