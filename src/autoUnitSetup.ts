import type { FormationInput } from "./formationLogic";
import type { Unit } from "./types";
import { createUnit } from "./unitStats";

//自動配置（CPU側） 盤の上から6行目（北）・25行目（南）を基準に配置。
export function autoPlaceUnits(input: FormationInput): Unit[] {
  const team = input.team;
  const assign = input.assignment;
  const units: Unit[] = [];

  const yBase = team === "north" ? 5 : 24; // 6列目 / 25列目（0-index）
  const direction = team === "north" ? 1 : -1;

  // 小隊（最大5）
  assign.infantry?.slice(0, 5).forEach((n, i) => {
    units.push(createUnit(`${team}_infantry_${i + 1}`, team, "infantry", 3 + i * 2, yBase, n));
  });

  // 大隊（中央寄りに配置）
  if (assign.battalion) {
    units.push(createUnit(`${team}_battalion`, team, "battalion", 7, yBase + direction * 1, assign.battalion));
  }

  // 遊撃部隊（端側）
  assign.raider?.slice(0, 2).forEach((n, i) => {
    units.push(createUnit(`${team}_raider_${i + 1}`, team, "raider", 1 + i * 12, yBase + direction * 1, n));
  });

  // 支援部隊（後方中央）
  assign.support?.slice(0, 1).forEach((n, i) => {
    units.push(createUnit(`${team}_support_${i + 1}`, team, "support", 6, yBase + direction * 2, n));
  });

  // 物資部隊（盤外）
  units.push({
    ...createUnit(`${team}_supply`, team, "supply", -1, -1, assign.supply ?? 10),
    range: 0,
  });

  return units;
}
