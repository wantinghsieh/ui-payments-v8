import { useState, useEffect } from "react";
import {
  AlignmentProps,
  Button,
  ButtonStates,
  ButtonTypes,
  FormInput,
  FormInputTypes,
} from "@cox/core-ui8";
import {
  EXTEND_PAYMENT_REVIEW_PROTOTYPE,
  EXTEND_PAYMENT_STATEMENT_PROTOTYPE,
  EXTEND_PAYMENT_REVIEW_URL,
  OKTA_FLOW_PAYMENT_BACK_URL,
} from "../../hooks/constants";
import { setUDOVariables } from "../../hooks/utils";
import ErrorAlert from "../../components/Alerts/ErrorAlert";
import SuccessAlert from "../../components/Alerts/SuccessAlert";
import { FormMessage, MessageStatus } from "@cox/core-ui8";
import { Spinner } from "@cox/core-ui8/dist/Spinner";
import { useAxios } from "@cox/core-ui8/dist/useAxios";

interface FormErrors {
  [key: string]: string | undefined;
}
interface FormData {
  promiseToPayDate: string | Date;
}
const initialFormData: FormData = {
  promiseToPayDate: "",
};

const tomorrow = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  return d;
})();

function formatDateToISO(dateStr: string | Date): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T00:00:00`;
}

interface RequestParams {
  [key: string]: string | undefined;
}

function ExtendPaySetupTemplate({
  payment,
  onPostSubmitResponse,
  setPaymentData,
}: any) {
  const {
    extendPayEligibilityError = "",
    paymentRestrictions = {},
    udoVariables = {},
    paymentDate = "",
  } = payment;

  const currentUrl = window.location.href;

  // In prototype mode cap at +15 days; in the backend supplies maxCollectionDueDate
  const maxExtendDate = currentUrl.includes("/ui/v8")
    ? (() => {
        const d = new Date();
        d.setDate(d.getDate() + 15);
        return d;
      })()
    : payment?.maxCollectionDueDate
      ? new Date(`${payment?.maxCollectionDueDate}T00:00:00`)
      : undefined;

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [showAlert, setShowAlert] = useState(true);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const { axiosAPI: axiosAPIForBack } = useAxios({
    autoFetch: false, // autoFetch will make a call on laod
    onCompleted: (data: any) => {
      onAjaxResponseForBack(data);
    },
    onError: (error) => {
      console.error("onAjaxError", error);
    },
  });

  useEffect(() => {
    setTimeout(function () {
      setUDOVariables(udoVariables);
    }, 0);
  }, []);

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
    setFormData((prev) => ({
      ...prev,
      promiseToPayDate: paymentDate ? new Date(paymentDate) : "",
    }));
  }, [paymentDate]);

  const handleOnComplete = (data: any) => {
    if (data.pageName !== "error" && data?.errorMessages?.length > 0) {
      console.log("Server side validation are not successful.");
      setIsSubmitting(false);
      setErrorMessages(data.errorMessages);
    } else {
      console.log("Server side validation is successful.");
      setIsSubmitting(false);
      setErrorMessages([]);
      onPostSubmitResponse(data);
    }
    window.scrollTo(0, 0);
  };

  const { axiosAPI } = useAxios({
    autoFetch: false,
    onCompleted: (data) => handleOnComplete(data),
  });

  /* Function to handle the form submission */
  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    const newErrors: FormErrors = {};
    if (!formData.promiseToPayDate) {
      newErrors.promiseToPayDate = "Please select the date.";
    }
    setErrors(newErrors);

    /* If there are no errors, proceed with form submission */
    if (Object.keys(newErrors).length === 0) {
      const currentUrl = window.location.href;
      /* if there is no error then navigate to extendpayreview.html else validate payment info */
      if (currentUrl.includes("/ui/v8")) {
        window.location.href = EXTEND_PAYMENT_REVIEW_PROTOTYPE;
      } else {
        const host = window.location.origin;
        const url = EXTEND_PAYMENT_REVIEW_URL;
        await axiosAPI({
          url: `${host}${url}`,
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          data: JSON.stringify({
            ...formData,
            promiseToPayDate: formatDateToISO(formData.promiseToPayDate),
          }),
        });
      }
    } else {
      setIsSubmitting(false);
    }
  };

  async function handleBackBtnClick() {
    const currentUrl = window.location.href;
    if (currentUrl.includes("/ui/v8")) {
      window.location.href = EXTEND_PAYMENT_STATEMENT_PROTOTYPE;
    } else {
      const requestParams: RequestParams = {};
      requestParams.pageName = "setup";
      requestParams.flowName = "payment-extension";

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

  const handleSelectedExtendedDate = (date: any) => {
    setFormData((prev: any) => ({
      ...prev,
      promiseToPayDate: date[0],
    }));
    if (date[0]) {
      setErrors({});
    }
  };

  return (
    <>
      {isSubmitting && (
        <div className="throbber-container" data-automation-id="throbber">
          <Spinner size={"xl"} />
        </div>
      )}
      {!extendPayEligibilityError ? (
        <>
          {paymentRestrictions?.allPaymentRestricted ||
          (paymentRestrictions?.restrictBankPayment &&
            paymentRestrictions?.restrictCardPayment) ? (
            <>
              <ErrorAlert
                message={`<span data-automation-id="payment-restriction-alert-text">
                                    We're sorry for the inconvenience, but online payments via bank,
                                     credit or debit cards are not enabled on your account. Please
                                      make a payment in cash at any 
                                      <a href="/aboutus/contact-us/cox-centers.html">Spectrum Store</a>.
                                       <br> <br> 
                                       For more information, please <a href="/residential/contactus.html">Chat with us</a>.
                                    </span>`}
                id="extend-payment-payment-restriction-error"
              />
            </>
          ) : (
            <>
              <div className="mb-3">
                {/* ALERTS WITH TIMER */}
                {showAlert && (
                  <>
                    {payment?.messages?.successMessages?.length > 0 && (
                      <>
                        {payment?.messages?.successMessages.map(
                          (message: any, index: number) => (
                            <div key={index}>
                              <SuccessAlert
                                message={message}
                                id="extend-payment"
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
                            <ErrorAlert message={message} id="extend-payment" />
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
              <div
                id="extend-pay-mop-setup"
                className="card-theme-extendpay ml-0"
              >
                <div className="payment-container extend-pay payment-radio-buttons chat-payment pl-0 pr-0">
                  <div className="autoreg_content"></div>
                  <div className="extend-date-picker">
                    <div className="extend-datepicker-header">Payment date</div>
                    <div className="extend-datepicker-header-description">
                      <b>Please note:</b> you will still need to make a payment
                      by 5pm local time on your promise date to ensure that it's
                      applied to your account on time.
                    </div>
                    <div className="date-field">
                      <FormInput
                        type={FormInputTypes.DATEPICKER}
                        required={true}
                        requiredMessage="required"
                        name="promiseToPayDate"
                        id="promiseToPayDate"
                        title="Pay on"
                        onChange={(date) => handleSelectedExtendedDate(date)}
                        value={formData.promiseToPayDate}
                        options={{
                          mode: "single",
                          enableTime: false,
                          shorthandCurrentMonth: true,
                          dateFormat: "m / d / Y",
                          minDate: tomorrow,
                          maxDate: maxExtendDate,
                        }}
                      />
                      {errors.promiseToPayDate && (
                        <FormMessage id="extend-pay-date" status={MessageStatus.ERROR} message={errors.promiseToPayDate} />
                      )}
                    </div>
                  </div>
                  <div className="form-group submit-button d-block d-md-flex pt-0 button-group mb-0">
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
                    <div className="payment-submit-btn">
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
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <ErrorAlert
          message={extendPayEligibilityError}
          id="extend-pay-eligibility-error"
        />
      )}
    </>
  );
}

export default ExtendPaySetupTemplate;
