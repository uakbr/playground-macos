import { useMotionValue } from "framer-motion";
import { apps } from "~/configs";
import { useStore } from "~/stores/useStore";

interface DockProps {
  open: (id: string) => void;
  showApps: {
    [key: string]: boolean;
  };
  showLaunchpad: boolean;
  toggleLaunchpad: (target: boolean) => void;
  hide: boolean;
  isMobile: boolean;
}

export default function Dock({
  open,
  showApps,
  showLaunchpad,
  toggleLaunchpad,
  hide,
  isMobile
}: DockProps) {
  const { dockSize, dockMag } = useStore((state) => ({
    dockSize: state.dockSize,
    dockMag: state.dockMag
  }));

  const openApp = (id: string) => {
    if (id === "launchpad") toggleLaunchpad(!showLaunchpad);
    else {
      toggleLaunchpad(false);
      open(id);
    }
  };

  const mouseX = useMotionValue<number | null>(null);

  return (
    <div
      className={`dock fixed inset-x-0 mx-auto bottom-1 ${hide ? "z-0" : "z-50"}`}
      w="full sm:max"
      overflow="x-scroll sm:x-visible"
      style={{
        WebkitOverflowScrolling: "touch"
      }}
    >
      <ul
        className="flex space-x-2 px-2 backdrop-blur-2xl bg-c-white/20"
        border="~ c-400/40 rounded-none sm:rounded-xl"
        onMouseMove={(e) => !isMobile && mouseX.set(e.nativeEvent.x)}
        onMouseLeave={() => !isMobile && mouseX.set(null)}
        style={{
          height: `${(dockSize + (isMobile ? 5 : 15)) / 16}rem`,
          minWidth: "min-content"
        }}
      >
        {apps.map((app) => (
          <DockItem
            key={`dock-${app.id}`}
            id={app.id}
            title={app.title}
            img={app.img}
            mouseX={mouseX}
            desktop={app.desktop}
            openApp={openApp}
            isOpen={app.desktop && showApps[app.id]}
            link={app.link}
            dockSize={dockSize}
            dockMag={dockMag}
          />
        ))}
      </ul>
    </div>
  );
}
