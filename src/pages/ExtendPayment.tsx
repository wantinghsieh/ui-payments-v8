import { useState, useEffect } from "react";
// icons & css
import chevronLeft from "../assets/icons/chevron-left.svg";
// components
import ExtendPayStatementTemplate from "../templates/ExtendPayStatementTemplate";
import ExtendPaySetupTemplate from "../templates/ExtendPaySetupTemplate";
import ExtendPayReviewTemplate from "../templates/ExtendPayReviewTemplate";
import ExtendPayConfirmTemplate from "../templates/ExtendPayConfirmTemplate";
import { Spinner } from "@cox/core-ui8/dist/Spinner";
import OktaErrorTemplate from "../templates/OktaErrorTemplate";
import ErrorAlert from "../components/Alerts/ErrorAlert";

const ExtendPayment = ({
  sections,
  customerType,
  setCoxAppContentUrl,
}: any) => {
  const { payment = {} } = sections;
  // paymentData drives which page/template is rendered; updated after each step's POST response.
  const [paymentData, setPaymentData] = useState(payment);
  // formError is owned here so it can be reset on page navigation, but managed by ExtendPayStatementTemplate.
  const [formError, setFormError] = useState(false);

  // Redirect the browser when the backend signals a full-page redirection.
  useEffect(() => {
    if (paymentData?.redirection) {
      window.location.href = paymentData.redirectionTo;
    }
  }, [paymentData?.redirection]);

  // Reset form error state whenever the user moves to a different step,
  // preventing stale validation errors from the "setup" page from persisting on return.
  useEffect(() => {
    setFormError(false);
  }, [paymentData.pageName]);

  // Notify the parent app of the CoxApp content URL once the confirm page is reached.
  useEffect(() => {
    if (paymentData.pageName === "confirm" && paymentData?.coxAppContent?.url) {
      setCoxAppContentUrl(paymentData.coxAppContent.url);
    }
  }, [paymentData.pageName, paymentData?.coxAppContent?.url]);

  // Advances to the next page by replacing paymentData with the POST response.
  const handlePostSubmitResponse = (data: any) => {
    console.log("Submit POST Response is returned");
    setPaymentData(data);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-container text-start">
      {/* Show a full-page spinner while the backend-initiated redirect is in flight */}
      {!paymentData?.redirection ? (
        <div
          id="extend-payment"
          className={`${customerType === "business" ? "page-layout-cb" : ""}`}
        >
          {/* Top navigation bar: back link and conditional print link on confirm */}
          <div className="navigation-back d-flex justify-content-between pb-0">
            <a
              href={paymentData.navigateTo}
              data-testid="extend-payment-navigation-back-link"
            >
              <span>
                <img src={chevronLeft} alt="chevronLeft" />
              </span>
              Billing home
            </a>
            {paymentData.pageName === "confirm" &&
              paymentData?.paymentConfirmDetails?.paymentStatus !==
              "failed" && (
                <span>
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
                </span>
              )}
          </div>
          {formError && (
            <ErrorAlert
              id="extend-pay-form-error-alert"
              message="Please correct the items marked below to continue."
            />
          )}
          <div>
            <h3 className="header-text">{paymentData.headerText}</h3>
            <p className="body-text">{paymentData.secondaryHeaderText}</p>
          </div>

          {/* Step router: renders the appropriate template based on pageName */}
          <div className="payments-container">
            {/* Step 1: statement selection and payment amount */}
            {paymentData.pageName === "setup" && (
              <ExtendPayStatementTemplate
                payment={paymentData}
                onPostSubmitResponse={handlePostSubmitResponse}
                formError={formError}
                setFormError={setFormError}
              />
            )}

            {/* Step 2: payment date setup */}
            {paymentData.pageName === "setup-paymentdate" && (
              <ExtendPaySetupTemplate
                payment={paymentData}
                onPostSubmitResponse={handlePostSubmitResponse}
                customerType={customerType}
                setPaymentData={setPaymentData}
              />
            )}

            {/* Step 3: review payment details before submitting */}
            {paymentData.pageName === "review" && (
              <ExtendPayReviewTemplate
                payment={paymentData}
                onPostSubmitResponse={handlePostSubmitResponse}
                customerType={customerType}
                setPaymentData={setPaymentData}
              />
            )}

            {/* Step 4: confirmation screen after successful payment */}
            {paymentData.pageName === "confirm" && (
              <ExtendPayConfirmTemplate
                payment={paymentData}
                onPostSubmitResponse={handlePostSubmitResponse}
                customerType={customerType}
                setPaymentData={setPaymentData}
              />
            )}

            {/* Error page (e.g. Okta authentication failure) */}
            {paymentData?.pageName === "error" && (
              <OktaErrorTemplate
                payment={paymentData}
                customerType={customerType}
                showHeader={false}
              />
            )}
          </div>
        </div>
      ) : (
        <Spinner
          size={"xl"}
          style={{ display: "flex", justifyContent: "center", width: "100%" }}
        />
      )}
    </div>
  );
};

export default ExtendPayment;
