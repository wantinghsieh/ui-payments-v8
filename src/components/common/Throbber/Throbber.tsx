import { Spinner } from "@cox/core-ui8/dist/Spinner";
import type { SpinnerSize } from "@cox/core-ui8/dist/Spinner";

interface ThrobberProps {
  show: boolean;
  /** Spinner size passed through to core-ui8 Spinner. Defaults to "xl". */
  size?: SpinnerSize;
}

/** Full-view loading spinner shown while a request is in flight. */
const Throbber = ({ show, size = "xl" }: ThrobberProps) =>
  show ? (
    <div className="throbber-container" data-automation-id="throbber">
      <Spinner size={size} />
    </div>
  ) : null;

export default Throbber;
