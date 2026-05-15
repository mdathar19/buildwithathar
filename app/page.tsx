import BootSequence from "./components/BootSequence";
import BackgroundFx from "./components/BackgroundFx";
import HudTop from "./components/HudTop";
import HudSide from "./components/HudSide";
import HudBottom from "./components/HudBottom";
import Hero from "./components/Hero";
import Manifest from "./components/Manifest";
import CapMatrix from "./components/CapMatrix";
import OpsLog from "./components/OpsLog";
import FounderBuild from "./components/FounderBuild";
import SysGrid from "./components/SysGrid";
import VisitorsMap from "./components/VisitorsMap";
import Transmit from "./components/Transmit";

export default function Page() {
  return (
    <>
      <BootSequence />
      <BackgroundFx />
      <HudTop />
      <HudSide />
      <main>
        <Hero />
        <Manifest />
        <CapMatrix />
        <OpsLog />
        <FounderBuild />
        <SysGrid />
        <VisitorsMap />
        <Transmit />
      </main>
      <HudBottom />
    </>
  );
}
