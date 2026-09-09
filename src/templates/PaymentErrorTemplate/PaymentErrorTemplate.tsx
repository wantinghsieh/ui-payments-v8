import { useDebugValue, useEffect } from "react";
import { setUDOVariables } from "../../hooks/utils";

const PaymentErrorTemplate = ({ paymentError, udoVars }: any) => {
  const {
    title = "",
    errorCode = "",
    errorMessage = ""
  } = paymentError;

  useEffect(() => {
    setTimeout(function () {
      setUDOVariables(udoVars);
    }, 0);
  }, [])

  return (
    <>
      {errorMessage ?
        <div className="error-container">
          <div
            id="#token-expiration"
            className="alert alert-danger pl-1 pr-2 ml-alert-err"
            role="alert"
            data-automation-id="token-expire-invalid-alert-color"
          >
            <div className="alert-content error ml-1" data-automation-id="token-expire-invalid-alert-icon"></div>
            <span data-automation-id="token-expire-invalid-alert-text">
              {errorMessage}
            </span>
          </div>
        </div>
        :
        ""
      }
    </>
  );
};

export default PaymentErrorTemplate;
