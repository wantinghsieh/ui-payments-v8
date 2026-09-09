import { useState } from "react";
import chevronLeft from "../../assets/icons/chevron-left.svg";
import { Badge, Modal, ModalTypes, RichText } from "@cox/core-ui8";
import Button, { ButtonTypes } from "@cox/core-ui8/dist/Button";
import Toggle, { ToggleLabelDisplay, ToggleValue } from "@cox/core-ui8/dist/Toggle";
import Banner, { BannerType, BannerVariation } from "@cox/core-ui8/dist/Banner";
import { useAxios } from "@cox/core-ui8/dist/useAxios";
import { isPrototypeUrl } from "../../utils/helper-utlities";
import { buildCancelEasyPayRequest, buildStepRequest } from "../../services/paymentsService";
import {
  PREPAID_AUTOMATIC_RECHARGE_CANCEL_SUCCESS_PROTOTYPE,
  PREPAID_AUTOMATIC_RECHARGE_LANDING_PAGE_PROTOTYPE,
} from "../../hooks/constants";
import { usePaymentStepSubmit } from "../../hooks/usePaymentStepSubmit";
import { PaymentData } from "../../types/payment";
import Throbber from "../../components/common/Throbber";

interface PrepaidAutomaticRechargeManageTemplateProps {
  payment: PaymentData;
  setPaymentData: (data: PaymentData) => void;
}

const CANCEL_WARNING_MESSAGE = "This will cancel any scheduled payments.";
const CANCEL_FAILED_MESSAGE = "Cancel EasyPay failed";
const CANCEL_ERROR_MESSAGE = "Something went wrong. Please try later.";

/**
 * Simulates the cancel-EasyPay outcome in the prototype environment — success,
 * a business-logic failure, or a network/server error — so every outcome the
 * design calls for can be exercised without a live backend. Not meaningful in
 * production, where `buildCancelEasyPayRequest` hits the real endpoint.
 */
const simulateCancelEasyPay = (): Promise<"success" | "failed" | "error"> =>
  new Promise((resolve) => {
    setTimeout(() => {
      const roll = Math.random();
      resolve(roll > 0.66 ? "failed" : roll > 0.33 ? "error" : "success");
    }, 1200);
  });

/**
 * Prepaid automatic recharge manage view: toggling EasyPay off opens the
 * cancel-confirmation modal; confirming cancels enrollment (or surfaces a
 * failure/error banner inside the modal and leaves EasyPay on).
 */
