import type { Unit } from "./types";

export default function TargetSettingPanel({
    units,
    selectedUnitId,
    onSelect,
    onHighlight,
    complete,
    getUnitName,
}:{
    units: Unit[];
    selectedUnitId: string | null;
    onSelect: (id: string) => void;
    onHighlight: (id: string) => void;
    complete: () => void;
    getUnitName: (u: Unit) => string;
}){
    return(
        <div
          style={{
            color:"black",
            width: 240,
            padding: "10px 14px",
            background: "lavender",
            borderRadius: 12,
            border: "1px solid #ccc",
          }}
        >
            <h3>目的地設定</h3>
            <p>部隊を選択 → 盤面をクリック</p>

            {
                units
                .filter((u) => u.type !== "supply" && u.type !== "tank")
                .map((u) =>(
                    <div 
                      key={u.id}
                      onClick={() => {
                        onSelect(u.id); 
                        onHighlight(u.id);
                    }}
                      style={{
                        color:"black",
                        margin: "4px 0",
                        padding: "4px 8px",
                        border: "1px solid #ccc",
                        borderRadius: 6,
                        background:
                          selectedUnitId === u.id
                            ? "silver"
                            : u.team === "north"
                            ? "lightcyan"
                            : "mistyrose",
                        cursor: "pointer",
                      }}
                    >
                        {getUnitName(u)} → {" "}
                        {u.targetX != null ? `(${u.targetX},${u.targetY})`:"未設定"}
                    </div>
                ))
            }
            <button 
              style={{
                marginTop: 12,
                width: "100%"
              }}
              onClick={complete}
            >
                設定完了
            </button>
        </div>
    )
}