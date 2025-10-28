import type { Unit, GameObject } from "./types";
import { calcSupplyGatherRate, TankSummonThresholds } from "./types";
import { northTankRoutes, southTankRoutes } from "./tankRoutes";
import { createUnit } from "./unitStats";

/**
 * 物資部隊による物資収集処理
 * @param supplyUnits 物資部隊の配列
 * @returns 獲得した物資量
 */
export function collectSupplies(supplyUnits: Unit[]): number {
  let total = 0;
  for (const s of supplyUnits) {
    const gain = calcSupplyGatherRate(s.members);
    s.collectedSupplies = (s.collectedSupplies || 0) + gain;
    total += gain;
  }
  return total;
}

/**
 * 戦車召喚処理
 * @param totalSupplies 現在の総物資
 * @param spawnedTanks 現在の戦車数
 * @param team 陣営タグ "north" or "south"
 * @param onSelectRoute ルート選択UI起動
 */
export function trySpawnTankWithPopup(
  totalSupplies: number,
  spawnedTanks: number,
  team: "north" | "south",
  onSelectRoute: (team: "north" | "south", nextIndex: number) => void
): boolean {
  if (spawnedTanks >= TankSummonThresholds.length) return false;

  const threshold = TankSummonThresholds[spawnedTanks];
  if (totalSupplies < threshold) return false;

  onSelectRoute(team, spawnedTanks);
  console.log(`🛻 ${team === "north" ? "北" : "南"}陣営：戦車召喚可能！ルート選択待機中`);
  return true;
}
