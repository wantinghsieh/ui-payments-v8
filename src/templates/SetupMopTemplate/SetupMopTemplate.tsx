import { useEffect, useState } from "react";
import {
  AlignmentProps,
  Button,
  ButtonStates,
  ButtonTypes,
  FormInput,
  FormInputTypes,
  FormMessage,
  FormOptionsTypes,
  FormRadioButton,
  MessageStatus,
  useAxios,
} from "@cox/core-ui8";
import {
  ONE_TIME_PAYMENT_STATEMENT_PAGE_PROTOTYPE,
  OKTA_ADD_CARD_URL,
  FETCH_TRUSTLY_METHOD_APPROVAL_AUTH_URL,
  OKTA_FLOW_PAYMENT_BACK_URL,
  ONE_TIME_PAYMENT_REVIEW_MOP_PAGE_PROTOTYPE,
  ONE_TIME_PAYMENT_REVIEW_POST_URL,
  OKTA_EDIT_CARD_GET_URL,
  OKTA_EDIT_CARD_POST_URL,
  OKTA_DELETE_MOP_DATA_DELETE_GET_URL,
  OKTA_DELETE_MOP_DATA_DELETE_POST_URL,
  OKTA_MAKE_DEFAULT_MOP_DATA_POST_URL,
  OKTA_CB_EDIT_CARD_GET_URL,
  OKTA_CB_EDIT_CARD_POST_URL,
  OKTA_CB_DELETE_MOP_DATA_DELETE_GET_URL,
  OKTA_CB_DELETE_MOP_DATA_DELETE_POST_URL,
  ONE_TIME_PAYMENT_CB_REVIEW_POST_URL,
  ONE_TIME_PAYMENT_CB_REVIEW_MOP_PAGE_PROTOTYPE,
  OKTA_CB_MAKE_DEFAULT_MOP_DATA_POST_URL,
  OKTA_CB_ADD_CARD_URL,
  FETCH_CB_TRUSTLY_METHOD_APPROVAL_AUTH_URL,
  MULTI_ACCOUNT_ONE_TIME_PAYMENT_CB_REVIEW_MOP_PAGE_PROTOTYPE,
  OKTA_CB_ADD_CARD_MULTI_ACCOUNT_URL,
  OKTA_CB_MULTI_ACCOUNT_DELETE_MOP_DATA_DELETE_GET_URL,
  OKTA_CB_MULTI_ACCOUNT_DELETE_MOP_DATA_DELETE_POST_URL,
  OKTA_CB_MULTI_ACCOUNT_EDIT_CARD_GET_URL,
  OKTA_CB_MULTI_ACCOUNT_EDIT_CARD_POST_URL,
  MULTI_ACCOUNT_CB_REVIEW_POST_URL,
} from "../../hooks/constants";
import AddPaymentMethod from "../../components/AddPaymentMethod";
import ErrorAlert from "../../components/Alerts/ErrorAlert";
import SuccessAlert from "../../components/Alerts/SuccessAlert";
import InfoAlert from "../../components/Alerts/InfoAlert";
import { Spinner } from "@cox/core-ui8/dist/Spinner";
import WarningAlert from "../../components/Alerts/WarningAlert";
import { toLocalDateTimeString } from "../../hooks/utils";
import { SESSION_KEYS } from "../../hooks/SESSION_KEYS";

