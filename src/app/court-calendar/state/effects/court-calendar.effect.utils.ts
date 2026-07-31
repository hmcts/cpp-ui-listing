import { HearingType, JudiciaryTypeGroup, JudiciaryTypesGroups } from '@cpp/reference-data';
import { defaultIfEmpty, switchMap } from 'rxjs/operators';
import { ListingService } from '../../../core';
import { ExtendedJudicialRole, HearingWithSelectedCourtCentre } from '../../../core';
import { forkJoin, of } from 'rxjs';
import { HearingSlotAllocation } from '@cpp/scheduling';

export const getSelectedJudiciary = (
  alreadyAssignedJudiciary: HearingWithSelectedCourtCentre[],
  judiciaries: ExtendedJudicialRole[],
  judiciaryType: JudiciaryTypeGroup
) => {
  const selectedJudiciary = judiciaries.find(
    judiciary => judiciary.judicialRoleType.judiciaryType === judiciaryType
  );

  const isSelectedJudiciarySame = selectedJudiciary
    ? alreadyAssignedJudiciary.filter(a =>
        a.judiciary.some(ju => ju.judicialId === selectedJudiciary.judicialId)
      ).length > 0
    : false;

  const hasSelectedJudiciary = selectedJudiciary ? !!selectedJudiciary.judicialId : false;

  return {
    selectedJudiciary,
    isSelectedJudiciarySame,
    hasSelectedJudiciary
  };
};

export const getPermissionAndNotificationHandler = (
  hearings: HearingWithSelectedCourtCentre[],
  judiciaries: ExtendedJudicialRole[],
  listingService: ListingService,
  updatedHearings?: HearingWithSelectedCourtCentre[]
) => {
  const judiciaryTypesToBeSelected = [
    JudiciaryTypesGroups.DEPUTY_DISTRICT_JUDGE,
    JudiciaryTypesGroups.RECORDER
  ];

  const alreadyAssignedJudiciary = hearings.filter(hearing =>
    hearing.judiciary.some(judi =>
      judiciaryTypesToBeSelected.includes(
        judi.judicialRoleType.judiciaryType as JudiciaryTypesGroups
      )
    )
  );

  if (judiciaries.length === 0 && alreadyAssignedJudiciary.length === 0) {
    return of(null);
  }

  return forkJoin(
    judiciaryTypesToBeSelected.reduce((accStream, judiciaryType) => {
      const { isSelectedJudiciarySame, hasSelectedJudiciary } = getSelectedJudiciary(
        alreadyAssignedJudiciary,
        judiciaries,
        judiciaryType
      );

      if (hasSelectedJudiciary && !isSelectedJudiciarySame) {
        accStream = [
          ...accStream,
          listingService.sendEmailNotification(
            updatedHearings || hearings,
            judiciaries,
            judiciaryType
          )
        ];
        if (alreadyAssignedJudiciary.length > 0) {
          return [
            ...accStream,
            listingService
              .revokeBulkJudiciaryPermission(hearings, judiciaryType)
              .pipe(
                switchMap(() =>
                  listingService.grantBulkJudiciaryPermission(hearings, judiciaries, judiciaryType)
                )
              )
          ];
        }
        return [
          ...accStream,
          listingService.grantBulkJudiciaryPermission(hearings, judiciaries, judiciaryType)
        ];
      }
      if (alreadyAssignedJudiciary.length > 0 && !hasSelectedJudiciary) {
        return [
          ...accStream,
          listingService.revokeBulkJudiciaryPermission(hearings, judiciaryType)
        ];
      }
      return accStream;
    }, [])
  ).pipe(defaultIfEmpty([]));
};

export const generateNonDefaultDays = (
  hearingSlotAllocations: HearingSlotAllocation[],
  hearingType: HearingType
) => {
  return hearingSlotAllocations.map(({ hearingSlot, hearingSlotTime, duration }) => {
    const finalDuration = duration ?? hearingType?.defaultDurationMin ?? 1;

    return {
      startTime: hearingSlotTime,
      duration: finalDuration,
      courtScheduleId: hearingSlot.courtScheduleId,
      courtCentreId: hearingSlot?.courtHouseId,
      session: hearingSlot.courtSession,
      oucode: hearingSlot.ouCode,
      courtRoomId: hearingSlot.courtRoomNumber,
      roomId: hearingSlot.courtRoomId
    };
  });
};
