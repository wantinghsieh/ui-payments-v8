import { useState } from "react";
import { Spinner } from "@cox/core-ui8/dist/Spinner";
import { Link } from "react-router-dom";
import Button, { ButtonStates, ButtonTypes } from "@cox/core-ui8/dist/Button";
import { useAxios } from "@cox/core-ui8/dist/useAxios";
import {
  EXTEND_PAYMENT_CONFIRM_PROTOTYPE,
  EXTEND_PAYMENT_CONFIRM_URL,
  EXTEND_PAYMENT_SETUP_PROTOTYPE,
  OKTA_FLOW_PAYMENT_BACK_URL,
} from "../../hooks/constants";
import { FormMessage, MessageStatus, Modal } from "@cox/core-ui8";
import DOMPurify from "dompurify";
import ErrorAlert from "../../components/Alerts/ErrorAlert";

interface RequestParams {
  [key: string]: string | undefined;
}

const ExtendPayReviewTemplate = ({
  payment,
  setPaymentData,
  onPostSubmitResponse,
}: any) => {
  const { paymentReviewDetails = {} } = payment;

  const [isTncChecked, setIsTncChecked] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState("");
  const [errorMessages, setErrorMessages] = useState([]);
  const [modalShowPayment, setModalShowPayment] = useState(false);
  const [modalHeader, setModalHeader] = useState("");
  const [modalData, setModalData] = useState("");

  const { axiosAPI: axiosAPIForConfirm } = useAxios({
    autoFetch: false, // autoFetch will make a call on laod
    onCompleted: (data: any) => {
      onAjaxResponseForReview(data);
    },
    onError: (error) => {
      console.error("onAjaxError", error);
    },
  });

  const { axiosAPI: axiosAPIForBack } = useAxios({
    autoFetch: false, // autoFetch will make a call on laod
    onCompleted: (data: any) => {
      onAjaxResponseForBack(data);
    },
    onError: (error) => {
      console.error("onAjaxError", error);
    },
  });

  const onAjaxResponseForBack = (data: any) => {
    setPaymentData(data);
    window.scrollTo(0, 0);
  };

  const onAjaxResponseForReview = (data: any) => {
    if (data?.pageName !== "error" && data?.errorMessages?.length > 0) {
      setErrorMessages(data.errorMessages);
    } else {
      onPostSubmitResponse(data);
    }
    window.scrollTo(0, 0);
  };

  const handleTermsAndConditionsChange = (event: any) => {
    setIsTncChecked(event.target.checked);
    if (!isTncChecked) {
      setErrors("");
    }
  };

  const handleOpenModalPayment = (modalHeader: string, modalData: string) => {
    setModalHeader(modalHeader);
    setModalData(modalData);
    setModalShowPayment(true);
  };

  const handleCloseModalPayment = () => {
    setModalShowPayment(false);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!isTncChecked) {
      setErrors("Please check this option to continue.");
      return;
    }
    setErrors("");
    setIsSubmitting(true);

    const currentUrl = window.location.href;
    if (currentUrl.includes("/ui/v8")) {
      window.location.href = EXTEND_PAYMENT_CONFIRM_PROTOTYPE;
      setIsSubmitting(false);
      return;
    } else {
      const requestParams: RequestParams = {};
      requestParams.isCheckBoxChecked = isTncChecked.toString();
      try {
        const host = window.location.origin;
        await axiosAPIForConfirm({
          url: `${host}${EXTEND_PAYMENT_CONFIRM_URL}`,
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          data: JSON.stringify(requestParams),
        });
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  async function handleBackBtnClick() {
    const currentUrl = window.location.href;
    if (currentUrl.includes("/ui/v8")) {
      window.location.href = EXTEND_PAYMENT_SETUP_PROTOTYPE;
    } else {
      const requestParams: RequestParams = {};
      requestParams.pageName = "setup-paymentdate";
      requestParams.flowName = "payment-extension";
      try {
        const url = OKTA_FLOW_PAYMENT_BACK_URL;
        const host = window.location.origin;
        await axiosAPIForBack({
          url: `${host}${url}`,
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          data: JSON.stringify(requestParams),
        });
      } catch (error) {
        console.error("Error:", error);
      }
    }
  }

  return (
    <>
      {isSubmitting && (
        <div className="throbber-container" data-automation-id="throbber">
          <Spinner size={"xl"} />
        </div>
      )}
      {/* MODAL FOR EASY PAY & ONE TIME PAYMENT TERMS */}
      <Modal
        title={modalHeader}
        description={modalData}
        isParsed={false}
        show={modalShowPayment}
        handleClose={handleCloseModalPayment}
        primaryBtnText="Close"
        primaryBtnClick={() => setModalShowPayment(false)}
        modalId="extend-payment-terms-modal"
      >
        <p
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(modalData),
          }}
        ></p>
      </Modal>
      <div id="extend-pay-container">
        {/* ALERT */}
        {errorMessages?.length > 0 && (
          <>
            {errorMessages.map((message: any, index: number) => (
              <div key={index}>
                <ErrorAlert message={message} id="one-time-payment" />
              </div>
            ))}
          </>
        )}
        {/* ACCOUNT DETAILS */}
        <div id="account-details-container">
          <h4 className="sub-header">Account details</h4>
          <div>
            <p className="body-content">
              <span>Account number:</span>{" "}
              {paymentReviewDetails?.accountDetails?.accountNumber}
            </p>
            <p className="body-content">
              <span>Service Address:</span>{" "}
              {paymentReviewDetails?.accountDetails?.serviceAddress}
            </p>
          </div>
        </div>

        {/* PAYMENT EXTENSION DATE */}
        <div id="payment-extension-date-container">
          <h4 className="sub-header">Payment extension date</h4>
          <p className="body-content">
            {paymentReviewDetails?.paymentExtensionDate && new Date(paymentReviewDetails.paymentExtensionDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}
          </p>
        </div>

        {/* MINIMUM AMOUNT DUE */}
        <div id="minimum-amount-due-container">
          <h4 className="sub-header">Minimum amount due</h4>
          <p className="body-content">
            ${paymentReviewDetails?.minimumAmountDue}
          </p>
        </div>

        {/*
          NOTE: the terms-of-service checkbox below stays raw input/label markup instead of
          core-ui8's FormCheckbox because FormCheckbox's option label is a plain string
          (FormItemProps) with no children/ReactNode slot and no way to bind a click handler to
          part of the label. The label embeds an inline Link that opens a Terms modal on click —
          only that phrase is clickable, not the whole label — which isn't expressible as a
          string, so FormCheckbox can't render it.
        */}
        {/* TERMS AND CONDITIONS */}
        <div id="tnc-container">
          <h4 className="sub-header">Terms and Conditions</h4>
          <form
            className="form wrap-errors collapse-form-validate"
            method="post"
            onSubmit={handleSubmit}
          >
            <div
              className="checkbox-container"
              data-content="ibill-verify-page"
            >
              <label
                className={`${errors ? "custom-checkbox-error" : ""} custom-checkbox`}
              >
                <input
                  type="checkbox"
                  id="terms-of-service-check"
                  name="time-terms-of-service"
                  aria-label="terms-of-service"
                  aria-required="true"
                  checked={isTncChecked}
                  onChange={handleTermsAndConditionsChange}
                  data-automation-id="review-terms-service-checkbox"
                />
                <span className="checkmark"></span>
                <span className="checkbox-label"></span>

                <label htmlFor="terms-of-service-check">
                  <span data-automation-id="review-terms-service-complete-text">
                    I have read and agree to the{" "}
                    <Link
                      to="#"
                      onClick={(event) => {
                        event.preventDefault();
                        handleOpenModalPayment(
                          payment?.termsAndConditions?.headerText,
                          payment?.termsAndConditions?.termsAndConditionsText,
                        );
                      }}
                      role="button"
                      data-toggle="modal"
                      id="link-terms-of-service"
                      data-target="#easypay-terms-modal"
                      data-automation-id="review-easypay-terms-link"
                      className="modal-link"
                    >
                      Payment Extension Terms of Service
                    </Link>
                    .
                  </span>
                </label>
              </label>
            </div>

            {/* ERRORS */}
            {errors && (
              <FormMessage
                id="extend-pay-terms-error"
                status={MessageStatus.ERROR}
                message={errors}
              />
            )}

            {/* BUTTON CONTAINER */}
            <div id="review-button-container">
              <Button
                openInNewTab={false}
                text="Back"
                size=""
                buttonStates={ButtonStates.ACTIVE}
                buttonTypes={ButtonTypes.SECONDARY}
                customClickEvent={handleBackBtnClick}
                data-automation-id="review-back-btn"
              />
              <Button
                isFormSubmit={true}
                openInNewTab={false}
                text="Submit"
                size=""
                buttonStates={ButtonStates.ACTIVE}
                buttonTypes={ButtonTypes.PRIMARY}
                data-automation-id="review-submit-btn"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ExtendPayReviewTemplate;
