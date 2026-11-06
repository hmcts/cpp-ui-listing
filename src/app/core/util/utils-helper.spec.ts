import { ExtendedJudicialRole, JudiciaryAssignmentSource } from '../model';
import { resolveJudiciaryAssignmentSource } from './utils-helper';

describe('resolveJudiciaryAssignmentSource', () => {
  const selectedJudiciary: ExtendedJudicialRole[] = [
    { judicialId: '1', judicialRoleType: { judiciaryType: 'MAGISTRATE' } }
  ];

  it('should return undefined for a CROWN hearing, regardless of judiciary selection', () => {
    expect(resolveJudiciaryAssignmentSource('CROWN', selectedJudiciary)).toBeUndefined();
    expect(resolveJudiciaryAssignmentSource('CROWN', undefined)).toBeUndefined();
    expect(resolveJudiciaryAssignmentSource('CROWN', [])).toBeUndefined();
  });

  it('should return undefined for a MAGISTRATES hearing when no judiciary selection was made', () => {
    expect(resolveJudiciaryAssignmentSource('MAGISTRATES', undefined)).toBeUndefined();
  });

  it('should return undefined for a MAGISTRATES hearing when all judiciary are unchecked', () => {
    expect(resolveJudiciaryAssignmentSource('MAGISTRATES', [])).toBeUndefined();
  });

  it('should return MANUAL for a MAGISTRATES hearing when judiciary selection is changed', () => {
    expect(resolveJudiciaryAssignmentSource('MAGISTRATES', selectedJudiciary)).toEqual(
      JudiciaryAssignmentSource.MANUAL
    );
  });
});
