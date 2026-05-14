interface LaneButtonsProps {
  currentLane: "left" | "right";
  onLaneChange: (lane: "left" | "right") => void;
}

export default function LaneButtons({ currentLane, onLaneChange }: LaneButtonsProps) {
  return (
    <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-10 z-10">
      <button
        className={`lane-btn lane-btn-left ${currentLane === "left" ? "lane-btn-active" : "lane-btn-inactive"}`}
        onPointerDown={(e) => {
          e.preventDefault();
          onLaneChange("left");
        }}
      >
        <span className="lane-btn-arrow">&larr;</span>
        <span className="lane-btn-text">LEFT</span>
      </button>
      <button
        className={`lane-btn lane-btn-right ${currentLane === "right" ? "lane-btn-active" : "lane-btn-inactive"}`}
        onPointerDown={(e) => {
          e.preventDefault();
          onLaneChange("right");
        }}
      >
        <span className="lane-btn-arrow">&rarr;</span>
        <span className="lane-btn-text">RIGHT</span>
      </button>
    </div>
  );
}
