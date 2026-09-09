import React, { useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import DOMPurify from "dompurify";
import {
  AlignmentProps,
  Button,
  ButtonStates,
  ButtonTypes,
  FormMessage,
  MessageStatus,
} from "@cox/core-ui8";
import { useAxios } from '@cox/core-ui8/dist/useAxios';
import { apiHost } from '../../config'
import {
  GET_VALIDATE_ROUTING_NBR_URL, MAKE_PAYMENT_REVIEW_INFO_POST_URL,
  MAKE_PAYMENT_AUTHORIZATION_FAILED_URL, MAKE_PAYMENT_CSRF_VALIDATION_FAILED_URL,
  MAKE_PAYMENT_REVIEW_PAGE_PROTOTYPE, VALIDATE_ROUTING_NBR_PROTPTYPE_URL
} from "../../hooks/constants";
import PaymentAmount from "../../components/PaymentAmount";
import PaymentDate from "../../components/PaymentDate";

interface FormData {
  accountName: string;
  routingNumber: string;
  bankName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  accountType: string;
  nameOnCC: string;
  cardNumber: string;
  encCardNumber: string;
  cardType: string;
  cvvNumber: string;
  encCvvNumber: string;
  country: string;
  countryZip: string;
  ccMonth: string;
  ccYear: string;
  focus: string;
  cardExpiration: string;
  integrityCheck: string;
  payDifferentAmount: string;
  otherDate: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface RequestParams {
  [key: string]: string | undefined;
}

const initialFormData: FormData = {
  accountName: "",
  routingNumber: "",
  bankName: "",
  accountNumber: "",
  confirmAccountNumber: "",
  accountType: "",
  nameOnCC: "",
  cardNumber: "",
  encCardNumber: "",
  cardType: "",
  country: "",
  cvvNumber: "",
  encCvvNumber: "",
  countryZip: "",
  ccMonth: "",
  ccYear: "",
  focus: "",
  cardExpiration: "",
  integrityCheck: "",
  payDifferentAmount: "",
  otherDate: ""
};

const SetupTemplate = ({ payment, onPostSubmitResponse }: any) => {
  const {
    pciChaseEncryptKeyJs = "",
    pciChaseEncryptJs = "",
    cardExpiration = "",
    pageError = "",
    paymentSetupDetails = {},
    paymentRestrictions = {},
    listOfYears = []
  } = payment;

  const udoVars = paymentSetupDetails?.udoVars || {};

  useEffect(() => {
    if (udoVars?.amountDue != null) {
      window?.utag?.view?.({
        channel: udoVars?.channel,
        pageName: udoVars?.pageName,
        pageType: udoVars?.pageType,
        subSection: udoVars?.subSection,
        businessUnit: udoVars?.businessUnit,
        purchaseStep: udoVars?.purchaseStep,
        visitorLoginStatus: udoVars?.visitorLoginStatus,
        amountDue: udoVars?.amountDue,
        amountPastDue: udoVars?.amountPastDue
      });

      window?.utag?.link?.({
        channel: udoVars?.channel,
        pageName: udoVars?.pageName,
        pageType: udoVars?.pageType,
        subSection: udoVars?.subSection,
        businessUnit: udoVars?.businessUnit,
        purchaseStep: udoVars?.purchaseStep,
        visitorLoginStatus: udoVars?.visitorLoginStatus,
        amountDue: udoVars?.amountDue,
        amountPastDue: udoVars?.amountPastDue
      });
    }
    else {
      window?.utag?.view?.({
        channel: udoVars?.channel,
        pageName: udoVars?.pageName,
        pageType: udoVars?.pageType,
        subSection: udoVars?.subSection,
        businessUnit: udoVars?.businessUnit,
        purchaseStep: udoVars?.purchaseStep,
        visitorLoginStatus: udoVars?.visitorLoginStatus
      });

      window?.utag?.link?.({
        channel: udoVars?.channel,
        pageName: udoVars?.pageName,
        pageType: udoVars?.pageType,
        subSection: udoVars?.subSection,
        businessUnit: udoVars?.businessUnit,
        purchaseStep: udoVars?.purchaseStep,
        visitorLoginStatus: udoVars?.visitorLoginStatus
      });
    }
  }, []);

  const [selectedOption, setSelectedOption] = useState("accountType");
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [bankName, setBankName] = useState("");
  const [errorMessages, setErrorMessages] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState("select-payment-option-1");
  const [selectedDate, setSelectedDate] = useState("today");

  const { axiosAPI: axiosAPIForBankName } = useAxios({
    autoFetch: false, // autoFetch will make a call on load
    onCompleted: (data: any) => {
      onAjaxResponseForBankName(data);
    },
    onError: (error) => {
      console.log("onAjaxError", error);
    }
  })

  const { axiosAPI: axiosAPIToSendPaymentData } = useAxios({
    autoFetch: false, // autoFetch will make a call on load
    onCompleted: (data: any) => {
      onAjaxResponseToSendPaymentData(data);
    },
    onError: (error) => {
      console.log("onAjaxError", error);
    }
  })

  const handleOptionChange = (event: any) => {
    setSelectedOption(event.target.value);
    setErrors({});
    setErrorMessages([]);
    setFormData(initialFormData);
  };

  const handleClick = (event: any) => {
    event.preventDefault();
  };

  const onAjaxResponseForBankName = (data: any) => {
    // const data = response.data;
    if (!data.match) {
      setErrors((prev: any) => {
        const error = data.response;
        if (error) {
          return { ...prev, ["routingNumber"]: error };
        } else {
          const { ["routingNumber"]: removedError, ...rest } = prev;
          return rest;
        }
      });
    } else {
      setBankName(data.response);
    }
  }

  useEffect(() => {
    const fetchBankName = async () => {
      if (formData.routingNumber.length === 9) {
        /* if prototype url take data from static file else make a rest call */
        let url;
        if (window.location.href.includes("/ui/v8")) {
          url = VALIDATE_ROUTING_NBR_PROTPTYPE_URL;
        } else {
          url = GET_VALIDATE_ROUTING_NBR_URL(`${formData.routingNumber}`);
        }

        try {
          const host = window.RequestJson === undefined ? apiHost : window.location.origin
          await axiosAPIForBankName({
            url: `${host}${url}`,
            method: "GET",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
            }
          });
        } catch (error) {
          console.error("Error fetching bank name:", error);
        }
      } else {
        setBankName("");
      }
    };

    fetchBankName();
  }, [formData.routingNumber]);

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
    if (paymentRestrictions.restrictBankPayment) {
      setSelectedOption("cardType");
    }
  }, []);

  const formatCardNumber = (value: any) => {
    const cleanValue = value.replace(/\D/g, "");
    if (/^3[47]/.test(cleanValue)) {
      if (cleanValue.length <= 4) {
        return cleanValue;
      } else if (cleanValue.length <= 10) {
        return `${cleanValue.slice(0, 4)}-${cleanValue.slice(4)}`;
      } else {
        return `${cleanValue.slice(0, 4)}-${cleanValue.slice(4, 10)}-${cleanValue.slice(10)}`;
      }
    }

    const chunks = [];
    for (let i = 0; i < cleanValue.length; i += 4) {
      chunks.push(cleanValue.slice(i, i + 4));
    }
    return chunks.join("-");
  };

  const getCardType = (value: any) => {
    const visa = /^4/;
    const masterCard = /^5[1-5]/;
    const discover = /^6(?:011|5)/;
    const amex = /^3[47]/;

    if (visa.test(value)) {
      return "Visa";
    } else if (masterCard.test(value)) {
      return "MasterCard";
    } else if (discover.test(value)) {
      return "Discover";
    } else if (amex.test(value)) {
      return "Amex";
    } else {
      return "randomcard";
    }
  };


  const isVisaMasterCardDiscover = (value: any): boolean => {
    const cardType = getCardType(value);
    return cardType === "Visa" || cardType === "MasterCard" || cardType === "Discover";
  };

  const cardNumberMaxLength = isVisaMasterCardDiscover(formData.cardNumber) ? 19 : 23;

  const isCanadaUK = (): boolean => {
    return formData.country === "canada" || formData.country === "UK";
  };
  const isNumber = (value: any) => /^[0-9]+$/.test(value);
  const zipMaxLength =
    formData.country === "canada" ? 6 : formData.country === "UK" ? 7 : 5;

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "accountName":
      case "nameOnCC":
        if (!value) return "This field is required.";
        if (!/^[a-z\-.,()'"\s]+$/i.test(value))
          return "Letters or punctuation only please.";
        break;
      case "routingNumber":
      case "accountNumber":
      case "confirmAccountNumber":
      case "cvvNumber":
      case "countryZip":
      case "bankName":
      case "cardNumber":
        if (name === "confirmAccountNumber" && value !== formData.accountNumber)
          return "Confirm value does not match actual value.";
        if (name === "cvvNumber" && value.length < 3)
          return "Please enter at least 3 characters.";
        if (name === "countryZip" && formData.country === "canada" && value.length < 6)
          return "Please enter at least 6 characters.";
        if (name === "countryZip" && formData.country === "UK" && value.length < 7)
          return "Please enter at least 7 characters.";
        if (name === "countryZip" && (formData.country === "" || formData.country === "US" || formData.country === "mexico") && !isNumber(value))
          return "Please enter numbers only.";
        if (name === "countryZip" && (formData.country === "" || formData.country === "mexico") && value.length < 5)
          return "Please enter a valid ZIP code.";
        break;
      case "accountType":
      case "ccMonth":
      case "ccYear":
        if (!value) return "A selection is required.";
        break;
    }
    return undefined;
  };

  const validateBlurField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "cardNumber":
        if (!value) return "This field is required.";
        if (
          name === "cardNumber" &&
          window.ValidatePANChecksum(value) === false
        )
          return "The credit card number you entered isn't valid. Please try again.";
        break;
      case "confirmAccountNumber":
        if (name === "confirmAccountNumber" && value !== formData.accountNumber)
          return "Confirm value does not match actual value.";
        break;
    }
    return undefined;
  };

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    let formattedValue = value;

    if (
      name === "routingNumber" ||
      name === "accountNumber" ||
      name === "confirmAccountNumber" ||
      name === "cvvNumber"
    ) {
      formattedValue = value.replace(/\D/g, "");
    }
    if (name === "cardNumber") {
      formattedValue = value.replace(/\D/g, "");
      formattedValue = formatCardNumber(formattedValue);
      formData.cardType = getCardType(formattedValue);
    }
    if (name === "countryZip") {
      formattedValue = value.replace(/\s/g, "");
    }

    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: formattedValue };
      if (name === "country") {
        updatedFormData.countryZip = "";
      }
      return updatedFormData;
    });

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));

    setErrors((prev) => {
      const error = validateField(name, formattedValue);
      if (error) {
        return { ...prev, [name]: error };
      } else {
        const { [name]: removedError, ...rest } = prev;
        return rest;
      }
    });
  };

  const handleInputBlur = (event: any) => {
    const { name, value } = event.target;
    let formattedValue = value;

    const currentError = validateBlurField(name, formattedValue);

    if (name === "accountNumber" && formData.confirmAccountNumber) {
      const confirmError = validateBlurField("confirmAccountNumber", formData.confirmAccountNumber);
      setErrors((prev) => ({
        ...prev,
        confirmAccountNumber: confirmError
        , [name]: currentError,
      }));
    } else {
      setErrors((prev) => {
        const error = validateBlurField(name, formattedValue);
        if (error) {
          return { ...prev, [name]: error };
        } else {
          const { [name]: removedError, ...rest } = prev;
          return rest;
        }
      });
    }
  };

  const handleInputFocus = (e: any) => {
    setFormData((prev) => ({ ...prev, focus: e.target.name }));
  };

  const onAjaxResponseToSendPaymentData = (data: any) => {
    // if (response.status !== 200) {
    //   throw new Error("Network response was not okay");
    // }

    // const data = response.data;

    if (typeof data.errorMessages == "undefined") {
      console.log("CSRF validation failed.");
      window.location.href = MAKE_PAYMENT_CSRF_VALIDATION_FAILED_URL;
      return;
    } else if (data.errorMessages != null && data.errorMessages.length > 0) {
      console.log("Server side validation is not successful.");
      // display the error messages at top of the screen
      setErrorMessages(data.errorMessages);
    } else {
      console.log("Server side validation is successful.");
      setSelectedOption("accountType");
      setErrors({});
      setErrorMessages([]);
      setFormData(initialFormData);
      // Callback to parent which navigates user to review page
      onPostSubmitResponse(data);
    }
    window.scrollTo(0, 0);
  }

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const newErrors: FormErrors = {};

    if (paymentAmount === "select-payment-option-3") {
      validatePaymentAmount(newErrors);
    }
    if (selectedDate === "other") {
      validatePaymentDate(newErrors);
    }

    if (selectedOption === "accountType") {
      validateAccountType(newErrors);
    } else if (selectedOption === "cardType") {
      validateCardType(newErrors);
    }
    setErrors(newErrors);
    if (newErrors.cardExpiration === 'Error') {
      window.scrollTo({
        top: 0,
      });
    }

    if (Object.keys(newErrors).length === 0) {
      const currentUrl = window.location.href;
      /* if prototype url return to review page tab else submit to validate payment info */
      if (currentUrl.includes("/ui/v8")) {
        if (currentUrl.includes("pay-now.html")) {
          window.location.href = MAKE_PAYMENT_REVIEW_PAGE_PROTOTYPE;
        }
        return;
      }
      const ccno = formData.cardNumber;
      const cvv = formData.cvvNumber;
      const result = window.ProtectPANandCVV(ccno, cvv, false);
      if (result != null) {
        formData.encCardNumber = result[0];
        formData.encCvvNumber = result[1];
        formData.integrityCheck = result[2];
      }
      // only read the applicable params and pass to perform server side validation
      const requestParams: RequestParams = {};
      if (selectedOption === "accountType") {
        requestParams.accountName = formData.accountName;
        requestParams.routingNumber = formData.routingNumber;
        requestParams.accountNumber = formData.accountNumber;
        requestParams.confirmAccountNumber = formData.confirmAccountNumber;
        requestParams.accountType = formData.accountType;
        requestParams.bankName = bankName;
        requestParams.mop = "bank";
      } else if (selectedOption === "cardType") {
        requestParams.nameOnCC = formData.nameOnCC;
        requestParams.cardNumber = formData.encCardNumber;
        requestParams.cvvNumber = formData.encCvvNumber;
        requestParams.countryZip = formData.countryZip;
        requestParams.ccMonth = formData.ccMonth;
        requestParams.ccYear = formData.ccYear;
        requestParams.cardType = formData.cardType;
        requestParams.country = formData.country;
        if (!requestParams.country) {
          requestParams.country = "US";
        }
        requestParams.mop = "card";
        requestParams.integrityCheck = formData.integrityCheck;
      }
      //fetch token from url and send it in request parameter
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');
      if (id) {
        requestParams.id = id;
      } else {
        window.location.href = MAKE_PAYMENT_AUTHORIZATION_FAILED_URL;
        return;
      }
      try {
        const host = window.RequestJson === undefined ? apiHost : window.location.origin
        await axiosAPIToSendPaymentData({
          url: `${host}${MAKE_PAYMENT_REVIEW_INFO_POST_URL}`,
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          data: JSON.stringify(requestParams)
        });
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const validatePaymentAmount = (newErrors: FormErrors) => {
    const {
      payDifferentAmount
    } = formData;

    if (!payDifferentAmount) newErrors.payDifferentAmount = "This field is required.";
  }

  const validatePaymentDate = (newErrors: FormErrors) => {
    const {
      otherDate
    } = formData;

    if (!otherDate) newErrors.otherDate = "This field is required.";
  }

  const validateAccountType = (newErrors: FormErrors) => {
    const {
      accountName,
      routingNumber,
      accountNumber,
      confirmAccountNumber,
      accountType,
    } = formData;
    if (!accountName) newErrors.accountName = "This field is required.";
    if (!routingNumber) newErrors.routingNumber = "This field is required.";
    if (!accountNumber) newErrors.accountNumber = "This field is required.";
    if (!confirmAccountNumber)
      newErrors.confirmAccountNumber = "This field is required.";
    if (accountNumber !== confirmAccountNumber)
      newErrors.confirmAccountNumber =
        "Confirm value does not match actual value.";
    if (!accountType) newErrors.accountType = "A selection is required.";
  };

  const validateCardType = (newErrors: FormErrors) => {
    const { nameOnCC, cardNumber, cvvNumber, countryZip, ccMonth, ccYear } =
      formData;
    if (!nameOnCC) newErrors.nameOnCC = "This field is required.";
    if (!cardNumber) newErrors.cardNumber = "This field is required.";
    if (window.ValidatePANChecksum(cardNumber) === false && cardNumber)
      newErrors.cardNumber =
        "The credit card number you entered isn't valid. Please try again.";
    if (!cvvNumber) newErrors.cvvNumber = "This field is required.";
    if (!countryZip) newErrors.countryZip = "This field is required.";
    if (!ccMonth) newErrors.ccMonth = "A selection is required.";
    if (!ccYear) newErrors.ccYear = "A selection is required.";
    const today = new Date();
    const expDate = new Date(parseInt(ccYear), parseInt(ccMonth));
    if (expDate < today) newErrors.cardExpiration = "Error";
    if (cvvNumber && cvvNumber.length < 3)
      return "Please enter at least 3 characters.";
    if (countryZip && countryZip.length < 5)
      return "Please enter a valid ZIP code.";
    return newErrors;
  };

  return (
    <>
      {payment.pageError ? (
        <fieldset name="cardExpiration">
          <div className="col-12">
            <div
              id="card-expiration"
              className="alert alert-danger pl-1 pr-2 ml-alert-err"
              role="alert"
            >
              <div className="alert-content error ml-1"></div>
              <span
                data-automation-id="setup-card-expiration-alert-text"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(payment.pageError)
                }}
              ></span>
            </div>
          </div>
        </fieldset>
      ) : (payment.prepaid && paymentRestrictions.restrictBankPayment && paymentRestrictions.restrictCardPayment) ? (
        <fieldset name="cardExpiration">
          <div className="col-12">
            <div
              id="card-expiration"
              className="alert alert-danger pl-1 pr-2 ml-alert-err"
              role="alert"
            >
              <div className="alert-content error ml-1"></div>
              <span data-automation-id="setup-card-expiration-alert-text">
                We cannot accept a Credit, Debit or ATM Card payment for this account.
              </span>
            </div>
          </div>
        </fieldset>
      ) : (payment.prepaid && payment.notEligibleforPayment) ? (
        <fieldset name="cardExpiration">
          <div className="col-12">
            <div
              id="card-expiration"
              className="alert alert-danger pl-1 pr-2 ml-alert-err"
              role="alert"
            >
              <div className="alert-content error ml-1"></div>
              <span
                data-automation-id="setup-card-expiration-alert-text"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(payment.paymentEligibilityErrorMessage)
                }}
              ></span>
            </div>
          </div>
        </fieldset>
      )
        :
        <>
          <form
            className="form wrap-errors collapse-form-validate"
            action="#"
            onSubmit={handleSubmit}
            method="post"
            data-validate-onblur="true"
          >
            <fieldset name="cardExpiration">
              {errors.cardExpiration && (
                <div className="col-12">
                  <div
                    id="#card-expiration"
                    className="alert alert-danger pl-1 pr-2 ml-alert-err"
                    role="alert"
                  >
                    <div className="alert-content error ml-1"></div>
                    <span data-automation-id="setup-card-expiration-alert-text">{cardExpiration}</span>
                  </div>
                </div>
              )}
            </fieldset>
            <fieldset>
              {errorMessages?.map((errorText: any, index: any) => (
                <div key={index} className="col-12">
                  <div
                    id={`server-errorMessage-${index}`}
                    className="alert alert-danger pl-1 pr-2 ml-alert-err"
                    role="alert"
                    data-automation-id={`setup-server-errorMessage-icon-${index}`}
                  >
                    <div className="alert-content error ml-1"></div>
                    <span data-automation-id={`setup-server-errorMessage-text-${index}`}>{errorText}</span>
                  </div>
                </div>
              ))}

              <div className="select-payment-amount-step">
                <div
                  className="payment-accordion custom-accordion"
                  id="payment-accordion"
                >
                  <PaymentAmount
                    payment={payment}
                    paymentAmount={paymentAmount}
                    setPaymentAmount={setPaymentAmount}
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                  />
                  {/* ------------------------------------PAYMENT DATE  ------------------------------------------------- */}
                  {(payment.oktaLogin && !payment.prepaid) &&
                    <PaymentDate
                      payment={payment}
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                      formData={formData}
                      setFormData={setFormData}
                      errors={errors}
                      setErrors={setErrors}
                    />}
                  <div className="box-style-border">
                    <div className="row">
                      <div className="col-12" data-automation-id="setup-payment-method-lbl">
                        <h2>Payment method</h2>
                      </div>
                      <div
                        className=""
                        id="collapseTwo"
                        data-parent="#payment-accordion"
                      >
                        <div className="payment-methods-form ">
                          <div className="form-group row justify-content-center">
                            <ul className="col-11">
                              {!paymentRestrictions.restrictBankPayment ?
                                <>
                                  <li>
                                    <div
                                      className={"card " + (selectedOption === 'accountType' ? 'bg-light' : '')}
                                      onClick={() => handleOptionChange({ target: { value: 'accountType' } })}
                                    >
                                      <div
                                        className="card-body showhide-trigger"
                                        data-show-div="bank-payment-detail"
                                        data-hide-div="credit-payment-detail"
                                      >
                                        <div className="row">
                                          <div>
                                            <input
                                              type="radio"
                                              className="form-check-input"
                                              id="radio-account-type"
                                              name="accountType"
                                              aria-label="radio-account"
                                              value="accountType"
                                              onChange={handleOptionChange}
                                              checked={selectedOption === "accountType"}
                                              data-automation-id="setup-radio-account-type"
                                            />
                                            <label
                                              className="form-check-label"
                                              htmlFor="radio-account"
                                            >
                                              <span data-automation-id="setup-checking-saving-acct-lbl">Checking or Savings account</span>
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                </>
                                : ""
                              }
                              {!paymentRestrictions.restrictCardPayment ?
                                <>
                                  <li>
                                    <div className={"card " + (selectedOption === 'cardType' ? 'bg-light' : '')}
                                      onClick={() => handleOptionChange({ target: { value: 'cardType' } })}
                                    >
                                      <div
                                        className="card-body showhide-trigger"
                                        data-show-div="credit-payment-detail"
                                        data-hide-div="bank-payment-detail"
                                      >
                                        <div className="row">
                                          <div>
                                            <input
                                              type="radio"
                                              className="form-check-input"
                                              id="radio-card-type"
                                              name="accountType"
                                              aria-label="radio-card"
                                              value="cardType"
                                              onChange={handleOptionChange}
                                              checked={selectedOption === "cardType"}
                                              data-automation-id="setup-radio-card-type"
                                            />
                                            <label
                                              className="form-check-label"
                                              htmlFor="radio-card"
                                            >
                                              <span data-automation-id="setup-credit-debit-lbl">Credit or Debit card</span>
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                </>
                                : ""
                              }
                            </ul>
                          </div>
                          <div className="payment-methods mt-3">
                            <div className="row">
                              <div className="col-sm-12 payment-margin">
                                {selectedOption === "accountType" && (
                                  <div
                                    className="bank-payment-detail adjust-margin"
                                    data-clear-fields="true"
                                    style={{}}
                                  >
                                    <fieldset>
                                      <legend className="hide" data-automation-id="setup-bank-acct-details-lbl">
                                        Bank account details
                                      </legend>
                                      <p className="details-text" data-automation-id="setup-acct-details-lbl">
                                        <strong>Enter Account Details</strong>
                                      </p>
                                      <div className="form-group">
                                        <label
                                          htmlFor="accountName"
                                          className={`${errors.accountName ? "errorMsg" : ""}`}
                                          data-automation-id="setup-name-on-acct-lbl"
                                        >
                                          Name on account
                                        </label>
                                        <div className="low-tooltip">
                                          <input
                                            type="text"
                                            id="accountName"
                                            name="accountName"
                                            className="input-with-tooltip"
                                            autoComplete="off"
                                            size={30}
                                            maxLength={31}
                                            value={formData.accountName}
                                            onChange={handleInputChange}
                                            aria-label="Name on account"
                                            aria-required="true"
                                            data-automation-id="setup-accountName-text"
                                          />
                                          <a
                                            data-tooltip-id="tooltip-display"
                                            href="#"
                                            data-html="true"
                                            className="tooltip-icon"
                                            data-tooltip-delay-hide={500}
                                            data-tooltip-delay-show={500}
                                            data-toggle="tooltip"
                                            data-tooltip-place="right"
                                            data-tooltip-html={`<div class='tooltip-inner'><div class='tooltip-content-holder'>Enter the first and last name of the authorized signer on this account.</div><button class='close-tooltip'></div></div>`}
                                            aria-label="Tooltip with redirect link"
                                            onClick={handleClick}
                                            data-automation-id="setup-accountName-tooltip"
                                          ></a>
                                          <Tooltip id="tooltip-display"></Tooltip>
                                          {errors.accountName && (
                                            <FormMessage id="setuptemplate-error-1" status={MessageStatus.ERROR} message={errors.accountName} />
                                          )}
                                        </div>
                                      </div>

                                      <div className="form-group">
                                        <label
                                          htmlFor="routingNumber"
                                          className={`${errors.routingNumber ? "errorMsg" : ""}`}
                                          data-automation-id="setup-routing-nbr-lbl"
                                        >
                                          Routing number
                                        </label>
                                        <div className="low-tooltip">
                                          <input
                                            type="tel"
                                            id="routingNumber"
                                            name="routingNumber"
                                            className="input-with-tooltip"
                                            autoComplete="off"
                                            size={30}
                                            maxLength={9}
                                            value={formData.routingNumber}
                                            onChange={handleInputChange}
                                            aria-label="Routing number"
                                            aria-required="true"
                                            data-automation-id="setup-routingNumber-text"
                                          />
                                          <a
                                            data-tooltip-id="tooltip-display"
                                            href="#"
                                            data-html="true"
                                            className="tooltip-icon"
                                            data-tooltip-delay-hide={500}
                                            data-tooltip-delay-show={500}
                                            data-toggle="tooltip"
                                            data-tooltip-place="right"
                                            data-tooltip-html={`<div class='tooltip-inner'><div class='tooltip-content-holder'>Your bank routing number is a nine-digit code printed on the bottom left side of your checks.</div><button class='close-tooltip'></div></div>`}
                                            aria-label="Tooltip with redirect link"
                                            onClick={handleClick}
                                            data-automation-id="setup-routingNumber-tooltip"
                                          ></a>
                                          <Tooltip id="tooltip-display"></Tooltip>
                                          {errors.routingNumber && (
                                            <FormMessage id="setuptemplate-error-2" status={MessageStatus.ERROR} message={errors.routingNumber} />
                                          )}
                                        </div>
                                      </div>
                                      <div className="form-group">
                                        <label htmlFor="bank-value-label" data-automation-id="setup-bank-name-lbl">
                                          Bank name
                                        </label>
                                        <input
                                          type="hidden"
                                          id="bank-value-label"
                                          className="hide"
                                          aria-label="bank name"
                                          value=""
                                          onChange={handleInputChange}
                                          data-automation-id="setup-hidden-bank-value-lbl"
                                        />
                                        <div>
                                          <label
                                            htmlFor="bank-value"
                                            className={`${errors.bankName ? "errorMsg" : ""}`}
                                            data-automation-id="setup-error-bankname-msg"
                                          >
                                            {bankName ? bankName : "---"}
                                          </label>
                                          <input
                                            type="hidden"
                                            className="bank-value"
                                            id="bankName"
                                            name="bankName"
                                            value={bankName ? bankName : ""}
                                            onChange={handleInputChange}
                                            data-automation-id="setup-hidden-bank-value-text"
                                          />
                                          {errors.bankName && (
                                            <FormMessage id="setuptemplate-error-3" status={MessageStatus.ERROR} message={errors.bankName} />
                                          )}
                                        </div>
                                      </div>
                                      <div className="form-group">
                                        <label
                                          htmlFor="accountNumber"
                                          className={`${errors.accountNumber ? "errorMsg" : ""}`}
                                          data-automation-id="setup-acct-nbr-lbl"
                                        >
                                          Account number
                                        </label>
                                        <div>
                                          <input
                                            type="text"
                                            id="accountNumber"
                                            name="accountNumber"
                                            className="input-with-tooltip"
                                            size={30}
                                            maxLength={17}
                                            value={formData.accountNumber}
                                            onBlur={handleInputBlur}
                                            onChange={handleInputChange}
                                            aria-label="Account number"
                                            aria-required="true"
                                            data-automation-id="setup-accountNumber-text"
                                          />
                                          {errors.accountNumber && (
                                            <FormMessage id="setuptemplate-error-4" status={MessageStatus.ERROR} message={errors.accountNumber} />
                                          )}
                                        </div>
                                      </div>
                                      <div className="form-group">
                                        <label
                                          htmlFor="confirmAccountNumber"
                                          className={`${errors.confirmAccountNumber ? "errorMsg" : ""}`}
                                          data-automation-id="setup-re-acct-nbr-lbl"
                                        >
                                          Re-enter account number
                                        </label>
                                        <div>
                                          <input
                                            type="text"
                                            id="confirmAccountNumber"
                                            name="confirmAccountNumber"
                                            className="input-with-tooltip"
                                            size={30}
                                            maxLength={17}
                                            value={formData.confirmAccountNumber}
                                            onBlur={handleInputBlur}
                                            onChange={handleInputChange}
                                            aria-label="confirmAcctNum"
                                            aria-required="true"
                                            data-automation-id="setup-confirmAccountNumber-text"
                                          />
                                          {errors.confirmAccountNumber && (
                                            <FormMessage id="setuptemplate-error-5" status={MessageStatus.ERROR} message={errors.confirmAccountNumber} />
                                          )}
                                        </div>
                                      </div>
                                      <div className="form-group">
                                        <label
                                          htmlFor="ddAcctType"
                                          className={`${errors.accountType ? "errorMsg" : ""}`}
                                          data-automation-id="setup-acct-type-lbl"
                                        >
                                          Account type
                                        </label>
                                        <div>
                                          <select
                                            className="required"
                                            id="accountType"
                                            name="accountType"
                                            value={formData.accountType}
                                            onChange={handleInputChange}
                                            aria-label="account-type"
                                            aria-required="true"
                                            data-automation-id="setup-accountType-select-dropdown"
                                          >
                                            <option value="">Choose</option>
                                            <option value="checking">Checking</option>
                                            <option value="savings">Savings</option>
                                          </select>
                                          {errors.accountType && (
                                            <FormMessage id="setuptemplate-error-6" status={MessageStatus.ERROR} message={errors.accountType} />
                                          )}
                                        </div>
                                      </div>
                                      <div className="form-group">
                                        <img
                                          id="check-img"
                                          src="https://webcdn.cox.com/ui/mybill/tsw_7/img/check-routing-num.gif"
                                          alt=""
                                          className="routing-image"
                                          data-automation-id="setup-check-image-details"
                                        />
                                      </div>
                                    </fieldset>
                                  </div>
                                )}

                                {selectedOption === "cardType" && (
                                  <div
                                    className="credit-payment-detail"
                                    data-clear-fields="true"
                                    data-automation-id="setup-card-type-section"
                                  >
                                    <fieldset>
                                      <legend className="hide" data-automation-id="setup-credit-card-details-lbl">
                                        Credit card details
                                      </legend>
                                      <p className="details-text" data-automation-id="setup-enter-card-details-lbl">
                                        <strong>Enter Card Details</strong>
                                      </p>

                                      <div className="form-group">
                                        <label
                                          htmlFor="txtNameOnCC"
                                          className={`${errors.nameOnCC ? "errorMsg" : ""}`}
                                          data-automation-id="setup-name-on-card-lbl"
                                        >
                                          Name on card
                                        </label>
                                        <div>
                                          <input
                                            type="text"
                                            id="nameOnCC"
                                            name="nameOnCC"
                                            className="input-with-tooltip"
                                            size={35}
                                            maxLength={31}
                                            value={formData.nameOnCC}
                                            onChange={handleInputChange}
                                            aria-label="Name on card"
                                            aria-required="true"
                                            data-automation-id="setup-name-on-card-text"
                                          />
                                          {errors.nameOnCC && (
                                            <FormMessage id="setuptemplate-error-7" status={MessageStatus.ERROR} message={errors.nameOnCC} />
                                          )}
                                        </div>
                                      </div>

                                      <div className="card-number-wrapper col-md-10 col-sm-10 pl-0">
                                        <div className="row ">
                                          <div className="form-group tooltip-z-index col-sm-6 col-md-6 pl-0 card-mobile">
                                            <label
                                              htmlFor="txtCCNum"
                                              className={`${errors.cardNumber ? "errorMsg" : ""}`}
                                              data-automation-id="setup-card-number-lbl"
                                            >
                                              Card number
                                            </label>
                                            <div className="low-tooltip">
                                              <input
                                                type="tel"
                                                id="cardNumber"
                                                name="cardNumber"
                                                className={`input-with-tooltip txtCCNum card-number all-cards form-control required ${formData.cardType}`}
                                                size={30}
                                                aria-label="Card number"
                                                autoComplete="off"
                                                value={formData.cardNumber}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                onFocus={handleInputFocus}
                                                maxLength={cardNumberMaxLength}
                                                aria-required="true"
                                                aria-describedby="txtCCNum-error"
                                                data-automation-id="setup-cardNumber-text"
                                              />
                                              <a
                                                data-tooltip-id="tooltip-display"
                                                href="#"
                                                data-html="true"
                                                className="tooltip-icon card-numb-tooltip"
                                                data-tooltip-delay-hide={500}
                                                data-tooltip-delay-show={500}
                                                data-toggle="tooltip"
                                                data-tooltip-place="bottom"
                                                data-tooltip-html={`<div class='tooltip-inner'><div class='tooltip-content-holder card-numb-tooltip'>We accept credit and debit cards with the following logos: <img src='https://webcdn.cox.com/content/dam/cox/residential/images/icons/credit_card_logos_horizontal.png'/></div><button class='close-tooltip'></div></div>`}
                                                aria-label="Tooltip with redirect link"
                                                onClick={handleClick}
                                                data-automation-id="setup-cardNumber-tooltip"
                                              ></a>
                                              <Tooltip id="tooltip-display"></Tooltip>
                                            </div>
                                            {errors.cardNumber && (
                                              <FormMessage id="setuptemplate-error-8" status={MessageStatus.ERROR} message={errors.cardNumber} />
                                            )}
                                          </div>

                                          <div className="form-group d-inline-block col-sm-6 col-md-3 cvv-mobile  cvv-z-index">
                                            <label
                                              htmlFor="cvv-number"
                                              className={`${errors.cvvNumber ? "errorMsg" : ""}`}
                                              data-automation-id="setup-cvv-lbl"
                                            >
                                              CVV
                                            </label>
                                            <div className="cvv-container low-tooltip">
                                              <input
                                                type="tel"
                                                id="cvvNumber"
                                                name="cvvNumber"
                                                maxLength={4}
                                                autoComplete="off"
                                                className="form-control cvv-number disable-copy-paste wholenumber ignore-validation"
                                                value={formData.cvvNumber}
                                                onChange={handleInputChange}
                                                data-field-selector="#txtCVV-number"
                                                aria-label="CVV"
                                                aria-required="true"
                                                aria-invalid="true"
                                                aria-describedby="cvv-number-error"
                                                data-automation-id="setup-cvvNumber-text"
                                              />
                                              <a
                                                data-tooltip-id="tooltip-display"
                                                href="#"
                                                data-html="true"
                                                className="tooltip-icon cvv-number-tooltip"
                                                data-tooltip-delay-hide={500}
                                                data-tooltip-delay-show={500}
                                                data-toggle="tooltip"
                                                data-tooltip-place="bottom"
                                                data-tooltip-html={`<div class='tooltip-inner'><div class='tooltip-content-holder card-numb-tooltip'>Find your CVV security code on the back (Visa, Mastercard, Discover) or front (AMEX) of your card. <img src='https://webcdn.cox.com/ui/mybill/tsw_7/img/CVV.png' alt='not found'/></div><button class='close-tooltip'></div></div>`}
                                                aria-label="Tooltip with redirect link"
                                                onClick={handleClick}
                                                data-automation-id="setup-cvvNumber-tooltip"
                                              ></a>
                                              <Tooltip id="tooltip-display"></Tooltip>
                                            </div>
                                            {errors.cvvNumber && (
                                              <FormMessage id="setuptemplate-error-9" status={MessageStatus.ERROR} message={errors.cvvNumber} />
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="form-group">
                                        <label htmlFor="txtCCType" className="hide" data-automation-id="setup-card-type-lbl">
                                          Card type
                                        </label>
                                        <div>
                                          <input
                                            type="text"
                                            className="txtCCType hide"
                                            value=""
                                            id="txtCCType"
                                            name="txtCCType"
                                            aria-label="Card Type"
                                            onChange={handleInputChange}
                                            data-automation-id="setup-txtCCType-text"
                                          />
                                        </div>
                                      </div>

                                      <div
                                        className="col-md-10 col-sm-10 adjust-padding-left"
                                        style={{ paddingLeft: "0px" }}
                                      >
                                        <div
                                          className="row cczip"
                                          style={{ marginTop: "-28px" }}
                                        >
                                          <div
                                            className="form-group d-inline-block col-md-6 col-sm-6 adjust-padding-left"
                                            style={{ paddingLeft: "0px" }}
                                          >
                                            <label htmlFor="Ccountry" data-automation-id="setup-country-lbl">Country</label>
                                            <div className="low-tooltip">
                                              <select
                                                className="ccCountry pl-1 valid ignore-validation"
                                                id="country"
                                                name="country"
                                                aria-label="Country"
                                                value={formData.country}
                                                onChange={handleInputChange}
                                                aria-required="true"
                                                data-automation-id="setup-country-select-dropdown"
                                              >
                                                <option value="US">
                                                  United States
                                                </option>
                                                <option value="mexico">Mexico</option>
                                                <option value="canada">Canada</option>
                                                <option value="UK">UK</option>
                                              </select>
                                              <a
                                                data-tooltip-id="tooltip-display"
                                                href="#"
                                                data-html="true"
                                                className="tooltip-icon country-tooltip"
                                                data-tooltip-delay-hide={500}
                                                data-tooltip-delay-show={500}
                                                data-toggle="tooltip"
                                                data-tooltip-place="bottom"
                                                data-tooltip-html={`<div class='tooltip-inner'><div class='tooltip-content-holder card-numb-tooltip'>Contact us if the country for your billing address is not listed.</div><button class='close-tooltip'></div></div>`}
                                                aria-label="Tooltip with redirect link"
                                                onClick={handleClick}
                                                data-automation-id="setup-country-name-tooltip"
                                              ></a>
                                              <Tooltip id="tooltip-display"></Tooltip>
                                            </div>
                                          </div>
                                          <div className="form-group d-inline-block col-md-5 col-sm-6 zipcode-z-index zip-mobile ">
                                            <label
                                              htmlFor="txtCCZip"
                                              className={`${errors.countryZip ? "errorMsg align-zip" : "align-zip"}`}
                                              data-automation-id="setup-error-country-zip-msg"
                                            >{`${isCanadaUK() ? "Postal code" : "ZIP code"}`}</label>
                                            <div>
                                              <input
                                                type="text"
                                                id="countryZip"
                                                name="countryZip"
                                                autoComplete="off"
                                                className="txtCCZip form-control disable-copy-paste numbersonly zipcodeUS ignore-validation"
                                                aria-label="ZIP code"
                                                value={formData.countryZip}
                                                onChange={handleInputChange}
                                                aria-required="true"
                                                maxLength={zipMaxLength}
                                                aria-describedby="txtCCZip-error"
                                                data-automation-id="setup-country-zip-text"
                                              />
                                              {errors.countryZip && (
                                                <FormMessage id="setuptemplate-error-10" status={MessageStatus.ERROR} message={errors.countryZip} />
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="form-group">
                                        <div className="col-md-10 col-sm-10 adjust-padding-left">
                                          <label
                                            htmlFor="ccExpiration"
                                            className={`${errors.ccMonth ? "errorMsg" : ""}`}
                                            data-automation-id="setup-exp-date-lbl"
                                          >
                                            Expiration date
                                          </label>
                                          <div className="row expiration-date">
                                            <div className="form-group d-inline-block col-md-6 col-sm-6 adjust-padding-left month-select">
                                              <select
                                                className="ccMonth month-expiration ignore-validation"
                                                id="ccMonth"
                                                name="ccMonth"
                                                value={formData.ccMonth}
                                                onChange={handleInputChange}
                                                aria-label="expiration-date"
                                                aria-required="true"
                                                aria-describedby="ccMonth-error"
                                                data-automation-id="setup-ccMonth-select-dropdown"
                                              >
                                                <option value="">Month</option>
                                                <option value="01">01</option>
                                                <option value="02">02</option>
                                                <option value="03">03</option>
                                                <option value="04">04</option>
                                                <option value="05">05</option>
                                                <option value="06">06</option>
                                                <option value="07">07</option>
                                                <option value="08">08</option>
                                                <option value="09">09</option>
                                                <option value="10">10</option>
                                                <option value="11">11</option>
                                                <option value="12">12</option>
                                              </select>
                                              {errors.ccMonth && (
                                                <FormMessage id="setuptemplate-error-11" status={MessageStatus.ERROR} message={errors.ccMonth} />
                                              )}
                                            </div>
                                            <div className="form-group d-inline-block col-md-6 col-sm-6  year-select">
                                              <select
                                                className="ccYear year-expiration ignore-validation"
                                                id="ccYear"
                                                name="ccYear"
                                                value={formData.ccYear}
                                                onChange={handleInputChange}
                                                aria-label="expiration-date"
                                                aria-required="true"
                                                aria-describedby="ccYear-error"
                                                data-automation-id="setup-ccYear-select-dropdown"
                                              >
                                                <option value="">Year</option>
                                                {listOfYears?.map((yearText: any, index: any) => (
                                                  <option key={index} value={yearText}>{yearText}</option>
                                                ))}
                                              </select>
                                              {errors.ccYear && (
                                                <FormMessage id="setuptemplate-error-12" status={MessageStatus.ERROR} message={errors.ccYear} />
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </fieldset>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group submit-button">
                <div className="payment-submit-btn">
                  <Button
                    isFormSubmit={true}
                    openInNewTab={false}
                    alignment={AlignmentProps.CENTER}
                    text="Continue"
                    size=""
                    buttonStates={ButtonStates.ACTIVE}
                    buttonTypes={ButtonTypes.PRIMARY}
                    data-automation-id="setup-submit-button"
                  />
                </div>
              </div>
            </fieldset>
          </form>
        </>
      }
    </>
  );
};

export default SetupTemplate;
