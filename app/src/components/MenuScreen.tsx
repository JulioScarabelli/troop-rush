interface MenuScreenProps {
  highScore: number;
  onStart: () => void;
}

export default function MenuScreen({ highScore, onStart }: MenuScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/60 backdrop-blur-sm">
      <div className="text-center">
        <h1 className="text-4xl font-black ink-strong tracking-tight mb-2">
          TROOP RUSH
        </h1>
        <p className="text-sm ink-soft mb-8">Choose wisely. Build your army. Survive.</p>

        {highScore > 0 && (
          <p className="text-sm text-yellow-400 mb-4">Best: {highScore}m</p>
        )}

        <button className="ui-cta text-lg px-8 py-3" onClick={onStart}>
          TAP TO START
        </button>

        <div className="mt-8 text-xs ink-soft space-y-1">
          <p>Use UP / DOWN buttons to pick lanes</p>
          <p>Or Arrow keys on keyboard</p>
        </div>
      </div>
    </div>
  );
}
