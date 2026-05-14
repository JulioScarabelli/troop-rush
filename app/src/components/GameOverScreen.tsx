import { resolveSpritePath } from "../ui/sprites";

interface GameOverScreenProps {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  onRestart: () => void;
}

export default function GameOverScreen({
  score,
  highScore,
  isNewHighScore,
  onRestart,
}: GameOverScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 gameover-backdrop">
      <div className="text-center px-6">
        <h2 className="gameover-title">GAME OVER</h2>

        <div className="score-card my-8">
          <div className="text-xs ink-soft uppercase tracking-widest mb-1">Distance</div>
          <div className="score-value">{score}m</div>

          {isNewHighScore && (
            <div className="new-best-badge">NEW BEST!</div>
          )}

          <div className="text-xs ink-soft mt-3">Best: {highScore}m</div>
        </div>

        <button className="play-btn-img" onClick={onRestart}>
          <img
            src={resolveSpritePath("/sprites/ui/btn-play.png")}
            alt="Play Again"
          />
        </button>
      </div>
    </div>
  );
}
