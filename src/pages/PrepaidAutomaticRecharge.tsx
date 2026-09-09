import { useContext, useEffect } from "react";
import AlertList from "../components/common/AlertList";
import BreadcrumbPageHeader from "../components/common/BreadcrumbPageHeader";
import PaymentContext from "../context/PaymentContext";
import { setUDOVariables } from "../hooks/utils";
import { PaymentData } from "../types/payment";
import {
  PrepaidAutomaticRechargeLandingTemplate,
  PrepaidAutomaticRechargeManageTemplate,
  PrepaidAutomaticRechargeSetupTemplate,
  PrepaidAutomaticRechargeReviewTemplate,
  PrepaidAutomaticRechargeConfirmTemplate,
} from "../templates/PrepaidAutomaticRechargeTemplates";

interface PrepaidAutomaticRechargeProps {
  sections: { payment?: PaymentData };
  setCoxAppContentUrl?: (url: string) => void;
}

interface PaymentContextValue {
  paymentData: PaymentData;
  setPaymentData: (data: PaymentData) => void;
}

/**
 * Prepaid automatic recharge (EasyPay) flow, residential card-only. Data-driven,
 * single page URL (prepaid-automatic-recharge.html) whose `pageName` selects the
 * landing / manage / setup / review / confirm view — mirroring the PrepaidRecharge
 * page shell.
 */
function PrepaidAutomaticRecharge({
  sections,
  setCoxAppContentUrl,
}: PrepaidAutomaticRechargeProps) {
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
  // offering it on a successful enrollment when the flag is absent.
  const showPrint =
    paymentData?.paymentConfirmDetails?.showPrint ??
    paymentData?.paymentConfirmDetails?.paymentStatus
      ?.toLowerCase()
      ?.startsWith("succe");

  const coxAppContentUrl = paymentData?.coxAppContent?.url;
  useEffect(() => {
    if (isConfirm && coxAppContentUrl && setCoxAppContentUrl) {
      setCoxAppContentUrl(coxAppContentUrl);
    }
  }, [isConfirm, coxAppContentUrl, setCoxAppContentUrl]);

  // Landing/manage render their own breadcrumb + headline (styled via
  // .selection-template-container/.manage-template-container, matching
  // automatic-payments.html's layout) rather than the shared PageHeader.
  const ownsHeader =
    paymentData.pageName === "easyPay-statements" || paymentData.pageName === "manage-statement";

  return (
    <div
      id="prepaid-automatic-recharge"
      className={`page-container text-start${
        paymentData.pageName === "review"
          ? " prepaid-automatic-recharge-review-page"
          : ""
      }`}
    >
      {!ownsHeader && (
        <BreadcrumbPageHeader
          id="prepaid-automatic-recharge"
          backLinkLabel="Billing home"
          backLinkTestId="prepaid-automatic-recharge-navigation-back-link"
          navigateTo={paymentData.navigateTo}
          primaryHeader={
            paymentData.headerText ??
            paymentData.paymentConfirmDetails?.paymentDetailsInfo?.headerText
          }
          // Review/confirm pages render their own intro copy — see
          // PrepaidAutomaticRechargeReviewTemplate / PrepaidAutomaticRechargeConfirmTemplate.
          secondaryHeader={
            paymentData.pageName === "review" || paymentData.pageName === "confirm"
              ? undefined
              : paymentData.subHeaderText
          }
          showPrint={isConfirm && showPrint}
          onPrintClick={handlePrint}
        />
      )}

      <div className="payment-container">
        {paymentData.pageName === "easyPay-statements" && (
          <PrepaidAutomaticRechargeLandingTemplate
            payment={paymentData}
            onPostSubmitResponse={setPaymentData}
            setPaymentData={setPaymentData}
          />
        )}
        {paymentData.pageName === "manage-statement" && (
          <PrepaidAutomaticRechargeManageTemplate
            payment={paymentData}
            setPaymentData={setPaymentData}
          />
        )}
        {paymentData.pageName === "setup-mop" && (
          <PrepaidAutomaticRechargeSetupTemplate
            payment={paymentData}
            onPostSubmitResponse={setPaymentData}
            setPaymentData={setPaymentData}
          />
        )}
        {paymentData.pageName === "review" && (
          <PrepaidAutomaticRechargeReviewTemplate
            payment={paymentData}
            onPostSubmitResponse={setPaymentData}
            setPaymentData={setPaymentData}
          />
        )}
        {isConfirm && (
          <PrepaidAutomaticRechargeConfirmTemplate payment={paymentData} />
        )}
        {paymentData.pageName === "error" && (
          <AlertList alerts={paymentData.alerts} id="prepaid-automatic-recharge" />
        )}
      </div>
    </div>
  );
}

export default PrepaidAutomaticRecharge;
