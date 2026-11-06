import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { WofdWarningService } from '@cpp/application';
import { Defendant } from '../../../../../core';
import { DefendantCellComponent } from '../defendant-cell.component';

describe('DefendantCellComponent', () => {
  let component: DefendantCellComponent;
  let fixture: ComponentFixture<DefendantCellComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: WofdWarningService,
          useValue: { isWofdApplication: jest.fn(), showModal: jest.fn() }
        }
      ]
    });

    fixture = TestBed.createComponent(DefendantCellComponent);
    component = fixture.componentInstance;
  });

  it('should wrap long unbroken defendant names', () => {
    const longLastName = 'A'.repeat(100);
    component.defendantData = {
      caseId: 'caseId',
      caseUrn: 'caseUrn',
      defendants: [{ id: 'defendant-id-1', firstName: 'John', lastName: longLastName } as Defendant]
    };
    fixture.detectChanges();

    const defendantName = fixture.debugElement.query(By.css('[data-test-id="defendant"]'));
    expect(defendantName.nativeElement.classList).toContain('wrap-long-text');
    expect(defendantName.nativeElement.textContent).toContain(longLastName);
  });
});
