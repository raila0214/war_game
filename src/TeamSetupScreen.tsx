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
