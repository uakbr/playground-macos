import React from "react";
import { Rnd } from "react-rnd";
import { minMarginX, minMarginY, appBarHeight } from "~/utils";

const FullIcon = ({ size }: { size: number }) => (
  <svg
    className="icon"
    viewBox="0 0 13 13"
    width={size}
    height={size}
    xmlns="http://www.w3.org/2000/svg"
    fillRule="evenodd"
    clipRule="evenodd"
    strokeLinejoin="round"
    strokeMiterlimit={2}
  >
    <path d="M9.26 12.03L.006 2.73v9.3H9.26zM2.735.012l9.3 9.3v-9.3h-9.3z" />
  </svg>
);

const ExitFullIcon = ({ size }: { size: number }) => (
  <svg
    className="icon"
    viewBox="0 0 19 19"
    width={size}
    height={size}
    xmlns="http://www.w3.org/2000/svg"
    fillRule="evenodd"
    clipRule="evenodd"
    strokeLinejoin="round"
    strokeMiterlimit={2}
  >
    <path d="M18.373 9.23L9.75.606V9.23h8.624zM.6 9.742l8.623 8.624V9.742H.599z" />
  </svg>
);

interface TrafficProps {
  id: string;
  max: boolean;
  aspectRatio?: number;
  setMax: (id: string, target?: boolean) => void;
  setMin: (id: string) => void;
  close: (id: string) => void;
}

interface WindowProps extends TrafficProps {
  title: string;
  min: boolean;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  x?: number;
  y?: number;
  z: number;
  focus: (id: string) => void;
  children: React.ReactNode;
}

interface WindowState {
  width: number;
  height: number;
  x: number;
  y: number;
}

const TrafficLights = ({ id, close, aspectRatio, max, setMax, setMin }: TrafficProps) => {
  const disableMax = aspectRatio !== undefined;

  const closeWindow = (e: React.MouseEvent | React.TouchEvent): void => {
    e.stopPropagation();
    close(id);
  };

  return (
    <div className="traffic-lights flex flex-row absolute left-0 space-x-2 pl-2 mt-1.5">
      <button
        className="window-btn bg-red-500 dark:bg-red-400"
        onClick={closeWindow}
        onTouchEnd={closeWindow}
      >
        <span className="icon i-gg:close text-[9px]" />
      </button>
      <button
        className={`window-btn ${max ? "bg-c-400" : "bg-yellow-500 dark:bg-yellow-400"}`}
        onClick={() => setMin(id)}
        onTouchEnd={() => setMin(id)}
        disabled={max}
      >
        <span className={`icon i-fe:minus text-[10px] ${max ? "invisible" : ""}`} />
      </button>
      <button
        className={`window-btn ${
          disableMax ? "bg-c-400" : "bg-green-500 dark:bg-green-400"
        }`}
        onClick={() => setMax(id)}
        onTouchEnd={() => setMax(id)}
        disabled={disableMax}
      >
        {!disableMax && (max ? <ExitFullIcon size={9} /> : <FullIcon size={6} />)}
      </button>
    </div>
  );
};

const Window = (props: WindowProps) => {
  const dockSize = useStore((state) => state.dockSize);
  const { winWidth, winHeight } = useWindowSize();
  const isMobile = winWidth < 640; // Simple mobile detection based on width

  const initWidth = isMobile ? winWidth : Math.min(winWidth, props.width || 640); // Full width on mobile
  const initHeight = isMobile ? winHeight : Math.min(winHeight, props.height || 400); // Full height on mobile

  const [state, setState] = useState<WindowState>({
    width: initWidth,
    height: initHeight,
    // "+ winWidth" because of the boundary for windows
    x: winWidth + (winWidth - initWidth) / 2 + (props.x || 0),
    // "- minMarginY" because of the boundary for windows
    y: (winHeight - initHeight - dockSize - minMarginY) / 2 + (props.y || 0)
  });

  useEffect(() => {
    setState({
      ...state,
      width: isMobile ? winWidth : Math.min(winWidth, state.width), // Ensure full width on mobile
      height: isMobile ? winHeight : Math.min(winHeight, state.height) // Ensure full height on mobile
    });
    if (isMobile && !props.max) {
      props.setMax(props.id, true); // Auto-maximize on mobile
    }
  }, [winWidth, winHeight, isMobile, props.max, props.id, props.setMax, state]);

  const round = props.max ? "rounded-none" : "rounded-lg";
  const minimized = props.min
    ? "opacity-0 invisible transition-opacity duration-300"
    : "";
  const border = props.max ? "" : "border border-gray-500/30";
  const width = isMobile || props.max ? winWidth : state.width; // Full width on mobile or maximized
  const height = isMobile || props.max ? winHeight : state.height; // Full height on mobile or maximized
  const disableMax = props.aspectRatio !== undefined;

  const children = React.cloneElement(props.children as React.ReactElement, {
    width: width
  });

  return (
    <Rnd
      bounds="parent"
      size={{
        width: width,
        height: height
      }}
      position={{
        x: isMobile || props.max // Position at top left on mobile or maximized
          ? winWidth // because of boundary
          : Math.min(
              // "winWidth * 2" because of the boundary for windows
              winWidth * 2 - minMarginX,
              Math.max(
                // "+ winWidth" because we add a boundary for windows
                winWidth - state.width + minMarginX,
                state.x
              )
            ),
        y: isMobile || props.max // Position at top left on mobile or maximized
          ? -minMarginY // because of boundary
          : Math.min(
              // "- minMarginY" because of the boundary for windows
              winHeight - minMarginY - (dockSize + 15 + minMarginY),
              Math.max(0, state.y)
            )
      }}
      onDragStop={(e, d) => {
        if (!isMobile) setState({ ...state, x: d.x, y: d.y }); // Disable dragging on mobile
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        if (!isMobile) { // Disable resizing on mobile
          setState({
            ...state,
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
            ...position
          });
        }
      }}
      minWidth={props.minWidth ? props.minWidth : 200}
      minHeight={props.minHeight ? props.minHeight : 150}
      dragHandleClassName="window-bar"
      disableDragging={isMobile || props.max} // Disable dragging on mobile
      enableResizing={!isMobile && !props.max} // Disable resizing on mobile
      lockAspectRatio={props.aspectRatio}
      lockAspectRatioExtraHeight={props.aspectRatio ? appBarHeight : undefined}
      style={{ zIndex: props.z }}
      onMouseDown={() => props.focus(props.id)}
      className={`overflow-hidden ${round} ${border} shadow-lg shadow-black/30 ${minimized} ${isMobile ? 'mobile-window' : ''}`} /* Added mobile-window class for mobile specific styling */
      id={`window-${props.id}`}
    >
      <div
        className="window-bar relative h-10 text-center bg-c-200 touch-manipulation" /* Increased height for mobile touch */
        onDoubleClick={() => !disableMax && !isMobile && props.setMax(props.id)} /* Disable maximize on double click for mobile */
      >
        <TrafficLights
          id={props.id}
          max={props.max}
          aspectRatio={props.aspectRatio}
          setMax={props.setMax}
          setMin={props.setMin}
          close={props.close}
        />
        <span className="font-semibold text-c-700">{props.title}</span>
      </div>
      <div className="innner-window w-full overflow-y-hidden">{children}</div>
    </Rnd>
  );
};

export default Window;