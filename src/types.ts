//型の一元管理用
export type Terrain = "plain" | "wall" | "block1" | "block2" | "tankloard";
 
//盤面セル
export type Cell = {
    x: number;
    y: number;
    terrain: Terrain;
    objectId?:string; //同じ建築物を識別するID
  };
//HPを持つ建築物
export type GameObject = {
    id: string;
    type: "coreMain" | "coreSub"; //種類
    hp: number; //現在HP
    maxHp: number; //最大HP
  };

//陣営（チームたぐ）
export type Team = "north" | "south";

//初期設定画面仮
export type UnitSetupData = {
  type:"infantry"   // 小隊
  | "battalion"  // 大隊
  | "raider"     // 遊撃部隊
  | "support"    // 支援部隊
  | "supply";    // 物資部隊
  members: number;
  team: "north"|"south";
  x?: number;
  y?: number;
};

//人数割り振り
export type PlayerUnitConfig = {
  totalPoints: number;
  units: {
    type: "infantry"   // 小隊
    | "battalion"  // 大隊
    | "raider"     // 遊撃部隊
    | "support"    // 支援部隊
    | "supply";    // 物資部隊
    members: number;
  }[];
};

//部隊タイプ
export type UnitType = 
| "infantry"   // 小隊
| "battalion"  // 大隊
| "raider"     // 遊撃部隊
| "support"    // 支援部隊
| "supply"     // 物資部隊
| "tank";      // 戦車

//部隊
export type TankUnit = {
  id: string;
  type: "tank"; 
  team: Team; //陣営 
  x: number; //位置X
  y: number; //位置Y
  attack: number; //攻撃力
  defense: number; //防御力
  hp: number; //現在HP
  maxHp: number //最大HP
  range: number //攻撃範囲
  speed: number // 移動速度
  members: number //部隊人数
  collectedSupplies?: number;
  routeNumber: number;     
  route: [number, number][]; 
  routeProgress: number;
  targetX?: number;
  targetY?: number;
};
export type BaseUnit = {
  id: string;
  type: Exclude<UnitType, "tank">; //部隊タイプ
  team: Team; //陣営 
  x: number; //位置X
  y: number; //位置Y
  attack: number; //攻撃力
  defense: number; //防御力
  hp: number; //現在HP
  maxHp: number //最大HP
  range: number //攻撃範囲
  speed: number // 移動速度
  members: number //部隊人数
  mode?: "heal" | "attack";
  collectedSupplies?: number;
  targetX?: number;
  targetY?: number;
};

export type Unit = BaseUnit | TankUnit;

//両チームの設定
export type GameSetup = {
  north: PlayerUnitConfig;
  south: PlayerUnitConfig;
};

// 物資部隊が1ターンに収集できる物資量を計算
export function calcSupplyGatherRate(members: number): number {
  if (members <= 6) return Math.floor(20 + (members - 1));
  if (members <= 25) return Math.floor(25 + (members - 5) * 0.5);
  return Math.floor(35 + (members - 25) * 0.3);
}

// 戦車召喚に必要な物資数
export const TankSummonThresholds = [500, 800, 1000, 1200];

//コア
export const CORE_DEFAULTS = {
  defense: 10,
  mainHp: 10000,
  subHp: 6000,
};