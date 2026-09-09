import DOMPurify from "dompurify";
import { FormMessage, FormOptionsTypes, FormRadioButton, MessageStatus } from "@cox/core-ui8";
function PaymentAmount({ payment, paymentAmount, setPaymentAmount, formData, setFormData, errors, setErrors }: any) {
    const { paymentSetupDetails, prepaid, oktaLogin } = payment;

    const handleCardClick = (option: string) => {
        setPaymentAmount(option);

        if (option !== "select-payment-option-3") {
            setErrors((prev: any) => ({ ...prev, payDifferentAmount: "" }));
            setFormData((prev: any) => ({ ...prev, payDifferentAmount: "" }));
        }
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

    }

    const handleInputChange = (event: any) => {
        const { name, value } = event.target;

        // Allow only numeric input with optional decimal for "payDifferentAmount"
        if (name === "payDifferentAmount" && !/^\d*\.?\d*$/.test(value)) {
            return; // Ignore non-numeric input
        }

        // Update form data
        setFormData((prev: any) => ({
            ...prev,
            [name]: value,
        }));

        const error = validateField(name, value);

        setErrors((prev: any) => {
            if (error) {
                return { ...prev, [name]: error };
            } else {
                const { [name]: removedError, ...rest } = prev;
                return rest;
            }
        });

    }

    const validateField = (name: string, value: string): string | undefined => {
        if (paymentAmount === "select-payment-option-3" && name === "payDifferentAmount") {
            if (!value.trim()) {
                return "This field is required.";
            }
        }
        return undefined;
    };


    return (
        <div className="box-style-border">
            <div className="row">
                <div className="col-12" data-automation-id="setup-payment-details-lbl">
                    <h2>Payment details</h2>
                </div>
            </div>

            {oktaLogin && !prepaid && (<div className="payment-due-section">
                <div className="row">
                    <div className="col-12">
                        <p>Select the amount you'd like to pay:</p>
                    </div>
                    <ul className="col-11 row">
                        <li className="total-due">
                            <div className="card bg-light " onClick={() => handleCardClick("select-payment-option-1")}>
                                <div className="card-body">
                                    <div className="row">
                                        <div>
                                            <FormRadioButton
                                                id="select-payment-option-1"
                                                title="Total balance due"
                                                name="radioboxgroup"
                                                type={FormOptionsTypes.radio}
                                                onChange={() => handleCardClick("select-payment-option-1")}
                                                items={[
                                                    {
                                                        text: `Total balance due: $${paymentSetupDetails.totalBalanceDue}`,
                                                        selected: paymentAmount === "select-payment-option-1",
                                                        disabled: false,
                                                        value: "select-payment-option-1",
                                                    },
                                                ]}
                                            />
                                            {paymentSetupDetails.pastDueBalance &&
                                                <span className="including-past-due">(Including past due amount)</span>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        {paymentSetupDetails.pastDueBalance &&
                            <li className="total-due past-due-option">
                                <div className="card bg-light" onClick={() => handleCardClick("select-payment-option-2")}>
                                    <div className="card-body">
                                        <div className="row">
                                            <div>
                                                <FormRadioButton
                                                    id="select-payment-option-2"
                                                    title="Past due"
                                                    name="radioboxgroup"
                                                    type={FormOptionsTypes.radio}
                                                    onChange={() => handleCardClick("select-payment-option-2")}
                                                    items={[
                                                        {
                                                            text: `Past due: $${paymentSetupDetails.pastDueBalance}`,
                                                            selected: paymentAmount === "select-payment-option-2",
                                                            disabled: false,
                                                            value: "select-payment-option-2",
                                                        },
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        }
                        <li className="total-due">
                            <div className="card bg-light" onClick={() => handleCardClick("select-payment-option-3")}>
                                <div className="card-body">
                                    <div className="row">
                                        <div>
                                            <div className="different-amount-option">
                                                <FormRadioButton
                                                    id="select-payment-option-3"
                                                    title="Different amount"
                                                    name="radioboxgroup"
                                                    type={FormOptionsTypes.radio}
                                                    onChange={() => handleCardClick("select-payment-option-3")}
                                                    items={[
                                                        {
                                                            text: "Different amount:",
                                                            selected: paymentAmount === "select-payment-option-3",
                                                            disabled: false,
                                                            value: "select-payment-option-3",
                                                        },
                                                    ]}
                                                />
                                                <span className="different-amount-input">
                                                    {" $"}
                                                    <input
                                                        type="text"
                                                        name="payDifferentAmount"
                                                        className={`choice-value choice-field currency ${errors.payDifferentAmount ? 'error' : ''}`}
                                                        id="pay-different-amount-txt"
                                                        aria-label="pay-different-amount-txt"
                                                        value={formData.payDifferentAmount}
                                                        onChange={handleInputChange}
                                                        onBlur={handleInputBlur}
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                        {errors.payDifferentAmount && (
                                            <FormMessage
                                                id="pay-different-amount-txt"
                                                status={MessageStatus.ERROR}
                                                message={errors.payDifferentAmount}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>)}

            {(!oktaLogin || prepaid) && (<div id="collapse3">
                <div className="row payment-date-section">
                    <ul className="col-11 payment-datepicker">
                        <li>
                            <div className="card bg-light">
                                <div className="card-body">
                                    <div className="row">
                                        <label>
                                            <div
                                                data-automation-id="setup-payment-details-desc"
                                                dangerouslySetInnerHTML={{
                                                    __html: DOMPurify.sanitize(paymentSetupDetails.description)
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>)}
        </div>
    );
}

export default PaymentAmount;
