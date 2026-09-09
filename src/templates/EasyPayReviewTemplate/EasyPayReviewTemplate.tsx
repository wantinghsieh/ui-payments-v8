import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { Link } from "react-router-dom";
import { useAxios } from "@cox/core-ui8/dist/useAxios";
import { Button, ButtonStates, ButtonTypes, FormMessage, MessageStatus, Modal } from "@cox/core-ui8";
// css & icons
import chevronLeft from "../../assets/icons/chevron-left.svg";
import { formatDate } from "../../hooks/utils";
// components
import WarningAlert from "../../components/Alerts/WarningAlert";
import CardMop from "../../components/CardMop/CardMop";
// utils
import {
  EASYPAY_SETUP_PAGE_PROTOTYPE,
  EASYPAY_CONFIRM_PAGE_PROTOTYPE,
  EASYPAY_CONFIRM_POST_URL,
  EASYPAY_AUTHORIZATION_FAILED_URL,
  EASYPAY_CSRF_VALIDATION_FAILED_URL,
  EASYPAY_ERROR_PAGE_URL,
  TOKENIZED_FLOW_PAYMENT_BACK_URL,
  OKTA_EASYPAY_CONFIRM_PAGE_PROTOTYPE,
  OKTA_EASYPAY_SETUP_PAGE_PROTOTYPE,
  OKTA_FLOW_PAYMENT_BACK_URL,
  OKTA_EASYPAY_CONFIRM_POST_URL,
  OKTA_CB_EASYPAY_LANDING_PAGE_PROTOTYPE,
  OKTA_FLOW_CB_PAYMENT_BACK_URL,
  OKTA_CB_EASYPAY_CONFIRM_POST_URL,
  OKTA_CB_EASYPAY_CONFIRM_PAGE_PROTOTYPE
} from "../../hooks/constants";
import { setUDOVariables } from "../../hooks/utils";
import { Spinner } from "@cox/core-ui8/dist/Spinner";
import ErrorAlert from "../../components/Alerts/ErrorAlert";

