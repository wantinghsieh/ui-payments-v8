import ErrorAlert from "../components/Alerts/ErrorAlert";
import StepIndicator from "../components/widgets/stepindicator/stepindicator";
import PaymentErrorTemplate from "../templates/PaymentErrorTemplate";

const PaymentError = ({ sections }: any) => {
  const { paymentError = {}, udoVars = {} } = sections;

  return (
    <div id="container" className="container add-payment-wrapper" tabIndex={-1}>
      <div className="col-12 col-lg-8 col-xl-8 mx-auto">
        <div className="card-theme-white mt-4 mb-4">
          <div className="page-container">
            <h3 className="error-payment-header" data-automation-id="new-payment-method-header">{paymentError.title}</h3>
            <ErrorAlert message={paymentError.errorMessage} id="payment-error" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentError;