const PrepaidAutomaticRechargeManageTemplate = ({
  payment,
  setPaymentData,
}: PrepaidAutomaticRechargeManageTemplateProps) => {
  const { statements = [] } = payment;
  const [firstStatement = {}] = statements;
  const {
    statementCode,
    name: serviceName = "StraightUp Internet",
    paymentMethod,
    expired,
    enrolled: initiallyEnrolled,
  } = firstStatement;
  const statementLabel = `Statement ${statementCode}: ${serviceName}`;

  const [enrolled, setEnrolled] = useState(initiallyEnrolled);
  const [toggleKey, setToggleKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelErrorMessage, setCancelErrorMessage] = useState("");

  const { isSubmitting, submit } = usePaymentStepSubmit({
    flow: "prepaid-automatic-recharge",
    onSuccess: setPaymentData,
  });

  const { axiosAPI: axiosAPIForCancel } = useAxios({
    autoFetch: false,
    onCompleted: (data: PaymentData) => handleCancelResponse(data),
    onError: (error: unknown) => {
      console.log("onAjaxError", error);
    },
  });

  const handleToggleChange = (event: any) => {
    if (event.target.checked) {
      setEnrolled(true);
      return;
    }
    // Keep the toggle visually on until the cancel is confirmed in the modal.
    setEnrolled(true);
    setToggleKey((prev) => prev + 1);
    setShowModal(true);
  };

  const handleStayEnrolled = () => {
    setShowModal(false);
    setCancelErrorMessage("");
    setEnrolled(true);
    setToggleKey((prev) => prev + 1);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCancelErrorMessage("");
  };

  const handleCancelResponse = (data: PaymentData) => {
    if ((data?.successMessages?.length ?? 0) > 0) {
      // cancel-easypay-put.rest only signals success/failure — it doesn't
      // return the full pageName/statements payload the page shell needs, so
      // reload for the server to render the updated enrollment state (same
      // as the Okta flow).
      window.location.reload();
    }
    if ((data?.errorMessages?.length ?? 0) > 0) {
      setIsCancelling(false);
      setCancelErrorMessage(data.errorMessages![0]);
      setEnrolled(true);
      setToggleKey((prev) => prev + 1);
    }
  };

  const handleConfirmCancel = async () => {
    if (isCancelling) return;
    setIsCancelling(true);
    setCancelErrorMessage("");

    if (isPrototypeUrl()) {
      const outcome = await simulateCancelEasyPay();
      setIsCancelling(false);
      if (outcome === "success") {
        window.location.href = PREPAID_AUTOMATIC_RECHARGE_CANCEL_SUCCESS_PROTOTYPE;
        return;
      }
      setCancelErrorMessage(
        outcome === "failed" ? CANCEL_FAILED_MESSAGE : CANCEL_ERROR_MESSAGE,
      );
      setEnrolled(true);
      setToggleKey((prev) => prev + 1);
      return;
    }

    try {
      await axiosAPIForCancel(buildCancelEasyPayRequest({ statementCode }));
    } catch (error) {
      console.error("Error:", error);
      setIsCancelling(false);
    }
  };

  const handleChangePaymentMethod = () => {
    submit(
      "setup-mop",
      buildStepRequest("prepaid-automatic-recharge", "setup-mop", { statementCode }),
    );
  };

  const handleBreadcrumbNavigation = () => {
    if (isPrototypeUrl()) {
      window.location.href = PREPAID_AUTOMATIC_RECHARGE_LANDING_PAGE_PROTOTYPE;
    } else {
      window.location.reload();
    }
  };

  return (
    <>
      <Throbber show={isCancelling || isSubmitting} />

      <div className="manage-template-container" data-automation-id="manage-statement-template">
        <div className="link__container" data-testid="link-container">
          <a
            href="/payments/prepaid-automatic-recharge.html"
            onClick={(event) => {
              event.preventDefault();
              handleBreadcrumbNavigation();
            }}
            className="link__anchor"
          >
            <img src={chevronLeft} className="link__icon" alt="chevronLeft" />
            EasyPay
          </a>
        </div>

        <div className="headline">Manage EasyPay automatic payments</div>

        <div className="statements-list">
          <div className="statement">
            <div className="statement-details">
              <span className="statement-code-details">{statementLabel}</span>
              <span className="payment-details">EasyPay automatic payments</span>
            </div>
            <Toggle
              key={toggleKey}
              id="easypay-toggle"
              name="enrollmentStatus"
              label={enrolled ? ToggleValue.selected : ToggleValue.default}
              labelDisplay={ToggleLabelDisplay.left}
              selected={enrolled}
              value={enrolled ? ToggleValue.selected : ToggleValue.default}
              onChange={handleToggleChange}
            />
          </div>
          <div className="statement">
            <div className="statement-details">
              <span className="statement-code-details">Payment method</span>
              <span className="payment-details">
                {paymentMethod} {expired && <Badge id="mop-expired-badge" text="Expired" />}
              </span>
            </div>
            <Button
              text="Change"
              customClickEvent={handleChangePaymentMethod}
              buttonTypes={ButtonTypes.SECONDARY}
              data-automation-id="manage-change-payment-method-button"
            />
          </div>
        </div>

        {showModal && (
          <Modal
            modalId="cancel-easy-pay"
            show={showModal}
            componentName="cancel-easy-pay"
            handleClose={handleCloseModal}
            responsive={true}
            backdrop="static"
            modalType={ModalTypes.custom}
            title="Cancel EasyPay"
            secondaryBtnText={cancelErrorMessage ? "" : "Stay enrolled"}
            secondaryBtnClick={handleStayEnrolled}
            primaryBtnText={cancelErrorMessage ? "Close" : "Confirm"}
            primaryBtnClick={cancelErrorMessage ? handleCloseModal : handleConfirmCancel}
          >
            <div className="modal-content-container" data-automation-id="cancel-easypay-modal">
              {cancelErrorMessage ? (
                <Banner
                  bannerType={BannerType.DYNAMIC}
                  variation={BannerVariation.ERROR}
                  message={cancelErrorMessage}
                  iconPath="/content/dam/cox/common/icons/ui_components/circle-exclamation-moderate-red.svg"
                />
              ) : (
                <>
                  <RichText
                    text="Are you sure you would like to turn off EasyPay automatic payments for the statement below?"
                    isParsed={true}
                    className="cox-text-title1-medium"
                  />
                  <Banner
                    bannerType={BannerType.DYNAMIC}
                    variation={BannerVariation.WARNING}
                    message={CANCEL_WARNING_MESSAGE}
                    iconPath="/content/dam/cox/common/icons/ui_components/circle-exclamation-pure-orange.svg"
                  />
                  <div className="config-card">{statementLabel}</div>
                </>
              )}
            </div>
          </Modal>
        )}
      </div>
    </>
  );
};

export default PrepaidAutomaticRechargeManageTemplate;
