import type { Cell, GameObject, Terrain, Unit } from "./types";
import { createBoard } from "./boardSetup";
import { useState } from "react";
import React from "react";

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
  units = [],
  onCellClick,
  showTargets = false,
}: {
  gameObjects: Record<string, GameObject>;
  setGameObjects: React.Dispatch<
    React.SetStateAction<Record<string, GameObject>>
  >;
  units?: Unit[];
  onCellClick?: (x: number, y: number) => void;
  showTargets?: boolean;
}) {
  const [board] = useState<Cell[]>(createBoard());

  return (
    <svg
      width={COLS * cellSize}
      height={ROWS * cellSize}
      style={{ border: "1px solid #222", background: "#fff" }}
    >
      {board.map((cell, i) => {
        const obj = cell.objectId ? gameObjects[cell.objectId] : null;
        const fill = obj ? coreColor[obj.type] : terrainColor[cell.terrain];

        const unitHere = units.find((u) => u.x === cell.x && u.y === cell.y && u.type !== "supply");
        let symbol = "";
        if(unitHere){
          if(unitHere.team === "north"){
            symbol = 
              unitHere.type === "battalion"
                ? "🟦"
                : unitHere.type === "infantry"
                ? "🔵"
                : unitHere.type === "raider"
                ? "💧"
                : unitHere.type === "support"
                ? "💙"
                : unitHere.type === "tank"
                ? "🚙"
                : "";
          } else {
            symbol = 
              unitHere.type === "battalion"
                ? "🟥"
                : unitHere.type === "infantry"
                ? "🔴"
                : unitHere.type === "raider"
                ? "🩸"
                : unitHere.type === "support"
                ? "❤️"
                : unitHere.type === "tank"
                ? "🚗"
                : "";
          }
        }

        //目的地マーカー
        const targetMarker = showTargets
          ? units.find(
            (u) => 
              u.targetX === cell.x &&
              u.targetY === cell.y &&
              u.type != "supply" &&
              u.type != "tank"
          )
          : null;

        return (
          <g key = {i}>
          <rect
            x={cell.x * cellSize}
            y={cell.y * cellSize}
            width={cellSize}
            height={cellSize}
            fill={fill}
            stroke="#aaa"
            onClick={() => onCellClick?.(cell.x, cell.y)} 
            style = {{cursor: onCellClick ? "pointer" : "default"}}
          />

          {symbol && (
            <text
              x={cell.x * cellSize + cellSize / 2}
              y={cell.y * cellSize + cellSize / 2+4}
              fontSize={16}
              textAnchor="middle"
            >
             {symbol}
            </text>
          )}
          {targetMarker && (
            <text
              x={cell.x * cellSize + cellSize / 2}
              y={cell.y * cellSize + cellSize / 2-6}
              fontSize={12}
              textAnchor="middle"
            >
              🎯
            </text>
          )}
          </g>
        );
      })}
    </svg>
  );
}
