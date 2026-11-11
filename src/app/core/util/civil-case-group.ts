import { ListedCase } from '../model';

export function isGroupedCivilCase(listedCase: ListedCase | undefined): boolean {
  return !!listedCase?.isCivil && !!(listedCase.isGroupMaster || listedCase.isGroupMember);
}
