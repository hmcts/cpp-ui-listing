import { ListedCase } from '../model';

export function isCivilGroupCase(listedCase: ListedCase | undefined): boolean {
  return !!listedCase?.isCivil && !!(listedCase.isGroupMaster || listedCase.isGroupMember);
}
