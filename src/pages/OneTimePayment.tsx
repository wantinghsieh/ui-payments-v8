import React, { useContext, useEffect, useState } from 'react'
import StatementTemplate from '../templates/StatementTemplate';
import SetupMopTemplate from '../templates/SetupMopTemplate';
import ConfirmMopTemplate from '../templates/ConfirmMopTemplate';
import chevronLeft from '../assets/icons/chevron-left.svg';
import ReviewMopTemplate from '../templates/ReviewMopTemplate';
import PageHeader from '../components/PageHeader';
import { setUDOVariables } from '../hooks/utils';
import OktaErrorTemplate from '../templates/OktaErrorTemplate';
import PaymentContext from '../context/PaymentContext';

function OneTimePayment({ sections, customerType, setCoxAppContentUrl }: any) {
  const { payment = {} } = sections;

  const { paymentData, setPaymentData } = useContext<any>(PaymentContext);

  useEffect(() => {
    setPaymentData(payment);
  }, [payment]);

  useEffect(() => {
    if (paymentData?.udoVars) {
      setTimeout(function () {
        setUDOVariables(paymentData?.udoVars);
      }, 0);
    }
  }, [paymentData]);

  const doShowSetupMopCallback = (data: any) => {
    console.log("Submit POST Response is returned to show Setup Mop page");
    setPaymentData(data);
  };

  const doShowReviewCallback = (data: any) => {
    console.log("Submit POST Response is returned to show Review page");
    setPaymentData(data);
  }

  const doShowConfirmCallback = (data: any) => {
    console.log("Submit POST Response is returned to show Confirm page");
    setPaymentData(data);
  }
  const handlePrint = () => {
    window.print();
  };

  if (paymentData.pageName === "confirm" && paymentData?.coxAppContent?.url) {
    setCoxAppContentUrl(paymentData.coxAppContent.url);
  }

  return (
    <>
      <div id="one-time-payment" className={`page-container text-start ${customerType === "business" ? "page-layout-cb" : ""}`}>
        {customerType !== "business" && (
          <div className="navigation-back  d-flex justify-content-between">
            <a
              href={paymentData.navigateTo}
              data-testid="updateprofile-navigation-back-link"
            >
              <span>
                <img src={chevronLeft} alt="chevronLeft" />
              </span>
              Billing home
            </a>
            {(paymentData.pageName === "confirm" && paymentData?.paymentConfirmDetails?.paymentStatus !== "failed") && (
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
        )}
        {customerType !== "business" && (
          <PageHeader
            id="makepayment"
            primaryHeader={paymentData.headerText}
          />
        )}
        <div className="payment-container">
          {paymentData.pageName === "setup" && (
            <StatementTemplate
              payment={paymentData}
              onPostSubmitResponse={doShowSetupMopCallback}
            />
          )}
          {paymentData.pageName === "setup-mop" && (
            <SetupMopTemplate
              payment={paymentData}
              onPostSubmitResponse={doShowReviewCallback}
              customerType={customerType}
              setPaymentData={setPaymentData}
            />
          )}
          {paymentData.pageName === "review" && (
            <ReviewMopTemplate
              payment={paymentData}
              onPostSubmitResponse={doShowConfirmCallback}
              customerType={customerType}
              setPaymentData={setPaymentData}
            />
          )}
          {paymentData.pageName === "confirm" && (
            <ConfirmMopTemplate
              payment={paymentData}
              onPostSubmitResponse={doShowReviewCallback}
              customerType={customerType}
              setPaymentData={setPaymentData}
            />
          )}
          {paymentData?.pageName === "error" && (
            <OktaErrorTemplate payment={paymentData} customerType={customerType} showHeader={false} />
          )}
        </div>
      </div>
    </>
  );
}

export default OneTimePayment;
