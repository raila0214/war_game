import type { Unit, GameObject, Cell } from "./types";
import { attackPatterns } from "./attackPatterns";
import { calcSoldierDamage, TANK_DAMAGE_CORE } from "./battleLogic";

function getAttackCells(u: Unit): [number, number][]{
    const pattern = attackPatterns[u.type] ?? [];
    return pattern.map(([dx,dy]) => [u.x + dx, u.y + dy]); 
}
function canDamageMainCore(objects: Record<string, GameObject>, team: "north" | "south"){
    const enemy = team === "north" ? "S" : "N";
    const subCores = Object.values(objects).filter(
        o => o.type === "coreSub" && o.id.includes(enemy)
    );
    return subCores.some((core) => core.hp <= 0);
}

export function processCombat(
    board: Cell[],
    units: Unit[],
    gameObjects: Record<string, GameObject>
): {
    newUnits: Unit[];
    newObjects: Record<string, GameObject>;
}{
    let updatedUnits = [...units];
    let updatedObjects = {...gameObjects };

    for (const attacker of units){
        const cells = getAttackCells(attacker);

        for(const[tx,ty] of cells){

            const cell = board.find((b) => b.x === tx && b.y == ty);
            if(cell?.objectId){
                const obj = updatedObjects[cell.objectId];
                if(!obj)continue;
                if(obj.team === attacker.team) continue;

                if(obj.type === "coreMain"){
                    if(!canDamageMainCore(updatedObjects,attacker.team)){
                        continue;
                    }
                }
                if(attacker.type === "tank"){
                    updatedObjects[cell.objectId]={
                        ...obj,
                        hp: Math.max(0, obj.hp - TANK_DAMAGE_CORE),
                    };
                } else {
                    const dmg = calcSoldierDamage(attacker.attack, obj.defense ?? 0);
                    updatedObjects[cell.objectId] = {
                        ...obj,
                        hp: Math.max(0,obj.hp - dmg),
                    };
                }
            }

            updatedUnits = updatedUnits.map((target) => {
                if(
                    target.team !== attacker.team &&
                    target.x === tx &&
                    target.y === ty
                ){
                    if(attacker.type === "tank") return target;

                    const damage = calcSoldierDamage(
                        attacker.attack,
                        target.defense
                    );
                    return {
                        ...target,
                        hp: Math.max(0, target.hp - damage),
                    };
                }
                return target;
            });
        }
    }
    return {
        newUnits: updatedUnits,
        newObjects: updatedObjects,
    };
}