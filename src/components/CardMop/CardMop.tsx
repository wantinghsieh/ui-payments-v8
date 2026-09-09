import { getMopIcon } from "../../utils/helper-utlities";

type CardMopProps = {
  automationId?: string;
  type?: string;
  classType?: string;
  mopDetails: string;
  paymentProviderId?: string;
};

const CardMop = ({ automationId, type, classType, mopDetails, paymentProviderId }: CardMopProps) => (
  <div id="mop-card" className="mop-container" data-testid={automationId}>
    <img
      className="mop-image"
      src={getMopIcon(type, classType, paymentProviderId)}
      alt="saved-mop-icon"
    />
    <span className="saved-mop-text">{mopDetails}</span>
  </div>
);

export default CardMop;
