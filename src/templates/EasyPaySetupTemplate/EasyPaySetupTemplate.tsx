import { useState, useEffect } from "react";
import {
  AlignmentProps,
  Button,
  ButtonStates,
  ButtonTypes
} from "@cox/core-ui8";
import { useAxios } from '@cox/core-ui8/dist/useAxios';
import {
  EASYPAY_REVIEW_PAGE_PROTOTYPE, EASYPAY_REVIEW_POST_URL, EASYPAY_AUTHORIZATION_FAILED_URL,
  EASYPAY_CSRF_VALIDATION_FAILED_URL, EASYPAY_ERROR_PAGE_URL, EASYPAY_ADD_CARD_URL,
  FETCH_TRUSTLY_METHOD_APPROVAL_URL, OKTA_EASYPAY_LANDING_PAGE_PROTOTYPE, OKTA_EASYPAY_REVIEW_PAGE_PROTOTYPE,
  OKTA_ADD_CARD_URL, OKTA_EDIT_CARD_GET_URL, OKTA_EDIT_CARD_POST_URL, OKTA_DELETE_MOP_DATA_DELETE_GET_URL,
  OKTA_DELETE_MOP_DATA_DELETE_POST_URL, OKTA_MAKE_DEFAULT_MOP_DATA_POST_URL, FETCH_TRUSTLY_METHOD_APPROVAL_AUTH_URL,
  OKTA_EASYPAY_REVIEW_POST_URL, OKTA_FLOW_PAYMENT_BACK_URL, FETCH_CB_TRUSTLY_METHOD_APPROVAL_AUTH_URL, OKTA_CB_ADD_CARD_URL,
  OKTA_CB_EDIT_CARD_GET_URL, OKTA_CB_EDIT_CARD_POST_URL, OKTA_CB_DELETE_MOP_DATA_DELETE_GET_URL,
  OKTA_CB_DELETE_MOP_DATA_DELETE_POST_URL, OKTA_CB_MAKE_DEFAULT_MOP_DATA_POST_URL,
  OKTA_CB_EASYPAY_REVIEW_POST_URL,
  OKTA_CB_EASYPAY_REVIEW_PAGE_PROTOTYPE
} from "../../hooks/constants";
import { setUDOVariables } from "../../hooks/utils";
import AddPaymentMethod from "../../components/AddPaymentMethod";
import InfoAlert from "../../components/Alerts/InfoAlert";
import ErrorAlert from "../../components/Alerts/ErrorAlert";
import SuccessAlert from "../../components/Alerts/SuccessAlert";
import chevronLeft from "../../assets/icons/chevron-left.svg";
import { Spinner } from "@cox/core-ui8/dist/Spinner";
import WarningAlert from "../../components/Alerts/WarningAlert";

interface FormErrors {
  [key: string]: string | undefined;
}

interface RequestParams {
  [key: string]: string | undefined;
}