interface FormData {
  option: string;
  otherDate: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const initialFormData: FormData = {
  option: "today",
  otherDate: "",
};

interface RequestParams {
  [key: string]: string | undefined;
}

function SetupMopTemplate({
  payment,
  customerType,
  setPaymentData,
  onPostSubmitResponse,
}: any) {
  const {
    savedMop = [],
    paymentRestrictions = {},
    paymentDateDetails = {},
  } = payment;

  const [activeTab, setActiveTab] = useState("existingPaymentMethods");
  const [formData, setFormData] = useState<FormData>(() => {
    const savedOption = sessionStorage.getItem(SESSION_KEYS.SETUP_MOP_DATE_OPTION);
    const savedOtherDate = sessionStorage.getItem(SESSION_KEYS.SETUP_MOP_OTHER_DATE);
    const option = paymentDateDetails?.paymentDateOption ?? savedOption ?? initialFormData.option;
    let otherDate = initialFormData.otherDate;
    if (paymentDateDetails?.selectedDate && paymentDateDetails?.paymentDateOption === "other") {
      otherDate = toLocalDateTimeString(new Date(paymentDateDetails.selectedDate)).split("T")[0];
    } else if (option === "other" && savedOtherDate) {
      otherDate = savedOtherDate;
    }
    return { option, otherDate };
  });
  const [showMopTab, setShowMopTab] = useState(true);
  const [checkclass, setCheckclass] = useState(() => {
    // 1) Prefer the explicitly selected card
    const selectedCard = savedMop?.find(
      (card: { selected?: boolean }) => card.selected
    );
    // 2) Then the default card
    const defaultCard = savedMop?.find(
      (card: { isDefaultMop?: boolean }) => card.isDefaultMop
    );
    // 3) Finally, just select the first card
    const firstCard = savedMop && savedMop.length > 0 ? savedMop[0] : undefined

    return (
      selectedCard?.mopId ||
      defaultCard?.mopId ||
      firstCard?.mopId ||
      ''
    );
  });
  const [errors, setErrors] = useState<FormErrors>({});
  // const [warningMessage, setWarningMessage] = useState(savedMop && savedMop.length > 0 && savedMop[0].expiringSoon ? savedMop[0].expiringSoonWarning : '');
  const [expiringSoonMessages, setExpiringSoonMessages] = useState([]);
  const [expiredCardMessages, setExpiredCardMessages] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [successMsgSetupMopRMDModal, setSuccessMsgSetupMopRMDModal] =
    useState<string>("");

  let today = "";
  let maxDueDate = "";
  let dueDate = "";
  const currentUrl = window.location.href;
  if (!currentUrl.includes("/ui/v8")) {
    if (paymentDateDetails?.startDate) {
      today = toLocalDateTimeString(new Date(paymentDateDetails?.startDate)).split(
        "T"
      )[0];
    }
    if (paymentDateDetails?.dueDate) {
      dueDate = new Date(paymentDateDetails?.dueDate).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );
    }
    if (paymentDateDetails?.calendarSelectionDate) {
      maxDueDate = toLocalDateTimeString(
        new Date(paymentDateDetails?.calendarSelectionDate)
      ).split("T")[0];
    }
  } else {
    today = toLocalDateTimeString(new Date()).split("T")[0];

    const maxDueDateObj = new Date();
    maxDueDateObj.setDate(maxDueDateObj.getDate() + 15);
    dueDate = new Date(maxDueDateObj).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    maxDueDate = toLocalDateTimeString(new Date(maxDueDateObj)).split("T")[0];
  }

