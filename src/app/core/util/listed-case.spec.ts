import { ListedCase } from '../model';
import { isCivilGroupCase } from './listed-case';

describe('isCivilGroupCase', () => {
  const listedCase = (flags: Partial<ListedCase>) => flags as ListedCase;

  it('should return false when listed case is undefined', () => {
    expect(isCivilGroupCase(undefined)).toBe(false);
  });

  it('should return true for a civil group master case', () => {
    expect(isCivilGroupCase(listedCase({ isCivil: true, isGroupMaster: true }))).toBe(true);
  });

  it('should return true for a civil group member case', () => {
    expect(isCivilGroupCase(listedCase({ isCivil: true, isGroupMember: true }))).toBe(true);
  });

  it('should return false for a civil case that is not part of a group', () => {
    expect(isCivilGroupCase(listedCase({ isCivil: true }))).toBe(false);
  });

  it('should return false for a non-civil group case', () => {
    expect(isCivilGroupCase(listedCase({ isCivil: false, isGroupMaster: true }))).toBe(false);
  });
});
