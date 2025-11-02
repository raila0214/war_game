import React, { useMemo, useState } from "react";
import type { FormationInput } from "./formationLogic";
import { validateAndCreateFormation } from "./formationLogic";
import { defaultNorthFormation , defaultSouthFormation } from "./defaultFormation";

type TeamSetupScreenProps = {
    onComplete: (north: FormationInput, south: FormationInput) => void;
};

type UnitType = "infantry" | "raider" | "support";

const unitLabel: Record<UnitType, string> = {
    infantry: "小隊",
    raider: "遊撃部隊",
    support: "支援部隊",
};

export default function TeamSetupScreen({ onComplete }: TeamSetupScreenProps) {
  const [northFormation, setNorthFormation] = useState<FormationInput>(defaultNorthFormation);
  const [southFormation, setSouthFormation] = useState<FormationInput>(defaultSouthFormation);

  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);

  //決定ボタン
  const handleConfirm = (teamFormation: FormationInput) => {
    const assign = teamFormation.assignment;
    //合計算出
    let total = 
      (assign.battalion ?? 0)+
      (assign.supply ?? 0)+
      (assign.support?.reduce((a,b) => a+b,0) ?? 0)+
      (assign.infantry?.reduce((a,b) => a+b,0) ?? 0)+
      (assign.raider?.reduce((a,b) => a+b,0) ?? 0);

    //合計が100未満
    if(total < 100){
        assign.battalion = (assign.battalion ?? 0) + (100 - total);
    }
  };

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>⚔ 部隊設定画面 ⚔</h1>

      <div style={{ marginBottom: 15}}>
        <button
          onClick={() => setShowRuleModal(true)}
          style={{marginRight: 10, padding: "6px 12px"}}
        >
          ルール説明
        </button>
        <button 
          onClick={() => setShowUnitModal(true)}
          style={{padding: "6px 12px"}}
        >
          部隊特性
        </button>

      </div>


      <p>各陣営の部隊構成を設定してください（合計100人）</p>

      <div style={{ display: "flex", justifyContent: "center", gap: 60, marginTop: 30 }}>
        <TeamEditor label="北陣営" formation={northFormation} setFormation={setNorthFormation} />
        <TeamEditor label="南陣営" formation={southFormation} setFormation={setSouthFormation} />
      </div>

      <button
        onClick={() => {
            handleConfirm(northFormation);
            handleConfirm(southFormation);
            onComplete(northFormation, southFormation);
        }}
        style={{ marginTop: 40, padding: "10px 20px", fontSize: 18 }}
        disabled= {
            calcTotal(northFormation) > 100 ||
            calcTotal(southFormation) > 100 ||
            hasError(northFormation) ||
            hasError(southFormation)
        }
      >
        ▶ 部隊配置
      </button>

      {showRuleModal &&(
        <Modal onClose={() => setShowRuleModal(false)}>
          <h2>ルール説明</h2>
          <p>
            <b>⬛︎ ゲーム概要</b><br />
            <b>最大○○ターン制</b>のターン制ストラテジーゲームです。<br />
            プレイヤーは<b> 北陣営 / 南陣営 </b>のいずれかを操り、敵陣営のコアを破壊、または殲滅することを目指します。<br />
            <b>６ターンに１回</b> 設定フェーズがあり、各部隊の目標地を指定できます<br />
            <br />
            <b>⬛︎ 勝利条件</b><br />
            以下の <b>いずれか</b> を満たした陣営が勝利します。<br />
            <b>1. 相手のメインコアを破壊する</b><br />
            <b>2. 相手の全ての部隊を殲滅する</b><br />
            <b>3. 全ターン終了時、メインコアの残りHPが高い方が勝利</b>
            <h5>※双方のメインコアの値が同値 → 引き分け</h5>
            <b>⬛︎ コアについて</b><br />
            <b>●メインコア</b><br />
            ・破壊されると敗北<br />
            ・直接攻撃するには、先にサブコアを破壊する必要がある<br />
            <b>●サブコア</b><br />
            ・メインコアを保護する装置<br />
            ・３つあるサブコアを１つ以上破壊しない限り、メインコアにダメージを与えられない<br />
            <br />
            <b>⬛︎ 戦力について</b><br />
            <b>●部隊</b><br />
            ・最大<b>６部隊</b>まで編成可能<br />
            ・プレイヤーは<b>１００ポイント</b>を割り振って部隊を編成する<br />
            ・<b>余ったポイントは全て大隊に自動配分される</b><br />
            <b>●戦車</b><br />
            ・コア破壊に特化<br />
            ・コアに対して固定値のダメージを与える
          </p>
        </Modal>
      )}
      {showUnitModal &&(
        <Modal onClose={() => setShowUnitModal(false)}>
          <h2>部隊特性</h2>
          <p>
            <b>○ 小隊</b>・・・最大５部隊<br />
            【特徴】基本的な部隊 <br />
            【攻撃範囲】縦横斜め１マス（計８マス）<br />
            【人数上限】２５人<br />
            <br />
            <b>○ 大隊</b>・・・１部隊固定<br />
            【特徴】高耐久の主力<br />
            【攻撃範囲】縦横２マス、斜め近距離１マス （計２０マス）<br />
            【人数上限】１００人<br />
            <br />
            <b>○ 遊撃部隊</b>・・・最大２部隊<br />
            【特徴】低耐久・高火力<br />
            【攻撃範囲】縦横１マス （計４マス）<br />
            【人数上限】１５人<br />
            <br />
            <b>○ 支援部隊</b>・・・最大１部隊<br />
            【特徴】回復　※攻撃には不参加<br />
            【回復範囲】縦横斜め１マス （計８マス）<br />
            【人数上限】２０人<br />
            <br />
            <b>○ 物資部隊</b><br />
            【特徴】部隊人数に応じて物資収集を行う。　※盤外活動<br />
            【戦車召喚】物資が一定値に到達したら戦車を召喚できる。<br />
            【人数上限】５０人<br />
            <br />
            <b>○ 戦車</b><br />
            【特徴】コアへの攻撃　※コア以外への攻撃は行わない <br />
            【攻撃範囲】縦横斜め１マス （計８マス）<br />
            【戦車上限】４台<br />
          </p>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void}){
  return(
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, width: "100%", height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          color: "black",
          background: "white",
          borderRadius: 12,
          padding: 20,
          width: "550px",
          maxHeight:"80vh",
          textAlign: "left",
          overflowY: "auto",
          position:"relative",
        }}
      >
        {children}

      </div>

    </div>
  );
}

