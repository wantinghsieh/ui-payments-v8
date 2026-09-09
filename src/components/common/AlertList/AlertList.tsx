import { AlertIconType, PaymentAlert } from "../../../types/payment";
import ErrorAlert from "../../Alerts/ErrorAlert";
import WarningAlert from "../../Alerts/WarningAlert";
import InfoAlert from "../../Alerts/InfoAlert";
import SuccessAlert from "../../Alerts/SuccessAlert";

const ALERT_BY_ICON_TYPE: Record<AlertIconType, (props: any) => JSX.Element> = {
  info: InfoAlert,
  warning: WarningAlert,
  error: ErrorAlert,
  success: SuccessAlert,
};

interface AlertListProps {
  /** Server-driven alerts; each one's `iconType` selects the banner style. */
  alerts?: PaymentAlert[];
  /** Plain messages rendered as error banners (client-side/submit errors). */
  messages?: string[];
  id?: string;
}

/**
 * Renders stacked banners for the alerts a view has to show. Server alerts come
 * first in payload order, followed by any plain error messages raised during the
 * step. An alert with a missing or unknown `iconType` renders as an error.
 */
const AlertList = ({ alerts, messages, id }: AlertListProps) => {
  const items: PaymentAlert[] = [
    ...(alerts ?? []),
    ...(messages ?? []).map((message) => ({
      message,
      iconType: "error" as const,
    })),
  ];

  if (items.length === 0) return null;

  return (
    <>
      {items.map((alert) => {
        const Alert =
          (alert.iconType && ALERT_BY_ICON_TYPE[alert.iconType]) || ErrorAlert;
        return <Alert key={`${alert.iconType ?? "error"}-${alert.message}`} {...alert} id={id} />;
      })}
    </>
  );
};

export default AlertList;
