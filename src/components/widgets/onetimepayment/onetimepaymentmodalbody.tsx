interface OneTimePaymentModalBodyProps {
  oneTimePaymentData: string;
}

const OneTimePaymentModalBody: React.FC<OneTimePaymentModalBodyProps> = ({
  oneTimePaymentData,
}) => (
  <div className="row" data-automation-id="otp-terms-modal-text">
    {oneTimePaymentData}
  </div>
);

export default OneTimePaymentModalBody;
