import type { Cell, GameObject, Terrain } from "./types";
import { createBoard } from "./boardSetup";
import { useState } from "react";

const ROWS = 30;
const COLS = 16;
const cellSize = 20;

// terrain色
const terrainColor: Record<Terrain, string> = {
  plain: "white",
  wall: "gray",
  block1: "yellow",
  block2: "#ffeeaa",
  tankloard: "blue",
};

// core色
const coreColor: Record<GameObject["type"], string> = {
  coreMain: "red",
  coreSub: "orange",
};

export default function Board({
  gameObjects,
  setGameObjects,
}: {
  gameObjects: Record<string, GameObject>;
  setGameObjects: React.Dispatch<
    React.SetStateAction<Record<string, GameObject>>
  >;
}) {
  const [board] = useState<Cell[]>(createBoard());

  // 攻撃処理（クリックでHPを減らす）※随時変更
  function attackCell(cell: Cell, damage: number) {
    if (cell.objectId) {
      setGameObjects((prev) => {
        const obj = prev[cell.objectId!];
        if (!obj) return prev;
        return {
          ...prev,
          [obj.id]: { ...obj, hp: Math.max(0, obj.hp - damage) },
        };
      });
    }
  }

  return (
    <svg
      width={COLS * cellSize}
      height={ROWS * cellSize}
      style={{ border: "1px solid #222", background: "#fff" }}
    >
      {board.map((cell, i) => {
        const obj = cell.objectId ? gameObjects[cell.objectId] : null;
        const fill = obj ? coreColor[obj.type] : terrainColor[cell.terrain];

        return (
          <rect
            key={i}
            x={cell.x * cellSize}
            y={cell.y * cellSize}
            width={cellSize}
            height={cellSize}
            fill={fill}
            stroke="#aaa"
            onClick={() => attackCell(cell, 200)} // クリックで200ダメージ
          />
        );
      })}
    </svg>
  );
}
