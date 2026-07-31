import { TestBed, inject } from '@angular/core/testing';
import { ConnectionService } from '../';
import { provideStore } from '@ngrx/store';

declare global {
  interface Window {
    Offline: any;
  }
}

describe('ConnectionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConnectionService, provideStore({})],
      teardown: { destroyAfterEach: false }
    });
  });

  it('should redirect window to the right url', inject(
    [ConnectionService],
    (service: ConnectionService) => {
      service.setHref = jasmine.createSpy().and.returnValue(true);
      service.pageNotFound();
      expect(service.setHref).toHaveBeenCalledWith('/listing/page-not-found');
      service.unauthorizedAccess();
      expect(service.setHref).toHaveBeenCalledWith('/listing/unauthorised-access');
      service.serviceFailed();
      expect(service.setHref).toHaveBeenCalledWith('/listing/technical-error');
    }
  ));
});
