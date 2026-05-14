import { resolveSpritePath } from "../ui/sprites";

interface MenuScreenProps {
  highScore: number;
  onStart: () => void;
}

export default function MenuScreen({ highScore, onStart }: MenuScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 menu-backdrop">
      <div className="text-center px-6 w-full">
        <img
          src={resolveSpritePath("/sprites/game/logo.png")}
          alt="Troop Rush"
          className="menu-logo"
        />
        <p className="text-sm ink-soft mb-10 tracking-wide mt-2">
          Choose wisely. Build your army. Survive.
        </p>

        {highScore > 0 && (
          <div className="mb-6">
            <span className="highscore-badge">BEST: {highScore}m</span>
          </div>
        )}

        <button className="play-btn-img" onClick={onStart}>
          <img
            src={resolveSpritePath("/sprites/ui/btn-play.png")}
            alt="Play"
          />
        </button>

        <div className="mt-10 text-xs ink-soft space-y-1.5 opacity-70">
          <p>Use LEFT / RIGHT buttons to pick lanes</p>
          <p>Arrow keys on keyboard</p>
        </div>
      </div>
    </div>
  );
}
