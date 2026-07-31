import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input, output } from '@angular/core';
import { CaseAccessAlertComponent } from '../case-access-alert.component';
import { CaseAccessAlertService } from '../case-access-alert.service';
import { CaseAccessModalComponent } from '../case-access-modal.component';

describe('CaseAccessAlertComponent', () => {
  let fixture: ComponentFixture<TestCaseAccessAlertComponent>;

  const shouldShowModal = jest.fn();
  const saveDecision = jest.fn();

  beforeEach(() => {
    TestBed.configureTestingModule({
      teardown: { destroyAfterEach: false }
    })
      .overrideComponent(CaseAccessAlertComponent, {
        remove: {
          imports: [CaseAccessModalComponent],
          providers: [CaseAccessAlertService]
        },
        add: {
          imports: [MockCaseAccessModalComponent]
        }
      })
      .overrideProvider(CaseAccessAlertService, {
        useValue: {
          shouldShowModal,
          saveDecision
        }
      });

    fixture = TestBed.createComponent(TestCaseAccessAlertComponent);
  });

  it('should render the component', () => {
    shouldShowModal.mockReturnValueOnce(true);
    fixture.detectChanges();

    expect(shouldShowModal.mock.calls).toMatchSnapshot();
    expect(fixture).toMatchSnapshot();
  });

  it('should save decision', () => {
    shouldShowModal.mockReturnValueOnce(true);
    fixture.detectChanges();
    const modal = fixture.debugElement.query(
      By.directive(MockCaseAccessModalComponent)
    ).componentInstance;
    modal.onSubmit.emit(true);
    expect(saveDecision).toHaveBeenCalled();
  });

  @Component({
    selector: 'case-access-modal',
    template: ` Urns: {{ urns() }} Show: {{ show() }} `
  })
  class MockCaseAccessModalComponent {
    readonly urns = input<string[]>(undefined);
    readonly show = input<boolean>(undefined);
    readonly onSubmit = output<boolean>();
  }

  @Component({
    selector: 'test-case-access-alert',
    template: `
      <case-access-alert
        [userId]="userId"
        [urns]="urns"
        [hearingIds]="hearingIds"
        [selectedHearingId]="selectedHearingId"
      ></case-access-alert>
    `,
    imports: [CaseAccessAlertComponent]
  })
  class TestCaseAccessAlertComponent {
    userId = 'userId';
    urns = ['URN1', 'URN2'];
    hearingIds = ['hearing1', 'hearing2'];
    selectedHearingId = 'selectedId';
  }
});
