import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganisationUnit } from '@cpp/reference-data';
import { CourtSelectionComponent } from './court-selection.component';
import { provideRouter } from '@angular/router';

describe('CourtSelectionComponent', () => {
  let component: CourtSelectionComponent;
  let fixture: ComponentFixture<CourtSelectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      providers: [provideRouter([])],
      teardown: { destroyAfterEach: false }
    }).configureCompiler({ preserveWhitespaces: false } as any);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CourtSelectionComponent);
    component = fixture.debugElement.children[0].componentInstance;
    fixture.detectChanges();
  });

  it('should render component', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should emit with selected court', () => {
    spyOn(component.continue, 'emit');
    component.selectedCourtCentre = { id: '*' } as OrganisationUnit;
    component.onContinue();
    expect(component.continue.emit).toHaveBeenCalledWith({ id: '*' });
  });
});
