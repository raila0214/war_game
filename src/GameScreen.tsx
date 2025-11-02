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
import { processCombat } from "./combatLogic";
import TargetSettingPanel from "./TargetSettingPanel";
import NormalSidePanel from "./NormalSidePanel";




//コア初期値
const initialGameObjects: Record<string, GameObject> = {
  mainCoreN: { id: "mainCoreN", type: "coreMain", hp: 10000, maxHp: 10000, defense: 0 ,team: "north"},
  subCoreN1: { id: "subCoreN1", type: "coreSub", hp: 6000, maxHp: 6000, defense:0 ,team: "north"},
  subCoreN2: { id: "subCoreN2", type: "coreSub", hp: 6000, maxHp: 6000, defense:0,team: "north" },
  subCoreN3: { id: "subCoreN3", type: "coreSub", hp: 6000, maxHp: 6000, defense: 0 ,team: "north"},
  mainCoreS: { id: "mainCoreS", type: "coreMain", hp: 10000, maxHp: 10000, defense:0 ,team: "south"},
  subCoreS1: { id: "subCoreS1", type: "coreSub", hp: 6000, maxHp: 6000, defense: 0 ,team: "south"},
  subCoreS2: { id: "subCoreS2", type: "coreSub", hp: 6000, maxHp: 6000, defense: 0,team: "south" },
  subCoreS3: { id: "subCoreS3", type: "coreSub", hp: 6000, maxHp: 6000, defense: 0,team:"south" },
};
const unitName: Record<string,string> = {
  infantry: "小隊",
  battalion: "大隊",
  raider: "遊撃隊",
  support: "支援部隊",
  tank: "戦車",
};
const teamName: Record<"north" | "south",string> = {
  north: "北",
  south: "南",
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

  const [highlightUnitId, setHighlightUnitId] = useState<string | null >(null);

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

 //通知
 const [messages, setMessages] = useState<string[]>([]);
 function pushMessages(newMsgs: string[]){
  setMessages(prev => {
    const merged = [...prev, `${turn}ターン目：${newMsgs}`];
    return merged.slice(-6);
  });
 }

 //勝敗
 const [winner, setWinner] = useState<"north" | "south" | "draw" | null>(null);

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
    const selectedRoute = routes[routeNumber -1];
    const [startX, startY] = selectedRoute.route[0];


    const tank = createUnit(
      `${pendingTeam}_tank_${pendingIndex +1}`,pendingTeam,"tank",startX,startY,1
    );
    tank.routeNumber = routeNumber;
    tank.route=selectedRoute.route;
    tank.routeProgress = 0;
    tank.stopBeforeCore = selectedRoute.stopBeforeCore;
    tank.subCoreId = selectedRoute.subCoreId;
  

    setUnits((prev) => [...prev,tank]);
    if(pendingTeam === "north") setSpawnedTanksN((n) => n + 1);
    else setSpawnedTanksS((n) => n+1);

    setRouteSelectOpen(false);
    setPendingTeam(null);
  }
  function judgeByCoreHp(gameObjects: Record<string, GameObject>){
    const n = gameObjects.mainCoreN.hp;
    const s = gameObjects.mainCoreS.hp;
    if(n>s) return "north";
    if(s>n) return "south";
    return "draw";
  }

  function checkAllUnitsDestroyed(units: Unit[], team: "north" | "south"){
    return units.filter(u =>
       u.team === team && 
       u.hp > 0 && 
       ["infantry","battalion","raider","support"].includes(u.type)
      ).length === 0;
  }

  function nextTurn(){
    if(winner) return;
    if(isTargetSetting || routeSelectOpen) return; //設定フェーズ中は進行しない

    if(turn > 100){
      const result = judgeByCoreHp(gameObjects);
      setWinner(result);
      pushMessages([`40ターン経過 → 判定勝利：${result}`]);
      return;
    }

    //ターン開始
    //6ターンごとに目的地を設定
    if(turn % 6 == 1){
      setIsTargetSetting(true);
      return;
    }

    let updatedObjects = {...gameObjects};
    let updatedUnits = moveUnitsTowardTargets(board,[...units]);

    //戦車の移動
    updatedUnits = moveTanks(updatedUnits, updatedObjects,turn);

    {
      const combatResult = processCombat(board,updatedUnits,updatedObjects);
      updatedUnits = combatResult.newUnits;
      updatedObjects = combatResult.newObjects;
    }
    //通知（なんか出てこない）
    
    const destroyedUnits = units.filter((u) => u.hp <= 0);
    if(destroyedUnits.length >0){
      pushMessages(destroyedUnits.map(u => `${u.id}が壊滅しました`))
    }
    updatedUnits = updatedUnits.filter((u) => u.hp >0);
    Object.values(updatedObjects).forEach(obj => {
      if(obj.hp <= 0 && gameObjects[obj.id]?.hp > 0){
        pushMessages([`${obj.id}が破壊されました`])
      }
    });

    //支援部隊の行動
    const supportUnits = updatedUnits.filter((u) => u.type === "support");
    for (const sup of supportUnits){
      updatedObjects = processSupportAction(board,updatedObjects,sup,updatedUnits);
    }

    //盤外の物資部隊ユニット
 
  const supplyNorth = units.filter(u => u.type === "supply" && u.team === "north");
  const supplySouth = units.filter(u => u.type === "supply" && u.team === "south");
  

    //物資収集
    const northGain = collectSupplies(supplyNorth);
    const southGain = collectSupplies(supplySouth);
    const newNorthSupplies = totalSuppliesN + northGain;
    const newSouthSupplies = totalSuppliesS + southGain;

    //戦車
    trySpawnTankWithPopup(newNorthSupplies, spawnedTanksN, "north", handleSelectRoute,(msg) => pushMessages([msg]));
    trySpawnTankWithPopup(newSouthSupplies, spawnedTanksS, "south",handleSelectRoute, (msg) => pushMessages([msg]));

    //メッセージ
    if (updatedObjects.mainCoreN.hp <= 0) {
      setWinner("south");
      pushMessages(["南陣営の勝利！（北メインコア破壊）"]);
    }
    if (updatedObjects.mainCoreS.hp <= 0) {
      setWinner("north");
      pushMessages(["北陣営の勝利！（南メインコア破壊）"]);
    }
    if (checkAllUnitsDestroyed(updatedUnits, "north")) {
      setWinner("south");
      pushMessages([`北陣営の部隊が全滅 → 南の勝利！`]);
    }
    if (checkAllUnitsDestroyed(updatedUnits, "south")) {
      setWinner("north");
      pushMessages([`南陣営の部隊が全滅 → 北の勝利！`]);
    }
    
    // 状態反映
    setUnits(updatedUnits);
    setGameObjects(updatedObjects);
    setTotalSuppliesN(newNorthSupplies);
    setTotalSuppliesS(newSouthSupplies);
    setTurn(t => turn+1);


  }
 

  function handleCellClick(x: number, y: number) {
    if(winner) return;
    if (!isTargetSetting || !selectedUnitId) return;
    setUnits((prev) =>
      prev.map((u) =>
        u.id === selectedUnitId ? { ...u, targetX: x, targetY: y } : u
      )
    );
  }

  function completeTargetSetting() {
    setIsTargetSetting(false);
    setSelectedUnitId(null);
    setHighlightUnitId(null);
    setTurn((t) => turn + 1);
  }

  function getUnitName(u: Unit){
    const jpType = unitName[u.type] ?? u.type;
    const jpTeam = teamName[u.team] ?? u.team;

    const match = u.id.match(/_(\d+)$/);
    const number = match ? match[1] : "";

    return number
      ? `${jpTeam}_${jpType}${number}`
      : `${jpTeam}_${jpType}`;
  }

  return (
    <>
    <div style={{ display: "flex", gap: 16, padding: 16 }}>
      <div>
      <h2>戦略シミュレーション</h2>
      {winner ? (
        <h2 style={{color: "red"}}>
          {
            winner === "draw"
            ? "引き分け"
            : winner === "north"
            ? "北陣営の勝利"
            : "南陣営の勝利"
          }
        </h2>
      ):(
        !isTargetSetting && !routeSelectOpen &&(
         <button onClick={nextTurn}> ▶︎ 次ターン</button>
      )
      )}
      <Board  
        gameObjects = {gameObjects} 
        setGameObjects={setGameObjects}
        units={units}
        onCellClick={handleCellClick}
        showTargets={true}
        highlightUnitId={highlightUnitId}
      />
    </div>
    {!isTargetSetting ? (
        <NormalSidePanel
          units={units}
          gameObjects={gameObjects}
          totalSuppliesN={totalSuppliesN}
          totalSuppliesS={totalSuppliesS}
          spawnedTanksN={spawnedTanksN}
          spawnedTanksS={spawnedTanksS}
          messages={messages}
          highlightUnitId={highlightUnitId}
          setHighlightUnitId={setHighlightUnitId}
          getUnitName={getUnitName}
        />
      ):(
        <TargetSettingPanel
          units={units}
          selectedUnitId={selectedUnitId}
          onSelect={setSelectedUnitId}
          onHighlight={(id) => setHighlightUnitId(id)}
          complete={completeTargetSetting}
          getUnitName={getUnitName}
        />
      )}
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

