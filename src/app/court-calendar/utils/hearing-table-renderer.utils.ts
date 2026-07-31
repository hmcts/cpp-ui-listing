import {
  HearingsGroupLevel,
  HearingsGroupLevelsConfig,
  HearingsRenderItem
} from '../model/hearing-table-renderer.interfaces';
import { PdkColor } from '@cpp/pdk';

// ─── Internal type utilities ───────────────────────────────────────────────────

type ArrayElement<T> = T extends (infer U)[] ? U : T;

type IterableKeys<T> = {
  [K in keyof T & string]: T[K] extends any[] ? K : T[K] extends object ? K : never;
}[keyof T & string];

type ArrayKeys<T> = {
  [K in keyof T & string]: T[K] extends any[] ? K : never;
}[keyof T & string];

// ─── Builder ───────────────────────────────────────────────────────────────────

interface HearingsGroupLevelsBuilder<TCurrent> {
  group<P extends IterableKeys<TCurrent>>(
    path: P,
    opts?: { dataPath?: keyof ArrayElement<TCurrent[P]>; label?: string; bgColor?: PdkColor }
  ): HearingsGroupLevelsBuilder<Extract<ArrayElement<TCurrent[P]>, object>>;
  rows<P extends ArrayKeys<TCurrent>>(rowsPath: P): HearingsGroupLevelsConfig;
}

function createGroupLevelsBuilder<TCurrent>(
  levels: HearingsGroupLevel[]
): HearingsGroupLevelsBuilder<TCurrent> {
  return {
    group(path: string, opts?: { dataPath?: string; label?: string; bgColor?: PdkColor }) {
      const newLevel: HearingsGroupLevel = {
        path,
        hasHeader: !!(opts?.dataPath || opts?.label),
        dataPath: opts?.dataPath,
        label: opts?.label,
        bgColor: opts?.bgColor
      };
      return createGroupLevelsBuilder([...levels, newLevel]);
    },
    rows(rowsPath: string): HearingsGroupLevelsConfig {
      return { levels, rowsPath };
    }
  } as HearingsGroupLevelsBuilder<TCurrent>;
}

export function defineHearingsGroupLevels<T>(): HearingsGroupLevelsBuilder<T> {
  return createGroupLevelsBuilder<T>([]);
}

// ─── buildRenderItems ──────────────────────────────────────────────────────────

export function buildRenderItems(
  section: Record<string, unknown>,
  groupLevels: HearingsGroupLevelsConfig | undefined,
  initialAncestorHeaderIds: string
): HearingsRenderItem[] {
  const sectionIdentifier = section['sectionIdentifier'] as string;
  if (!groupLevels?.levels?.length) {
    return [];
  }

  const result: HearingsRenderItem[] = [];

  let headerCount = 0;
  const levelDepths = groupLevels.levels.map(level => {
    if (level.hasHeader) {
      headerCount++;
      return headerCount;
    }
    return -1;
  });
  const dataRowDepth = headerCount + 1;

  function walkLevel(dataItems: unknown[], levelIndex: number, ancestorHeaderIds: string): void {
    const level = groupLevels.levels[levelIndex];
    const isLastLevel = levelIndex === groupLevels.levels.length - 1;

    dataItems.forEach((item, i) => {
      const levelHeaderId = `${sectionIdentifier}-lvl${levelIndex}-${i}`;
      let currentHeaderIds = ancestorHeaderIds;

      if (level.hasHeader) {
        result.push({
          type: 'levelHeader',
          levelPath: level.path,
          levelIndex,
          depth: levelDepths[levelIndex],
          levelHeaderId,
          cellData: level.dataPath
            ? (item as Record<string, unknown>)[level.dataPath]
            : level.label,
          data: item,
          ancestorHeaderIds
        });
        currentHeaderIds = ancestorHeaderIds
          ? `${ancestorHeaderIds} ${levelHeaderId}`
          : levelHeaderId;
      }

      if (isLastLevel) {
        result.push({
          type: 'rowGroup',
          rowGroupData: item,
          rowsPath: groupLevels.rowsPath,
          depth: dataRowDepth,
          headerIds: currentHeaderIds
        });
      } else {
        const nextLevelPath = groupLevels.levels[levelIndex + 1].path;
        const nextData = (item as Record<string, unknown>)[nextLevelPath];
        const nextDataArray = Array.isArray(nextData) ? nextData : [nextData];
        walkLevel(nextDataArray, levelIndex + 1, currentHeaderIds);
      }
    });
  }

  const level0Data = section[groupLevels.levels[0].path];
  const level0Array = Array.isArray(level0Data) ? level0Data : [level0Data];
  walkLevel(level0Array, 0, initialAncestorHeaderIds);

  return result;
}
