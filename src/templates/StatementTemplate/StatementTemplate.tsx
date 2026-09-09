import React, { useEffect, useRef, useState } from "react";
import {
  AlignmentProps,
  Button,
  ButtonStates,
  ButtonTypes,
  FormCheckbox,
  FormMessage,
  FormOptionsLayout,
  FormOptionsTypes,
  FormRadioButton,
  MessageStatus,
  useAxios,
} from "@cox/core-ui8";
import {
  ONE_TIME_PAYMENT_SETUP_MOP_PAGE_PROTOTYPE,
  ONE_TIME_PAYMENT_STATEMENT_POST_URL,
} from "../../hooks/constants";
import ErrorAlert from "../../components/Alerts/ErrorAlert";
import InfoAlert from "../../components/Alerts/InfoAlert";
import { Spinner } from "@cox/core-ui8/dist/Spinner";

interface Statement {
  id: string;
  statementCode: string;
  name: string;
  totalBalanceDue: string;
  pastDueBalance: string;
  otherAmount: string;
  selected: boolean;
  paymentOption: "totalBalance" | "pastDue" | "otherAmount";
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface RequestParams {
  selectedStatement: Statement[];
  pageName: string;
  totalAmount: string;
}

function StatementTemplate({ payment, onPostSubmitResponse }: any) {
  const { statements = [] } = payment;

  const [statementData, setStatementData] = useState<Statement[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const { axiosAPI } = useAxios({
    autoFetch: false, // autoFetch will make a call on laod
    onCompleted: (data: any) => {
      handleOnComplete(data);
    },
    onError: (error) => {
      console.log("onAjaxError", error);
    },
  });

  useEffect(() => {
    if (statements) {
      const updatedStatements = statements.map((statement: Statement) => ({
        ...statement,
        id: statement.statementCode + statement.name,
        otherAmount: statement.otherAmount ? statement.otherAmount : "",
        paymentOption: statement.paymentOption
          ? statement.paymentOption
          : "totalBalance",
      }));
      setStatementData(updatedStatements);
      setTotalAmount(
        updatedStatements.reduce(
          (acc: number, statement: Statement) =>
            statement.selected
              ? acc + parseFloat(statement.totalBalanceDue)
              : acc,
          0.0
        )
      );
    }
  }, [statements]);

  const toggleCheckbox = (statId: string) => {
    setStatementData((prev) =>
      prev.map((stat) => {
        if (stat.id === statId) {
          return {
            ...stat,
            selected: !stat.selected,
            paymentOption: "totalBalance",
            otherAmount: "",
          };
        } else {
          return stat;
        }
      })
    );

    setErrors((prevErrors: FormErrors) => {
      const restErrors = { ...prevErrors };
      delete restErrors.noStatementSelected;
      delete restErrors[`otherAmount-${statId}`];
      return restErrors;
    });
  };

  // Recalculate totalAmount whenever statementData changes
  useEffect(() => {
    const total = statementData.reduce(
      (acc: number, statement: Statement) =>
        statement.selected
          ? acc +
          (statement.paymentOption === "totalBalance"
            ? parseFloat(statement.totalBalanceDue)
            : statement.paymentOption === "pastDue"
              ? parseFloat(statement.pastDueBalance)
              : parseFloat(statement.otherAmount || "0"))
          : acc,
      0.0
    );
    setTotalAmount(Number(total));
    setShowErrorAlert(false);

    setErrorMessages([]);
  }, [statementData]);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    if (isSubmitting) return;

    const newErrors: FormErrors = {};

    validateStatement(newErrors);

    const updatedErrors = {
      ...errors,
      ...newErrors,
    }; /* Combine existing errors with new errors */
    setErrors(updatedErrors);

    /* If there are no errors, proceed with form submission */
    if (Object.keys(updatedErrors).length === 0) {
      setIsSubmitting(true);
      const currentUrl = window.location.href;
      if (currentUrl.includes("/ui/v8")) {
        window.location.href = ONE_TIME_PAYMENT_SETUP_MOP_PAGE_PROTOTYPE;
        setIsSubmitting(false);
        return;
      }

      const requestParams: RequestParams = {
        selectedStatement: [],
        pageName: "",
        totalAmount: "0",
      };

      const selectedStatements = statementData.filter(
        (statement) => statement.selected
      );
      requestParams.selectedStatement = selectedStatements;
      requestParams.totalAmount = totalAmount.toString();
      requestParams.pageName = "setup";

      try {
        const host = window.location.origin;
        await axiosAPI({
          url: `${host}${ONE_TIME_PAYMENT_STATEMENT_POST_URL}`,
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
      setShowErrorAlert(true);
      setIsSubmitting(false);
      return;
    }
  };

  const updatePaymentOption = (
    statId: string,
    option: "totalBalance" | "pastDue" | "otherAmount"
  ) => {
    setStatementData((prev) =>
      prev.map((statement) =>
        statement.id === statId
          ? { ...statement, paymentOption: option }
          : statement
      )
    );

    if (option !== "otherAmount") {
      setStatementData((prev) =>
        prev.map((statement) =>
          statement.id === statId
            ? { ...statement, otherAmount: "" }
            : statement
        )
      );
      setErrors((prevErrors) => {
        const restErrors = { ...prevErrors };
        delete restErrors[`otherAmount-${statId}`];
        return restErrors;
      });
    } else {
      const element = inputRefs.current[statId];
      if (element) element.focus();
    }
  };

  const validateStatement = (newErrors: FormErrors) => {
    const isNoStatementSelected = !statementData.some(
      (statement) => statement.selected
    );
    if (isNoStatementSelected) {
      newErrors.noStatementSelected = "Select a statement";
    }

    statementData.forEach((statement) => {
      if (statement.paymentOption === "otherAmount" && !statement.otherAmount) {
        newErrors[`otherAmount-${statement.id}`] = "This field is required.";
      }
    });
  };

  const handleOnComplete = (data: any) => {
    console.log("onAjaxCompleted", data);
    if (data?.pageName !== "error" && data?.errorMessages !== null && data?.errorMessages?.length > 0) {
      console.log("Server side validation is not successful.");
      setErrorMessages(data.errorMessages);
    } else {
      console.log("Server side validation is successful.");
      setErrorMessages([]);
      // Callback to parent which navigates user to setup-mop page
      onPostSubmitResponse(data);
    }
    window.scrollTo(0, 0);
  };

  const handleInputChange = (event: any, statId: string) => {
    const { name, value } = event.target;

    // Allow only numeric input with two digits after decimal for "otherAmount"
    if (name.includes("otherAmount") && !/^\d{0,6}(\.\d{0,2})?$/.test(value)) {
      return; // Ignore non-numeric input
    }

    const updatedStatements = statementData.map((statement) => {
      if (statement.id === statId) {
        return {
          ...statement,
          otherAmount: value,
        };
      }
      return statement;
    });

    setStatementData(updatedStatements);

    const error = validateField(name, value);

    setErrors((prev: any) => {
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

    const error = validateField(name, value);

    setErrors((prev: any) => {
      if (error) {
        return { ...prev, [name]: error };
      } else {
        const { [name]: removedError, ...rest } = prev;
        return rest;
      }
    });
  };

  const validateField = (name: string, value: string): string | undefined => {
    if (name.includes("otherAmount")) {
      if (!value.trim()) {
        return "This field is required.";
      }
      if (value === ".") {
        return "Please enter a valid currrency.";
      }
    }
    return undefined;
  };

  return (
    <>
      <div id="payment-statements">
        {isSubmitting &&
          <div className="throbber-container" data-automation-id="throbber">
            <Spinner
              size={'xl'}
            />
          </div>
        }
        {payment?.noStmtAvailable?.noStmtAvailable &&
          <InfoAlert message={payment?.noStmtAvailable?.message} id="no-statement-available-alert" />
        }
        {errorMessages?.map((errorText: any, index: any) => (
          <div key={index}>
            <ErrorAlert message={errorText} id="one-time-payment" />
          </div>
        ))}
        {showErrorAlert && (
          <ErrorAlert
            message="Please correct the items marked below to continue."
            id="one-time-payment"
          />
        )}
        {!payment?.noStmtAvailable?.noStmtAvailable &&
          <div className="content mt-2">
            {statements?.length > 1 && (
              <p
                className="content-heading"
                data-testid="makepayment-description"
              >
                Select which statement you would like to pay.
              </p>
            )}
            <form
              className="form wrap-errors collapse-form-validate"
              action="#"
              onSubmit={handleSubmit}
              method="post"
              data-validate-onblur="true"
            >
              <div className="statement-container">
                {statementData.map((statement: any) => (
                  <div className="statement" key={statement.id}>
                    <div
                      className={`statement-card ${statement.selected ? "selected-card" : ""} ${errors.noStatementSelected ? "error-border" : ""} ${statements?.length === 1 ? "backgrounf-white" : ""}`}
                    >
                      {statements?.length > 1 ? (
                        <FormCheckbox
                          type={FormOptionsTypes.checkbox}
                          title=""
                          name={statement.statementCode + statement.name}
                          layout={FormOptionsLayout.HORIZONTAL}
                          id={`statement-checkbox-${statement.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`}
                          parameters={false}
                          radioCheckMark="/content/dam/cox/common/icons/ui_components/white-check-mark.svg"
                          checkboxCheckMark="/content/dam/cox/common/icons/ui_components/white-check-mark.svg"
                          onChange={() => toggleCheckbox(statement.id)}
                          items={[
                            {
                              text:
                                "Statement " +
                                statement.statementCode +
                                ": " +
                                statement.name,
                              selected: statement.selected,
                              disabled: false,
                              value: "on",
                            },
                          ]}
                        />
                      ) : (
                        <span className="single-statement">{`Statement ${statement.statementCode}: ${statement.name}`}</span>
                      )}
                      <span className="statement-price">
                        ${statement.totalBalanceDue}
                      </span>
                    </div>
                    {statement.selected && (
                      <div
                        className={`statement-details ${statements?.length === 1 ? "details-layout" : ""}`}
                      >
                        <h4 className="font-weight-500">Payment amount</h4>
                        {/* TOTAL BALANCE RADIO */}
                        <div
                          className={`payment-option total-balance-${statement.id}`}
                        >
                          <div>
                            {" "}
                            <div className="payment-option-label">
                              {/* value is suffixed with the statement id so the
                                  control's internal input id/htmlFor stays unique
                                  per statement — otherwise selecting one
                                  statement's option toggles another's. */}
                              <FormRadioButton
                                id={`total-balance-radio-${statement.id}`}
                                title="Total balance due"
                                name={`total-balance-option-${statement.id}`}
                                type={FormOptionsTypes.radio}
                                onChange={() =>
                                  updatePaymentOption(
                                    statement.id,
                                    "totalBalance"
                                  )
                                }
                                items={[
                                  {
                                    text: "Total balance due:",
                                    selected:
                                      statement.paymentOption === "totalBalance",
                                    disabled: false,
                                    value: `totalBalance-${statement.id}`,
                                  },
                                ]}
                              />
                              <span className="total-balance-value">
                                &nbsp;<b>${statement.totalBalanceDue}</b>
                              </span>
                            </div>
                            {statement.pastDueBalance != 0 && (
                              <span className="including-past-due">
                                Includes past due amount of $
                                {statement.pastDueBalance}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* PAST DUE RADIO */}
                        {statement.pastDueBalance != 0 && (
                          <div className="payment-option past-due">
                            <div>
                              <div className="payment-option-label">
                                <FormRadioButton
                                  id={`past-due-radio-${statement.id}`}
                                  title="Past amount due"
                                  name={`past-due-option-${statement.id}`}
                                  type={FormOptionsTypes.radio}
                                  onChange={() =>
                                    updatePaymentOption(statement.id, "pastDue")
                                  }
                                  items={[
                                    {
                                      text: "Past amount due:",
                                      selected:
                                        statement.paymentOption === "pastDue",
                                      disabled: false,
                                      value: `pastDue-${statement.id}`,
                                    },
                                  ]}
                                />
                                <span className="past-due-value">
                                  &nbsp;<b>${statement.pastDueBalance}</b>
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* OTHER AMOUNT RADIO */}
                        <div className="payment-option other-amount">
                          <div
                            className={`other-amount-wrapper align-items-center ${errors[`otherAmount-${statement.id}`] ? "add-margin" : ""}`}
                            onClick={() =>
                              updatePaymentOption(statement.id, "otherAmount")
                            }
                          >
                            <FormRadioButton
                              id={`other-amount-radio-${statement.id}`}
                              title="Other amount"
                              name={`other-amount-option-${statement.id}`}
                              type={FormOptionsTypes.radio}
                              onChange={() =>
                                updatePaymentOption(statement.id, "otherAmount")
                              }
                              items={[
                                {
                                  text: "Other amount:",
                                  selected:
                                    statement.paymentOption === "otherAmount",
                                  disabled: false,
                                  value: `otherAmount-${statement.id}`,
                                },
                              ]}
                            />
                            <div
                              className="other-amount-input-container"
                              data-testid={`other-amount-input-${statement.id}-container`}
                            >
                              <input
                                type="text"
                                name={`otherAmount-${statement.id}`}
                                className={`other-amount-input ${errors[`otherAmount-${statement.id}`] ? "text-input-error" : ""}`}
                                id={`otherAmount-${statement.id}`}
                                aria-label={`otherAmount-${statement.id}`}
                                placeholder="Other amount"
                                value={statement.otherAmount}
                                ref={(element) => (inputRefs.current[statement.id] = element)}
                                onChange={(e) =>
                                  handleInputChange(e, statement.id)
                                }
                                onBlur={handleInputBlur}
                                data-testid={`other-amount-input-${statement.id}-input-control`}
                              />
                              {errors[`otherAmount-${statement.id}`] && (
                                <FormMessage
                                  id={`other-amount-${statement.id}`}
                                  status={MessageStatus.ERROR}
                                  message={errors[`otherAmount-${statement.id}`] || ""}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {errors.noStatementSelected && (
                <FormMessage
                  id="statement-selection"
                  status={MessageStatus.ERROR}
                  message={errors.noStatementSelected || ""}
                />
              )}
              <div className="statement-total" data-testid="statement-total">
                {statements?.length > 1 && (
                  <p className="total-amount" data-testid="total-amount">
                    Amount to be paid: ${totalAmount.toFixed(2)}
                  </p>
                )}
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
          </div>
        }
      </div>
    </>
  );
}

export default StatementTemplate;
