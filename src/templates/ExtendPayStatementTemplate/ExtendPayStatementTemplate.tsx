import { useEffect, useState } from "react";
import {
  AlignmentProps,
  Button,
  ButtonStates,
  ButtonTypes,
  FormRadioButton,
  FormOptionsTypes,
  FormMessage,
  MessageStatus,
  useAxios,
} from "@cox/core-ui8";
import {
  EXTEND_PAYMENT_SETUP_PROTOTYPE,
  EXTEND_PAYMENT_SETUP_URL,
} from "../../hooks/constants";
import InfoAlert from "../../components/Alerts/InfoAlert";
import ErrorAlert from "../../components/Alerts/ErrorAlert";
import { Spinner } from "@cox/core-ui8/dist/Spinner";
import { setUDOVariables } from "../../hooks/utils";

interface Statement {
  id: string;
  statementCode: string;
  name: string;
  totalBalanceDue: string;
  pastDueBalance: string;
  otherAmount: string; // restored value when user previously chose "Other amount"
  paymentOption: "totalBalance" | "pastDue" | "otherAmount"; // restored selection on Back
  label: string; // sub-label shown under "Min due" (e.g. due date text)
}

// Payload sent to the backend on form submission.
interface FormData {
  option: string; // selected payment option: "totalBalance" | "pastDue" | "otherAmount"
  value: string; // dollar amount for the selected option
  statementCode: string;
}

// Defined outside the component so it is not recreated on every render.
const initialFormData: FormData = {
  option: "",
  value: "",
  statementCode: "",
};

