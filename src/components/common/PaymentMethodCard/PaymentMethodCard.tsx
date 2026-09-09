import CardMop from "../../CardMop/CardMop";
import { PaymentDetailLine } from "../../../types/payment";

interface PaymentMethodCardProps {
  /** Payment method travels per statement line in most flows' review/confirm payloads. */
  detailLine?: PaymentDetailLine;
  automationId: string;
}

/**
 * Renders a `PaymentDetailLine`'s payment method via `CardMop` — for any flow
 * that reads its payment method off `paymentDetails[]` rather than a
 * top-level `paymentMethod` object.
 */
const PaymentMethodCard = ({ detailLine, automationId }: PaymentMethodCardProps) => (
  <CardMop
    automationId={automationId}
    type={detailLine?.type?.toLowerCase()}
    paymentProviderId={detailLine?.paymentProviderId}
    mopDetails={detailLine?.cclast4 ?? ""}
  />
);

export default PaymentMethodCard;
