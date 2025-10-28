import type { Unit } from "./types";
import type { Cell } from "./types";

function heuristic(ax: number, ay: number, bx: number, by: number){
    return Math.abs(ax -bx) + Math.abs(ay - by);
}

export function moveUnitsTowardTargets(board: Cell[], units: Unit[]): Unit[] {
    return units.map((u) => {
        if(u.targetX == null || u.targetY == null) return u;

        const path = findPath(board, u.x, u.y, u.targetX, u.targetY);
        if(path.length > 1){
            const [nextX, nextY] = path[1];
            return { ...u, x: nextX, y: nextY };
        }
        return u;
    });
}
export function moveTanks(units: Unit[] , turn: number): Unit[]{
    //3ターンに1マス進む
    if(turn % 3 !== 0) return units;

    return units.map((u) => {
        if(u.type !== "tank" || !u.route || typeof u.routeProgress !== "number") return u;

        const nextIndex = u.routeProgress + 1;
        if(nextIndex >= u.route.length) return u;
        const [nextX,nextY] = u.route[nextIndex];
        return { ...u, x: nextX, y:nextY, routeProgress: nextIndex};
    });
}


export function findPath(board: Cell[], startX: number, startY: number, targetX: number, targetY: number): [number, number][]{
    const rows = 30;
    const cols = 16;
    const toKey = (x: number, y:number) => `${x},${y}`;

    const openSet = new Set<string>();
    const cameFrom: Record<string,string | undefined> = {};
    const gScore: Record<string,number> = {};
    const fScore: Record<string,number> = {};

    const startKey = toKey(startX,startY);
    const targetKey = toKey(targetX,targetY);

    gScore[startKey]=0;
    fScore[startKey]=Math.abs(targetX-startX) + Math.abs(targetY-startY);
    openSet.add(startKey);

    const isBlocked = (x: number, y: number) => {
        const cell = board.find((c)=>c.x === x && c.y === y);
        return !cell || cell.terrain === "block1" || cell.terrain === "wall" || cell.terrain === "block2";
    };

    const dirs = [
        [1,0],[-1,0],[0,1],[0,-1],
    ];

    while(openSet.size > 0){
        const current = Array.from(openSet).reduce((a,b) => 
            (fScore[a] ?? Infinity ) < (fScore[b] ?? Infinity)? a:b);
        if(current === targetKey){
            const path: [number,number][] = [];
            let c: string | undefined = current;
            while (c){
                    const [x,y] = c.split(",").map(Number);
                    path.unshift([x,y]);
                    c = cameFrom[c]!;
            }
            return path;
        }

            openSet.delete(current);
            const [cx,cy]=current.split(",").map(Number);

            for(const[dx,dy] of dirs){
                const nx = cx + dx;
                const ny = cy + dy;
                const key = toKey(nx,ny);

                if(nx < 0 || nx >= cols || ny < 0 || ny >= rows || isBlocked(nx,ny)) continue;

                const tentativeG = (gScore[current] ?? Infinity) + 1;

                if(tentativeG < ( gScore[key] ?? Infinity)){
                    cameFrom[key] = current;
                    gScore[key]=tentativeG;
                    fScore[key]=tentativeG+Math.abs(targetX - nx) + Math.abs(targetY - ny);
                    openSet.add(key);
                }
            }
        }
        return [];
    }