import { ExtendedJudicialRole } from '../model';
import { resolveJohSource } from './utils-helper';

describe('resolveJohSource', () => {
  const selectedJudiciary: ExtendedJudicialRole[] = [
    { judicialId: '1', judicialRoleType: { judiciaryType: 'MAGISTRATE' } }
  ];

  it('should return undefined for a CROWN hearing, regardless of judiciary selection', () => {
    expect(resolveJohSource('CROWN', selectedJudiciary)).toBeUndefined();
    expect(resolveJohSource('CROWN', undefined)).toBeUndefined();
    expect(resolveJohSource('CROWN', [])).toBeUndefined();
  });

  it('should return undefined for a MAGISTRATES hearing when no judiciary selection was made', () => {
    expect(resolveJohSource('MAGISTRATES', undefined)).toBeUndefined();
  });

  it('should return undefined for a MAGISTRATES hearing when all judiciary are unchecked', () => {
    expect(resolveJohSource('MAGISTRATES', [])).toBeUndefined();
  });

  it('should return MANUAL for a MAGISTRATES hearing when judiciary selection is changed', () => {
    expect(resolveJohSource('MAGISTRATES', selectedJudiciary)).toEqual('MANUAL');
  });
});
