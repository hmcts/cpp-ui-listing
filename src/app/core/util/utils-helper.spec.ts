import { ExtendedJudicialRole, JudiciaryAssignmentSource } from '../model';
import { resolveJudiciaryAssignmentSource } from './utils-helper';

describe('resolveJudiciaryAssignmentSource', () => {
  it('should return undefined when no judiciary selection was made', () => {
    expect(resolveJudiciaryAssignmentSource(undefined)).toBeUndefined();
  });

  it('should return undefined when all judiciary are unchecked', () => {
    expect(resolveJudiciaryAssignmentSource([])).toBeUndefined();
  });

  it('should return MANUAL when the judiciary selection is changed', () => {
    const selectedJudiciary: ExtendedJudicialRole[] = [
      { judicialId: '1', judicialRoleType: { judiciaryType: 'RECORDER' } }
    ];
    expect(resolveJudiciaryAssignmentSource(selectedJudiciary)).toEqual(
      JudiciaryAssignmentSource.MANUAL
    );
  });
});
