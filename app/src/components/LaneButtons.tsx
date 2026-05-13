interface LaneButtonsProps {
  currentLane: "top" | "bottom";
  onLaneChange: (lane: "top" | "bottom") => void;
}

export default function LaneButtons({ currentLane, onLaneChange }: LaneButtonsProps) {
  return (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6 z-10">
      <button
        className={`lane-btn lane-btn-up ${currentLane === "top" ? "ring-2 ring-white ring-offset-2 ring-offset-transparent" : "opacity-60"}`}
        onPointerDown={(e) => {
          e.preventDefault();
          onLaneChange("top");
        }}
      >
        UP
      </button>
      <button
        className={`lane-btn lane-btn-down ${currentLane === "bottom" ? "ring-2 ring-white ring-offset-2 ring-offset-transparent" : "opacity-60"}`}
        onPointerDown={(e) => {
          e.preventDefault();
          onLaneChange("bottom");
        }}
      >
        DOWN
      </button>
    </div>
  );
}
