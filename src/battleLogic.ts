import type { Cell, GameObject } from "./types";

//乱数
function randomRange(min: number, max: number): number {
    return Math.random()*(max-min)+min;
}

//兵士のダメージ計算
export function calcSoldierDamage(attack: number, defense: number): number{
    const rand = randomRange(0.9, 1.1);
    const damage = ((attack*0.5) -(defense * 0.3)) * rand;
    return Math.max(0, Math.floor(damage));
}

//支援部隊の回復量
export function calcHealAmount(supportCount: number): number{
    const rand = randomRange(0.9, 1.1);
    const heal = (15 + (supportCount-1)*2)*rand;
    return Math.round(heal);
}

//戦車対コア
export const TANK_DAMAGE_CORE = 1000;

export function applyAttackOrHeal(
    board: Cell[],
    gameObjects: Record<string, GameObject>,
    targetX: number,
    targetY: number,
    type: "soldier" | "tank" | "support",
    attackPower: number,
    defensePower: number = 0,
    supportCount: number = 0
): Record<string, GameObject>{
    const cell = board.find((b) => b.x === targetX && b.y === targetY);
    if(!cell || !cell.objectId) return gameObjects;

    const id = cell.objectId;
    const obj = gameObjects[id];
    if(!obj) return gameObjects;

    let newHP = obj.hp;

    switch(type){
        case "soldier":{
            const dmg =calcSoldierDamage(attackPower, defensePower);
            newHP = Math.max(0,obj.hp - dmg);
            break;
        }
        case "tank":{
            newHP = Math.max(0,obj.hp - TANK_DAMAGE_CORE);
            break;
        }
        case "support":{
            const heal = calcHealAmount(supportCount);
            newHP = Math.min(obj.maxHp,obj.hp + heal);
            break;
        }
    }

    return {
        ...gameObjects,
        [id]: { ...obj, hp: newHP },
    };
}