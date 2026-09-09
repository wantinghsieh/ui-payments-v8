import { useContext, useEffect } from "react";
import AlertList from "../components/common/AlertList";
import BreadcrumbPageHeader from "../components/common/BreadcrumbPageHeader";
import PaymentContext from "../context/PaymentContext";
import { setUDOVariables } from "../hooks/utils";
import { PaymentData } from "../types/payment";
import {
  PrepaidRechargeSetupTemplate,
  PrepaidRechargeReviewTemplate,
  PrepaidRechargeConfirmTemplate,
} from "../templates/PrepaidRechargeTemplates";

interface PrepaidRechargeProps {
  sections: { payment?: PaymentData };
  setCoxAppContentUrl?: (url: string) => void;
}

interface PaymentContextValue {
  paymentData: PaymentData;
  setPaymentData: (data: PaymentData) => void;
}

/**
 * Prepaid recharge / renewal flow (residential, card-only). Data-driven, single
 * page URL (prepaid-recharge.html) whose `pageName` selects the setup / review /
 * confirm view — mirroring the one-time-payment page shell but composed entirely
 * from the reusable prepaid templates and shared components.
 */
function PrepaidRecharge({ sections, setCoxAppContentUrl }: PrepaidRechargeProps) {
  const { payment = {} as PaymentData } = sections;
  // PaymentContext is created untyped (shared across flows); narrow it locally.
  const { paymentData, setPaymentData } = useContext<any>(
    PaymentContext,
  ) as PaymentContextValue;

  useEffect(() => {
    setPaymentData(payment);
  }, [payment]);

  useEffect(() => {
    if (paymentData?.udoVars) {
      setTimeout(() => setUDOVariables(paymentData.udoVars), 0);
    }
  }, [paymentData]);

  const handlePrint = () => window.print();

  const isConfirm = paymentData.pageName === "confirm";
  // The server decides whether the confirmation can be printed; fall back to
  // offering it on a successful payment when the flag is absent.
  const showPrint =
    paymentData?.paymentConfirmDetails?.showPrint ??
    paymentData?.paymentConfirmDetails?.paymentStatus === "success";

  const coxAppContentUrl = paymentData?.coxAppContent?.url;
  useEffect(() => {
    if (isConfirm && coxAppContentUrl && setCoxAppContentUrl) {
      setCoxAppContentUrl(coxAppContentUrl);
    }
  }, [isConfirm, coxAppContentUrl, setCoxAppContentUrl]);

  return (
    <div
      id="prepaid-recharge"
      className={`page-container text-start${
        paymentData.pageName === "review" ? " prepaidrecharge-review-page" : ""
      }`}
    >
      <BreadcrumbPageHeader
        id="prepaidrecharge"
        backLinkLabel="Billing home"
        backLinkTestId="prepaid-navigation-back-link"
        navigateTo={paymentData.navigateTo}
        primaryHeader={paymentData.headerText}
        secondaryHeader={paymentData.paymentReviewDetails?.reviewDescription}
        showPrint={isConfirm && showPrint}
        onPrintClick={handlePrint}
      />

      <div className="payment-container">
        {paymentData.pageName === "setup-mop" && (
          <PrepaidRechargeSetupTemplate
            payment={paymentData}
            onPostSubmitResponse={setPaymentData}
          />
        )}
        {paymentData.pageName === "review" && (
          <PrepaidRechargeReviewTemplate
            payment={paymentData}
            onPostSubmitResponse={setPaymentData}
            setPaymentData={setPaymentData}
          />
        )}
        {isConfirm && (
          <PrepaidRechargeConfirmTemplate payment={paymentData} />
        )}
        {paymentData.pageName === "error" && (
          <AlertList alerts={paymentData.alerts} id="prepaid-recharge" />
        )}
      </div>
    </div>
  );
}

export default PrepaidRecharge;
