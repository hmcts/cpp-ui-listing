import { magsPublishListStatusVmAdapter, MagsPublishStatus, CourtListType } from '../index';
import { MagsPublishStatusDto } from '../mags-publish-list.dto';

const mockDto: MagsPublishStatusDto = {
  courtListId: 'court-1',
  courtCentreId: 'centre-1',
  publishStatus: MagsPublishStatus.REQUESTED,
  fileStatus: MagsPublishStatus.REQUESTED,
  lastUpdated: '2026-01-01T00:00:00Z',
  courtListType: CourtListType.STANDARD,
  fileId: '123e4567-e89b-12d3-a456-426614174000',
  publishDate: '2026-01-01'
};

describe('magsPublishListStatusVmAdapter', () => {
  it('should map DTO to VM', () => {
    const result = magsPublishListStatusVmAdapter(mockDto);

    expect(result).toEqual({
      publishRequestId: 'court-1',
      courtCentreId: 'centre-1',
      publishStatus: MagsPublishStatus.REQUESTED,
      downloadStatus: MagsPublishStatus.REQUESTED,
      lastUpdated: '2026-01-01T00:00:00Z',
      fileId: '123e4567-e89b-12d3-a456-426614174000',
      listType: CourtListType.STANDARD
    });
  });
});
