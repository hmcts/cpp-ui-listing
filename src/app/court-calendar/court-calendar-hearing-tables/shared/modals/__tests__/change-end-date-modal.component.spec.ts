import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PDK_MODAL_DATA_TOKEN } from '@cpp/pdk';
import { CPPDate } from '../../../../../core/util';
import {
  ChangeEndDateModalComponent,
  ChangeEndDateModalData
} from '../change-end-date-modal.component';

describe('ChangeEndDateModalComponent', () => {
  let fixture: ComponentFixture<ChangeEndDateModalComponent>;
  let component: ChangeEndDateModalComponent;

  const modalData: ChangeEndDateModalData = {
    hearingTypeDescription: 'Trial',
    hearingDayCount: 3,
    endDate: '2026-01-15',
    continue: jest.fn(),
    cancel: jest.fn()
  };

  const mockCppDate = { format: jest.fn().mockReturnValue('2026-07-16') } as unknown as CPPDate;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeEndDateModalComponent],
      providers: [
        { provide: PDK_MODAL_DATA_TOKEN, useValue: modalData },
        { provide: CPPDate, useValue: mockCppDate }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeEndDateModalComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the injected modal data', () => {
    expect(component.modalData).toBe(modalData);
  });

  it('should default todayDate to the formatted current date', () => {
    expect(component.todayDate).toBe('2026-07-16');
  });

  it('should provide the required error message', () => {
    expect(component.errorMessages).toEqual([
      { rule: 'required', message: 'Enter a new hearing end date' }
    ]);
  });

  describe('template', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should render the hearing type description and day count', () => {
      const text = fixture.nativeElement.textContent;
      expect(text).toContain('Trial');
      expect(text).toContain('3 hearing days');
    });

    it('should call cancel when the Cancel link is clicked', () => {
      const cancelLink = fixture.debugElement.query(By.css('a[pdk-link]'));
      cancelLink.triggerEventHandler('click', {});

      expect(modalData.cancel).toHaveBeenCalled();
    });

    it('should call continue on valid form submission', () => {
      const form = fixture.debugElement.query(By.css('[data-test-id="change-end-date-form"]'));
      form.triggerEventHandler('validSubmit', {});

      expect(modalData.continue).toHaveBeenCalled();
    });
  });
});
