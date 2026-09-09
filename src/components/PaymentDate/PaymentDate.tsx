import React, { useRef } from 'react';
import { FormMessage, MessageStatus } from "@cox/core-ui8";
const PaymentDate = ({ payment, selectedDate, setSelectedDate, formData, setFormData, errors, setErrors }: any) => {
    const { paymentSetupDetails } = payment;

    const inputRef = useRef<HTMLInputElement>(null);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    const handleCardClick = (option: string) => {
        setSelectedDate(option);

        if (option !== "other") {
            setErrors((prev: any) => ({ ...prev, otherDate: "" }));
            setFormData((prev: any) => ({ ...prev, otherDate: "" }));
        }
    };

    const handleIconClick = () => {
        inputRef.current?.showPicker?.();
    };

    const handleInputChange = (event: any) => {
        const { name, value } = event.target;

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
        if (selectedDate === "other" && name === "otherDate") {
            if (!value.trim()) {
                setErrors((prev: any) => ({ ...prev, [name]: "This field is required." }));
                return "This field is required.";
            }
        }

        return undefined;
    };

    return (
        <div className="box-style-border">
            <div className="row">
                <div className="col-12">
                    <h2>Payment date</h2>
                </div>
            </div>
            <div id="collapse3">
                <div className="row payment-date-section">
                    {!paymentSetupDetails.pastDue &&
                        <div className="col-12">
                            <p>Your payment is due on Month DD, YYYY. Select when you'd like to make your payment:</p>
                        </div>
                    }

                    <ul className="col-11 payment-datepicker">
                        {!paymentSetupDetails.pastDue && (
                            <>
                                <li className="today-date">
                                    <div className="card" onClick={() => handleCardClick("today")}>
                                        <div className="card-body">
                                            <div className="row">
                                                <input
                                                    type="radio"
                                                    id="pay-date-1"
                                                    name="payment-date"
                                                    value="today"
                                                    checked={selectedDate === 'today'}
                                                />
                                                <label htmlFor="pay-date-1">
                                                    <span>Today,&nbsp;{paymentSetupDetails.tadayDate}</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </li>

                                <li className="due-date">
                                    <div className="card" onClick={() => handleCardClick("due")}>
                                        <div className="card-body">
                                            <div className="row">
                                                <input
                                                    type="radio"
                                                    id="pay-date-2"
                                                    name="payment-date"
                                                    value="due"
                                                    checked={selectedDate === 'due'}
                                                />
                                                <label htmlFor="pay-date-2">
                                                    <span>Due date: {paymentSetupDetails.dueDate}</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </li>

                                <li className="pick-date">
                                    <div className="card bg-light" onClick={() => handleCardClick("other")}>
                                        <div className="card-body">
                                            <div className="row">
                                                <div>
                                                    <input
                                                        type="radio"
                                                        id="pay-date-3"
                                                        name="payment-date"
                                                        value="other"
                                                        checked={selectedDate === 'other'}
                                                    />
                                                    <label htmlFor="pay-date-3" className='other-date-label'>
                                                        <span>Other date:</span>
                                                        <div className="date-picker-wrapper">
                                                            <input
                                                                type="date"
                                                                name="otherDate"
                                                                id="pay-date-4"
                                                                ref={inputRef}
                                                                className={`choice-value date date-picker ${errors.otherDate ? 'error' : ''}`}
                                                                placeholder="12/31/2025"
                                                                min={today}
                                                                value={formData.otherDate || today}
                                                                onChange={handleInputChange}
                                                            />
                                                            <span
                                                                onClick={handleIconClick}
                                                                className="calendar-icon"
                                                            >
                                                                📅
                                                            </span>
                                                        </div>
                                                    </label>
                                                </div>
                                                {errors.otherDate && (
                                                    <FormMessage id="other-date-txt" status={MessageStatus.ERROR} message={errors.otherDate} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </>)}

                        {paymentSetupDetails.pastDue &&
                            <li>
                                <div className="card bg-light">
                                    <div className="card-body">
                                        <div className="row">
                                            <label htmlFor="pay-date-5">
                                                <span>Your payment will be made today.</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        }
                    </ul>
                </div>

            </div>

        </div>
    );
};

export default PaymentDate;