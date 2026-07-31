import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { getUserRolePermissions, RequiredPermission } from '@cpp/users-groups';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { userPermissions } from '../../../config';
import { MagsPublishListComponent } from './mags-publish-list.component';
import { MagsPublishListVM } from '../../models/mags-publish-list.vm';
import { CourtListType, MagsPublishStatus } from '../../models/mags-publish-list.dto';

const publishCourtListPermission: RequiredPermission = userPermissions.publicCourtList;

const statusOnlinePublic: MagsPublishListVM = {
  publishRequestId: 'req-op',
  courtCentreId: 'cc-1',
  publishStatus: MagsPublishStatus.SUCCESSFUL,
  downloadStatus: MagsPublishStatus.SUCCESSFUL,
  lastUpdated: '2024-01-15T12:00:00Z',
  fileId: '123e4567-e89b-12d3-a456-426614174002',
  listType: CourtListType.ONLINE_PUBLIC
};

const statusStandard: MagsPublishListVM = {
  publishRequestId: 'req-std',
  courtCentreId: 'cc-1',
  publishStatus: MagsPublishStatus.REQUESTED,
  downloadStatus: MagsPublishStatus.REQUESTED,
  lastUpdated: '2024-01-15T10:00:00Z',
  listType: CourtListType.STANDARD
};

@Component({
  selector: 'app-test-host',
  template: `
    <mags-publish-list
      [isHmctsUser]="isHmctsUser()"
      [magPublishListPermissions]="magPublishListPermissions()"
      [statuses]="statuses()"
      (onMagsPublishList)="onPublishList($event)"
      (onDownloadMagsPublishedList)="onDownloadList($event)"
    ></mags-publish-list>
  `,
  imports: [MagsPublishListComponent]
})
class TestHostComponent {
  isHmctsUser = signal<boolean>(true);
  magPublishListPermissions = signal<RequiredPermission>(publishCourtListPermission);
  statuses = signal<MagsPublishListVM[]>([]);

  onPublishList(_event: { listType: CourtListType }): void {}
  onDownloadList(_event: { listType: CourtListType; fileId: string }): void {}
}

describe('MagsPublishListComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let component: MagsPublishListComponent;
  let mockStore: MockStore;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideMockStore()],
      teardown: { destroyAfterEach: false }
    }).compileComponents();
  }));

  beforeEach(() => {
    mockStore = TestBed.inject(MockStore);
    mockStore.overrideSelector(getUserRolePermissions, [
      { ...publishCourtListPermission, description: '' }
    ]);
    mockStore.refreshState();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(MagsPublishListComponent)
    ).componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show Online public and Standard court list when isHmctsUser is true and user has Court List publish permission', () => {
    host.isHmctsUser.set(true);
    host.statuses.set([]);
    fixture.detectChanges();

    const items = fixture.debugElement.queryAll(By.css('[mags-publish-list-item]'));
    const labels = items.map(el => el.componentInstance.label());
    expect(labels).toContain('Online public court list');
    expect(labels).toContain('Standard court list');
    expect(items.length).toBe(2);
  });

  it('should show only Standard court list when isHmctsUser is false and user has Court List publish permission', () => {
    host.isHmctsUser.set(false);
    host.statuses.set([]);
    fixture.detectChanges();

    const items = fixture.debugElement.queryAll(By.css('[mags-publish-list-item]'));
    const labels = items.map(el => el.componentInstance.label());
    expect(labels).not.toContain('Online public court list');
    expect(labels).toContain('Standard court list');
    expect(items.length).toBe(1);
  });

  it('should emit publishList with ONLINE_PUBLIC when Online public publish is clicked', () => {
    const spy = jest.spyOn(host, 'onPublishList');
    host.isHmctsUser.set(true);
    host.statuses.set([]);
    fixture.detectChanges();

    const items = fixture.debugElement.queryAll(By.css('[mags-publish-list-item]'));
    const onlinePublicItem = items.find(
      el => el.componentInstance.label() === 'Online public court list'
    );
    const btn = onlinePublicItem?.query(By.css('button'));
    btn?.nativeElement.click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith({ listType: CourtListType.ONLINE_PUBLIC });
  });

  it('should emit publishList with STANDARD when Standard publish is clicked', () => {
    const spy = jest.spyOn(host, 'onPublishList');
    host.isHmctsUser.set(false);
    host.statuses.set([]);
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button'));
    btn?.nativeElement.click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith({ listType: CourtListType.STANDARD });
  });

  it('should hide publish list when user lacks Court List publish permission', () => {
    mockStore.overrideSelector(getUserRolePermissions, []);
    mockStore.refreshState();
    host.isHmctsUser.set(true);
    host.statuses.set([]);
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('[mags-publish-list-item]')).length).toBe(0);
  });

  it('should show "No lists have been published for this date yet" when user lacks publish permission and there is nothing to download', () => {
    mockStore.overrideSelector(getUserRolePermissions, []);
    mockStore.refreshState();
    host.isHmctsUser.set(true);
    host.statuses.set([]);
    fixture.detectChanges();

    const emptyState = fixture.debugElement.query(By.css('p'));
    expect(emptyState?.nativeElement.textContent.trim()).toBe(
      'No lists have been published for this date yet'
    );
  });

  it('should show publish list when user has Court List publish permission', () => {
    mockStore.overrideSelector(getUserRolePermissions, [
      { ...publishCourtListPermission, description: '' }
    ]);
    mockStore.refreshState();
    host.isHmctsUser.set(true);
    host.statuses.set([]);
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('[mags-publish-list-item]')).length).toBe(2);
  });

  it('should emit downloadList with listType and fileId when download link is clicked', () => {
    const spy = jest.spyOn(host, 'onDownloadList');
    host.isHmctsUser.set(true);
    host.statuses.set([statusOnlinePublic, statusStandard]);
    fixture.detectChanges();

    const downloadLink = fixture.debugElement.query(By.css('.link-btn'));
    expect(downloadLink).toBeTruthy();
    downloadLink.nativeElement.click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith({
      listType: CourtListType.ONLINE_PUBLIC,
      fileId: '123e4567-e89b-12d3-a456-426614174002'
    });
  });
});
