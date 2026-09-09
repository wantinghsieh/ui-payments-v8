import { useContext, useEffect, useState } from "react";
// icons & css
import chevronLeft from "../assets/icons/chevron-left.svg";
// components
import FuturePaySetupTemplate from "../templates/FuturePaySetupTemplate";
import FuturePaySetupMopTemplate from "../templates/FuturePaySetupMopTemplate";
import FuturePayReviewTemplate from "../templates/FuturePayReviewTemplate";
import FuturePayConfirmTemplate from "../templates/FuturePayConfirmTemplate";
import ErrorAlert from "../components/Alerts/ErrorAlert";
import OktaErrorTemplate from "../templates/OktaErrorTemplate";
import PaymentContext from "../context/PaymentContext";
import { Spinner } from "@cox/core-ui8/dist/Spinner";

export interface Statement {
  statementCode: string;
  name: string;
  paymentMethod?: string;
  enrolled?: boolean;
  expired?: boolean;
  selected?: boolean;
}

const FuturePayment = ({ sections, customerType, setCoxAppContentUrl }: any) => {
  const { payment = {} } = sections;
  const [formError, setFormError] = useState<boolean>(false);

  /**  set initial paymentData from context **/
  const { paymentData, setPaymentData } = useContext<any>(PaymentContext);

  /** update the paymentData when the payment prop is updated **/
  useEffect(() => {
    setPaymentData(payment);
  }, [payment]);

  // Redirect the browser when the backend signals a full-page redirection
  // (FDP review/confirm session/state errors -> /ibill/ptp-error.html).
  useEffect(() => {
    if (paymentData?.redirection) {
      window.location.href = paymentData.redirectionTo;
    }
  }, [paymentData?.redirection]);

  const doShowSetupMopCallback = (data: any) => {
    console.log("Submit POST Response is returned to show Setup Mop tab");
    setPaymentData(data);
  };

  const doShowReviewCallback = (data: any) => {
    console.log("Submit POST Response is returned so show Review tab");
    setPaymentData(data);
  };

  const doShowConfirmCallback = (data: any) => {
    console.log("Submit POST Response is returned to show Confirm tab");
    setPaymentData(data);
  };

  const handlePrint = () => {
    window.print();
  };

  if (paymentData.pageName === "confirm" && paymentData?.coxAppContent?.url) {
    setCoxAppContentUrl(paymentData.coxAppContent.url);
  }

  // Show a full-page spinner while the backend-initiated redirect is in flight,
  // so the error payload (back-link/header/blank container) never flashes before navigation.
  if (paymentData?.redirection) {
    return (
      <div className={`page-container text-start ${customerType === "business" ? "page-layout-cb" : ""}`}>
        <Spinner
          size={"xl"}
          style={{ display: "flex", justifyContent: "center", width: "100%" }}
        />
      </div>
    );
  }

  return (
    <div className={`page-container text-start ${customerType === "business" ? "page-layout-cb" : ""}`}>
      <div id="future-payment">
        {customerType !== "business" && <div className="navigation-back d-flex justify-content-between pb-0">
          <a
            href={paymentData.navigateTo}
            data-testid="future-payment-navigation-back-link"
          >
            <span>
              <img src={chevronLeft} alt="chevronLeft" />
            </span>
            Billing home
          </a>
          {paymentData.pageName === "confirm" && paymentData?.paymentConfirmDetails?.paymentStatus !== "failed" && <span>
            <a
              href="#"
              title="Print"
              className="print-trigger no-print desktop-only"
              aria-label="Print confirmation"
              onClick={handlePrint}
              data-automation-id="confirm-print-confirmation-link"
            >
              Print
            </a>
          </span>}
        </div>}

        {formError && (
          <ErrorAlert
            id="future-pay-form-error-alert"
            message="Please correct the items marked below to continue."
          />
        )}

        {customerType !== "business" && <div>
          <h3 className="header-text">{paymentData.headerText}</h3>
          <p className="body-text">{paymentData.secondaryHeaderText}</p>
        </div>}

        <div className="payments-container">
          {paymentData.pageName === "setup" && (
            <FuturePaySetupTemplate
              payment={paymentData}
              onPostSubmitResponse={doShowSetupMopCallback}
              formError={formError}
              setFormError={setFormError}
            />
          )}

          {paymentData.pageName === "setup-mop" && (
            <FuturePaySetupMopTemplate
              payment={paymentData}
              onPostSubmitResponse={doShowReviewCallback}
              customerType={customerType}
              setPaymentData={setPaymentData}
            />
          )}

          {paymentData.pageName === "review" && (
            <FuturePayReviewTemplate
              payment={paymentData}
              onPostSubmitResponse={doShowConfirmCallback}
              customerType={customerType}
              setPaymentData={setPaymentData}
            />
          )}
          {paymentData.pageName === "confirm" && (
            <FuturePayConfirmTemplate
              payment={paymentData}
              onPostSubmitResponse={doShowConfirmCallback}
              customerType={customerType}
              setPaymentData={setPaymentData} />
          )}

          {paymentData?.pageName === "error" && (
            <OktaErrorTemplate payment={paymentData} customerType={customerType} showHeader={false} />
          )}
        </div>
      </div>
    </div>
  );
};

export default FuturePayment;
