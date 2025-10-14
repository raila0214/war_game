import type { FormationInput } from "./formationLogic";

export const defaultNorthFormation: FormationInput = {
  team: "north",
  assignment: {
    infantry: [10, 10, 10],
    battalion: 30,
    raider: [10],
    support: [20],
    supply: 10,
  },
};

export const defaultSouthFormation: FormationInput = {
  team: "south",
  assignment: {
    infantry: [10, 10, 10],
    battalion: 30,
    raider: [10],
    support: [20],
    supply: 10,
  },
};
