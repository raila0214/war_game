import React, { useState } from "react";
import type { FormationInput } from "./formationLogic";

type PlacedUnit = {
  id: string;
  name: string;
  x: number;
  y: number;
};

type Props = {
  northFormation: FormationInput;
  southFormation: FormationInput;
  onComplete: (north: FormationInput, south: FormationInput) => void;
};

export default function FormationSetupScreen({
  northFormation,
  southFormation,
  onComplete,
}: Props) {
  const [selectedTeam, setSelectedTeam] = useState<"north" | "south" | null>(
    null
  );
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [placedUnits, setPlacedUnits] = useState<PlacedUnit[]>([]);

  // 配置可能列
  const northRow = 5;
  const southRow = 24;

  // 盤面サイズ
  const cols = 16;
  const rows = 30;

  // 配置可能マスクリック
  const handleCellClick = (x: number, y: number) => {
    if (!selectedUnit || !selectedTeam) return;

    // 同じチームの同じユニットの配置更新
    setPlacedUnits((prev) => {
      const filtered = prev.filter((p) => p.id !== selectedUnit);
      const newPlaced = {
        id: selectedUnit,
        name: `${selectedTeam}_${selectedUnit}`,
        x,
        y,
      };
      return [...filtered, newPlaced];
    });
  };

  // 現在の選択部隊リストを取得
  const currentFormation =
    selectedTeam === "north" ? northFormation : southFormation;

  // 配置完了処理
  const handleComplete = () => {
    const applyPlacement = (
      formation: FormationInput,
      team: "north" | "south"
    ): FormationInput => {
      const updated = { ...formation };
      const assigned = placedUnits.filter((p) =>
        p.id.startsWith(team)
      );

      // 各ユニットに座標を登録
      updated.assignment = {
        ...formation.assignment,
        positions: assigned.map((u) => ({ id: u.id, x: u.x, y: u.y })),
      };

      return updated;
    };

    onComplete(applyPlacement(northFormation, "north"), applyPlacement(southFormation, "south"));
  };

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>🗺 部隊配置画面</h1>
      <p>メモ：北陣営は6列目、南陣営は25列目に配置できます。</p>

      {/* チーム選択 ⚠️随時変更 */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setSelectedTeam("north")}
          style={{
            marginRight: 10,
            background: selectedTeam === "north" ? "#add8e6" : "#eee",
            padding: "6px 12px",
          }}
        >
          北陣営を編成
        </button>
        <button
          onClick={() => setSelectedTeam("south")}
          style={{
            background: selectedTeam === "south" ? "#f08080" : "#eee",
            padding: "6px 12px",
          }}
        >
          南陣営を編成
        </button>
      </div>

      {/* 盤面 */}
      <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
        <svg
          width={cols * 24}
          height={rows * 18}
          style={{ border: "1px solid #444", background: "#fafafa" }}
        >
          {[...Array(rows)].map((_, y) =>
            [...Array(cols)].map((_, x) => {
              const unitHere = placedUnits.find(
                (u) => u.x === x && u.y === y
              );
              const isNorthRow = y === northRow;
              const isSouthRow = y === southRow;

              const color = unitHere
                ? unitHere.id.startsWith("north")
                  ? "#1e90ff"
                  : "#ff6347"
                : isNorthRow || isSouthRow
                ? "rgba(255,255,0,0.4)"
                : "#e8e8e8";

              return (
                <rect
                  key={`${x}-${y}`}
                  x={x * 24}
                  y={y * 18}
                  width={24}
                  height={18}
                  fill={color}
                  stroke="#ccc"
                  onClick={() => {
                    if (
                      (selectedTeam === "north" && isNorthRow) ||
                      (selectedTeam === "south" && isSouthRow)
                    ) {
                      handleCellClick(x, y);
                    }
                  }}
                  style={{
                    cursor:
                      (isNorthRow && selectedTeam === "north") ||
                      (isSouthRow && selectedTeam === "south")
                        ? "pointer"
                        : "default",
                  }}
                />
              );
            })
          )}
        </svg>

        {/* 部隊リスト */}
        {selectedTeam && (
          <div
            style={{
              background: "#f0f8ff",
              padding: 16,
              borderRadius: 12,
              width: 240,
              textAlign: "left",
              border: "1px solid #ccc",
            }}
          >
            <h3>{selectedTeam === "north" ? "北陣営" : "南陣営"} 部隊</h3>
            {Object.entries(currentFormation.assignment)
              .filter(([key]) => key !== "supply")
              .map(([type, value]) => {
                if (Array.isArray(value)) {
                  return (value as number[]).map((n: number, i: number) => {
                    const id = `${selectedTeam}_${type}_${i + 1}`;
                    const placed = placedUnits.find((p) => p.id === id);
                    return (
                      <div
                        key={id}
                        onClick={() => setSelectedUnit(id)}
                        style={{
                          margin: "4px 0",
                          padding: "4px 8px",
                          border: "1px solid #ccc",
                          borderRadius: 6,
                          background:
                            selectedUnit === id
                              ? "#add8e6"
                              : placed
                              ? "#d0ffd0"
                              : "white",
                          cursor: "pointer",
                        }}
                      >
                        {type} #{i + 1}（{n}人）
                        {placed && (
                          <div style={{ fontSize: 12, color: "#555" }}>
                            → ({placed.x}, {placed.y})
                          </div>
                        )}
                      </div>
                    );
                  });
                }else return null;
              })
              }
          </div>
        )}
      </div>

      {/* 配置完了 */}
      <button
        style={{
          marginTop: 30,
          padding: "10px 20px",
          fontSize: 18,
        }}
        disabled={
          placedUnits.filter((u) => u.id.startsWith("north")).length === 0 ||
          placedUnits.filter((u) => u.id.startsWith("south")).length === 0
        }
        onClick={handleComplete}
      >
        ▶ 配置完了 → ゲーム開始
      </button>
    </div>
  );
}
