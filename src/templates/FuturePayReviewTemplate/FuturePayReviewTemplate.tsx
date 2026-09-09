import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { Link } from "react-router-dom";
import { useAxios } from "@cox/core-ui8/dist/useAxios";
import { Button, ButtonStates, ButtonTypes, FormMessage, MessageStatus, Modal } from "@cox/core-ui8";
// components
import CardMop from "../../components/CardMop/CardMop";
// utils
import {
  FUTURE_PAYMENT_CONFIRM_URL,
  FUTURE_PAYMENT_SETUP_MOP_PROTOTYPE,
  FUTURE_PAYMENT_BACKBUTTON_URL,
  FUTURE_PAYMENT_CONFIRM_PROTOTYPE,
  FUTURE_PAYMENT_CB_SETUP_MOP_PROTOTYPE,
  FUTURE_PAYMENT_CB_CONFIRM_PROTOTYPE,
  FUTURE_PAYMENT_CB_CONFIRM_URL,
  FUTURE_PAYMENT_CB_BACKBUTTON_URL
} from "../../hooks/constants";
import { setUDOVariables } from "../../hooks/utils";
import { Spinner } from "@cox/core-ui8/dist/Spinner";
import ErrorAlert from '../../components/Alerts/ErrorAlert';
import WarningAlert from "../../components/Alerts/WarningAlert";

