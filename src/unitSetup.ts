import type { Unit, PlayerUnitConfig } from "./types";
import { createUnit } from "./unitStats";

/*
export function generateUnitFromConfig(
    config: PlayerUnitConfig,
    team: "north"|"south"
): Unit[]{
    const units: Unit[] =[];
    let totalAssigned = 0;

    //大隊と物資部隊を必ず含める
    const battalion = config.units.find((u) => u.type === "battalion") ?? {
        type: "battalion",
        members: 1,
    };
    const supply = config.units.find((u) => u.type === "supply") ?? {
        type: "supply",
        members: 1,
    };

    
}
*/