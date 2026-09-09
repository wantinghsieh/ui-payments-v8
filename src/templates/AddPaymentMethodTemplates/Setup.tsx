import { useState, useEffect } from "react";
import { ButtonTypes } from "@cox/core-ui8";
import {
  FETCH_TRUSTLY_METHOD_APPROVAL_URL,
  ADD_PAYMENT_METHOD_ADD_CARD_URL,
} from "../../hooks/constants";
import ErrorAlert from "../../components/Alerts/ErrorAlert";
import AddPaymentMethod from "../../components/AddPaymentMethod";

const Setup = ({ paymentData, setPaymentData, paymentRestrictions }: any) => {
  const [activeTab, setActiveTab] = useState("bankAccount");

  const formButtons: any = [
    {
      isFormSubmit: true,
      buttonTypes: ButtonTypes.PRIMARY,
      text: "Add Card",
      cssClass: "review-buttons text-center mt-2 mb-2",
      id: "add-btn",
    },
  ];

  const handleResponse = (response: any) => {

    // Handle the response here
    console.log(response);
    if (response?.messages?.errorMessages?.length > 0) {
      setPaymentData((prev: any) => ({
        ...prev,
        messages: response?.messages,
      }));
      const element = document.getElementById('add-payment-method');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    else {
      window.location.reload();
    }

  };

  // show/hide active tabs based on payment.paymentRestrictions
  useEffect(() => {
    if (paymentRestrictions?.restrictBankPayment) {
      setActiveTab("creditCard");
    } else if (paymentRestrictions?.restrictCardPayment) {
      setActiveTab("bankAccount");
    }
  }, [paymentRestrictions]);

  return (
    <>
      {paymentData.notEligibleforPayment ? (
        <ErrorAlert message={paymentData.eligibilityErrorMessage} id="add-payment-method-eligibility-error" />
      ) :
        <div>
          {paymentRestrictions?.allPaymentRestricted ||
            (paymentRestrictions?.restrictBankPayment &&
              paymentRestrictions?.restrictCardPayment) ? (
            <ErrorAlert
              message={`<span data-automation-id="payment-restriction-alert-text">
              We apologize for the inconvenience, but online payments and automatic EasyPay
              transactions using bank accounts, credit, or debit cards are currently
              unavailable on your account.
              <br /><br />
              To continue, please make your payment in cash at any <a href="/aboutus/contact-us/cox-centers.html">
              Spectrum Store</a> or through an authorized third-party retailer. Thank you for your understanding.
              </span>`}
              id="add-payment-method-restriction-error"
            />
          ) : (
            <>
              <AddPaymentMethod
                id="add-payment-method"
                payment={paymentData}
                showExistingPaymentMethodsTab={false}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                paymentRestrictions={paymentRestrictions}
                formButtons={formButtons}
                trustlyMethodUrl={FETCH_TRUSTLY_METHOD_APPROVAL_URL}
                saveCardApiUrl={ADD_PAYMENT_METHOD_ADD_CARD_URL}
                onResponse={handleResponse}
              />
            </>
          )}
        </div>
      }
    </>
  );
};

export default Setup;