function EasyPaySetupTemplate({ payment, onPostSubmitResponse, customerType, setPaymentData }: any) {
  const {
    pciChaseEncryptKeyJs = "",
    pciChaseEncryptJs = "",
    oktaLogin = false,
    savedMop = [],
    easyPayEligibilityError = "",
    paymentRestrictions = {},
    udoVariables = {}
  } = payment;

  const [activeTab, setActiveTab] = useState('existingPaymentMethods');
  const [errors, setErrors] = useState<FormErrors>({});
  const [checkclass, setCheckclass] = useState(() => {
    // Find the first enabled card
    const selectedCard = savedMop?.find((card: { selected: any; disabled: any; }) => card.selected && !card.disabled);
    const defaultCard = savedMop?.find((card: { isDefaultMop: any; disabled: any; }) => (card.isDefaultMop === true || card.isDefaultMop === 'true') && !card.disabled);
    const firstEnabledCard = savedMop?.find((card: { disabled: any; }) => !card.disabled);

    return (
      selectedCard?.mopId ||
      defaultCard?.mopId ||
      firstEnabledCard?.mopId ||
      ''
    );
  });
  const [expiringSoonMessages, setExpiringSoonMessages] = useState([]);
  const [expiredCardMessages, setExpiredCardMessages] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMopTab, setShowMopTab] = useState(true);
  const [showAlert, setShowAlert] = useState(true);
  const [selectedFutureDate, setSelectedFutureDate] = useState("");
  const getLabelForBackNavigation = payment?.navigateTo?.includes('ibill') ? 'Billing home' : 'Account overview';

  const formButtons: any = oktaLogin ? [
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
  ] : [
    {
      isFormSubmit: true,
      buttonTypes: ButtonTypes.PRIMARY,
      text: "Add Card",
      cssClass: "review-buttons text-center mt-2 mb-2",
      id: "add-btn",
    },
  ];

  useEffect(() => {
    setTimeout(function () {
      setUDOVariables(udoVariables);
    }, 0);
  }, []);

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

  useEffect(() => {
    /* If there is no savedMop then display the payment method */
    if (!savedMop || savedMop.length === 0) {
      setShowMopTab(false);
      if (paymentRestrictions?.restrictBankPayment) {
        setActiveTab('creditCard');
      } else {
        setActiveTab('bankAccount');
      }
    }
  }, [paymentRestrictions]);

  useEffect(() => {
    if (savedMop && savedMop.length > 0) {
      // load bank account tab if there are only card mop's
      if (customerType === 'business' && !paymentRestrictions?.restrictBankPayment && !payment?.addCardMopDetails && !payment?.trustlyMethodApproval && !payment?.updateCardMopDetails) {
        const bankMopExists = savedMop?.some((mop: any) => mop.type === 'BANK');
        if(!bankMopExists) {
          setActiveTab('bankAccount');
        }
      }
      const expiringSoonMops = savedMop?.filter((card: any) => card.expiringSoon).map((card: any) => card.expiringSoonWarning);
      setExpiringSoonMessages(expiringSoonMops);

      const expiredMops = savedMop?.filter((card: any) => card.cardExpiredWarning).map((card: any) => card.cardExpiredWarning);
      setExpiredCardMessages(expiredMops);
    }
  }, [savedMop]);

  useEffect(() => {
    if (payment?.trustlyMethodApproval?.approvalStatus) {
      const selectedMopId = payment?.trustlyMethodApproval?.response;
      const selectedCard = savedMop?.find((card: any) => card.mopId === selectedMopId);
      setCheckclass(selectedCard?.mopId);
    }
  }, [payment?.trustlyMethodApproval]);

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

  const { axiosAPI } = useAxios({
    autoFetch: false, // autoFetch will make a call on laod
    onCompleted: (data: any) => {
      handleOnComplete(data);
    },
    onError: (error) => {
      console.log("onAjaxError", error);
    }
  })

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
    if (!oktaLogin && data?.redirectToErrorPage) {
      window.location.href = EASYPAY_ERROR_PAGE_URL;
      return;
    }
    else if (!oktaLogin && typeof data?.errorMessages === "undefined") {
      console.log("CSRF validation failed.");
      window.location.href = EASYPAY_CSRF_VALIDATION_FAILED_URL;
      return;
    } else if (data?.pageName !== "error" && data?.errorMessages !== null && data?.errorMessages?.length > 0) {
      console.log("Server side validation is not successful.");
      setErrorMessages(data.errorMessages);
      setCheckclass(() => {
        const selectedCard = savedMop?.find((card: { selected: any; disabled: any; }) => card.selected && !card.disabled);
        const defaultCard = savedMop?.find((card: { isDefaultMop: any; disabled: any; }) => (card.isDefaultMop === true || card.isDefaultMop === 'true') && !card.disabled);
        const firstEnabledCard = savedMop?.find((card: { disabled: any; }) => !card.disabled);

        return (
          selectedCard?.mopId ||
          defaultCard?.mopId ||
          firstEnabledCard?.mopId ||
          ''
        );
      });
    } else {
      console.log("Server side validation is successful.");
      setErrorMessages([]);
      onPostSubmitResponse(data);
    }
    window.scrollTo(0, 0);
  };

  /* Function to handle the form submission */
  const handleSubmit = async () => {
    if (isSubmitting) return;

    const newErrors: FormErrors = {};

    const updatedErrors = { ...errors, ...newErrors };  /* Combine existing errors with new errors */
    setErrors(updatedErrors);

    /* If there are no errors, proceed with form submission */
    if (Object.keys(updatedErrors).length === 0) {
      setIsSubmitting(true);
      const currentUrl = window.location.href;
      /* if there is no error then navigate to easypayreview.html else validate payment info */
      if (currentUrl.includes("/ui/v8")) {
        window.location.href = (customerType === "business" && oktaLogin) ? OKTA_CB_EASYPAY_REVIEW_PAGE_PROTOTYPE: oktaLogin ? OKTA_EASYPAY_REVIEW_PAGE_PROTOTYPE : EASYPAY_REVIEW_PAGE_PROTOTYPE;
        setIsSubmitting(false);
        return;
      }

      /* Prepare request parameters for the API call */
      const requestParams: RequestParams = {};

      if (!oktaLogin) {
        if (checkclass) {
          requestParams.checkClass = checkclass;
        }

        /* Retrieve the URL parameter 'id' */
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (id) {
          requestParams.id = id;
        } else {
          /* If no 'id' and not in prototype environment, navigate to authorization failed page */
          const currentUrl = window.location.href;
          if (!currentUrl.includes("/ui/v8")) {
            window.location.href = EASYPAY_AUTHORIZATION_FAILED_URL;
            setIsSubmitting(false);
            return;
          }
        }
      } else {
        if (checkclass) {
          requestParams.mopId = checkclass;
        }
      }

      try {
        const host = window.location.origin;
        const url = (customerType === "business" && oktaLogin) ? OKTA_CB_EASYPAY_REVIEW_POST_URL : oktaLogin ? OKTA_EASYPAY_REVIEW_POST_URL : EASYPAY_REVIEW_POST_URL;
        await axiosAPI({
          url: `${host}${url}`,
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          data: JSON.stringify(requestParams)
        });
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };

  async function handleBackBtnClick() {
    if (customerType === "business" && oktaLogin) {
      return window.location.href = payment?.navigateTo;
    }
    const currentUrl = window.location.href;
    if (currentUrl.includes("/ui/v8")) {
      window.location.href = OKTA_EASYPAY_LANDING_PAGE_PROTOTYPE;
    } else {
      const requestParams: RequestParams = {};

      requestParams.pageName = payment?.previousPageName ? payment.previousPageName : "easyPay-statements";
      requestParams.flowName = "okta-automatic-payments";

      try {
        const hostName = window.location.origin;
        await axiosAPIForBack({
          url: `${hostName}${OKTA_FLOW_PAYMENT_BACK_URL}`,
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

  const handleResponse = (response: any) => {
    // Handle the response here
    console.log(response);
    if (response?.messages?.errorMessages?.length > 0) {
      setPaymentData((prev: any) => ({
        ...prev,
        messages: response?.messages,
      }));
      const element = document.getElementById('easy-pay');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    else {
      sessionStorage.setItem('scrollToTopAfterReload', 'true');
      if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.location.reload();
    }
  };

  useEffect(() => {
    const hasAlerts =
      errorMessages?.length > 0 ||
      expiredCardMessages?.length > 0 ||
      payment?.trustlyMethodApproval?.approvalStatus === true ||
      payment?.trustlyMethodApproval?.approvalStatus === false ||
      payment?.addCardMopDetails?.status === "true" ||
      payment?.addCardMopDetails?.status === "false" ||
      payment?.updateCardMopDetails?.status === "true" ||
      payment?.updateCardMopDetails?.status === "false";

    if (hasAlerts) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [
    errorMessages?.length,
    expiredCardMessages?.length,
    payment?.trustlyMethodApproval?.approvalStatus,
    payment?.addCardMopDetails?.status,
    payment?.updateCardMopDetails?.status,
  ]);

  useEffect(() => {
    const shouldScrollAfterReload = sessionStorage.getItem('scrollToTopAfterReload');
    const hasAlertsOnMount =
      payment?.trustlyMethodApproval?.approvalStatus === true ||
      payment?.trustlyMethodApproval?.approvalStatus === false ||
      payment?.addCardMopDetails?.status ||
      payment?.updateCardMopDetails?.status;

    let restoredHistory = false;
    if (shouldScrollAfterReload === 'true' || hasAlertsOnMount) {
      sessionStorage.removeItem('scrollToTopAfterReload');
      if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
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
      if (restoredHistory && typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "existingPaymentMethods") {
      setPaymentData((prev: any) => ({
        ...prev,
        successMessage: "",
      }))
    }

    setPaymentData((prev: any) => ({
      ...prev,
      errorMessage: ""
    }))
  }, [activeTab]);

  const onAjaxResponseForBack = (data: any) => {
    setPaymentData(data);
    window.scrollTo(0, 0);
  };

  const handleSelectedFutureDate = (date: any) => {
    setSelectedFutureDate(date[0])
  }

  return (
    <>
      {isSubmitting &&
        <div className="throbber-container" data-automation-id="throbber">
          <Spinner
            size={'xl'}
          />
        </div>
      }
      <div id="easy-pay-setup" className="card-theme-easypay ml-0">
        <div className="payment-container easy-pay payment-radio-buttons chat-payment pl-0 pr-0">
          {payment.oktaLogin && customerType !== "business" && (
            <div className="navigation-back  d-flex justify-content-between">
              <a href={payment.navigateTo}
                className='link__anchor'>
                <img src={chevronLeft} className='link__icon' alt="chevronLeft" />
                {getLabelForBackNavigation}
              </a>
            </div>
          )}
          <div className="autoreg_content">
            {customerType !== "business" && <div className="header-content mb-0">
              <h2 data-automation-id="add-payment-method-header" className="mt-0 add-payment-method-header">Set up EasyPay automatic payments</h2>
            </div>}
            {((customerType === "business" && oktaLogin) && (!paymentRestrictions?.restrictBankPayment && !paymentRestrictions?.restrictCardPayment && !paymentRestrictions?.allPaymentRestricted)) && <div className="mb-0">
              <h2 data-automation-id="add-payment-method-header" className="mt-0 add-payment-method-header">Select a payment method to enroll in Autopay</h2>
            </div>}
            {!easyPayEligibilityError ? (
              <>
                {paymentRestrictions?.allPaymentRestricted || (paymentRestrictions?.restrictBankPayment && paymentRestrictions?.restrictCardPayment) ? (
                  <>
                    {oktaLogin ? (
                      <ErrorAlert
                        message={customerType === "business" ? (`<span>You're currently unable to use any payment methods. Please contact Customer Care for additional information and options.</span>`) : `<span data-automation-id="payment-restriction-alert-text">
                                    We're sorry for the inconvenience, but online payments via bank,
                                     credit or debit cards are not enabled on your account. Please
                                      make a payment in cash at any 
                                      <a href="/aboutus/contact-us/cox-centers.html">Spectrum Store</a>.
                                       <br> <br> 
                                       For more information, please <a href="/residential/contactus.html" class="chat-trigger">chat with us</a>.
                                    </span>`}
                        id="automatic-payments-payment-restriction-error"
                      />
                    ) : (
                      <ErrorAlert message={`<span data-automation-id="payment-restriction-alert-text">
                              We apologize for the inconvenience, but online payments and automatic EasyPay
                              transactions using bank accounts, credit, or debit cards are currently
                              unavailable on your account.
                              <br /><br />
                              To continue, please make your payment in cash at any <a href="/aboutus/contact-us/cox-centers.html">
                                Spectrum Store</a> or through an authorized third-party retailer. Thank you for your understanding.
                            </span>`} id="easy-pay-payment-restriction-error" />
                    )}
                  </>
                ) : (
                  <>
                    <div className="alerts-wrapper">
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
                        <div className="pb-2"><InfoAlert
                          message={`<span data-automation-id="spmAccount-alert-text">
                                                          This account is currently set up to accept Bank Account payments only. To explore other available payment methods, <a style="text-decoration: none;" href="https://www.cox.com/business/support/cox-business-bill-payment-methods.html" target="_blank"> click here </a> or select Chat at any time to connect with a representative directly.
                                                          </span>`}
                          id="one-time-payment"
                        /></div>
                      )}
                      {(customerType === "business" && paymentRestrictions?.restrictCardPayment && oktaLogin) && (
                        <WarningAlert
                          message={"You're currently unable to use a credit/debit card to pay your bill. Please try a different form of payment."}
                          id="one-time-payment"
                        />
                      )}
                      {(customerType === "business" && paymentRestrictions?.restrictBankPayment && oktaLogin) && (
                        <WarningAlert
                          message={"You're currently unable to use a checking/savings account to pay your bill. Please try a different form of payment."}
                          id="one-time-payment"
                        />
                      )}
                      {expiredCardMessages?.length > 0 && (
                        <>
                          {expiredCardMessages.map((message: any) => (
                            <ErrorAlert message={message} id="expired-card-alert" key={message} />
                          ))}
                        </>
                      )}
                      {/* ALERTS WITH TIMER */}
                      {showAlert && (
                        <>
                          {payment?.trustlyMethodApproval?.approvalStatus === false && (
                            <ErrorAlert message={payment?.trustlyMethodApproval?.message} id="automatic-payment" />
                          )}
                          {payment?.trustlyMethodApproval?.approvalStatus === true && (
                            <SuccessAlert message={payment?.trustlyMethodApproval?.message} id="automatic-payment" />
                          )}
                          {payment?.addCardMopDetails?.status === "true" && (
                            <SuccessAlert message={payment?.addCardMopDetails?.successMessage} id="automatic-payment" />
                          )}
                          {payment?.addCardMopDetails?.status === "false" && (
                            <ErrorAlert message={payment?.addCardMopDetails?.errorMessage} id="automatic-payment" />
                          )}
                          {payment?.updateCardMopDetails?.status === "true" && (
                            <SuccessAlert message={payment?.updateCardMopDetails?.successMessage} id="automatic-payment" />
                          )}
                          {errorMessages?.length > 0 && (
                            <>
                              {errorMessages.map((message: any, index: number) => (
                                <div key={index}>
                                  <ErrorAlert
                                    message={message}
                                    id="automatic-payment"
                                  />
                                </div>
                              ))}
                            </>
                          )}
                        </>
                      )}
                    </div>
                    {(oktaLogin && customerType === "business") ? '' : <h3 data-automation-id="add-payment-method-header" className="mt-4 add-payment-method-subheader">Select an EasyPay automatic payment method</h3>}
                    <AddPaymentMethod
                      id="easy-pay"
                      payment={payment}
                      showExistingPaymentMethodsTab={showMopTab}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      showLinks={oktaLogin && payment?.hasFullIbillAccess}
                      paymentRestrictions={paymentRestrictions}
                      checkclass={checkclass}
                      setCheckclass={setCheckclass}
                      formButtons={formButtons}
                      trustlyMethodUrl={
                        (customerType === "business" && oktaLogin)
                          ? FETCH_CB_TRUSTLY_METHOD_APPROVAL_AUTH_URL
                          : oktaLogin
                            ? FETCH_TRUSTLY_METHOD_APPROVAL_AUTH_URL
                            : FETCH_TRUSTLY_METHOD_APPROVAL_URL
                      }
                      saveCardApiUrl={
                        (customerType === "business" && oktaLogin)
                          ? OKTA_CB_ADD_CARD_URL
                          : oktaLogin
                            ? OKTA_ADD_CARD_URL
                            : EASYPAY_ADD_CARD_URL
                      }
                      getCardDataApiUrl={customerType === "business" ? OKTA_CB_EDIT_CARD_GET_URL : OKTA_EDIT_CARD_GET_URL}
                      updateCardDataApiUrl={customerType === "business" ? OKTA_CB_EDIT_CARD_POST_URL : OKTA_EDIT_CARD_POST_URL}
                      getDeleteMopApiUrl={customerType === "business" ? OKTA_CB_DELETE_MOP_DATA_DELETE_GET_URL : OKTA_DELETE_MOP_DATA_DELETE_GET_URL}
                      postDeleteMopApiUrl={customerType === "business" ? OKTA_CB_DELETE_MOP_DATA_DELETE_POST_URL : OKTA_DELETE_MOP_DATA_DELETE_POST_URL}
                      makeDefaultApiUrl={customerType === "business" ? OKTA_CB_MAKE_DEFAULT_MOP_DATA_POST_URL : OKTA_MAKE_DEFAULT_MOP_DATA_POST_URL}
                      flowName={oktaLogin ? "automatic-payments" : ""}
                      onResponse={handleResponse}
                      customerType={customerType}
                      isSPMAccount={payment?.isSPMAccount}
                    />
                    <div className="form-group submit-button d-block d-md-flex pt-0 button-group mb-0">
                      {oktaLogin && (activeTab === 'existingPaymentMethods' || activeTab === 'bankAccount') && (
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
                      {activeTab === 'existingPaymentMethods' && (
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
                  </>
                )}
              </>
            ) : (
              <ErrorAlert message={easyPayEligibilityError} id="easy-pay-eligibility-error" />
            )
            }
          </div>
        </div>
      </div >
    </>
  );
}

export default EasyPaySetupTemplate;
