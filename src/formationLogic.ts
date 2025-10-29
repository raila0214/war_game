//編成ルール
import type { Unit } from "./types";
import { createUnit } from "./unitStats";

export type UnitPosition = {
    id: string;
    x: number;
    y: number;
};

export type FormationInput = {
  team: "north" | "south";
  assignment: {
    infantry?: number[]; // 各小隊の人数 [10,10,10,...]
    battalion?: number;  // 大隊
    raider?: number[];   // 遊撃部隊
    support?: number[];    // 支援部隊
    supply?: number;     // 物資部隊
    positions?: UnitPosition[];
  };
};

// プレイヤーが入力した編成を検証・補正して、盤面に配置可能なユニット配列を返す

export function validateAndCreateFormation(input: FormationInput): Unit[] {
  const team = input.team;
  const assign = input.assignment;
  const units: Unit[] = [];

  // 合計兵数を算出
  let total =
    (assign.battalion ?? 0) +
    (assign.supply ?? 0) +
    (assign.support?.reduce((a,b) => a+b,0) ?? 0) +
    (assign.infantry?.reduce((a, b) => a + b, 0) ?? 0) +
    (assign.raider?.reduce((a, b) => a + b, 0) ?? 0);

  // 合計が100未満 → 残りを大隊に足す
  if (total < 100) {
    assign.battalion = (assign.battalion ?? 0) + (100 - total);
    total = 100;
  }

  // 大隊と物資部隊が必ず存在
  if (!assign.battalion || assign.battalion <= 0) assign.battalion = 1;
  if (!assign.supply || assign.supply <= 0) assign.supply = 1;


  // 小隊（最大5）
  assign.infantry?.slice(0, 5).forEach((n, i) => {
    units.push(createUnit(`${team}_infantry_${i + 1}`, team, "infantry", -1,-1, n));
  });
  
  

  // 大隊（必ず1）
  units.push(createUnit(`${team}_battalion`, team, "battalion", -1,-1, assign.battalion));

  // 遊撃部隊（最大2）
  assign.raider?.slice(0, 2).forEach((n, i) => {
    units.push(createUnit(`${team}_raider_${i + 1}`, team, "raider", -1,-1, n));
  });

  // 支援部隊（最大1）
  assign.support?.slice(0, 1).forEach((n, i) => {
    units.push(createUnit(`${team}_support_${i + 1}`, team, "support", -1, -1, n));
  });

  // 物資部隊（盤外）
  units.push({
    ...createUnit(`${team}_supply`, team, "supply", -1, -1, assign.supply),
    range: 0, // 盤外
  });

  return units;
}

