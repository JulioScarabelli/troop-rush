interface HUDProps {
  score: number;
  troopCount: number;
}

export default function HUD({ score, troopCount }: HUDProps) {
  return (
    <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-3 pointer-events-none z-10">
      <div className="bg-black/50 rounded-lg px-3 py-1.5 backdrop-blur-sm">
        <div className="text-xs ink-soft">DISTANCE</div>
        <div className="text-xl font-bold ink-strong tabular-nums">{score}m</div>
      </div>
      <div className="bg-black/50 rounded-lg px-3 py-1.5 backdrop-blur-sm">
        <div className="text-xs ink-soft text-right">TROOPS</div>
        <div className="text-xl font-bold text-green-400 tabular-nums">{troopCount}</div>
      </div>
    </div>
  );
}
