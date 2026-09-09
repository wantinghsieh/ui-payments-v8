import { Button, ButtonTypes } from "@cox/core-ui8";
import chevronLeft from "../../assets/icons/chevron-left.svg";
import { isPrototypeUrl } from "../../utils/helper-utlities";
import { getPrototypeStepUrl, buildStepRequest } from "../../services/paymentsService";
import { usePaymentStepSubmit } from "../../hooks/usePaymentStepSubmit";
import { PaymentData } from "../../types/payment";
import AlertList from "../../components/common/AlertList";
import Throbber from "../../components/common/Throbber";

interface PrepaidAutomaticRechargeLandingTemplateProps {
  payment: PaymentData;
  onPostSubmitResponse: (data: PaymentData) => void;
  setPaymentData: (data: PaymentData) => void;
}

/**
 * Prepaid automatic recharge landing view. Shows each statement's EasyPay
 * enrollment status and routes to Setup (to enroll) or Manage (to review/
 * cancel) — prepaid accounts always return exactly one entry in `statements`.
 */
const PrepaidAutomaticRechargeLandingTemplate = ({
  payment,
  onPostSubmitResponse,
  setPaymentData,
}: PrepaidAutomaticRechargeLandingTemplateProps) => {
  const {
    statements = [],
    alerts = [],
    pageError,
    easyPayEligibilityError,
  } = payment;

  const { isSubmitting, submit } = usePaymentStepSubmit({
    flow: "prepaid-automatic-recharge",
    onSuccess: onPostSubmitResponse,
  });

  const handleEnroll = (statementCode?: string) => {
    submit(
      "setup-mop",
      buildStepRequest("prepaid-automatic-recharge", "setup-mop", { statementCode }),
    );
  };

  const handleManage = () => {
    if (isPrototypeUrl()) {
      const manageUrl = getPrototypeStepUrl(
        "prepaid-automatic-recharge",
        "manage-statement",
      );
      if (manageUrl) window.location.href = manageUrl;
      return;
    }
    setPaymentData({ ...payment, pageName: "manage-statement" });
  };

  return (
    <>
      <Throbber show={isSubmitting} />

      <div id="prepaid-automatic-recharge-landing" className="selection-template-container">
        <div className="link__container" data-testid="link-container">
          <a
            href={payment.navigateTo}
            className="link__anchor"
            data-testid="prepaid-automatic-recharge-navigation-back-link"
          >
            <img src={chevronLeft} className="link__icon" alt="chevronLeft" />
            Billing home
          </a>
        </div>

        <div className="easypay-header-container">
          <div className="headline" data-automation-id="easypay-landing-header">
            {payment.headerText}
          </div>
          <div className="sub-title" data-automation-id="easypay-landing-subheader">
            {payment.subTitle}
          </div>
        </div>

        <AlertList
          alerts={alerts}
          messages={[pageError, easyPayEligibilityError].filter(Boolean) as string[]}
          id="prepaid-automatic-recharge"
        />

        <div className="statements-list">
          {statements.map(({ statementCode, name, paymentMethod, enrolled }) => (
            <div className="statement" key={statementCode}>
              <div className="statement-details">
                <span className="statement-code-details" data-automation-id="easypay-landing-service-name">
                  {`Statement ${statementCode}: ${name}`}
                </span>
                <span className="payment-details">
                  EasyPay:{" "}
                  <span className={enrolled ? "enrolled" : "un-enrolled"}>
                    {enrolled ? "On" : "Off"}
                  </span>
                </span>
                {enrolled && paymentMethod && (
                  <span className="payment-details">{paymentMethod}</span>
                )}
              </div>
              <div className="statement-button">
                <Button
                  text={enrolled ? "Manage" : "Enroll"}
                  buttonTypes={ButtonTypes.SECONDARY}
                  customClickEvent={
                    enrolled ? handleManage : () => handleEnroll(statementCode)
                  }
                  data-automation-id="easypay-landing-action-button"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PrepaidAutomaticRechargeLandingTemplate;
