import { TestBed, inject } from '@angular/core/testing';

import { BootstrapService } from './bootstrap.service';
import { ConnectionService } from '../connection/connection';

describe('BootstrapService', () => {
  let startConnectivityMonitor: jest.Mock;

  beforeEach(() => {
    startConnectivityMonitor = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        BootstrapService,
        {
          provide: ConnectionService,
          useValue: {
            startConnectivityMonitor
          }
        }
      ],
      teardown: { destroyAfterEach: false }
    });
  });

  it('should be created', inject([BootstrapService], (service: BootstrapService) => {
    expect(service).toBeTruthy();
  }));

  describe('startConnectivityMonitor', () => {
    it('should invoke connection service', inject(
      [BootstrapService],
      (service: BootstrapService) => {
        service.startConnectivityMonitor();

        expect(startConnectivityMonitor).toHaveBeenCalled();
      }
    ));
  });
});
