import GoogleAnalytics from "./google-analytics";
import OpenPanelAnalytics from "./open-panel";
import Plausible from "./plausible";

export default function Analytics() {
  return (
    <>
      <OpenPanelAnalytics />
      <GoogleAnalytics />
      <Plausible />
    </>
  );
}
