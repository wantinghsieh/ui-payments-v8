import { useEffect, useState } from "react";
import Setup from "../templates/AddPaymentMethodTemplates/Setup";
import Success from "../templates/AddPaymentMethodTemplates/Success";
import Failure from "../templates/AddPaymentMethodTemplates/Failure";
import PageHeader from "../components/PageHeader";
import { setUDOVariables } from "../hooks/utils";

function AddPaymentMethod({ sections }: any) {
  const { payment = {} } = sections;

  const [paymentData, setPaymentData] = useState(payment);

  useEffect(() => {
    if (paymentData?.udoVar) {
      setTimeout(function () {
        setUDOVariables(paymentData?.udoVar);
      }, 0);
    }
  }, []);

  return (
    <div
      id="add-payment-method"
      className={`container ${payment.customerType === "residential" ? "add-payment-wrapper" : ""} ${payment.customerType === "business" ? "cox-busi" : ""}`}
      tabIndex={-1}
    >
      <div className="col-12 col-lg-8 col-xl-9 mx-auto ">
        <div className="card-theme-white mt-4 mb-4">
          <div className="page-container">
            <PageHeader
              id="add-payment-method"
              primaryHeader={payment.headerText}
              secondaryHeader={
                !paymentData.showResponse &&
                !paymentData?.trustlyMethodApproval &&
                payment.subHeaderText
              }
            />

            {!paymentData.showResponse &&
              !paymentData?.trustlyMethodApproval && (
                <Setup
                  paymentData={paymentData}
                  setPaymentData={setPaymentData}
                  paymentRestrictions={paymentData.paymentRestrictions}
                />
              )}

            {paymentData.showResponse &&
              paymentData?.messages?.successMessages?.length > 0 && (
                <Success payment={paymentData} />
              )}
            {paymentData.showResponse &&
              paymentData?.messages?.errorMessages?.length > 0 && (
                <Failure payment={paymentData} />
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddPaymentMethod;
