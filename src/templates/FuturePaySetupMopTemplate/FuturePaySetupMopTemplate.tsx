import { useState, useEffect } from "react";
import {
  AlignmentProps,
  Button,
  ButtonStates,
  ButtonTypes,
  FormInput,
  FormInputTypes,
} from "@cox/core-ui8";
import { useAxios } from "@cox/core-ui8/dist/useAxios";
import {
  EASYPAY_ADD_CARD_URL,
  FETCH_TRUSTLY_METHOD_APPROVAL_URL,
  OKTA_ADD_CARD_URL,
  OKTA_EDIT_CARD_GET_URL,
  OKTA_EDIT_CARD_POST_URL,
  OKTA_DELETE_MOP_DATA_DELETE_GET_URL,
  OKTA_DELETE_MOP_DATA_DELETE_POST_URL,
  OKTA_MAKE_DEFAULT_MOP_DATA_POST_URL,
  FETCH_TRUSTLY_METHOD_APPROVAL_AUTH_URL,
  FUTURE_PAYMENT_STATEMENT_SELECTOR_PROTOTYPE,
  FUTURE_PAYMENT_REVIEW_URL,
  FUTURE_PAYMENT_BACKBUTTON_URL,
  FUTURE_PAYMENT_REVIEW_PROTOTYPE,
  FETCH_CB_TRUSTLY_METHOD_APPROVAL_AUTH_URL,
  OKTA_CB_ADD_CARD_URL,
  OKTA_CB_EDIT_CARD_GET_URL,
  OKTA_CB_EDIT_CARD_POST_URL,
  OKTA_CB_DELETE_MOP_DATA_DELETE_GET_URL,
  OKTA_CB_DELETE_MOP_DATA_DELETE_POST_URL,
  OKTA_CB_MAKE_DEFAULT_MOP_DATA_POST_URL,
  FUTURE_PAYMENT_CB_REVIEW_URL,
  FUTURE_PAYMENT_CB_REVIEW_PROTOTYPE,
} from "../../hooks/constants";
import { setUDOVariables, toLocalDateTimeString } from "../../hooks/utils";
import { SESSION_KEYS } from "../../hooks/SESSION_KEYS";
import AddPaymentMethod from "../../components/AddPaymentMethod";
import InfoAlert from "../../components/Alerts/InfoAlert";
import ErrorAlert from "../../components/Alerts/ErrorAlert";
import SuccessAlert from "../../components/Alerts/SuccessAlert";
import { FormMessage, MessageStatus } from "@cox/core-ui8";
import { Spinner } from "@cox/core-ui8/dist/Spinner";
import WarningAlert from "../../components/Alerts/WarningAlert";

interface FormErrors {
  [key: string]: string | undefined;
}

interface FormData {
  futureDate: string | Date;
}

interface RequestParams {
  [key: string]: string | undefined;
}

