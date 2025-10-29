import type { Team, Unit ,BaseUnit,TankUnit,UnitType } from "./types";

/**
 * 部隊タイプに応じて、人数をもとに各パラメータを算出
 */
export function calcUnitStats(type: Unit["type"], members: number) {
  switch (type) {
    case "infantry": // 小隊
      return {
        attack: 80 + (members - 1) * 1,
        defense: 40 + (members - 1) * 0.5,
        hp: 300 + (members - 1) * 10,
        speed: 4,
      };
    case "battalion": // 大隊
      return {
        attack: 60 + (members - 1) * 0.8,
        defense: 30 + (members - 1) * 0.5,
        hp: 1000 + (members - 1) * 15,
        speed: 3,
      };
    case "raider": // 遊撃部隊
      return {
        attack: 100 + (members - 1) * 1.2,
        defense: 20 + (members - 1) * 0.5,
        hp: 140 + (members - 1) * 5,
        speed: 5,
      };
    case "support": // 支援部隊
      return {
        attack: 20,
        defense: 30 + (members - 1) * 0.5,
        hp: 400 + (members - 1) * 10,
        speed: 2,
      };
    case "supply": // 物資部隊
      return {
        attack: 0,
        defense: 10 + (members - 1) * 0.3,
        hp: 400 + (members - 1) * 8,
        speed: 2,
      };
    case "tank": // 戦車
      return {
        attack: 0,
        defense: 60,
        hp: 500,
        speed: 1,
      };
    default:
      return { attack: 0, defense: 0, hp: 0, speed: 0 };
  }
}

/**
 * 部隊の初期化を簡単に行うヘルパー関数
 */
export function createUnit(
  id: string,
  team: Team,
  type: Exclude<UnitType, "tank">,
  x: number,
  y: number,
  members: number
): BaseUnit;

export function createUnit(
  id: string,
  team: Team,
  type: "tank",
  x: number,
  y: number,
  members: number
): TankUnit;

export function createUnit(
  id: string,
  team: Team,
  type: UnitType,
  x: number,
  y: number,
  members: number
): Unit {
  const base = calcUnitStats(type, members);
  if(type === "tank"){
    const tankUnit: TankUnit = {
      id,
      team,
      type: "tank",
      x,
      y,
      members,
      range: 1,
      attack: base.attack,
      defense: base.defense,
      hp: base.hp,
      maxHp: base.hp,
      speed: base.speed,
      routeNumber: 1,
      route: [[x,y]],
      routeProgress: 0,
    };
    return tankUnit;
  }
  const baseUnit: BaseUnit = {
    id,
      team,
      type,
      x,
      y,
      members,
      range: 1,
      attack: base.attack,
      defense: base.defense,
      hp: base.hp,
      maxHp: base.hp,
      speed: base.speed,
  }
  return baseUnit;
}
