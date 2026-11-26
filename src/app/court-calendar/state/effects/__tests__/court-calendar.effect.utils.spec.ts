import { cold } from 'jasmine-marbles';
import {
  generateNonDefaultDays,
  getPermissionAndNotificationHandler,
  getSelectedJudiciary
} from '../court-calendar.effect.utils';
import { JudiciaryTypesGroups } from '@cpp/reference-data';

describe('court-calendar.effect.utils', () => {
  describe('getSelectedJudiciary', () => {
    it('should return matching judiciary and flags when already assigned', () => {
      const selected = {
        judicialId: 'J1',
        judicialRoleType: { judiciaryType: JudiciaryTypesGroups.DEPUTY_DISTRICT_JUDGE }
      } as any;

      const hearings = [{ judiciary: [{ judicialId: 'J1' }] }] as any;

      const result = getSelectedJudiciary(
        hearings,
        [selected],
        JudiciaryTypesGroups.DEPUTY_DISTRICT_JUDGE
      );

      expect(result.selectedJudiciary).toBe(selected);
      expect(result.isSelectedJudiciarySame).toBe(true);
      expect(result.hasSelectedJudiciary).toBe(true);
    });

    it('should return flags when no selected judiciary exists', () => {
      const result = getSelectedJudiciary(
        [{ judiciary: [] }] as any,
        [] as any,
        JudiciaryTypesGroups.RECORDER
      );

      expect(result.selectedJudiciary).toBeUndefined();
      expect(result.isSelectedJudiciarySame).toBe(false);
      expect(result.hasSelectedJudiciary).toBe(false);
    });
  });

  describe('getPermissionAndNotificationHandler', () => {
    it('should return of(null) when no judiciaries', () => {
      const listingService = {} as any;
      const result$ = getPermissionAndNotificationHandler([] as any, [] as any, listingService);

      const expected$ = cold('(a|)', { a: null });
      expect(result$).toBeObservable(expected$);
    });

    it('should send email and grant permission when selected differs and no prior assignments', () => {
      const listingService = {
        sendEmailNotification: jest.fn().mockReturnValue(cold('(a|)', { a: 'email' })),
        grantBulkJudiciaryPermission: jest.fn().mockReturnValue(cold('(b|)', { b: 'grant' })),
        revokeBulkJudiciaryPermission: jest.fn()
      } as any;

      const judiciaries = [
        {
          judicialId: 'J2',
          judicialRoleType: { judiciaryType: JudiciaryTypesGroups.DEPUTY_DISTRICT_JUDGE }
        }
      ] as any;

      const hearings = [{ judiciary: [] }] as any;

      const result$ = getPermissionAndNotificationHandler(hearings, judiciaries, listingService);

      const expected$ = cold('(c|)', { c: ['email', 'grant'] });
      expect(result$).toBeObservable(expected$);
      expect(listingService.sendEmailNotification).toHaveBeenCalled();
      expect(listingService.grantBulkJudiciaryPermission).toHaveBeenCalled();
      expect(listingService.revokeBulkJudiciaryPermission).not.toHaveBeenCalled();
    });

    it('should revoke permission when already assigned and no selected judiciary for a type', () => {
      const listingService = {
        sendEmailNotification: jest.fn().mockReturnValue(cold('(a|)', { a: 'email' })),
        grantBulkJudiciaryPermission: jest.fn().mockReturnValue(cold('(b|)', { b: 'grant' })),
        revokeBulkJudiciaryPermission: jest.fn().mockReturnValue(cold('(c|)', { c: 'revoke' }))
      } as any;

      const judiciaries = [
        {
          judicialId: 'J2',
          judicialRoleType: { judiciaryType: JudiciaryTypesGroups.DEPUTY_DISTRICT_JUDGE }
        }
      ] as any;

      const hearings = [
        {
          judiciary: [
            {
              judicialId: 'J9',
              judicialRoleType: { judiciaryType: JudiciaryTypesGroups.RECORDER }
            }
          ]
        }
      ] as any;

      const result$ = getPermissionAndNotificationHandler(hearings, judiciaries, listingService);

      // Order: email + grant (DDJ), then revoke (Recorder)
      const expected$ = cold('(d|)', { d: ['email', 'grant', 'revoke'] });
      expect(result$).toBeObservable(expected$);
      expect(listingService.revokeBulkJudiciaryPermission).toHaveBeenCalled();
    });

    it('should send email using updated hearings when provided', () => {
      const listingService = {
        sendEmailNotification: jest.fn().mockReturnValue(cold('(a|)', { a: 'email' })),
        grantBulkJudiciaryPermission: jest.fn().mockReturnValue(cold('(b|)', { b: 'grant' })),
        revokeBulkJudiciaryPermission: jest.fn()
      } as any;

      const judiciaries = [
        {
          judicialId: 'J2',
          judicialRoleType: { judiciaryType: JudiciaryTypesGroups.DEPUTY_DISTRICT_JUDGE }
        }
      ] as any;

      const hearings = [{ judiciary: [] }] as any;
      const updatedHearings = [{ judiciary: [], updated: true }] as any;

      const result$ = getPermissionAndNotificationHandler(
        hearings,
        judiciaries,
        listingService,
        updatedHearings
      );

      const expected$ = cold('(c|)', { c: ['email', 'grant'] });
      expect(result$).toBeObservable(expected$);
      expect(listingService.sendEmailNotification).toHaveBeenCalledWith(
        updatedHearings,
        judiciaries,
        JudiciaryTypesGroups.DEPUTY_DISTRICT_JUDGE
      );
    });
  });

  describe('generateNonDefaultDays', () => {
    it('should use duration from allocation when present', () => {
      const input = [
        { hearingSlotTime: '10:00', duration: 45, hearingSlot: { courtScheduleId: '1' } }
      ] as any;

      const result = generateNonDefaultDays(input, { defaultDurationMin: 30 } as any);
      expect(result[0].duration).toBe(45);
    });

    it('should fall back to hearing type default or 1', () => {
      const input = [{ hearingSlotTime: '10:00', hearingSlot: { courtScheduleId: '1' } }] as any;

      const withDefault = generateNonDefaultDays(input, { defaultDurationMin: 30 } as any);
      expect(withDefault[0].duration).toBe(30);

      const withoutDefault = generateNonDefaultDays(input, undefined as any);
      expect(withoutDefault[0].duration).toBe(1);
    });

    it('should always mark generated non default days as virtual', () => {
      const input = [{ hearingSlotTime: '10:00', hearingSlot: { courtScheduleId: '1' } }] as any;

      const result = generateNonDefaultDays(input, { defaultDurationMin: 30 } as any);
      expect(result[0].virtual).toBe(true);
    });
  });
});