const ExtendPayStatementTemplate = ({
  payment,
  onPostSubmitResponse,
  formError,
  setFormError,
}: any) => {
  const { statements = [], udoVariables } = payment;
  // Extend payment always has a single statement.
  const statement: Statement = statements[0];

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [inputError, setInputError] = useState<string>("");
  const [errorMessages, setErrorMessages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Updates the selected payment option and its corresponding value.
  // Clears any "Other amount" validation error when switching away from it.
  const handleRadioSelect = (option: string, value: string) => {
    if (option !== "otherAmount") {
      setInputError("");
    }
    setFormData({
      option: option,
      value: value,
      statementCode: formData.statementCode,
    });
  };

  // Validates the "Other amount" input value against business rules:
  // - must not be empty
  // - must not be less than the minimum due (pastDueBalance)
  const validateOtherAmount = (value: string) => {
    if (value === "") {
      setInputError("This field is required.");
    } else if (statement && Number(value) < Number(statement.pastDueBalance)) {
      setInputError("Amount cannot be less than minimum due.");
    } else {
      setInputError("");
    }
  };

  // Handles typing in the "Other amount" text input.
  // - Rejects non-numeric input and values with more than 2 decimal places.
  // - Focusing the input auto-selects the "Other amount" payment option.
  // - Validates inline while the user types (only when already on "otherAmount").
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    // Allow only numeric input with two digits after decimal for "otherAmount"
    if (name.includes("otherAmount") && !/^\d{0,6}(\.\d{0,2})?$/.test(value)) {
      return; // Ignore non-numeric input
    }
    if (formData.option === "otherAmount") {
      validateOtherAmount(value);
    }
    setFormData({
      option: "otherAmount",
      value: value,
      statementCode: formData.statementCode,
    });
  };

  // Re-validates the "Other amount" input when focus leaves the field.
  const handleInputBlur = (e: any) => {
    if (formData.option === "otherAmount") {
      validateOtherAmount(e.target.value);
    }
  };

  // Handles the response from the backend after form submission.
  // On server-side validation failure, displays error messages at the top.
  // On success, navigates to the next step (setup-mop page) via the parent callback.
  const handleOnComplete = (data: any) => {
    if (data.pageName !== "error" && data?.errorMessages?.length > 0) {
      console.log("Server side validation are not successful.");
      setIsSubmitting(false);
      setErrorMessages(data.errorMessages);
    } else {
      console.log("Server side validation is successful.");
      setErrorMessages([]);
      onPostSubmitResponse(data);
    }
    window.scrollTo(0, 0);
  };

  const { axiosAPI } = useAxios({
    autoFetch: false,
    onCompleted: (data) => handleOnComplete(data),
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Guard: "Other amount" selected but no value typed yet
    if (formData.option === "otherAmount" && formData.value === "") {
      setInputError("This field is required.");
      return;
    }
    // Guard: block submission if any inline validation error is present
    if (formError) {
      return;
    }
    setIsSubmitting(true);
    const currentUrl = window.location.href;
    // Prototype flow: redirect directly without a backend call
    if (currentUrl.includes("/ui/v8")) {
      window.location.href = EXTEND_PAYMENT_SETUP_PROTOTYPE;
    } else {
      const host = window.location.origin;
      axiosAPI({
        url: `${host}${EXTEND_PAYMENT_SETUP_URL}`,
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        data: JSON.stringify(formData),
      });
    }
  };

  // On mount: set UDO analytics variables and restore the user's previous selection.
  // The backend returns `statement.paymentOption` and `statement.otherAmount` when
  // the user navigates Back from the setup-mop page, allowing full state restoration.
  useEffect(() => {
    setTimeout(function () {
      setUDOVariables(udoVariables);
    }, 0);

    if (statement) {
      const restoredOption = statement.paymentOption || "totalBalance";
      setFormData({
        option: restoredOption,
        value:
          restoredOption === "otherAmount"
            ? (statement.otherAmount ?? "")
            : restoredOption === "pastDue"
              ? statement.pastDueBalance
              : statement.totalBalanceDue,
        statementCode: statement.statementCode,
      });
    }
  }, []);

  // Propagate the input error state up to the parent so it can show a
  // top-level error alert banner ("Please correct the items below").
  useEffect(() => {
    setFormError(!!inputError);
  }, [inputError]);

  // Derived value for the "Other amount" input — empty when a different option is selected.
  const otherAmountValue =
    formData.option === "otherAmount" ? formData.value : "";

  return (
    <>
      {/* Full-page spinner shown during form submission */}
      {isSubmitting && !(errorMessages?.length > 0) && (
        <div className="throbber-container" data-automation-id="throbber">
          <Spinner size={"xl"} />
        </div>
      )}
      <div id="extend-payment-setup-container">
        {/* No statement available banner */}
        {payment?.noStmtAvailable?.noStmtAvailable && (
          <InfoAlert
            message={payment?.noStmtAvailable?.message}
            id="no-statement-available-alert"
          />
        )}
        {/* Server-side validation error messages */}
        {errorMessages?.length > 0 && (
          <>
            {errorMessages.map((message: any, index: number) => (
              <div key={index}>
                <ErrorAlert message={message} id="extend-payment" />
              </div>
            ))}
          </>
        )}
        {/* Main form — only rendered when a statement is available */}
        {!payment?.noStmtAvailable?.noStmtAvailable && statement && (
          <form
            className="extend-payment-setup-form"
            action=""
            onSubmit={handleSubmit}
          >
            <div>
              {/* Statement card header — displays statement name and total balance */}
              <div className="statement-radio-button-card selected-statement-radio-button-card">
                <div className="statement-radio-button">
                  <p className="single-statement-label">{`Statement ${statement.statementCode}: ${statement.name}`}</p>
                </div>
                <span className="statement-price">
                  ${statement.totalBalanceDue}
                </span>
              </div>

              {/* Payment amount options */}
              <div className="statement-details-container">
                <div>
                  <h4 className="body-header">Payment amount</h4>
                  <p className="body-text">
                    You must pay at least the minimum due to extend.
                  </p>
                </div>
                <div className="radio-group-container">
                  {/* TOTAL BALANCE DUE */}
                  <div>
                    <div className="radio-button-container">
                      <FormRadioButton
                        id={statement.totalBalanceDue}
                        title={"Total balance due"}
                        name="extend-pay-option"
                        type={FormOptionsTypes.radio}
                        onChange={() =>
                          handleRadioSelect(
                            "totalBalance",
                            statement.totalBalanceDue,
                          )
                        }
                        items={[
                          {
                            text: `Total balance due:`,
                            selected: formData.option === "totalBalance",
                            disabled: false,
                            value: statement.totalBalanceDue,
                          },
                        ]}
                      />
                      <span className="fw-bold">
                        ${statement.totalBalanceDue}
                      </span>
                    </div>
                    <span className="label-sub-text">
                      (Including min due amount)
                    </span>
                  </div>

                  {/* MINIMUM DUE */}
                  <div>
                    <div className="radio-button-container">
                      <FormRadioButton
                        id={statement.pastDueBalance}
                        title={"Min due"}
                        name="extend-pay-option"
                        type={FormOptionsTypes.radio}
                        onChange={() =>
                          handleRadioSelect("pastDue", statement.pastDueBalance)
                        }
                        items={[
                          {
                            text: `Min due:`,
                            selected: formData.option === "pastDue",
                            disabled: false,
                            value: statement.pastDueBalance,
                          },
                        ]}
                      />
                      <span className="fw-bold">
                        ${statement.pastDueBalance}
                      </span>
                    </div>
                    <span className="label-sub-text">{statement.label}</span>
                  </div>

                  {/* OTHER AMOUNT — focusing the input auto-selects this option */}
                  <div>
                    <div
                      className={`radio-button-container align-items-center ${inputError ? "add-margin" : ""}`}
                    >
                      <FormRadioButton
                        id="Other amount"
                        title={"Other amount"}
                        name="extend-pay-option"
                        type={FormOptionsTypes.radio}
                        onChange={() =>
                          handleRadioSelect("otherAmount", otherAmountValue)
                        }
                        items={[
                          {
                            text: `Other amount:`,
                            selected: formData.option === "otherAmount",
                            disabled: false,
                            value: otherAmountValue,
                          },
                        ]}
                      />
                      <div className="other-amount-input-container">
                        <input
                          type="text"
                          name={`otherAmount-${statement.id}`}
                          className={`${inputError ? "text-input-error" : ""}`}
                          id={`otherAmount-${statement.id}`}
                          aria-label={`otherAmount-${statement.id}`}
                          placeholder="Other amount"
                          value={otherAmountValue}
                          onChange={(e) => handleInputChange(e)}
                          onBlur={(e) => handleInputBlur(e)}
                          onFocus={(e) => handleInputChange(e)}
                          data-testid={`other-amount-input-${statement.id}-input-control`}
                        />
                        {inputError && (
                          <FormMessage
                            id={`extend-pay-other-amount-${statement.id}`}
                            status={MessageStatus.ERROR}
                            message={inputError}
                          />
                        )}
                      </div>
                    </div>
                    <span className="label-sub-text">
                      (Cannot be lower than min due)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group submit-button pt-3">
              <div className={`payment-submit-btn`}>
                <Button
                  isFormSubmit={true}
                  openInNewTab={false}
                  alignment={AlignmentProps.LEFT}
                  text="Continue"
                  size=""
                  buttonStates={ButtonStates.ACTIVE}
                  buttonTypes={ButtonTypes.PRIMARY}
                />
              </div>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default ExtendPayStatementTemplate;