  const formattedDate = new Date(`${today}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formButtons: any = [
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
  ];

  const { axiosAPI: axiosAPIForReview } = useAxios({
    autoFetch: false, // autoFetch will make a call on laod
    onCompleted: (data: any) => {
      onAjaxResponseForReview(data);
    },
    onError: (error) => {
      console.log("onAjaxError", error);
    },
  });

  const { axiosAPI: axiosAPIForBack } = useAxios({
    autoFetch: false, // autoFetch will make a call on laod
    onCompleted: (data: any) => {
      onAjaxResponseForBack(data);
    },
    onError: (error) => {
      console.log("onAjaxError", error);
    },
  });

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

  // useEffect(() => {
  //   if (savedMop && savedMop.length > 0) {
  //     const selectedCard = savedMop.find((card: any) => card.mopId === checkclass);
  //     if (selectedCard && selectedCard.expiringSoon) {
  //       setWarningMessage(selectedCard.expiringSoonWarning);
  //     } else {
  //       setWarningMessage('');
  //     }
  //   }
  // }, [checkclass, savedMop]);
  useEffect(() => {
    if (savedMop && savedMop.length > 0) {
      // load bank account tab if there are only card mop's
      if (customerType === 'business' && !payment?.multiAccount && !paymentRestrictions?.restrictBankPayment && !payment?.addCardMopDetails && !payment?.trustlyMethodApproval && !payment?.updateCardMopDetails) {
        const bankMopExists = savedMop?.some((mop: any) => mop.type === 'BANK');
        if (!bankMopExists) {
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
      const selectedCard = savedMop?.find(
        (card: any) => card.mopId === selectedMopId
      );
      setCheckclass(selectedCard?.mopId);
    }

    if (payment?.addCardMopDetails?.status === "true") {
      const selectedMopId = payment?.addCardMopDetails?.id;
      const selectedCard = savedMop?.find(
        (card: any) => card.mopId === selectedMopId
      );
      setCheckclass(selectedCard?.mopId);
    }
  }, [payment?.trustlyMethodApproval, payment?.addCardMopDetails]);

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

  useEffect(() => {
    const hasAlerts =
      successMsgSetupMopRMDModal ||
      errorMessages?.length > 0 ||
      expiredCardMessages?.length > 0 ||
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
    payment?.trustlyMethodApproval?.approvalStatus,
    payment?.addCardMopDetails?.status,
    payment?.updateCardMopDetails?.status,
    payment?.messages?.successMessages?.length,
  ]);

  useEffect(() => {
    const shouldScrollAfterReload = sessionStorage.getItem(SESSION_KEYS.SCROLL_TO_TOP_AFTER_RELOAD);
    const hasAlertsOnMount =
      payment?.messages?.successMessages?.length > 0 ||
      payment?.trustlyMethodApproval?.approvalStatus === true ||
      payment?.trustlyMethodApproval?.approvalStatus === false ||
      payment?.addCardMopDetails?.status ||
      payment?.updateCardMopDetails?.status;

    let restoredHistory = false;
    if (shouldScrollAfterReload === 'true' || hasAlertsOnMount) {
      sessionStorage.removeItem(SESSION_KEYS.SCROLL_TO_TOP_AFTER_RELOAD);
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

  const clearDateSession = () => {
    sessionStorage.removeItem(SESSION_KEYS.SETUP_MOP_DATE_OPTION);
    sessionStorage.removeItem(SESSION_KEYS.SETUP_MOP_OTHER_DATE);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const newErrors: FormErrors = {};
    if (formData.option === "other" && !formData.otherDate) {
      newErrors.otherDate = "This field is required.";
    }

    setErrors(newErrors);

    /* If there are no errors, proceed with form submission */
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      const currentUrl = window.location.href;
      if (currentUrl.includes("/ui/v8")) {
        clearDateSession();
        window.location.href = customerType === "business" ? payment?.multiAccount ? MULTI_ACCOUNT_ONE_TIME_PAYMENT_CB_REVIEW_MOP_PAGE_PROTOTYPE : ONE_TIME_PAYMENT_CB_REVIEW_MOP_PAGE_PROTOTYPE : ONE_TIME_PAYMENT_REVIEW_MOP_PAGE_PROTOTYPE;
        return;
      }

      const requestParams: RequestParams = {};

      if (payment?.multiAccount) {
        if (savedMop?.[0]?.type) {
          requestParams.mopType = savedMop[0].type;
        }
      } else {
        requestParams.paymentDateOption = formData.option;
        requestParams.paymentDate = formData.otherDate
          ? new Date(`${formData.otherDate}T00:00:00`).toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          : "";
        if (checkclass) {
          requestParams.mopId = checkclass;
        }
      }

      try {
        const host = window.location.origin;
        const reviewUrl = payment?.multiAccount
          ? MULTI_ACCOUNT_CB_REVIEW_POST_URL
          : customerType === "business"
          ? ONE_TIME_PAYMENT_CB_REVIEW_POST_URL
          : ONE_TIME_PAYMENT_REVIEW_POST_URL;
        await axiosAPIForReview({
          url: `${host}${reviewUrl}`,
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
    } else {
      setIsSubmitting(false);
    }
  };

  const onAjaxResponseForReview = (data: any) => {
    if (data?.pageName !== "error" && data?.errorMessages?.length > 0) {
      setErrorMessages(data.errorMessages);
    } else {
      clearDateSession();
      onPostSubmitResponse(data);
    }
    window.scrollTo(0, 0);
  };

  const handleCardClick = (option: string) => {
    setFormData((prev: any) => ({
      ...prev,
      option,
      otherDate: option !== "other" ? "" : prev.otherDate,
    }));
    sessionStorage.setItem(SESSION_KEYS.SETUP_MOP_DATE_OPTION, option);
    if (option !== "other") {
      sessionStorage.removeItem(SESSION_KEYS.SETUP_MOP_OTHER_DATE);
    }
  };

  const handleOtherDateChange = (dates: any) => {
    const picked = dates?.[0];
    const value = picked ? toLocalDateTimeString(picked).split("T")[0] : "";
    if (value) {
      setErrors({});
      sessionStorage.setItem(SESSION_KEYS.SETUP_MOP_OTHER_DATE, value);
      sessionStorage.setItem(SESSION_KEYS.SETUP_MOP_DATE_OPTION, "other");
    } else {
      sessionStorage.removeItem(SESSION_KEYS.SETUP_MOP_OTHER_DATE);
    }
    setFormData((prev: any) => ({
      ...prev,
      option: value ? "other" : prev.option,
      otherDate: value,
    }));
  };

  async function handleBackBtnClick() {
    clearDateSession();
    if (customerType === "business") {
      return window.location.href = payment?.navigateTo;
    }
    const currentUrl = window.location.href;
    if (currentUrl.includes("/ui/v8")) {
      window.location.href = ONE_TIME_PAYMENT_STATEMENT_PAGE_PROTOTYPE;
    } else {
      const requestParams: RequestParams = {};
      requestParams.pageName = "setup";
      requestParams.flowName = "one-time-payments";

      try {
        const host = window.location.origin;
        await axiosAPIForBack({
          url: `${host}${OKTA_FLOW_PAYMENT_BACK_URL}`,
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

  const handleResponse = (response: any) => {
    // Handle the response here
    if (response?.messages?.errorMessages?.length > 0) {
      setPaymentData((prev: any) => ({
        ...prev,
        messages: response?.messages,
      }));
      const element = document.getElementById("one-time-payment");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      sessionStorage.setItem(SESSION_KEYS.SCROLL_TO_TOP_AFTER_RELOAD, 'true');
      if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.location.reload();
    }
  };

  return (
    <>
      {isSubmitting && (
        <div className="throbber-container" data-automation-id="throbber">
          <Spinner size={"xl"} />
        </div>
      )}

      {paymentRestrictions?.allPaymentRestricted ||
        (paymentRestrictions?.restrictBankPayment &&
          paymentRestrictions?.restrictCardPayment) ? (
        <ErrorAlert
          message={customerType === "business" ? (`<span>You're currently unable to use any payment methods. Please contact Customer Care for additional information and options.</span>`) : `<span data-automation-id="payment-restriction-alert-text">
                                    We're sorry for the inconvenience, but online payments via bank,
                                     credit or debit cards are not enabled on your account. Please
                                      make a payment in cash at any 
                                      <a href="/aboutus/contact-us/cox-centers.html">Spectrum Store</a>.
                                       <br> <br> 
                                       For more information, please <a href="/residential/contactus.html" class="chat-trigger">chat with us</a>.
                                    </span>`}
          id="one-time-payment"
        />
      ) : (
        <>
          <div className="mb-3">
            {successMsgSetupMopRMDModal && (
              <SuccessAlert
                message={successMsgSetupMopRMDModal}
                id="one-time-payment"
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
              <div className="pb-2"><InfoAlert
                message={`<span data-automation-id="spmAccount-alert-text">
                                    This account is currently set up to accept Bank Account payments only. To explore other available payment methods, <a style="text-decoration: none;" href="https://www.cox.com/business/support/cox-business-bill-payment-methods.html" target="_blank"> click here </a> or select Chat at any time to connect with a representative directly.
                                    </span>`}
                id="one-time-payment"
              /></div>
            )}
            {customerType === "business" && paymentRestrictions?.restrictCardPayment && (
              <WarningAlert
                message={"You're currently unable to use a credit/debit card to pay your bill. Please try a different form of payment."}
                id="one-time-payment"
              />
            )}
            {customerType === "business" && paymentRestrictions?.restrictBankPayment && (
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
                {payment?.trustlyMethodApproval?.approvalStatus === true && (
                  <SuccessAlert
                    message={payment?.trustlyMethodApproval?.message}
                    id="one-time-payment"
                  />
                )}
                {payment?.trustlyMethodApproval?.approvalStatus === false && (
                  <ErrorAlert
                    message={payment?.trustlyMethodApproval?.message}
                    id="one-time-payment"
                  />
                )}
                {payment?.addCardMopDetails?.status === "true" && (
                  <SuccessAlert
                    message={payment?.addCardMopDetails?.successMessage}
                    id="one-time-payment"
                  />
                )}
                {payment?.addCardMopDetails?.status === "false" && (
                  <ErrorAlert
                    message={payment?.addCardMopDetails?.errorMessage}
                    id="one-time-payment"
                  />
                )}
                {payment?.updateCardMopDetails?.status === "true" && (
                  <SuccessAlert
                    message={payment?.updateCardMopDetails?.successMessage}
                    id="one-time-payment"
                  />
                )}
                {payment?.messages?.successMessages?.length > 0 && (
                  <>
                    {payment?.messages?.successMessages.map(
                      (message: any, index: number) => (
                        <div key={index}>
                          <SuccessAlert
                            message={message}
                            id="one-time-payment"
                          />
                        </div>
                      )
                    )}
                  </>
                )}
                {errorMessages?.length > 0 && (
                  <>
                    {errorMessages.map((message: any, index: number) => (
                      <div key={index}>
                        <ErrorAlert
                          message={message}
                          id="one-time-payment"
                        />
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
          <div id="payment-setup">
            <div className="content">
              <h4
                className="content-heading"
                data-testid="paymentdate-header"
                data-automation-id="paymentdate-header"
              >
                Payment date
              </h4>
              <p
                data-testid="paymentdate-description"
                data-automation-id="paymentdate-description"
              >
                {paymentDateDetails?.headerText}
              </p>

              <div className="form wrap-errors collapse-form-validate">
                <div className="setup-container">
                  <>
                    {!paymentDateDetails?.paymentMadeToday && (
                      <div className="payment-date-wrapper">
                        <div className={`payment-date`}>
                          <div>
                            <div className="payment-date-label">
                              <FormRadioButton
                                id={`today-date-radio`}
                                title="Today"
                                name={`today-date-option`}
                                type={FormOptionsTypes.radio}
                                onChange={() => handleCardClick("today")}
                                items={[
                                  {
                                    text: "Today:",
                                    selected: formData.option === "today",
                                    disabled: false,
                                    value: "today",
                                  },
                                ]}
                              />
                              <span>&nbsp;{formattedDate}</span>
                            </div>
                          </div>
                        </div>

                        {/* Due date */}
                        {paymentDateDetails?.dueDate && (
                          <div className={`payment-date`}>
                            <div>
                              <div className="payment-date-label">
                                <FormRadioButton
                                  id={`due-date-radio`}
                                  title="Due date"
                                  name={`due-date-option`}
                                  type={FormOptionsTypes.radio}
                                  onChange={() => handleCardClick("due-date")}
                                  items={[
                                    {
                                      text: "Due date:",
                                      selected: formData.option === "due-date",
                                      disabled: false,
                                      value: "due-date",
                                    },
                                  ]}
                                />
                                <span>&nbsp;{dueDate}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {!payment?.multiAccount && <div className="payment-date-wrapper other-amount">
                          <div className="other-date-wrapper">
                            <FormRadioButton
                              id={`other-date-radio`}
                              title="Other date"
                              name={`other-date-option`}
                              type={FormOptionsTypes.radio}
                              onChange={() => handleCardClick("other")}
                              items={[
                                {
                                  text: "Other date:",
                                  selected: formData.option === "other",
                                  disabled: false,
                                  value: "other",
                                },
                              ]}
                            />

                            <div
                              id="other-date"
                              className="date-field"
                              onClick={(e) => {
                                if ((e.target as HTMLElement).closest(".date-picker")) return;
                                handleCardClick("other");
                              }}
                            >
                              <FormInput
                                type={FormInputTypes.DATEPICKER}
                                required={false}
                                name="otherDate"
                                id="pay-other-date"
                                title=""
                                onChange={(date: any) => handleOtherDateChange(date)}
                                value={
                                  formData.otherDate
                                    ? new Date(`${formData.otherDate}T00:00:00`)
                                    : ""
                                }
                                options={{
                                  mode: "single",
                                  enableTime: false,
                                  shorthandCurrentMonth: true,
                                  dateFormat: "m / d / Y",
                                  minDate: new Date(
                                    `${new Date(
                                      new Date(today).getTime() +
                                      24 * 60 * 60 * 1000
                                    )
                                      .toISOString()
                                      .split("T")[0]}T00:00:00`
                                  ),
                                  maxDate: maxDueDate
                                    ? new Date(`${maxDueDate}T00:00:00`)
                                    : undefined,
                                }}
                              />
                              {errors.otherDate && (
                                <FormMessage
                                  id="other-date"
                                  status={MessageStatus.ERROR}
                                  message={errors.otherDate}
                                />
                              )}
                            </div>
                          </div>
                        </div>}
                      </div>
                    )}
                  </>
                </div>

                <div
                  className="payment-method-header-wrapper"
                  data-testid="paymentMethod-content"
                >
                  <h4
                    data-testid="paymentMethod-header"
                    data-automation-id="paymentMethod-header"
                  >
                    Payment methods
                  </h4>
                </div>
                <div
                  className="payment-methods mt-3"
                  data-automation-id="payment-methods-container"
                >
                  <div className="row">
                    <div className="col-sm-12 custom-payment-margin pl-0">
                      <AddPaymentMethod
                        id="one-time-payment"
                        payment={payment}
                        showExistingPaymentMethodsTab={showMopTab}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        showLinks={payment?.hasFullIbillAccess}
                        checkclass={checkclass}
                        setCheckclass={setCheckclass}
                        paymentRestrictions={paymentRestrictions}
                        formButtons={formButtons}
                        isSPMAccount={payment?.isSPMAccount}
                        trustlyMethodUrl={
                          customerType === "business" ? FETCH_CB_TRUSTLY_METHOD_APPROVAL_AUTH_URL : FETCH_TRUSTLY_METHOD_APPROVAL_AUTH_URL
                        }
                        saveCardApiUrl={customerType === "business" ? payment?.multiAccount ? OKTA_CB_ADD_CARD_MULTI_ACCOUNT_URL : OKTA_CB_ADD_CARD_URL : OKTA_ADD_CARD_URL}
                        flowName="make-payment"
                        getCardDataApiUrl={customerType === "business" ? payment?.multiAccount ? OKTA_CB_MULTI_ACCOUNT_EDIT_CARD_GET_URL : OKTA_CB_EDIT_CARD_GET_URL : OKTA_EDIT_CARD_GET_URL}
                        updateCardDataApiUrl={customerType === "business" ? payment?.multiAccount ? OKTA_CB_MULTI_ACCOUNT_EDIT_CARD_POST_URL : OKTA_CB_EDIT_CARD_POST_URL : OKTA_EDIT_CARD_POST_URL}
                        getDeleteMopApiUrl={customerType === "business" ? payment?.multiAccount ? OKTA_CB_MULTI_ACCOUNT_DELETE_MOP_DATA_DELETE_GET_URL : OKTA_CB_DELETE_MOP_DATA_DELETE_GET_URL : OKTA_DELETE_MOP_DATA_DELETE_GET_URL}
                        postDeleteMopApiUrl={customerType === "business" ? payment?.multiAccount ? OKTA_CB_MULTI_ACCOUNT_DELETE_MOP_DATA_DELETE_POST_URL : OKTA_CB_DELETE_MOP_DATA_DELETE_POST_URL : OKTA_DELETE_MOP_DATA_DELETE_POST_URL}
                        makeDefaultApiUrl={customerType === "business" ? OKTA_CB_MAKE_DEFAULT_MOP_DATA_POST_URL : OKTA_MAKE_DEFAULT_MOP_DATA_POST_URL}
                        onResponse={handleResponse}
                        setSuccessMsgSetupMopRMDModal={
                          setSuccessMsgSetupMopRMDModal
                        }
                        customerType={customerType}
                        multiAccount={payment?.multiAccount}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group submit-button button-group">
                  {(activeTab === "existingPaymentMethods" ||
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
                        size=""
                        buttonStates={checkclass || (payment?.multiAccount && savedMop?.length > 0) ? ButtonStates.ACTIVE : ButtonStates.DISABLED}
                        buttonTypes={ButtonTypes.PRIMARY}
                        customClickEvent={handleSubmit}
                        data-auomation-id="setup-continue-button"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default SetupMopTemplate;
