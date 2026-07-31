import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MagsPublishStatusesComponent } from '../mags-publish-statuses.component';
import { MagsPublishListVM } from '../../models/mags-publish-list.vm';
import { MagsPublishStatus } from '../../models';
import { CourtListType } from '../../models/mags-publish-list.dto';

const mockStatuses: MagsPublishListVM[] = [
  {
    publishRequestId: 'req-1',
    courtCentreId: 'centre-1',
    publishStatus: MagsPublishStatus.SUCCESSFUL,
    downloadStatus: MagsPublishStatus.SUCCESSFUL,
    lastUpdated: '2026-01-01T00:00:00Z',
    listType: CourtListType.STANDARD
  },
  {
    publishRequestId: 'req-2',
    courtCentreId: 'centre-1',
    publishStatus: MagsPublishStatus.SUCCESSFUL,
    downloadStatus: MagsPublishStatus.FAILED,
    lastUpdated: '2026-01-01T00:00:00Z',
    listType: CourtListType.ONLINE_PUBLIC
  }
];

@Component({
  selector: 'app-test-host',
  template: `<mags-publish-statuses [statuses]="statuses()"></mags-publish-statuses>`,
  imports: [MagsPublishStatusesComponent]
})
class TestHostComponent {
  statuses = signal<MagsPublishListVM[]>([]);
}

describe('MagsPublishStatusesComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;
  let component: MagsPublishStatusesComponent;

  beforeEach(() => {
    Element.prototype.scrollIntoView = jest.fn();
    TestBed.configureTestingModule({
      providers: [],
      teardown: { destroyAfterEach: false }
    });

    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(MagsPublishStatusesComponent)
    ).componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render correctly with empty statuses', () => {
    testHost.statuses.set([]);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should render correctly with one status', () => {
    testHost.statuses.set([mockStatuses[0]]);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should render correctly with multiple statuses', () => {
    testHost.statuses.set(mockStatuses);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should show publish again suggestion when publish SUCCESSFUL and download FAILED', () => {
    testHost.statuses.set([mockStatuses[1]]);
    fixture.detectChanges();
    const suggestion = fixture.debugElement.query(
      By.css('[data-test-id="alert-message-suggestion"]')
    );
    expect(suggestion?.nativeElement?.textContent?.trim()).toContain(
      'Publish again to publish & generate PDF'
    );
  });

  it('should show publish again when both publish and download FAILED', () => {
    const failedStatus: MagsPublishListVM = {
      ...mockStatuses[0],
      publishStatus: MagsPublishStatus.FAILED,
      downloadStatus: MagsPublishStatus.FAILED
    };
    testHost.statuses.set([failedStatus]);
    fixture.detectChanges();
    const suggestion = fixture.debugElement.query(
      By.css('[data-test-id="alert-message-suggestion"]')
    );
    expect(suggestion?.nativeElement?.textContent?.trim()).toContain('Publish again.');
  });

  it('should expose magsPublishStatus enum', () => {
    expect(component.magsPublishStatus).toBe(MagsPublishStatus);
  });
});