function FuturePaySetupMopTemplate({
  payment,
  onPostSubmitResponse,
  customerType,
  setPaymentData,
}: any) {
  const {
    pciChaseEncryptKeyJs = "",
    pciChaseEncryptJs = "",
    oktaLogin = false,
    savedMop = [],
    futurePayEligibilityError = "",
    paymentRestrictions = {},
    udoVariables = {},
    selectedDate = "",
  } = payment;

  const [activeTab, setActiveTab] = useState("existingPaymentMethods");
  const [errors, setErrors] = useState<FormErrors>({});
  const [checkclass, setCheckclass] = useState(() => {
    // 1) Prefer the explicitly selected card
    const selectedCard = savedMop?.find(
      (card: { selected?: boolean }) => card.selected,
    );
    // 2) Then the default card
    const defaultCard = savedMop?.find(
      (card: { isDefaultMop?: boolean }) => card.isDefaultMop,
    );
    // 3) Finally, just select the first card
    const firstCard = savedMop && savedMop.length > 0 ? savedMop[0] : undefined;

    return selectedCard?.mopId || defaultCard?.mopId || firstCard?.mopId || "";
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [showAlert, setShowAlert] = useState(true);
  const [showMopTab, setShowMopTab] = useState(true);
  const [formData, setFormData] = useState<FormData>(() => {
    if (selectedDate) {
      return { futureDate: new Date(selectedDate) };
    }
    const savedDate = sessionStorage.getItem(SESSION_KEYS.FUTURE_PAY_DATE);
    return { futureDate: savedDate ? new Date(`${savedDate}T00:00:00`) : "" };
  });
  const [successMsgSetupMopRMDModal, setSuccessMsgSetupMopRMDModal] =
    useState<string>("");
  const [expiringSoonMessages, setExpiringSoonMessages] = useState([]);
  const [expiredCardMessages, setExpiredCardMessages] = useState([]);

  const formButtons: any = oktaLogin
    ? [
        {
          isFormSubmit: false,
          buttonTypes: ButtonTypes.SECONDARY,
          text: "Back",
          cssClass: "review-buttons text-center mt-2 mb-2",
          customClickEvent: handleBackBtnClick,
          id: "back-btn",
        },
        {
          isFormSubmit: true,
          buttonTypes: ButtonTypes.PRIMARY,
          text: "Add Card",
          cssClass: "review-buttons text-center mt-2 mb-2",
          id: "add-btn",
        },
      ]
    : [
        {
          isFormSubmit: true,
          buttonTypes: ButtonTypes.PRIMARY,
          text: "Add Card",
          cssClass: "review-buttons text-center mt-2 mb-2",
          id: "add-btn",
        },
      ];

  // Date picker bounds: tomorrow is the earliest selectable date
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const currentUrl = window.location.href;
  // In prototype mode cap at +15 days; in the backend supplies maxcollectionDueDate
   const maxFutureDate = !currentUrl.includes("/ui/v8")
  ? new Date(`${payment.maxcollectionDueDate}T00:00:00`)
  : (() => {
      const d = new Date(today);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 15);
      return d;
    })();


  // Defer UDO variable setup to allow the DOM to settle before analytics fire
  useEffect(() => {
    setTimeout(function () {
      setUDOVariables(udoVariables);
    }, 0);
  }, []);

  /* Dynamically inject PCI Chase encryption scripts required for card tokenisation;
     clean them up on unmount to avoid duplicate script tags on re-render */
  useEffect(() => {
    const script1 = document.createElement("script");
    script1.src = pciChaseEncryptKeyJs;
    script1.async = true;
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.src = pciChaseEncryptJs;
    script2.async = true;
    document.head.appendChild(script2);

    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);

  // Sync the date picker when the parent provides a new selectedDate (e.g. back-navigation restore).
  // Guard on selectedDate so this never overwrites a session-restored value when selectedDate is empty.
  useEffect(() => {
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        futureDate: new Date(`${selectedDate}T00:00:00`),
      }));
    }
  }, [selectedDate]);

  useEffect(() => {
    /* If there is no savedMop then display the payment method */
    if (!savedMop || savedMop.length === 0) {
      setShowMopTab(false);
      if (paymentRestrictions?.restrictBankPayment) {
        setActiveTab("creditCard");
      } else {
        setActiveTab("bankAccount");
      }
    }
  }, [paymentRestrictions]);

  useEffect(() => {
    if (savedMop && savedMop.length > 0) {
      // For business customers with no bank MOP saved, default to the bank account tab
      // so they are prompted to add one rather than seeing an empty card list
      if (
        customerType === "business" &&
        !paymentRestrictions?.restrictBankPayment &&
        !payment?.addCardMopDetails &&
        !payment?.trustlyMethodApproval &&
        !payment?.updateCardMopDetails
      ) {
        const bankMopExists = savedMop?.some((mop: any) => mop.type === "BANK");
        if (!bankMopExists) {
          setActiveTab("bankAccount");
        }
      }
      const expiringSoonMops = savedMop
        ?.filter((card: any) => card.expiringSoon)
        .map((card: any) => card.expiringSoonWarning);
      setExpiringSoonMessages(expiringSoonMops);

      const expiredMops = savedMop
        ?.filter((card: any) => card.cardExpiredWarning)
        .map((card: any) => card.cardExpiredWarning);
      setExpiredCardMessages(expiredMops);
    }
  }, [savedMop]);

  // After a Trustly bank approval, auto-select the newly approved MOP in the list
  useEffect(() => {
    if (payment?.trustlyMethodApproval?.approvalStatus) {
      const selectedMopId = payment?.trustlyMethodApproval?.response;
      const selectedCard = savedMop?.find(
        (card: any) => card.mopId === selectedMopId,
      );
      setCheckclass(selectedCard?.mopId);
    }
  }, [payment?.trustlyMethodApproval]);

  const { axiosAPI } = useAxios({
    autoFetch: false, // autoFetch will make a call on laod
    onCompleted: (data: any) => {
      handleOnComplete(data);
    },
    onError: (error) => {
      console.log("onAjaxError", error);
    },
  });

  const clearDateSession = () => {
    sessionStorage.removeItem(SESSION_KEYS.FUTURE_PAY_DATE);
  };

  const handleOnComplete = (data: any) => {
    if (data.pageName !== "error" && data?.errorMessages?.length > 0) {
      setErrorMessages(data.errorMessages);
    } else {
      setErrorMessages([]);
      clearDateSession();
      onPostSubmitResponse(data);
    }
    window.scrollTo(0, 0);
  };

  // Auto-dismiss transient alerts after 10 seconds on non-prototype pages
  useEffect(() => {
    if (!window.location.href.includes("/ui/v8") && showAlert) {
      const timeoutId = setTimeout(() => {
        setShowAlert(false);
      }, 10000);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [showAlert]);

  // Whenever a new alert becomes visible, scroll to the top so the user sees it
  useEffect(() => {
    const hasAlerts =
      successMsgSetupMopRMDModal ||
      errorMessages?.length > 0 ||
      expiredCardMessages?.length > 0 ||
      errors?.futureDate ||
      payment?.trustlyMethodApproval?.approvalStatus === true ||
      payment?.trustlyMethodApproval?.approvalStatus === false ||
      payment?.addCardMopDetails?.status === "true" ||
      payment?.addCardMopDetails?.status === "false" ||
      payment?.updateCardMopDetails?.status === "true" ||
      payment?.messages?.successMessages?.length > 0;

    if (hasAlerts) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [
    successMsgSetupMopRMDModal,
    errorMessages?.length,
    expiredCardMessages?.length,
    errors?.futureDate,
    payment?.trustlyMethodApproval?.approvalStatus,
    payment?.addCardMopDetails?.status,
    payment?.updateCardMopDetails?.status,
    payment?.messages?.successMessages?.length,
  ]);

  /* On initial mount, restore scroll position to the top when returning from a reload
     (e.g. after add/edit MOP) or when the page loads with pre-existing alert states.
     Uses both requestAnimationFrame and a 100ms timeout to handle browsers that
     restore scroll position asynchronously after page load. */
  useEffect(() => {
    const shouldScrollAfterReload = sessionStorage.getItem(
      SESSION_KEYS.SCROLL_TO_TOP_AFTER_RELOAD,
    );
    const hasAlertsOnMount =
      payment?.messages?.successMessages?.length > 0 ||
      payment?.trustlyMethodApproval?.approvalStatus === true ||
      payment?.trustlyMethodApproval?.approvalStatus === false ||
      payment?.addCardMopDetails?.status ||
      payment?.updateCardMopDetails?.status;

    let restoredHistory = false;
    if (shouldScrollAfterReload === "true" || hasAlertsOnMount) {
      sessionStorage.removeItem(SESSION_KEYS.SCROLL_TO_TOP_AFTER_RELOAD);
      if (
        typeof window !== "undefined" &&
        "scrollRestoration" in window.history
      ) {
        window.history.scrollRestoration = "manual";
        restoredHistory = true;
      }
      window.scrollTo(0, 0);
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }

    return () => {
      if (
        restoredHistory &&
        typeof window !== "undefined" &&
        "scrollRestoration" in window.history
      ) {
        window.history.scrollRestoration = "auto";
      }
    };
  }, []);

  /* Function to handle the form submission */
  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    const newErrors: FormErrors = {};
    if (!formData.futureDate) {
      newErrors.futureDate = "This field is required.";
    }
    setErrors(newErrors);

    /* If there are no errors, proceed with form submission */
    if (Object.keys(newErrors).length === 0) {
      /* if there is no error then navigate to futurepayreview.html else validate payment info */
      if (currentUrl.includes("/ui/v8")) {
        clearDateSession();
        window.location.href =
          customerType === "business"
            ? FUTURE_PAYMENT_CB_REVIEW_PROTOTYPE
            : FUTURE_PAYMENT_REVIEW_PROTOTYPE;
      } else {
        /* Prepare request parameters for the API call and make required API call*/
        const requestParams: RequestParams = {};
        const dateObj = new Date(formData.futureDate);
        // Normalise to UTC midnight so the server always receives the date the user picked,
        // regardless of the browser's local timezone offset
        const futureDate = new Date(
          dateObj.getTime() - dateObj.getTimezoneOffset() * 60000,
        ).toISOString();
        if (checkclass) {
          requestParams.mopId = checkclass;
        }
        requestParams.futureDate = futureDate;
        const host = window.location.origin;
        const url =
          customerType === "business"
            ? FUTURE_PAYMENT_CB_REVIEW_URL
            : FUTURE_PAYMENT_REVIEW_URL;
        axiosAPI({
          url: `${host}${url}`,
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          data: JSON.stringify(requestParams),
        });
      }
    } else {
      setIsSubmitting(false);
    }
  };

  /* Back button: business customers navigate to the URL supplied by the server;
     residential prototype goes to the statement selector; backend posts to the back-button endpoint */
  async function handleBackBtnClick() {
    clearDateSession();
    if (customerType === "business") {
      return (window.location.href = payment?.navigateTo);
    }
    const currentUrl = window.location.href;
    if (currentUrl.includes("/ui/v8")) {
      window.location.href = FUTURE_PAYMENT_STATEMENT_SELECTOR_PROTOTYPE;
    } else {
      const host = window.location.origin;
      const url = FUTURE_PAYMENT_BACKBUTTON_URL;
      const requestParams: RequestParams = {};
      requestParams.pageName = "setup";
      axiosAPI({
        url: `${host}${url}`,
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": window?.RequestJson?.page?.reserved?.csrfToken,
        },
        data: JSON.stringify(requestParams),
      });
    }
  }

  /* Callback passed to AddPaymentMethod; handles add/edit/delete MOP responses.
     On error, surfaces messages inline; on success, reloads the page so the
     updated MOP list is fetched fresh from the server. */
  const handleResponse = (response: any) => {
    if (response?.messages?.errorMessages?.length > 0) {
      setPaymentData((prev: any) => ({
        ...prev,
        messages: response?.messages,
      }));
      const element = document.getElementById("future-payment");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      sessionStorage.setItem(SESSION_KEYS.SCROLL_TO_TOP_AFTER_RELOAD, "true");
      if (
        typeof window !== "undefined" &&
        "scrollRestoration" in window.history
      ) {
        window.history.scrollRestoration = "manual";
      }
      window.location.reload();
    }
  };

  // Clear stale success/error messages whenever the user switches payment method tabs
  useEffect(() => {
    if (activeTab !== "existingPaymentMethods") {
      setPaymentData((prev: any) => ({
        ...prev,
        successMessage: "",
      }));
    }

    setPaymentData((prev: any) => ({
      ...prev,
      errorMessage: "",
    }));
  }, [activeTab]);

  const handleSelectedFutureDate = (date: any) => {
    const picked = date[0];
    setFormData((prev: any) => ({
      ...prev,
      futureDate: picked,
    }));
    if (picked) {
      sessionStorage.setItem(SESSION_KEYS.FUTURE_PAY_DATE, toLocalDateTimeString(picked).split("T")[0]);
      setErrors({});
    } else {
      sessionStorage.removeItem(SESSION_KEYS.FUTURE_PAY_DATE);
    }
  };

  return (
    <>
      {isSubmitting && (
        <div className="throbber-container" data-automation-id="throbber">
          <Spinner size={"xl"} />
        </div>
      )}
      {!futurePayEligibilityError ? (
        <>
          {paymentRestrictions?.allPaymentRestricted ||
          (paymentRestrictions?.restrictBankPayment &&
            paymentRestrictions?.restrictCardPayment) ? (
            <>
              {oktaLogin ? (
                <ErrorAlert
                  message={
                    customerType === "business"
                      ? `<span>You're currently unable to use any payment methods. Please contact Customer Care for additional information and options.</span>`
                      : `<span data-automation-id="payment-restriction-alert-text">
                                    We're sorry for the inconvenience, but online payments via bank,
                                     credit or debit cards are not enabled on your account. Please
                                      make a payment in cash at any 
                                      <a href="/aboutus/contact-us/cox-centers.html">Spectrum Store</a>.
                                       <br> <br> 
                                       For more information, please <a href="/residential/contactus.html" class="chat-trigger">Chat with us</a>.
                                    </span>`
                  }
                  id="future-payment-payment-restriction-error"
                />
              ) : (
                <ErrorAlert
                  message={`<span data-automation-id="payment-restriction-alert-text">
                              We apologize for the inconvenience, but online payments and automatic FuturePay
                              transactions using bank accounts, credit, or debit cards are currently
                              unavailable on your account.
                              <br /><br />
                              To continue, please make your payment in cash at any <a href="/aboutus/contact-us/cox-centers.html">
                                Spectrum Store</a> or through an authorized third-party retailer. Thank you for your understanding.
                            </span>`}
                  id="future-pay-payment-restriction-error"
                />
              )}
            </>
          ) : (
            <>
              <div>
                {successMsgSetupMopRMDModal && (
                  <SuccessAlert
                    message={successMsgSetupMopRMDModal}
                    id="future-payment"
                  />
                )}
                {expiringSoonMessages?.length > 0 && (
                  <>
                    {expiringSoonMessages.map((message: any) => (
                      <WarningAlert
                        message={message}
                        id="expiring-soon-error"
                        key={message}
                      />
                    ))}
                  </>
                )}
                {payment?.isSPMAccount && (
                  <div className="pb-2">
                    <InfoAlert
                      message={`<span data-automation-id="spmAccount-alert-text">
                                                          This account is currently set up to accept Bank Account payments only. To explore other available payment methods, <a style="text-decoration: none;" href="https://www.cox.com/business/support/cox-business-bill-payment-methods.html" target="_blank"> click here </a> or select Chat at any time to connect with a representative directly.
                                                          </span>`}
                      id="one-time-payment"
                    />
                  </div>
                )}
                {customerType === "business" &&
                  paymentRestrictions?.restrictCardPayment &&
                  oktaLogin && (
                    <WarningAlert
                      message={
                        "You're currently unable to use a credit/debit card to pay your bill. Please try a different form of payment."
                      }
                      id="one-time-payment"
                    />
                  )}
                {customerType === "business" &&
                  paymentRestrictions?.restrictBankPayment &&
                  oktaLogin && (
                    <WarningAlert
                      message={
                        "You're currently unable to use a checking/savings account to pay your bill. Please try a different form of payment."
                      }
                      id="one-time-payment"
                    />
                  )}
                {expiredCardMessages?.length > 0 && (
                  <>
                    {expiredCardMessages.map((message: any) => (
                      <ErrorAlert
                        message={message}
                        id="expired-card-alert"
                        key={message}
                      />
                    ))}
                  </>
                )}
                {/* ALERTS WITH TIMER */}
                {showAlert && (
                  <>
                    {payment?.trustlyMethodApproval?.approvalStatus ===
                      true && (
                      <SuccessAlert
                        message={payment?.trustlyMethodApproval?.message}
                        id="future-payment"
                      />
                    )}
                    {payment?.trustlyMethodApproval?.approvalStatus ===
                      false && (
                      <ErrorAlert
                        message={payment?.trustlyMethodApproval?.message}
                        id="future-payment"
                      />
                    )}
                    {payment?.addCardMopDetails?.status === "true" && (
                      <SuccessAlert
                        message={payment?.addCardMopDetails?.successMessage}
                        id="future-payment"
                      />
                    )}
                    {payment?.addCardMopDetails?.status === "false" && (
                      <ErrorAlert
                        message={payment?.addCardMopDetails?.errorMessage}
                        id="future-payment"
                      />
                    )}
                    {payment?.updateCardMopDetails?.status === "true" && (
                      <SuccessAlert
                        message={payment?.updateCardMopDetails?.successMessage}
                        id="future-payment"
                      />
                    )}
                    {payment?.messages?.successMessages?.length > 0 && (
                      <>
                        {payment?.messages?.successMessages.map(
                          (message: any, index: number) => (
                            <div key={index}>
                              <SuccessAlert
                                message={message}
                                id="future-payment"
                              />
                            </div>
                          ),
                        )}
                      </>
                    )}
                    {errorMessages?.length > 0 && (
                      <>
                        {errorMessages.map((message: any, index: number) => (
                          <div key={index}>
                            <ErrorAlert message={message} id="future-payment" />
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
              <div
                id="future-pay-mop-setup"
                className="card-theme-futurepay ml-0"
              >
                <div className="payment-container future-pay payment-radio-buttons chat-payment pl-0 pr-0">
                  <div className="autoreg_content"></div>
                  <div className="future-date-picker">
                    <div className="future-datepicker-header">Payment date</div>
                    <div className="date-field">
                      <FormInput
                        type={FormInputTypes.DATEPICKER}
                        required={true}
                        requiredMessage="required"
                        name="futureDate"
                        id="futureDate"
                        title="Pay on"
                        onChange={(date) => handleSelectedFutureDate(date)}
                        value={formData.futureDate}
                        options={{
                          mode: "single",
                          enableTime: false,
                          shorthandCurrentMonth: true,
                          dateFormat: "m / d / Y",
                          minDate: tomorrow,
                          maxDate: maxFutureDate,
                        }}
                      />
                      {errors.futureDate && (
                        <FormMessage id="future-date" status={MessageStatus.ERROR} message={errors.futureDate} />
                      )}
                    </div>
                  </div>
                  <h3
                    data-automation-id="add-payment-method-header"
                    className="mt-4 add-payment-method-subheader"
                  >
                    Payment methods
                  </h3>
                  <div className="row">
                    <div className="col-sm-12 custom-payment-margin pl-0">
                      <AddPaymentMethod
                        id="future-payment"
                        payment={payment}
                        showExistingPaymentMethodsTab={showMopTab}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        showLinks={oktaLogin}
                        paymentRestrictions={paymentRestrictions}
                        checkclass={checkclass}
                        setCheckclass={setCheckclass}
                        formButtons={formButtons}
                        trustlyMethodUrl={
                          customerType === "business" && oktaLogin
                            ? FETCH_CB_TRUSTLY_METHOD_APPROVAL_AUTH_URL
                            : oktaLogin
                              ? FETCH_TRUSTLY_METHOD_APPROVAL_AUTH_URL
                              : FETCH_TRUSTLY_METHOD_APPROVAL_URL
                        }
                        saveCardApiUrl={
                          customerType === "business" && oktaLogin
                            ? OKTA_CB_ADD_CARD_URL
                            : oktaLogin
                              ? OKTA_ADD_CARD_URL
                              : EASYPAY_ADD_CARD_URL
                        }
                        getCardDataApiUrl={
                          customerType === "business"
                            ? OKTA_CB_EDIT_CARD_GET_URL
                            : OKTA_EDIT_CARD_GET_URL
                        }
                        updateCardDataApiUrl={
                          customerType === "business"
                            ? OKTA_CB_EDIT_CARD_POST_URL
                            : OKTA_EDIT_CARD_POST_URL
                        }
                        getDeleteMopApiUrl={
                          customerType === "business"
                            ? OKTA_CB_DELETE_MOP_DATA_DELETE_GET_URL
                            : OKTA_DELETE_MOP_DATA_DELETE_GET_URL
                        }
                        postDeleteMopApiUrl={
                          customerType === "business"
                            ? OKTA_CB_DELETE_MOP_DATA_DELETE_POST_URL
                            : OKTA_DELETE_MOP_DATA_DELETE_POST_URL
                        }
                        makeDefaultApiUrl={
                          customerType === "business"
                            ? OKTA_CB_MAKE_DEFAULT_MOP_DATA_POST_URL
                            : OKTA_MAKE_DEFAULT_MOP_DATA_POST_URL
                        }
                        flowName={oktaLogin ? "future-payment" : ""}
                        onResponse={handleResponse}
                        setSuccessMsgSetupMopRMDModal={
                          setSuccessMsgSetupMopRMDModal
                        }
                        isSPMAccount={payment?.spmaccount}
                        customerType={customerType}
                      />
                    </div>
                  </div>
                  <div className="form-group submit-button d-block d-md-flex pt-0 button-group mb-0">
                    {oktaLogin &&
                      (activeTab === "existingPaymentMethods" ||
                        activeTab === "bankAccount") && (
                        <div>
                          <Button
                            openInNewTab={false}
                            alignment={AlignmentProps.CENTER}
                            text="Back"
                            size=""
                            buttonStates={ButtonStates.ACTIVE}
                            buttonTypes={ButtonTypes.SECONDARY}
                            className="custom-secondary-btn"
                            customClickEvent={handleBackBtnClick}
                            data-automation-id="setup-back-button"
                          />
                        </div>
                      )}
                    {activeTab === "existingPaymentMethods" && (
                      <div className={`payment-submit-btn`}>
                        <Button
                          isFormSubmit={true}
                          openInNewTab={false}
                          alignment={AlignmentProps.CENTER}
                          text="Continue"
                          customClickEvent={handleSubmit}
                          size=""
                          buttonStates={ButtonStates.ACTIVE}
                          buttonTypes={ButtonTypes.PRIMARY}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <ErrorAlert
          message={futurePayEligibilityError}
          id="future-pay-eligibility-error"
        />
      )}
    </>
  );
}

export default FuturePaySetupMopTemplate;
