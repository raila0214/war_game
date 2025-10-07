//盤面の初期化とコアの配置ルール

import type { Cell } from "./types";

const ROWS = 30;
const COLS = 16;

export function createBoard(): Cell[]{
    const board: Cell[]=[];

    for (let y = 0; y < ROWS; y++){
        for(let x = 0; x < COLS; x++){
            board.push({ x, y, terrain: "plain"});
        }
    }

// 北メインコア (4マス共有: mainCoreN)
  [6, 7, 8, 9].forEach((x) => {
    board.find((b) => b.x === x && b.y === 0)!.objectId = "mainCoreN";
  });

  // 南メインコア (4マス共有: mainCoreS)
  [6, 7, 8, 9].forEach((x) => {
    board.find((b) => b.x === x && b.y === ROWS - 1)!.objectId = "mainCoreS";
  });

  // 北サブコア (3つ)
  [2, 7, 12].forEach((x, i) => {
    board.find((b) => b.x === x && b.y === 3)!.objectId = `subCoreN${i + 1}`;
  });

  // 南サブコア (3つ)
  [3, 8, 13].forEach((x, i) => {
    board.find((b) => b.x === x && b.y === ROWS - 4)!.objectId = `subCoreS${i + 1}`;
  });

  // 障害物（block1: 完全侵入不可）
  [
    [7, 9], [8, 9],
    [6,10],[7,10],[8,10],[9,10],
    [6,11],[7,11],[8,11],[9,11],
    [7, 12], [8, 12],
    [7, 17], [8, 17],
    [6,18],[7,18],[8,18],[9,18],
    [6,19],[7,19],[8,19],[9,19],
    [7, 20], [8, 20],
  ].forEach(([x, y]) => {
    board.find((b) => b.x === x && b.y === y)!.terrain = "block1";
  });

  // 障害物(block2: 戦車のみ侵入可能)
  [
    [2,6],[3,6],[4,6],[11,6],[12,6],[13,6],
    [2,13],[13,13],
    [2,14],[3,14],[12,14],[13,14],
    [2,15],[3,15],[12,15],[13,15],
    [2,16],[13,16],
    [2,23],[3,23],[4,23],[11,23],[12,23],[13,23],
  ].forEach(([x, y]) => {
    board.find((b) => b.x === x && b.y === y)!.terrain = "block2";
  });

  //wall
  [
    [0,3],[5,3],[10,3],[15,3],
    [0,26],[5,26],[10,26],[15,26],
  ].forEach(([x, y]) => {
    board.find((b) => b.x === x && b.y === y)!.terrain = "wall";
  });

  return board;
}
