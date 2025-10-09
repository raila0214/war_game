import { useState } from "react";
import Board from "./Board";
import type { GameObject , Unit , GameSetup } from "./types";
import { applyAttackOrHeal } from "./battleLogic";
import { createBoard } from "./boardSetup";
import { processSupportAction } from "./supportLogic";
import { collectSupplies, trySpawnTank } from "./supplyLogic";
import { createUnit } from "./unitStats";
import TeamSetupScreen from "./TeamSetupScreen";
//import { generateUnitFromConfig } from "./unitSetup";


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
  //盤面
  const board = createBoard();
  //コア
  const [gameObjects, setGameObjects] = useState(initialGameObjects);

  //盤上に存在する部隊ユニット
  const [units, setUnits] = useState<Unit[]>([
    createUnit("north_support_1","north","support",6,5,15),
  ]);

  //盤外の物資部隊ユニット
  const offboardNorthSupplyUnits: Unit[] = [
    {...createUnit("north_supply","north","supply",-1,-1,20), range: 0},
  ];
  const offboardSouthSupplyUnits: Unit[] = [
    {...createUnit("south_supply","north","supply",-1,-1,20), range: 0},
  ];

  //北物資
  const [totalSuppliesN, setTotalSuppliesN] = useState(0);
  const [spawnedTanksN, setSpawnedTanksN] = useState(0);
  
  //南物資
  const [totalSuppliesS, setTotalSuppliesS] = useState(0);
  const [spawnedTanksS, setSpawnedTanksS] = useState(0);

  function nextTurn(){
    let updatedObjects = {...gameObjects};
    let updatedUnits = [...units];

    //支援部隊の行動
    const supportUnits = updatedUnits.filter((u) => u.type === "support");
    for (const sup of supportUnits){
      updatedObjects = processSupportAction(board,updatedObjects,sup,updatedUnits);
    }
    //物資収集
    const northGain = collectSupplies(offboardNorthSupplyUnits);
    const southGain = collectSupplies(offboardSouthSupplyUnits);
    const newNorthSupplies = totalSuppliesN + northGain;
    const newSouthSupplies = totalSuppliesS + southGain;

    //戦車
    const newNorthTank = trySpawnTank(newNorthSupplies, spawnedTanksN, "north");
    const newSouthTank = trySpawnTank(newSouthSupplies, spawnedTanksS, "south");
    if (newNorthTank) {
      updatedUnits.push(newNorthTank);
      setSpawnedTanksN(spawnedTanksN + 1);
    }
    if (newSouthTank) {
      updatedUnits.push(newSouthTank);
      setSpawnedTanksS(spawnedTanksS + 1);
    }

    // 状態反映
    setUnits(updatedUnits);
    setGameObjects(updatedObjects);
    setTotalSuppliesN(newNorthSupplies);
    setTotalSuppliesS(newSouthSupplies);


  }

  return (
    <>
    <div style={{ display: "flex", gap: 16, padding: 16 }}>
      <div>
      <h2>戦略シミュレーション</h2>
      <button onClick={nextTurn}> ▶︎ 次ターン</button>
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

    <div
        style={{
          minWidth: 240,
          padding: "10px 14px",
          background: "#b0c4de",
          borderRadius: 12,
          border: "1px solid #ccc",
          height: "fit-content",
        }}
      >
        <h3>📦 物資収集状況</h3>

        <div style={{ marginBottom: 10 }}>
          <strong>北陣営</strong>
          <div>総物資：{totalSuppliesN}</div>
          <div>召喚済み戦車：{spawnedTanksN} / 4</div>
        </div>

        <div>
          <strong>南陣営</strong>
          <div>総物資：{totalSuppliesS}</div>
          <div>召喚済み戦車：{spawnedTanksS} / 4</div>
        </div>
      </div>
    </div>
    </>
  );
}

