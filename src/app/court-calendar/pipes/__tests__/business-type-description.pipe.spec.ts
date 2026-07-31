import { BusinessTypeDescriptionByCodePipe } from '../business-type-description.pipe';
import { RotaBusinessType, RotaBusinessTypeCode } from '@cpp/reference-data';

describe('BusinessTypeDescriptionByCodePipe', () => {
  let pipe: BusinessTypeDescriptionByCodePipe;

  beforeEach(() => {
    pipe = new BusinessTypeDescriptionByCodePipe();
  });

  const mockRotaBusinessTypes: RotaBusinessType[] = [
    {
      id: '1',
      seqNum: 1,
      typeCode: RotaBusinessTypeCode.applications,
      typeDescription: 'Applications',
      slot: true,
      duration: false
    },
    {
      id: '2',
      seqNum: 2,
      typeCode: RotaBusinessTypeCode.crownCourt,
      typeDescription: 'Crown Court',
      slot: false,
      duration: true
    },
    {
      id: '3',
      seqNum: 3,
      typeCode: RotaBusinessTypeCode.trial,
      typeDescription: 'Trial',
      slot: true,
      duration: true
    }
  ];

  describe('when businessTypeCode is provided', () => {
    it('should return the correct description for existing business type code', () => {
      const result = pipe.transform(RotaBusinessTypeCode.applications, mockRotaBusinessTypes);
      expect(result).toBe('Applications');
    });

    it('should return the correct description for different business type codes', () => {
      const resultCC = pipe.transform(RotaBusinessTypeCode.crownCourt, mockRotaBusinessTypes);
      const resultTrial = pipe.transform(RotaBusinessTypeCode.trial, mockRotaBusinessTypes);

      expect(resultCC).toBe('Crown Court');
      expect(resultTrial).toBe('Trial');
    });

    it('should return empty string when business type code does not exist', () => {
      const result = pipe.transform('NON_EXISTENT' as RotaBusinessTypeCode, mockRotaBusinessTypes);
      expect(result).toBe('');
    });

    it('should return empty string when rotaBusinessTypes array is empty', () => {
      const result = pipe.transform(RotaBusinessTypeCode.applications, []);
      expect(result).toBe('');
    });

    it('should return empty string when rotaBusinessTypes is null', () => {
      const result = pipe.transform(RotaBusinessTypeCode.applications, null as any);
      expect(result).toBe('');
    });

    it('should return empty string when rotaBusinessTypes is undefined', () => {
      const result = pipe.transform(RotaBusinessTypeCode.applications, undefined as any);
      expect(result).toBe('');
    });
  });

  describe('when businessTypeCode is not provided', () => {
    it('should return empty string when businessTypeCode is null', () => {
      const result = pipe.transform(null as any, mockRotaBusinessTypes);
      expect(result).toBe('');
    });

    it('should return empty string when businessTypeCode is undefined', () => {
      const result = pipe.transform(undefined as any, mockRotaBusinessTypes);
      expect(result).toBe('');
    });

    it('should return empty string when businessTypeCode is empty string', () => {
      const result = pipe.transform('' as RotaBusinessTypeCode, mockRotaBusinessTypes);
      expect(result).toBe('');
    });
  });

  describe('edge cases', () => {
    it('should handle business types with missing typeDescription', () => {
      const businessTypesWithMissingDescription: RotaBusinessType[] = [
        {
          id: '1',
          seqNum: 1,
          typeCode: RotaBusinessTypeCode.applications,
          typeDescription: undefined as any,
          slot: true,
          duration: false
        },
        {
          id: '2',
          seqNum: 2,
          typeCode: RotaBusinessTypeCode.crownCourt,
          typeDescription: 'Crown Court',
          slot: false,
          duration: true
        }
      ];

      const result = pipe.transform(
        RotaBusinessTypeCode.applications,
        businessTypesWithMissingDescription
      );
      expect(result).toBe('');
    });

    it('should handle business types with null typeDescription', () => {
      const businessTypesWithNullDescription: RotaBusinessType[] = [
        {
          id: '1',
          seqNum: 1,
          typeCode: RotaBusinessTypeCode.applications,
          typeDescription: null as any,
          slot: true,
          duration: false
        }
      ];

      const result = pipe.transform(
        RotaBusinessTypeCode.applications,
        businessTypesWithNullDescription
      );
      expect(result).toBe('');
    });

    it('should return first matching description when duplicate type codes exist', () => {
      const businessTypesWithDuplicates: RotaBusinessType[] = [
        {
          id: '1',
          seqNum: 1,
          typeCode: RotaBusinessTypeCode.applications,
          typeDescription: 'First Description',
          slot: true,
          duration: false
        },
        {
          id: '2',
          seqNum: 2,
          typeCode: RotaBusinessTypeCode.applications,
          typeDescription: 'Second Description',
          slot: false,
          duration: true
        }
      ];

      const result = pipe.transform(RotaBusinessTypeCode.applications, businessTypesWithDuplicates);
      expect(result).toBe('First Description');
    });
  });

  describe('pipe creation', () => {
    it('should create pipe instance', () => {
      expect(pipe).toBeTruthy();
      expect(pipe).toBeInstanceOf(BusinessTypeDescriptionByCodePipe);
    });
  });
});