function TeamEditor({ 
    label, 
    formation, 
    setFormation 
}:{
    label: string;
    formation: FormationInput;
    setFormation: (f: FormationInput) => void;
}) {
  const assign = formation.assignment;
  //各種人数計算
  const total = useMemo(() => calcTotal(formation),[formation]);
  const remaining = 100-total; 
  const errors = useMemo(() => validateFormation(formation),[formation]);

  //部隊追加
  const addUnit = (type: UnitType) => {
    const newAssign = { ...assign };
    if(type === "infantry") {
        newAssign.infantry = [...(assign.infantry ?? []), 10];
    } else if ( type === "raider"){
        newAssign.raider = [...(assign.raider ?? []), 10];
    } else if (type === "support"){
        newAssign.support = [...(assign.support ?? []),10];
    }
    setFormation({...formation,assignment: newAssign});
  }

  //部隊削除
  const removeUnit = (type: UnitType, index: number) => {
    const newAssign = {...assign};
    const list = [...(assign[type] ?? [])];
    list.splice(index, 1);
    newAssign[type] =list;
    setFormation({...formation, assignment: newAssign});
  };

  const canAdd = 
    getActiveUnitCount(formation) < 6 && remaining >= 0 &&errors.length === 0;
    

  return (
    <div style={{ 
        background: "#808080", 
        padding: 20, 
        borderRadius: 12,
        width: 320,
        textAlign: "left", 
      }}
    >
      <h2>{label}</h2>
      <div style={{marginBottom: 10}}>
        構成可能実動部隊数：６ (現在 {getActiveUnitCount(formation)} 部隊)
      </div>
      <div 
        style={{
            marginBottom: 10, 
            color: remaining < 0 ? "red" : remaining === 0 ? "green" : "black",
        }}
      >
        残りポイント：<strong>{remaining}</strong>
      </div>
      {/*大隊 */}
      <div>
        大隊：
        <input
          style={{
            padding: "2px 9px",
            fontSize: "14px",
            height: "20px",
            borderRadius: "0px",
          }}
          type="number"
          min={1}
          value={assign.battalion ?? 0}
          onChange={(e) => {
            const val = Number(e.target.value);
            setFormation({
                ...formation,
                assignment: { ...assign, battalion: val },
            });
          }}
        />
      </div>
      {/*動的部隊リスト */}
      {["infantry", "raider", "support"].map((type) => 
        (assign[type as UnitType] ?? []).map((val, i) => (
            <div key={`${type}-${i}`}>
                {unitLabel[type as UnitType]}：
                <input
                  type= "number"
                  min={1}
                  value= {val}
                  onChange={(e) =>{
                    const newAssign = {...assign};
                    const list = [...(assign[type as UnitType] ?? [])];
                    list[i] = Number(e.target.value);
                    newAssign[type as UnitType]= list;
                    setFormation({...formation, assignment: newAssign});
                  }}
                  style={{
                    padding: "2px 9px",
                    fontSize: "14px",
                    height: "20px",
                    borderRadius: "0px",
                  }}
                />
                <button 
                  style={{
                    padding: "3px 9px",
                    fontSize: "14px",
                    height: "28px",
                    borderRadius: "0px",
                  }}
                  onClick={() => removeUnit(type as UnitType, i)}
                >
                    -削除
                </button>
            </div>
        ))
        
      )}
      {/**部隊追加ボタン */}
      <div style={{ marginTop: 10}}>
        <select id={`add-${label}`} style={{marginRight: 8, height: "28px", padding: "2px 9px", fontSize: " 14px",}}>
            <option value="infantry">小隊</option>
            <option value="raider">遊撃部隊</option>
            <option value="support">支援部隊</option>
        </select>
        <button
          onClick={() => {
            const selectEL = document.getElementById(
                `add-${label}`
            ) as HTMLSelectElement;
            addUnit(selectEL.value as UnitType);
          }}
          disabled ={!canAdd}
          style={{
            padding: "3px 9px",
            fontSize: "14px",
            height: "28px",
            borderRadius: "0px",
          }}
        >
            +部隊を追加
        </button>
      </div>

      {/**物資部隊 */}
      <div style={{marginTop: 10}}>
        物資部隊：
        <input
          type="number"
          min={1}
          value={assign.supply ?? 0}
          onChange={(e) => {
            const val = Number(e.target.value);
            setFormation({
                ...formation,
                assignment: {...assign, supply: val},
            });
          }}
        />
      </div>

      {/**エラー表示 */}
      {errors.length > 0 && (
        <div style={{color: "red", marginTop: 10}}>
            {errors.map((e,i) =>(
                <div key={i}>{e}</div>
            ))}
        </div>
      )}

      {/**決定ボタン */}
      <button
        style={{ marginTop: 20, padding: "6px 12px"}}
        disabled = {remaining < 0 || errors.length > 0}
        onClick={() => alert(`${label}の編成を確定しました`)}
      >
        決定
      </button>
    </div>
  );
}

function calcTotal(f: FormationInput){
    const a = f.assignment;
    return (
        (a.battalion ?? 0) + 
        (a.supply ?? 0) +
        (a.infantry?.reduce((s,v) => s+v,0) ?? 0) +
        (a.raider?.reduce((s,v) => s + v , 0) ?? 0) +
        (a.support?.reduce((s,v) => s + v,0) ?? 0)
    );
}

function getActiveUnitCount(f: FormationInput){
    const a = f.assignment;
    return (
        (a.infantry?.length ?? 0)+
        (a.raider?.length ?? 0)+
        (a.support?.length ?? 0)+
        1 //大隊は固定
    );
}

function validateFormation(f: FormationInput): string[]{
    const a = f.assignment;
    const errors: string[] = [];
    if((a.infantry?.length ?? 0) > 5) errors.push("小隊は最大5部隊までです。");
    if((a.raider?.length ?? 0) > 2) errors.push("遊撃部隊は最大2部隊までです。");
    if((a.support?.length ?? 0) > 1) errors.push("支援部隊は1部隊までです。");
    return errors;
}

function hasError(f: FormationInput){
    return validateFormation(f).length > 0;
}
