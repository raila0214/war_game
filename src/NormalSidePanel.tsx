import type { Unit,GameObject } from "./types";

const coreName: Record<string, string> = {
    mainCoreN: "北メインコア ",
    mainCoreS: "南メインコア ",
    subCoreN1: "北サブコア(左)",
    subCoreN2: "北サブコア(中)",
    subCoreN3: "北サブコア(右)",
    subCoreS1: "南サブコア(左)",
    subCoreS2: "南サブコア(中)",
    subCoreS3: "南サブコア(右)",
  
  };
export default function NormalSidePanel({
    units,
    gameObjects,
    totalSuppliesN,
    totalSuppliesS,
    spawnedTanksN,
    spawnedTanksS,
    messages,
    highlightUnitId,
    setHighlightUnitId,
    getUnitName,
}: {
    units: Unit[];
    gameObjects: Record<string, GameObject>;
    totalSuppliesN: number;
    totalSuppliesS: number;
    spawnedTanksN: number;
    spawnedTanksS: number;
    messages: string[];
    highlightUnitId: string | null;
    setHighlightUnitId: (id: string | null) => void;
    getUnitName: (u: Unit) => string;
  }
  ){
    return(
        <div style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            color: "black",
          }}>
          <div
              style={{
                width: 240,
                padding: "6px",
                background: "#d0e0ff",
                borderRadius: 10,
                border: "1px solid #ccc",
                height: "fit-content",
              }}
            >
              <h3 style={{marginBottom: 6}}>部隊一覧</h3>
              {units
              .filter((u) => u.type !== "supply")
              .map((u) => (
                <div
                key = {u.id}
                onMouseDown={() => setHighlightUnitId(u.id)}
                onMouseUp={() => setHighlightUnitId(null)}
                style={{
                  margin: "6px 0",
                  padding: "4px 6px",
                  border: "1px solid #888",
                  borderRadius: 6,
                  background:
                    highlightUnitId === u.id
                      ? "#ffffaa"
                      : u.team === "north"
                      ? "lightcyan"
                      : "mistyrose",
                  cursor: "pointer",
                }}
              >
                <div style = {{fontSize: 10, display: "flex", justifyContent:"space-between"}}>
                  <strong>{getUnitName(u)}</strong>
                  <span style={{fontSize: 8}}>HP：{u.hp}/{u.maxHp}</span>
                </div>
                <div style={{width: "100%",background: "#ddd", height: 10, borderRadius: 4}}>
                  <div
                    style={{
                      width: `${(u.hp/u.maxHp)*100}%`,
                      background: u.hp > u.maxHp * 0.5 ? "#4caf50" : "#f44336",
                      height: "100%",
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
              ))}
      
              </div>
              <div
              style={{
                width: 240,
                padding: "8px 10px",
                background: "#d0e0ff",
                borderRadius: 12,
                border: "1px solid #ccc",
              }}
            >
              <h3 style={{marginBottom: 8}}>コアHP一覧</h3>
                {Object.values(gameObjects).map((core) => {
                  const name = coreName[core.id] ?? core.id;
                  const percent = (core.hp / core.maxHp) * 100;
                  return (
                    <div 
                    key = {core.id} 
                    style={{
                      margin: "6px 0",
                      padding: "4px 6px",
                      border: "1px solid #888",
                      borderRadius: 6,
                      background:
                        highlightUnitId === core.id
                          ? "#ffffaa"
                          : core.team === "north"
                          ? "lightcyan"
                          : "mistyrose",
                      cursor: "pointer",
      
                      fontSize: 12, 
                      justifyContent:"space-between"
                      }}>
                      <div style = {{fontSize: 10, display: "flex", justifyContent:"space-between"}}>
                      <strong>{name}</strong>
                      <span style={{fontSize: 8}}>HP：{core.hp}/{core.maxHp}</span>
                      </div>
                      <div style={{width: "100%", background: "#ddd", height: 10, borderRadius: 4}}>
                        <div style={{
                          width: `${percent}%`,
                          background: percent > 50 ? "#4caf50" : "#f44336",
                          height: "100%",
                          borderRadius: 4,
                        }}/>
                      </div>
                    </div>
                  )
              })}
              
              <h3>📦 物資収集状況</h3>
      
              <div style={{ marginBottom: 10 }}>
                <strong>北陣営</strong>
                <div>総物資：{totalSuppliesN}</div>
                <div>召喚済み戦車：{spawnedTanksN} / 4</div>
              </div>
      
              <div>
                <strong>南陣営</strong>
                <div>総物資：{totalSuppliesS}</div>
                <div>召喚済み戦車：{spawnedTanksS} / 4</div>
              </div>
      
              <div style={{ marginTop: 16 }}>
                <h3>📢 戦闘状況</h3>
                <div
                  style={{
                    background: "snow",
                    border: "1px solid #888",
                    padding: 8,
                    height: 120,
                    fontSize: 12,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  {messages.map((msg, i) => (
                    <div key={i}>{msg}</div>
                  ))}
                </div>
              
              </div>
              </div>
              </div>
    );
}