function FuturePayReviewTemplate({
  payment,
  onPostSubmitResponse,
  customerType,
  setPaymentData,
}: any) {
  const {
    futurePayReviewDetails = {},
    udoVariables = {},
  } = payment;

  interface RequestParams {
    [key: string]: string | undefined;
  }

  const [isTncChecked, setIsTncChecked] = useState<boolean>(false);
  const [isEasyPayChecked, setIsEasyPayChecked] = useState<boolean>(false);
  const [isPaperlessChecked, setIsPaperlessChecked] = useState<boolean>(false);
  const [errors, setErrors] = useState("");
  const [modalShowPayment, setModalShowPayment] = useState(false);
  const [modalHeader, setModalHeader] = useState("");
  const [modalData, setModalData] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTimeout(function () {
      setUDOVariables(udoVariables);
    }, 0);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const hasAlerts =
      futurePayReviewDetails?.warningMessages?.length > 0 ||
      futurePayReviewDetails?.cardExpiredWarning;

    if (hasAlerts) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [
    futurePayReviewDetails?.warningMessages?.length,
    futurePayReviewDetails?.cardExpiredWarning
  ]);

  const handleOpenModalPayment = (
    modalHeader: string,
    modalData: string
  ) => {
    setModalHeader(modalHeader);
    setModalData(modalData);
    setModalShowPayment(true);
  };

  const handleCloseModalPayment = () => {
    setModalShowPayment(false);
  };

  const handleEasyPayChecked = (e: any) => {
    setIsEasyPayChecked(e.target.checked);
  };

  const handlePaperlessChecked = (e: any) => {
    setIsPaperlessChecked(e.target.checked);
  };

  const handleTermsAndConditionsChange = (event: any) => {
    setIsTncChecked(event.target.checked);
    if (!isTncChecked) {
      setErrors("");
    }
  };

  const { axiosAPI } = useAxios({
    autoFetch: false, // autoFetch will make a call on laod
    onCompleted: (data) => handleOnComplete(data)
  });

  const { axiosAPI: axiosAPIForBack } = useAxios({
    autoFetch: false, // autoFetch will make a call on load
    onCompleted: (data: any) => {
      onPostSubmitResponse(data);
      window.scrollTo(0, 0);
    },
    onError: (error) => {
      console.log("onAjaxError", error);
    },
  });

  const handleOnComplete = (data: any) => {
    if (data.pageName !== "error" && data?.errorMessages?.length > 0) {
      console.log("Server side validation are not successful.");
    } else {
      console.log("Server side validation is successful.");
      onPostSubmitResponse(data);
    }
    window.scrollTo(0, 0);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (isSubmitting) return;
    //setIsSubmitting(true);
    if (!isTncChecked) {
      setErrors("Please check this option to continue.");
      return;
    }
    setErrors("");
    setIsSubmitting(true);

    const currentUrl = window.location.href;
    if (currentUrl.includes("/ui/v8")) {
      window.location.href = customerType === "business" ? FUTURE_PAYMENT_CB_CONFIRM_PROTOTYPE : FUTURE_PAYMENT_CONFIRM_PROTOTYPE;
    }
    else {
      const requestParams: RequestParams = {};
      requestParams.isCheckBoxChecked = isTncChecked.toString();
      requestParams.isEasyPayChecked = isEasyPayChecked.toString();
      requestParams.isPaperlessChecked = isPaperlessChecked.toString();

      try {
        const host = window.location.origin;
        const url = customerType === "business" ? FUTURE_PAYMENT_CB_CONFIRM_URL : FUTURE_PAYMENT_CONFIRM_URL;
        axiosAPI({
          url: `${host}${url}`,
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": window?.RequestJson?.page?.reserved?.csrfToken
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
      window.location.href = customerType === "business" ? FUTURE_PAYMENT_CB_SETUP_MOP_PROTOTYPE : FUTURE_PAYMENT_SETUP_MOP_PROTOTYPE;
    } else {
      const requestParams: RequestParams = {};
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");

      requestParams.pageName = "setup-mop";
      if (id) {
        requestParams.id = id;
      }

      try {
        const url = customerType === "business" ? FUTURE_PAYMENT_CB_BACKBUTTON_URL : FUTURE_PAYMENT_BACKBUTTON_URL;
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

  const onAjaxResponseForBack = (data: any) => {
    setPaymentData(data);
  };

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
        modalId={`${customerType === "business" ? "easypay-terms-modal-cb" : "easypay-terms-modal"}`}
      >
        <p
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(modalData),
          }}
        ></p>
      </Modal>

      <div id="review-payments-container">

        {futurePayReviewDetails?.warningMessages?.length > 0 && (
          <>
            {futurePayReviewDetails?.warningMessages?.map((message: any, index: number) => (
              <div key={index}>
                <ErrorAlert
                  message={message}
                  id="future-payment"
                />
              </div>
            ))}
          </>
        )}
        {futurePayReviewDetails?.expiringSoon && (
          <WarningAlert
            message={futurePayReviewDetails?.expiringSoonWarning}
            id={"expiring-soon-warning"}
          />
        )}
        {futurePayReviewDetails?.cardExpiredWarning && (
          <ErrorAlert
            message={futurePayReviewDetails?.cardExpiredWarning}
            id={"card-expired-warning"}
          />
        )}
        {payment?.cbAlert && (
          <WarningAlert
            message={payment?.cbAlert}
            id={"expiring-soon-warning"}
          />
        )}

        {/* ACCOUNT DETAILS */}
        <div id="account-details-container">
          <h4 className="sub-header">Account details</h4>
          <div>
            <p className="body-content">
              <span>Account number:</span>{" "}
              {futurePayReviewDetails?.accountDetails?.accountNumber}
            </p>
            <p className="body-content">
              <span>Service Address:</span>{" "}
              {futurePayReviewDetails?.accountDetails?.serviceAddress}
            </p>
            <p className="body-content"></p>
          </div>
        </div>

        {/* PAYMENT METHOD - COMMON */}
        <div id="payment-method-container">
          <h4 className="sub-header">Payment method</h4>
          {/* TOKENIZED FLOW */}
          <CardMop
            mopDetails={futurePayReviewDetails?.paymentMethod.methodData.cardNumber}
            type={futurePayReviewDetails?.paymentMethod.methodData.type}
            paymentProviderId={futurePayReviewDetails?.paymentMethod?.methodData?.paymentProviderId}
            automationId={futurePayReviewDetails?.paymentMethod.methodData.type === "bank" ? "success-bank-account-number" : "success-card-number"}
          />
        </div>

        {/* BILLING - MULTI STATEMENT WITH PAST DUE */}
        {(payment?.futurePayReviewDetails?.billing && payment?.futurePayReviewDetails?.billing?.paymentAmount) && (
          <div id="billing-details-container">
            <h4 className="sub-header">Billing</h4>
            <p className="body-content">
              Payment amount:{" "}
              <b>${payment.futurePayReviewDetails.billing.paymentAmount}</b>
              <br />
              Payment date:{" "}
              <span>{futurePayReviewDetails?.billing?.paymentDate}</span>
            </p>
          </div>
        )}

        {/* PAYMENT DETAILS */}
        <div id="payment-details-container">
          <h4 className="sub-header">Payment details</h4>
          {futurePayReviewDetails?.paymentDetails?.map((statement: any) => {
            return (
              <p className="body-content">
                {customerType === "business" ? <span>Statement: {statement.serviceName}</span> : <span>Statement {statement.statementCode}: {statement.serviceName}</span>}
                <br />
                {statement.totalAmount && (
                  <>
                    Total: ${statement.totalAmount}
                    <br />
                  </>
                )}
              </p>
            );
          })}
        </div>

        {/*
          NOTE: the checkboxes below (easy-pay, paperless, terms-of-service-check) stay raw
          input/label markup instead of core-ui8's FormCheckbox because FormCheckbox's option
          label is a plain string (FormItemProps) with no children/ReactNode slot and no way to
          bind a click handler to part of the label. The terms-of-service label embeds an inline
          Link that opens a Terms modal on click — only that phrase is clickable, not the whole
          label — which isn't expressible as a string, so FormCheckbox can't render it.
        */}
        {/* TERMS AND CONDITIONS - COMMON */}
        <div id="tnc-container">
          {/* BILLING OPTIONS CONTAINER */}
          {(futurePayReviewDetails?.billingOptions?.showEasyPayCheckbox || futurePayReviewDetails?.billingOptions?.showPaperlessCheck) && (
            <>
              <h3 className="sub-header">
                Billing options<span className="sub-header-label">(Optional)</span>
              </h3>
              <div
                id="okta-otp-review-billing-options-container"
                className="sub-container"
              >
                {futurePayReviewDetails?.billingOptions?.showEasyPayCheckbox && (
                  <label className="custom-checkbox" htmlFor="easy-pay">
                    <input
                      type="checkbox"
                      id="easy-pay"
                      name="easy-pay"
                      aria-label="easy-pay-terms-of-service"
                      aria-required="true"
                      checked={isEasyPayChecked}
                      onChange={handleEasyPayChecked}
                      data-automation-id="review-terms-service-checkbox"
                    />
                    <span className="checkmark"></span>
                    <span className="checkbox-label"></span>

                    {customerType !== "business" && <label htmlFor="easy-pay">
                      {futurePayReviewDetails?.billingOptions?.clickToCancelText && (
                        <>
                          <div
                            className="click-to-cancel-text"
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(
                                futurePayReviewDetails?.billingOptions?.clickToCancelText
                              ),
                            }}
                          ></div>
                          <br />
                        </>
                      )}
                      <p>
                        By checking this box, I confirm that I have read and agree to
                        the{" "}
                        <Link
                          className="modal-link"
                          data-automation-id="easy-pay-terms-of-service-link"
                          onClick={(e: any) => {
                            e.preventDefault();
                            handleOpenModalPayment(
                              futurePayReviewDetails?.billingOptions?.easyPayModalHeader,
                              futurePayReviewDetails?.billingOptions?.easyPayModalBody
                            );
                          }}
                          role="button"
                          to="#"
                        >
                          EasyPay Terms of Service
                        </Link>
                        .
                      </p>
                    </label>
                    }

                    {/* {LABEL FOR CUSTOMER TYPE BUSINESS } */}
                    {customerType === "business" && (<label htmlFor="auto-pay">
                      <p>
                        Never miss a payment by saving and enrolling this payment
                        method in automatic monthly payments with Auto pay.
                        I have read and agree to the{" "}
                        <Link
                          className="modal-link"
                          data-automation-id="auto-pay-terms-of-service-link"
                          onClick={(e: any) => {
                            e.preventDefault();
                            handleOpenModalPayment(
                              futurePayReviewDetails?.billingOptions?.easyPayModalHeader,
                              futurePayReviewDetails?.billingOptions?.easyPayModalBody
                            );
                          }}
                          role="button"
                          to="#"
                        >
                          Autopay Terms of Service
                        </Link>
                        .
                      </p>
                    </label>)}
                  </label>
                )}

                {futurePayReviewDetails?.billingOptions?.showPaperlessCheck && (
                  <label className="custom-checkbox" htmlFor="paperless">
                    <input
                      type="checkbox"
                      id="paperless"
                      name="paperless"
                      aria-label="enroll-in-paperless-billing"
                      aria-required="true"
                      checked={isPaperlessChecked}
                      onChange={handlePaperlessChecked}
                      data-automation-id="review-terms-service-checkbox"
                    />
                    <span className="checkmark"></span>
                    <span className="checkbox-label"></span>

                    <label htmlFor="paperless">
                      <p>
                        Enroll in paperless billing. View your bill anytime, reduce
                        clutter and protect the environment. We'll send statement
                        reminders to{" "}
                        <span className="fw-bold">
                          {futurePayReviewDetails?.billingOptions?.mailId}.
                        </span>
                      </p>
                    </label>
                  </label>
                )}
              </div>
            </>
          )}
          <h4 className="sub-header tnc-header">
            Terms and Conditions
            <span className="sub-header-label">(Required)</span>
          </h4>
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

                <label
                  htmlFor="terms-of-service-check"
                // className={`${errors ? "errorLabel" : ""}`}
                >
                  {/* TERMS AND CONDITIONS FOR RESI */}
                  {customerType !== "business" && <span data-automation-id="review-terms-service-complete-text">
                    I have read and agree
                    to the{" "}
                    <Link
                      to="#"
                      onClick={(event) => {
                        event.preventDefault();
                        handleOpenModalPayment(
                          futurePayReviewDetails.futurePayTerms.headerText,
                          futurePayReviewDetails.futurePayTerms
                            .termsAndConditionsText
                        );
                      }}
                      role="button"
                      data-toggle="modal"
                      id="link-terms-of-service"
                      data-target="#easypay-terms-modal"
                      data-automation-id="review-easypay-terms-link"
                      className="modal-link"
                    >
                      Future Payments Terms of Service
                    </Link>
                    . Once you submit your payment, it can't be modified or canceled.
                  </span>
                  }

                  {/* TERMS AND CONDITIONS FOR BUSINESS */}
                  {customerType === "business" && <span data-automation-id="review-terms-service-complete-text">
                    I understand and agree to this payment cannot be canceled or modified
                    and that I have read and agreed to the {" "}
                    <Link
                      to="#"
                      onClick={(event) => {
                        event.preventDefault();
                        handleOpenModalPayment(
                          futurePayReviewDetails.futurePayTerms.headerText,
                          futurePayReviewDetails.futurePayTerms
                            .termsAndConditionsText
                        );
                      }}
                      role="button"
                      data-toggle="modal"
                      id="link-terms-of-service"
                      data-target="#easypay-terms-modal"
                      data-automation-id="review-easypay-terms-link"
                      className="modal-link"
                    >
                      Terms and Conditions.
                    </Link>
                  </span>
                  }
                </label>
              </label>
            </div>

            {/* ERRORS */}
            {errors && (
              <FormMessage
                id="future-pay-terms-error"
                status={MessageStatus.ERROR}
                message={errors}
              />
            )}

            {/* BUTTON CONTAINER */}
            <div id="easy-pay-button-container">
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
}

export default FuturePayReviewTemplate;
