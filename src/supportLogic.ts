//支援部隊の設定
import type { Unit, Cell, GameObject } from "./types";
import {
  calcHealAmount,
  calcSoldierDamage,
  applyAttackOrHeal,
} from "./battleLogic";

// 支援部隊が孤立しているかを判定
function isSupportIsolated(unit: Unit, allUnits: Unit[]): boolean {
  // 周囲1マス以内に同じ陣営の味方がいれば孤立していない
  return !allUnits.some(
    (u) =>
      u.id !== unit.id &&
      u.team === unit.team &&
      Math.abs(u.x - unit.x) <= 2 &&
      Math.abs(u.y - unit.y) <= 2
  );
}

// 支援部隊の行動ロジック
export function processSupportAction(
  board: Cell[],
  gameObjects: Record<string, GameObject>,
  unit: Unit,
  allUnits: Unit[]
): Record<string, GameObject> {
  const isolated = isSupportIsolated(unit, allUnits);
  let updatedObjects = { ...gameObjects };

  if (isolated) {
    // -----------------------------
    // 🟥 攻撃モード（孤立中）
    // -----------------------------
    const targets = allUnits.filter(
      (enemy) =>
        enemy.team !== unit.team &&
        Math.abs(enemy.x - unit.x) <= unit.range &&
        Math.abs(enemy.y - unit.y) <= unit.range
    );

    for (const target of targets) {
      const damage = calcSoldierDamage(unit.attack, target.defense);
      target.hp = Math.max(0, target.hp - damage);
      console.log(
        `[支援部隊攻撃] ${unit.id} → ${target.id} に ${damage} ダメージ`
      );
    }

    // コア（GameObject）に近い場合は攻撃を加える
    for (const cell of board) {
      if (
        cell.objectId &&
        Math.abs(cell.x - unit.x) <= unit.range &&
        Math.abs(cell.y - unit.y) <= unit.range
      ) {
        updatedObjects = applyAttackOrHeal(
          board,
          updatedObjects,
          cell.x,
          cell.y,
          "soldier",
          unit.attack,
          0
        );
      }
    }
  } else {
    // -----------------------------
    // 🟩 回復モード（味方が近くにいる）
    // -----------------------------
    const allies = allUnits.filter(
      (ally) =>
        ally.team === unit.team &&
        ally.id !== unit.id &&
        Math.abs(ally.x - unit.x) <= unit.range &&
        Math.abs(ally.y - unit.y) <= unit.range
    );

    for (const ally of allies) {
      const heal = calcHealAmount(unit.members);
      ally.hp = Math.min(ally.maxHp, ally.hp + heal);
      console.log(`[支援回復] ${unit.id} → ${ally.id} に ${heal} 回復`);
    }
  }

  return updatedObjects;
}
