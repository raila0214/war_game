import { validateAndCreateFormation } from "./formationLogic";
import type { FormationInput } from "./formationLogic";
import type { Unit } from "./types";
import { autoPlaceUnits } from "./autoUnitSetup";

export function generateUnits(input: FormationInput,useAutoPlacement = false): Unit[]{
    const units = validateAndCreateFormation(input);
    //useAutoPlacementがtrue,または全ユニットが(x,y=-1)なら自動配置
    const needAuto = useAutoPlacement || units.every((u) => u.x === -1 && u.y === -1);

    if(needAuto) {
        return autoPlaceUnits(input);
    }

    return units;
}
