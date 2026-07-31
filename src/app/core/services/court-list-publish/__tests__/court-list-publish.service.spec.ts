import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { CourtListPublishService } from '../court-list-publish.service';
import { CppHttp } from '@cpp/core';
import { CourtListType } from '../../../../create-a-list/models';

describe('CourtListPublishService', () => {
  let service: CourtListPublishService;
  let cppHttpMock: { command: jest.Mock; query: jest.Mock };

  beforeEach(() => {
    cppHttpMock = {
      command: jest.fn(),
      query: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [CourtListPublishService, { provide: CppHttp, useValue: cppHttpMock }],
      teardown: { destroyAfterEach: false }
    });

    service = TestBed.inject(CourtListPublishService);
  });

  describe('publishCourtList', () => {
    it('should call cppHttp.command with correct options and return parsed body', (done) => {
      const request = {
        courtCentreId: 'centre-1',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        courtListType: CourtListType.STANDARD
      };
      const mockDto = {
        courtListId: 'list-1',
        courtCentreId: 'centre-1',
        publishStatus: 'REQUESTED',
        fileStatus: 'REQUESTED',
        courtListType: 'STANDARD',
        lastUpdated: new Date().toISOString(),
        fileName: 'list.pdf',
        publishDate: '2025-01-01'
      };
      const response = new HttpResponse({
        body: JSON.stringify(mockDto),
        status: 200
      });

      cppHttpMock.command.mockReturnValue(of(response));

      service.publishCourtList(request).subscribe((result) => {
        expect(cppHttpMock.command).toHaveBeenCalledWith({
          url: '/courtlistpublishing-service/api/court-list-publish/publish',
          requestType: 'application/vnd.courtlistpublishing-service.publish.post+json',
          body: request
        });
        expect(result).toEqual(mockDto);
        done();
      });
    });
  });

  describe('retrieveCourtListPublishStatus', () => {
    it('should call cppHttp.query with courtListId and background true when payload has courtListId', () => {
      const payload = { courtListId: 'list-1' };
      cppHttpMock.query.mockReturnValue(of([]));

      service.retrieveCourtListPublishStatus(payload).subscribe();

      expect(cppHttpMock.query).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/courtlistpublishing-service/api/court-list-publish/publish-status',
          requestType: 'application/vnd.courtlistpublishing-service.publish.get+json',
          background: true
        })
      );
    });

    it('should call cppHttp.query with courtCentreId and publishDate and background false', () => {
      const payload = { courtCentreId: 'centre-1', publishDate: '2025-01-01' };
      cppHttpMock.query.mockReturnValue(of([]));

      service.retrieveCourtListPublishStatus(payload).subscribe();

      expect(cppHttpMock.query).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/courtlistpublishing-service/api/court-list-publish/publish-status',
          requestType: 'application/vnd.courtlistpublishing-service.publish.get+json',
          background: false
        })
      );
    });

    it('should return the observable from query', (done) => {
      const payload = { courtCentreId: 'c1', publishDate: '2025-01-01' };
      const mockData = [
        { courtListId: '1', publishStatus: 'SUCCESSFUL', fileStatus: 'SUCCESSFUL' } as any
      ];
      cppHttpMock.query.mockReturnValue(of(mockData));

      service.retrieveCourtListPublishStatus(payload).subscribe((result) => {
        expect(result).toEqual(mockData);
        done();
      });
    });
  });

  describe('downloadCourtListPdf', () => {
    it('should call cppHttp.query with fileId and return Blob', (done) => {
      const fileId = '123e4567-e89b-12d3-a456-426614174002';
      const blob = new Blob([], { type: 'application/pdf' });
      cppHttpMock.query.mockReturnValue(of(blob));

      service.downloadCourtListPdf(fileId).subscribe((result) => {
        expect(result).toBeInstanceOf(Blob);
        expect(result.type).toBe('application/pdf');
        expect(cppHttpMock.query).toHaveBeenCalledWith({
          url: `/courtlistpublishing-service/api/files/download/${fileId}`,
          requestType: 'application/vnd.courtlistpublishing-service.files.download+json',
          responseType: 'blob'
        });
        done();
      });
    });
  });
});
