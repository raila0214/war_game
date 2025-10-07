import type { Unit, GameObject } from "./types";
import { calcSupplyGatherRate, TankSummonThresholds } from "./types";

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
 * @returns 新しく生成された戦車ユニット（なければ null）
 */
export function trySpawnTank(
  totalSupplies: number,
  spawnedTanks: number,
  team: "north" | "south"
): Unit | null {
  if (spawnedTanks >= TankSummonThresholds.length) return null;

  const threshold = TankSummonThresholds[spawnedTanks];
  if (totalSupplies < threshold) return null;

  const yPosition = team === "north" ? 10 + spawnedTanks * 2 : 18 - spawnedTanks * 2;

  const tank: Unit = {
    id: `${team}_tank_${spawnedTanks + 1}`,
    team,
    type: "tank",
    x: 8,
    y: yPosition,
    range: 1,
    members: 1,
    attack: 0,
    defense: 60,
    hp: 1600,
    maxHp: 1600,
    speed: 1,
    collectedSupplies: 0,
  };

  console.log(`🚜 ${team === "north" ? "北陣営" : "南陣営"}：戦車召喚！ ${tank.id}`);
  return tank;
}
