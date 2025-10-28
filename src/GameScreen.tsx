//元App

import { useState, useEffect } from "react";
import Board from "./Board";
import type { GameObject , Unit , GameSetup } from "./types";
import { applyAttackOrHeal } from "./battleLogic";
import { createBoard } from "./boardSetup";
import { processSupportAction } from "./supportLogic";
import { collectSupplies, trySpawnTankWithPopup } from "./supplyLogic";
import { createUnit } from "./unitStats";
import TeamSetupScreen from "./TeamSetupScreen";
import { generateUnits } from "./unitSetup";
import type { FormationInput , validateAndCreateFormation } from "./formationLogic";
import { defaultNorthFormation, defaultSouthFormation } from "./defaultFormation";
import { moveUnitsTowardTargets, moveTanks } from "./movementLogic";
import { northTankRoutes, southTankRoutes } from "./tankRoutes";




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



export default function GameScreen({
    northFormation,
    southFormation,
}: {
    northFormation: FormationInput;
    southFormation: FormationInput;
}) {
  //盤面
  const board = createBoard();
  //コア
  const [gameObjects, setGameObjects] = useState(initialGameObjects);

  //ゲーム状況
  //const [setupComplete, setSetupComplete] = useState(false);

  //盤上に存在する部隊ユニット
  const [units, setUnits] = useState<Unit[]>([
    ...generateUnits(defaultNorthFormation),
    ...generateUnits(defaultSouthFormation)
  ]);

  const [turn, setTurn] = useState(1);
  const [isTargetSetting, setIsTargetSetting]=useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null > (null);

  //北物資
  const [totalSuppliesN, setTotalSuppliesN] = useState(0);
  const [spawnedTanksN, setSpawnedTanksN] = useState(0);
  
  //南物資
  const [totalSuppliesS, setTotalSuppliesS] = useState(0);
  const [spawnedTanksS, setSpawnedTanksS] = useState(0);

 //ルート選択ポップアップ
 const [routeSelectOpen, setRouteSelectOpen] = useState(false);
 const [pendingTeam, setPendingTeam] = useState<"north" | "south" | null > (null);
 const [pendingIndex, setPendingIndex] = useState(0);

  useEffect(() => {
    const generated = [
      ...generateUnits(northFormation),
      ...generateUnits(southFormation),
    ];
    [northFormation, southFormation].forEach((formation) => {
      formation.assignment.positions?.forEach((p)=>{
        const u = generated.find((g) => g.id === p.id);
        if(u){
          u.x = p.x;
          u.y = p.y;
        }
      });
    });

    setUnits(generated);
  }, [northFormation, southFormation]);

  //戦車ルート設定
  function handleSelectRoute(team: "north" | "south", nextIndex: number){
    setPendingTeam(team);
    setPendingIndex(nextIndex);
    setRouteSelectOpen(true);
  }

  //戦車ルート確定
  function confirmRouteSelection(routeNumber: number){
    if(!pendingTeam)return;
    const routes = pendingTeam === "north" ? northTankRoutes : southTankRoutes;
    const route = routes[routeNumber -1];
    const [startX, startY] = route[0];


    const tank = createUnit(
      `${pendingTeam}_tank_${pendingIndex +1}`,pendingTeam,"tank",startX,startY,1
    );
    tank.routeNumber = routeNumber;
    tank.route=route;
    tank.routeProgress = 0;
  

    setUnits((prev) => [...prev,tank]);
    if(pendingTeam === "north") setSpawnedTanksN((n) => n + 1);
    else setSpawnedTanksS((n) => n+1);

    setRouteSelectOpen(false);
    setPendingTeam(null);
  }

  function nextTurn(){
    if(isTargetSetting || routeSelectOpen) return; //設定フェーズ中は進行しない

    //ターン開始
    //6ターンごとに目的地を設定
    if(turn % 6 == 1){
      setIsTargetSetting(true);
      return;
    }

    let updatedObjects = {...gameObjects};
    let updatedUnits = moveUnitsTowardTargets(board,[...units]);

    //戦車の移動
    updatedUnits = moveTanks(updatedUnits, turn);

    //支援部隊の行動
    const supportUnits = updatedUnits.filter((u) => u.type === "support");
    for (const sup of supportUnits){
      updatedObjects = processSupportAction(board,updatedObjects,sup,updatedUnits);
    }

    //盤外の物資部隊ユニット
  const offboardNorthSupplyUnits: Unit[] = [
    {...createUnit("north_supply","north","supply",-1,-1,20), range: 0},
  ];
  const offboardSouthSupplyUnits: Unit[] = [
    {...createUnit("south_supply","north","supply",-1,-1,20), range: 0},
  ];

    //物資収集
    const northGain = collectSupplies(offboardNorthSupplyUnits);
    const southGain = collectSupplies(offboardSouthSupplyUnits);
    const newNorthSupplies = totalSuppliesN + northGain;
    const newSouthSupplies = totalSuppliesS + southGain;

    //戦車
    trySpawnTankWithPopup(newNorthSupplies, spawnedTanksN, "north", handleSelectRoute);
    trySpawnTankWithPopup(newSouthSupplies, spawnedTanksS, "south",handleSelectRoute);
    
    // 状態反映
    setUnits(updatedUnits);
    setGameObjects(updatedObjects);
    setTotalSuppliesN(newNorthSupplies);
    setTotalSuppliesS(newSouthSupplies);
    setTurn((t) => turn+1);


  }
  /* --- 編成画面で「完了」ボタンが押された時の処理 ---
  function handleSetupComplete(
    northFormation: FormationInput, 
    southFormation: FormationInput
  ) {
    const generatedUnits = [
      ...generateUnits(northFormation),
      ...generateUnits(southFormation, true),
    ];
    setUnits(generatedUnits);
    setSetupComplete(true);
  }

  if(!setupComplete){
    return <TeamSetupScreen onComplete={handleSetupComplete}/>;
  }
  */

  function handleCellClick(x: number, y: number) {
    if (!isTargetSetting || !selectedUnitId) return;
    setUnits((prev) =>
      prev.map((u) =>
        u.id === selectedUnitId ? { ...u, targetX: x, targetY: y } : u
      )
    );
  }

  function completeTargetSetting() {
    setIsTargetSetting(false);
    setTurn((t) => turn + 1);
  }

  return (
    <>
    <div style={{ display: "flex", gap: 16, padding: 16 }}>
      <div>
      <h2>戦略シミュレーション</h2>
      {!isTargetSetting && !routeSelectOpen &&(
         <button onClick={nextTurn}> ▶︎ 次ターン</button>
      )}
      {isTargetSetting && (
        <div
          style={{
            background: "#ffffe0",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
            margin: "8px 0",
          }}
        >
          <h3>設定フェーズ</h3>
          <p>部隊をクリック</p>
          <button onClick={completeTargetSetting}>設定完了</button>
        </div>
      )}
      <Board  
        gameObjects = {gameObjects} 
        setGameObjects={setGameObjects}
        units={units}
        onCellClick={handleCellClick}
        showTargets={true}
      />
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

        {isTargetSetting && (
          <>
            <h3 style={{marginTop: 12}}>部隊一覧</h3>
            {units
            .filter((u) => u.type !== "supply")
            .map((u) => (
              <div
                key={u.id}
                onClick={() => setSelectedUnitId(u.id)}
                style={{
                  margin: "4px 0",
                  padding: "4px 8px",
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  background:
                    selectedUnitId === u.id
                    ? "#add8e6"
                    : u.team === "north"
                    ? "#e0f7ff"
                    : "#ffe0e0",
                  cursor: "pointer",
                }}
              >
                {u.id} ー＞ {u.targetX != null ? `(${u.targetX},${u.targetY})`: "未設定"}
              </div>
            ))}
          </>
        )}
      </div>
    </div>

    {routeSelectOpen && pendingTeam && (
      <div
        style= {{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
        }}
      >
        <div
          style={{
            background: "#708090",
            padding: 20,
            borderRadius: 12,
            textAlign: "center",
            width: 320,
          }}
        >
          <h3>{pendingTeam === "north" ? "北陣営" : "南陣営"} 戦車ルート選択</h3>
          <p>召喚する戦車の進行ルートを選択してください</p>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20}}>
            <button onClick={() => confirmRouteSelection(1)} >左ルート</button>
            <button onClick={() => confirmRouteSelection(2)} >中央ルート</button>
            <button onClick={() => confirmRouteSelection(3)} >右ルート</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

