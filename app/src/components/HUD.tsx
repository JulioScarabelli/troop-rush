import { resolveSpritePath } from "../ui/sprites";

interface HUDProps {
  score: number;
  troopCount: number;
}

export default function HUD({ score, troopCount }: HUDProps) {
  const hudStyle = {
    backgroundImage: `url(${resolveSpritePath("/sprites/ui/hud-panel.png")})`,
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
  };

  return (
    <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-3 pointer-events-none z-10">
      <div className="hud-chip-wood" style={hudStyle}>
        <div className="hud-label">DISTANCE</div>
        <div className="hud-value">{score}m</div>
      </div>
      <div className="hud-chip-wood" style={hudStyle}>
        <div className="hud-label text-right">TROOPS</div>
        <div className="hud-value text-right" style={{ color: troopCount > 10 ? "#a3e635" : troopCount > 5 ? "#fbbf24" : "#fda4af" }}>
          {troopCount}
        </div>
      </div>
    </div>
  );
}
