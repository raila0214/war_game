import { useState } from "react";
import TeamSetupScreen from "./TeamSetupScreen";
import FormationSetupScreen from "./FormationSetupScreen";
import GameScreen from "./GameScreen";
import type { FormationInput } from "./formationLogic";

export default function App() {
  const [page, setPage] = useState<"setup" | "formation" | "game">("setup");
  const [northFormation, setNorthFormation] = useState<FormationInput | null>(null);
  const [southFormation, setSouthFormation] = useState<FormationInput | null>(null);

  // === 部隊編成完了時 ===
  const handleSetupComplete = (north: FormationInput, south: FormationInput) => {
    setNorthFormation(north);
    setSouthFormation(south);
    setPage("formation");
  };

  // === 配置完了時 ===
  const handleFormationComplete = (
    placedNorth: FormationInput,
    placedSouth: FormationInput
  ) => {
    setNorthFormation(placedNorth);
    setSouthFormation(placedSouth);
    setPage("game");
  };

  if (page === "setup") {
    return <TeamSetupScreen onComplete={handleSetupComplete} />;
  }

  if (page === "formation" && northFormation && southFormation) {
    return (
      <FormationSetupScreen
        northFormation={northFormation}
        southFormation={southFormation}
        onComplete={handleFormationComplete}
      />
    );
  }

  if (page === "game" && northFormation && southFormation) {
    return (
      <GameScreen
        northFormation={northFormation}
        southFormation={southFormation}
      />
    );
  }

  return null;
}