function EasyPayReviewTemplate({
  payment,
  onPostSubmitResponse,
  customerType,
  setPaymentData,
}: any) {
  const {
    easyPayReviewDetails = {},
    udoVariables = {},
    oktaLogin = false,
  } = payment;

  interface RequestParams {
    [key: string]: string | undefined;
  }

  const [isTncChecked, setIsTncChecked] = useState<boolean>(false);
  const [isBillingOptChecked, setIsBillingOptChecked] =
    useState<boolean>(false);
  const [errors, setErrors] = useState("");

  const [modalShowPayment, setModalShowPayment] = useState(false);
  const [modalHeader, setModalHeader] = useState("");
  const [modalData, setModalData] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const getLabelForBackNavigation = payment?.navigateTo?.includes('ibill') ? 'Billing home' : 'Account overview';
  const currentDate = new Date();
  const [showAllCbPayments, setShowAllCbPayments] = useState(false);
  const [showApiError, setShowApiError] = useState(false);
  const cbStatements = easyPayReviewDetails?.paymentDetails || [];
  const showToggle = cbStatements.length > 2;
  const visibleStatements = showAllCbPayments ? cbStatements : cbStatements.slice(0, 2);


  useEffect(() => {
    setTimeout(function () {
      setUDOVariables(udoVariables);
    }, 0);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const hasAlerts =
      showApiError ||
      easyPayReviewDetails?.cardExpiredWarning

    if (hasAlerts) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [
    showApiError,
    easyPayReviewDetails?.cardExpiredWarning
  ]);

  const handleOpenModalPayment = (
    url: string,
    modalHeader: string,
    modalData: string
  ) => {
    // setModalUrlPayment(url);
    setModalHeader(modalHeader);
    setModalData(modalData);
    setModalShowPayment(true);
  };

  const handleCloseModalPayment = () => {
    setModalShowPayment(false);
  };

  const handleBillingOptionsChange = (event: any) => {
    setIsBillingOptChecked(event.target.checked);
  };

  const handleTermsAndConditionsChange = (event: any) => {
    setIsTncChecked(event.target.checked);
    if (!isTncChecked) {
      setErrors("");
    }
  };

  const { axiosAPI: axiosAPIForReview } = useAxios({
    autoFetch: false, // autoFetch will make a call on laod
    onCompleted: (data: any) => {
      handleOnComplete(data);
    },
    onError: (error) => {
      console.log("onAjaxError", error);
      if (customerType === "business" && oktaLogin) { setShowApiError(true); }
    },
  });

  const { axiosAPI: axiosAPIForBack } = useAxios({
    autoFetch: false, // autoFetch will make a call on load
    onCompleted: (data: any) => {
      onAjaxResponseForBack(data);
    },
    onError: (error) => {
      console.log("onAjaxError", error);
    },
  });

  const handleOnComplete = (data: any) => {
    if (!oktaLogin && data.redirectToErrorPage) {
      window.location.href = EASYPAY_ERROR_PAGE_URL;
      return;
    }

    if (!oktaLogin && typeof data.errorMessages === "undefined") {
      console.log("CSRF validation failed.");
      window.location.href = EASYPAY_CSRF_VALIDATION_FAILED_URL;
      return;
    }

    if (data?.pageName !== "error" && data?.errorMessages && data?.errorMessages?.length > 0) {
      console.log("Server side validation is not successful.");
      // display the error messages at top of the screen
      setErrors(data.errorMessages);
    } else {
      console.log("Server side validation is successful.");
      setErrors("");
      // Callback to parent which navigates user to review page
      onPostSubmitResponse(data);
    }
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setShowApiError(false);
    if (isSubmitting) return;

    if (!isTncChecked) {
      setErrors("Please check this option to continue.");
      return;
    }
    setErrors("");

    const currentUrl = window.location.href;
    if (currentUrl.includes("/ui/v8")) {
      window.location.href =
        oktaLogin && customerType === 'business'
          ? OKTA_CB_EASYPAY_CONFIRM_PAGE_PROTOTYPE
          : oktaLogin
            ? OKTA_EASYPAY_CONFIRM_PAGE_PROTOTYPE
            : EASYPAY_CONFIRM_PAGE_PROTOTYPE;
      return;
    }

    const requestParams: RequestParams = {};
    requestParams.isCheckBoxChecked = isTncChecked.toString();
    if (payment.oktaLogin) {
      // MIGHT NEED INTEGRATION CHANGES
      requestParams.isBillingOptionsChecked = isBillingOptChecked.toString();
    }

    //fetch token from url and send it in request parameter
    if (!oktaLogin) {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get("id");
      if (id) {
        requestParams.id = id;
      } else {
        const currentUrl = window.location.href;
        if (!currentUrl.includes("/ui/v8")) {
          window.location.href = EASYPAY_AUTHORIZATION_FAILED_URL;
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      const host = window.location.origin;
      const url = (customerType === "business" && oktaLogin) ? OKTA_CB_EASYPAY_CONFIRM_POST_URL : oktaLogin ? OKTA_EASYPAY_CONFIRM_POST_URL : EASYPAY_CONFIRM_POST_URL;
      await axiosAPIForReview({
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
    } finally {
      setIsSubmitting(false);
    }
  };

  async function handleBackBtnClick() {
    const currentUrl = window.location.href;
    if (currentUrl.includes("/ui/v8")) {
      window.location.href = (customerType === "business" && oktaLogin) ? OKTA_CB_EASYPAY_LANDING_PAGE_PROTOTYPE : oktaLogin ? OKTA_EASYPAY_SETUP_PAGE_PROTOTYPE : EASYPAY_SETUP_PAGE_PROTOTYPE;
    } else {
      const requestParams: RequestParams = {};
      if (!oktaLogin) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");

        requestParams.pageName = "setup";
        requestParams.flowName = "automatic-payments";
        if (id) {
          requestParams.id = id;
        }
      } else {
        requestParams.pageName = "setup";
        requestParams.flowName = "okta-automatic-payments";
      }

      try {
        const url = (customerType === "business" && oktaLogin) ? OKTA_FLOW_CB_PAYMENT_BACK_URL : oktaLogin ? OKTA_FLOW_PAYMENT_BACK_URL : TOKENIZED_FLOW_PAYMENT_BACK_URL;
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
    window.scrollTo(0, 0);
  };

  return (
    <>
      {/* MODAL FOR EASY PAY & ONE TIME PAYMENT TERMS */}
      <Modal
        title={modalHeader}
        description={modalData}
        isParsed={false}
        show={modalShowPayment}
        handleClose={handleCloseModalPayment}
        primaryBtnText="Close"
        primaryBtnClick={() => setModalShowPayment(false)}
        modalId="easypay-terms-modal"
      >
        <p
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(modalData),
          }}
        ></p>
      </Modal>

      {isSubmitting &&
        <div className="throbber-container" data-automation-id="throbber">
          <Spinner
            size={'xl'}
          />
        </div>
      }

      <div id="easy-pay-container">
        {/* Breadcrumb - OKTA FLOW */}
        {oktaLogin && customerType !== "business" && (
          <div className="navigation-back d-flex justify-content-between">
            <a href={payment.navigateTo}
              className='link__anchor'>
              <img src={chevronLeft} className='link__icon' alt="chevronLeft" />
              {getLabelForBackNavigation}
            </a>
          </div>
        )}

        {/* EASY PAY HEADER, ALERTS & SUB HEADER  */}
        <div className="review-details-container">
          {/* HEADER - COMMON */}
          <h3
            className="header"
            data-automation-id="review-submit-payment-text"
          >
            {(customerType === "business" && oktaLogin) ? "Review details for automatic payments with Autopay" : "Review details for automatic payments with EasyPay"}
          </h3>

          {/* ERROR ALERTS - OKTA FLOW */}
          {(oktaLogin && customerType === "business" && showApiError) && (
            <div className={`warning-container ${(customerType === "business" && oktaLogin) ? "business-container" : ""}`}>            
                  <ErrorAlert
                    message='Something went wrong. Please try again later.'
                    id={"auto-pay-error-alert"}
                  />
            </div>
          )}

          {/* WARNING ALERTS - OKTA FLOW */}
          {oktaLogin && payment?.messages?.warningMessages?.length > 0 && (
            <div className={`warning-container ${(customerType === "business" && oktaLogin) ? "business-container" : ""}`}>
              {payment?.messages?.warningMessages?.map((message: string) => {
                return (
                  <WarningAlert
                    message={message}
                    id={"easy-pay-warning-alert"}
                  />
                );
              })}
            </div>
          )}

          {/* WARNING ALERTS */}
          {(easyPayReviewDetails?.expiringSoon ||
            easyPayReviewDetails?.oneTimePayment ||
            easyPayReviewDetails?.scheduledPayment ||
            easyPayReviewDetails?.cardExpiredWarning) && (
              <div className={`warning-container ${(customerType === "business" && oktaLogin) ? "business-container" : ""}`}>
                {easyPayReviewDetails?.expiringSoon && (
                  <WarningAlert
                    message={easyPayReviewDetails?.expiringSoonWarning}
                    id={"expiring-soon-warning"}
                  />
                )}
                {easyPayReviewDetails?.oneTimePayment && (
                  <WarningAlert
                    message={easyPayReviewDetails?.immediatePaymentWarning}
                    id={"immediate-payment-warning"}
                  />
                )}
                {easyPayReviewDetails?.scheduledPayment && (
                  <WarningAlert
                    message={easyPayReviewDetails?.scheduledPaymentWarning}
                    id={"scheduled-payment-warning"}
                  />
                )}
                {easyPayReviewDetails?.cardExpiredWarning && (
                  <ErrorAlert
                    message={easyPayReviewDetails?.cardExpiredWarning}
                    id={"card-expired-warning"}
                  />
                )}
              </div>
            )}

          {easyPayReviewDetails?.achOfferAlertStatus && (
            <WarningAlert message={easyPayReviewDetails?.achOfferAlert} id={"ach-offer-alert"} />
          )}  

          {/* SUB HEADER - COMMON FOR RESI TYPE*/}
          {customerType !== "business" && (<p
            className="body-content"
            data-automation-id="review-payment-desc-text"
          >
            You're almost done. Just double check your information below. And
            remember, your account or card will always be charged on your
            monthly payment due date.
          </p>)}
        </div>

        {/* ACCOUNT DETAILS - OKTA FLOW */}
        {oktaLogin && (
          <div id="account-details-container">
            <h4 className="sub-header">Account details</h4>
            <div>
              <p className="body-content">
                <span>Account number:</span>{" "}
                {easyPayReviewDetails?.accountDetails?.accountNumber}
              </p>
              <p className="body-content">
                <span>Service Address:</span>{" "}
                {easyPayReviewDetails?.accountDetails?.serviceAddress}
              </p>
              <p className="body-content"></p>
            </div>
          </div>
        )}

        {/* PAYMENT METHOD - COMMON */}
        <div id="payment-method-container">
          <h4 className="sub-header">Payment method</h4>
          {/* TOKENIZED FLOW */}
          {!oktaLogin && (
            <CardMop
              automationId={
                easyPayReviewDetails.paymentMethod.type === "bank"
                  ? "review-bank-account-number"
                  : "review-card-number"
              }
              type={easyPayReviewDetails.paymentMethod.methodData.type}
              paymentProviderId={easyPayReviewDetails?.paymentMethod?.methodData?.paymentProviderId}
              mopDetails={
                easyPayReviewDetails.paymentMethod.methodData.cardNumber
              }
            />
          )}
          {/* OKTA FLOW */}
          {oktaLogin && (
            <CardMop
              automationId={
                payment.easyPayReviewDetails.paymentMethod.type === "bank"
                  ? "review-bank-account-number"
                  : "review-card-number"
              }
              type={payment.easyPayReviewDetails.paymentMethod.type}
              paymentProviderId={payment?.easyPayReviewDetails?.paymentMethod?.paymentProviderId}
              mopDetails={payment.easyPayReviewDetails.paymentMethod.cclast4}
            />
          )}
        </div>

        {/* BILLING - OKTA FLOW - MULTI STATEMENT WITH PAST DUE */}
        {(oktaLogin && payment?.easyPayReviewDetails?.billing && payment?.easyPayReviewDetails?.billing?.paymentAmount) && (
          <div id="billing-details-container">
            <h4 className="sub-header">Billing</h4>
            <p className="body-content">
              Payment amount:{" "}
              ${payment.easyPayReviewDetails.billing.paymentAmount}
              <br />
              Payment date:{" "}
              {formatDate(`${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getDate().toString().padStart(2, '0')}/${currentDate.getFullYear()}`)}
            </p>
          </div>
        )}

        {/* PAYMENT DETAILS - OKTA FLOW FOR RESIDENTIAL TYPE */}
        {customerType !== "business" && oktaLogin && (
          <div id="payment-details-container">
            <h4 className="sub-header">Payment details</h4>
            {easyPayReviewDetails?.paymentDetails?.map((statement: any) => {
              return (
                <p className="body-content">
                  Statement {statement.statementCode}: {statement.serviceName}
                  <br />
                  {statement.currentDue && (
                    <>
                      Currently due: ${statement.currentDue}
                      <br />
                    </>
                  )}
                  {/* {statement.nextPaymentDate && (
                    <>
                      Next payment date: {formatDate(statement.nextPaymentDate)}
                    </>
                  )} */}
                </p>
              );
            })}
          </div>
        )}

        {/* PAYMENT DETAILS - OKTA FLOW BUSINESS TYPE */}
        {customerType === "business" && oktaLogin && (
          <div id="payment-details-container">
            <h4 className="sub-header">Payment details</h4>
            {(() => {
              return (
                <>
                  {visibleStatements.map((statement: any) => (
                    <p key={statement.statementCode} className="body-content">
                      Statement: {statement?.serviceName}
                      <br />
                      {statement?.currentDue && (
                        <>
                          Currently due: ${statement?.currentDue}
                          <br />
                        </>
                      )}
                      {statement?.nextPaymentDate && (
                        <>
                          Next payment date: {formatDate(statement?.nextPaymentDate)}
                        </>
                      )}
                    </p>
                  ))}
                  {showToggle && (
                    <div className="viewAll"
                      onClick={() => setShowAllCbPayments(prev => !prev)}
                    >
                      {showAllCbPayments ? "View less" : "View all"}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/*
          NOTE: the checkboxes below (billing-options-check, terms-of-service-check) stay raw
          input/label markup instead of core-ui8's FormCheckbox because FormCheckbox's option
          label is a plain string (FormItemProps) with no children/ReactNode slot and no way to
          bind a click handler to part of the label. The terms-of-service label embeds an inline
          Link that opens a Terms modal on click — only that phrase is clickable, not the whole
          label — which isn't expressible as a string, so FormCheckbox can't render it.
        */}
        {/* BILLING OPTIONS - OKTA FLOW */}
        {oktaLogin &&
          payment?.easyPayReviewDetails?.billingOptions?.showPaperlessCheck && (
            <div id="billing-options-container">
              <h4 className="sub-header">
                Billing options
                <span className="sub-header-label">(Optional)</span>
              </h4>
              <div
                className="checkbox-container"
                data-content="ibill-verify-page"
              >
                <label className={`custom-checkbox`}>
                  <input
                    type="checkbox"
                    id="billing-options-check"
                    name="billing-options"
                    aria-label="billing-options"
                    aria-required="true"
                    checked={isBillingOptChecked}
                    onChange={handleBillingOptionsChange}
                    data-automation-id="review-billing-options-checkbox"
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-label"></span>

                  <label htmlFor="billing-options-check">
                    <span
                      className="body-content"
                      data-automation-id="review-billing-options-complete-text"
                    >
                      Enroll in paperless billing. View your bill anytime,
                      reduce clutter and protect the environment. We'll send
                      statement reminders to{" "}
                      <span className="fw-bold">
                        {payment?.easyPayReviewDetails?.billingOptions?.mailId}
                      </span>
                      .
                    </span>
                  </label>
                </label>
              </div>
            </div>
          )}

        {/* TERMS AND CONDITIONS - COMMON */}
        <div id="tnc-container">
          <h4 className="sub-header">
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

                  {/* FOR RESI TYPE */}
                  {(!oktaLogin || (oktaLogin && customerType === "residential")) && <span data-automation-id="review-terms-service-complete-text">
                    By checking this box, I confirm that I have read and agree
                    to the{" "}
                    <Link
                      to="#"
                      onClick={(event) => {
                        event.preventDefault();
                        handleOpenModalPayment(
                          "../../components/widgets/customModal/CustomModal.tsx",
                          easyPayReviewDetails.easyPayTerms.headerText,
                          easyPayReviewDetails.easyPayTerms
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
                      EasyPay Terms of Service
                    </Link>
                    {easyPayReviewDetails?.oneTimePayment && (
                      <>
                        {" "}
                        and{" "}
                        <Link
                          to="#"
                          onClick={(event) => {
                            event.preventDefault();
                            handleOpenModalPayment(
                              "../../components/widgets/customModal/CustomModal.tsx",
                              easyPayReviewDetails.oneTimePaymentTerms
                                .headerText,
                              easyPayReviewDetails.oneTimePaymentTerms
                                .termsAndConditionsText
                            );
                          }}
                          role="button"
                          data-toggle="modal"
                          id="link-terms-of-service"
                          data-target="#one-time-payment-terms-modal"
                          data-automation-id="review-onetimepayment-terms-link"
                          className="modal-link"
                        >
                          One Time Payment Terms of Service
                        </Link>
                      </>
                    )}
                    . <br />
                    <br />
                    <span
                      className="click-to-cancel-text"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          easyPayReviewDetails.clickToCancelText
                        ),
                      }}
                    ></span>
                  </span>
                  }
                  {/* FOR BUSINESS TYPE   */}
                  {(customerType === "business" && oktaLogin) && <span data-automation-id="review-terms-service-complete-text">
                    I have read and agree to the
                    {" "}
                    <Link
                      to="#"
                      onClick={(event) => {
                        event.preventDefault();
                        handleOpenModalPayment(
                          "../../components/widgets/customModal/CustomModal.tsx",
                          easyPayReviewDetails.easyPayTerms.headerText,
                          easyPayReviewDetails.easyPayTerms
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
                      Autopay Terms of Service
                    </Link>
                    .
                  </span>}

                </label>
              </label>
            </div>

            {/* ERRORS */}
            {errors && (
              <FormMessage
                id="easy-pay-terms-error"
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
                text="Enroll"
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

export default EasyPayReviewTemplate;
