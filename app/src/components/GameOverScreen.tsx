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
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/70 backdrop-blur-sm">
      <div className="text-center">
        <h2 className="text-3xl font-black text-red-400 mb-2">GAME OVER</h2>

        <div className="ui-panel my-6 mx-4">
          <div className="text-sm ink-soft">Distance</div>
          <div className="text-3xl font-bold ink-strong tabular-nums">{score}m</div>

          {isNewHighScore && (
            <div className="text-sm text-yellow-400 font-bold mt-2 animate-pulse">
              NEW BEST!
            </div>
          )}

          <div className="text-xs ink-soft mt-2">Best: {highScore}m</div>
        </div>

        <button className="ui-cta text-lg px-8 py-3" onClick={onRestart}>
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}
