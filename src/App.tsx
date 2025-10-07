import { useState } from "react";
import Board from "./Board";
import type { GameObject , Unit } from "./types";
import { applyAttackOrHeal } from "./battleLogic";
import { createBoard } from "./boardSetup";
import { processSupportAction } from "./supportLogic";
import { collectSupplies, trySpawnTank } from "./supplyLogic";

function calcUnitStats(type: string, members: number){
  switch(type){
    case "infantry": //小隊
      return {
        attack: 80 + (members -1)*1,
        defense: 40 + (members -1)*0.5,
        hp: 500 + (members -1)*10,
        speed: 4,
      };
    case "battalion": //大隊
      return {
        attack: 60 + (members -1)*0.8,
        defense: 30 + (members -1)*0.5,
        hp: 2000 + (members -1)*15,
        speed: 4,
      };
    case "raider": //遊撃部隊
      return {
        attack: 100 + (members -1)*1.2,
        defense: 20 + (members -1)*0.5,
        hp: 240 + (members -1)*5,
        speed: 5,
      };
    case "support": //支援部隊
      return {
        attack: 20,
        defense: 30 + (members -1)*0.5,
        hp: 600 + (members -1)*10,
        speed: 2,
      };
    case "tank": //戦車
      return {
        attack: 0,
        defense: 60,
        hp: 1600,
        speed: 1,
      };
    default:
      return {attack: 0, defense: 0, hp:0, speed:0};
  }
}
//コア初期値
const initialGameObjects: Record<string, GameObject> = {
  mainCoreN: { id: "mainCoreN", type: "coreMain", hp: 10000, maxHp: 10000 },
  mainCoreS: { id: "mainCoreS", type: "coreMain", hp: 10000, maxHp: 10000 },
  subCoreN1: { id: "subCoreN1", type: "coreSub", hp: 6000, maxHp: 6000 },
  subCoreN2: { id: "subCoreN2", type: "coreSub", hp: 6000, maxHp: 6000 },
  subCoreN3: { id: "subCoreN3", type: "coreSub", hp: 6000, maxHp: 6000 },
  subCoreS1: { id: "subCoreS1", type: "coreSub", hp: 6000, maxHp: 6000 },
  subCoreS2: { id: "subCoreS2", type: "coreSub", hp: 6000, maxHp: 6000 },
  subCoreS3: { id: "subCoreS3", type: "coreSub", hp: 6000, maxHp: 6000 },
};

export default function App() {
  const board = createBoard();
  const [gameObjects, setGameObjects] = useState(initialGameObjects);

  //北物資
  const [tatolSuppliesN, setTotalSuppliesN] = useState(0);
  const [spawnedTanksN, setSpawnedTanksN] = useState(0);

  //南物資
  const [tatolSuppliesS, setTotalSuppliesS] = useState(0);
  const [spawnedTanksS, setSpawnedTanksS] = useState(0);

  // === 部隊の初期化 ===
  const smallSquadStats = calcUnitStats("infantry", 20);
  const supportStats = calcUnitStats("support", 15);

  const [units, setUnits] = useState<Unit[]>([
    {
      id: "north_infantry_1",
      team: "north",
      type: "infantry",
      x: 6,
      y: 5,
      members: 20,
      range: 1,
      ...smallSquadStats,
      hp: smallSquadStats.hp,
      maxHp: smallSquadStats.hp,
    },
    {
      id: "south_support_1",
      team: "south",
      type: "support",
      x: 7,
      y: 24,
      members: 15,
      range: 1,
      ...supportStats,
      hp: supportStats.hp,
      maxHp: supportStats.hp,
    },
  ]);

  // === ターン内で支援部隊行動テスト ===
  function simulateTurn() {
    const supportUnits = units.filter((u) => u.type === "support");
    let updatedObjects = { ...gameObjects };

    for (const sup of supportUnits) {
      updatedObjects = processSupportAction(board, updatedObjects, sup, units);
    }

    setGameObjects(updatedObjects);
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>戦略シミュレーション（部隊テスト）</h2>

      <Board  gameObjects = {gameObjects} setGameObjects={setGameObjects}/>
      <div style={{ marginTop: 16 }}>
        <h3>コアHP一覧</h3>
        <ul>
          {Object.values(gameObjects).map((obj) => (
            <li key={obj.id}>
              {obj.id}：{obj.hp}/{obj.maxHp}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

