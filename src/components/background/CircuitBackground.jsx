function CircuitBackground() {
  return (
    <div className="circuit-bg" aria-hidden="true">
      <div className="grid-layer"></div>

      <svg
        className="circuit-svg"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className="traces-far">
          <path className="trace trace-1" d="M -20 120 H 160 V 40 H 340" />
          <path className="trace trace-2 alt" d="M -20 260 H 220 V 340 H 460 V 220" />
          <path className="trace trace-3" d="M 1220 100 H 980 V 220 H 760" />
          <path className="trace trace-4 alt" d="M 1220 300 H 1040 V 180 H 860 V 400" />
          <path className="trace trace-11" d="M -20 700 H 100 V 780" />
          <path className="trace trace-12 alt" d="M 1220 700 H 1100 V 780" />
        </g>
        <g className="traces-near">
          <path className="trace trace-5" d="M 120 800 V 620 H 320 V 500" />
          <path className="trace trace-6 alt" d="M 500 800 V 660 H 640 V 560" />
          <path className="trace trace-7" d="M 900 800 V 700 H 700 V 620 H 560" />
          <path className="trace trace-8 alt" d="M -20 500 H 140 V 580 H 300" />
          <path className="trace trace-9" d="M 1220 560 H 1000 V 480 H 840" />
          <path className="trace trace-10 alt" d="M 380 40 V 160 H 560 V 260" />
        </g>

        <path className="pulse pulse-1" d="M -20 260 H 220 V 340 H 460 V 220" />
        <path className="pulse pulse-2 alt" d="M 1220 300 H 1040 V 180 H 860 V 400" />
        <path className="pulse pulse-3" d="M 120 800 V 620 H 320 V 500" />
        <path className="pulse pulse-4 alt" d="M 1220 560 H 1000 V 480 H 840" />
        <path className="pulse pulse-5" d="M 900 800 V 700 H 700 V 620 H 560" />

        <g className="nodes">
          <circle className="node node-a" cx="160" cy="40" r="7" />
          <circle className="node node-b alt" cx="460" cy="220" r="5" />
          <circle className="node node-ring" cx="760" cy="220" r="10" />
          <circle className="node node-c" cx="320" cy="500" r="5" />
          <circle className="node node-d alt" cx="640" cy="560" r="6" />
          <circle className="node node-ring alt" cx="560" cy="260" r="9" />
          <circle className="node node-e" cx="840" cy="480" r="5" />
          <circle className="node node-f alt" cx="300" cy="580" r="6" />
          <circle className="node node-g" cx="100" cy="780" r="5" />
          <circle className="node node-h alt" cx="1100" cy="780" r="5" />
        </g>

        <g className="rings">
          <circle className="ring ring-1" cx="900" cy="150" r="60" />
          <circle className="ring ring-1" cx="900" cy="150" r="90" />
          <circle className="ring ring-2" cx="200" cy="650" r="45" />
          <circle className="ring ring-3" cx="200" cy="650" r="75" />
        </g>
      </svg>

      <div className="grain"></div>
    </div>
  )
}

export default CircuitBackground