import {
    FormInput,
    FormDropdown,
    FormCheckbox,
    FormInputTypes,
    FormOptionsTypes,
    FormOptionsLayout,
    useFormContext,
    MessageStatus
} from "@cox/core-ui8";
import { useEffect } from "react";

interface FormItemsProps {
    formData: {
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
        setDefault: boolean;
    };
    setFormData: (data: any) => void;
    setErrors: (data: any) => void;
    setShowErrors: (data: any) => void;
    listOfYears: [string];
    oktaLogin?: boolean;
    isMultiAccount?: boolean;
}

const FormItems = ({ formData, setFormData, setErrors, setShowErrors, listOfYears, oktaLogin, isMultiAccount }: FormItemsProps) => {

    const { formContext, setFormContext } = useFormContext();

    /* Function to check if the selected country is Canada or the UK */
    const isCanadaUK = (): boolean => {
        return formData.country === "CA" || formData.country === "UK";
    };

    /* Function to check if the value consists only of numbers */
    const isNumber = (value: any) => /^[0-9]+$/.test(value);

    const isLetterOrNumber = (value: any) => /^[a-zA-Z0-9]+$/.test(value);

    /* Determine the maximum length for ZIP codes based on the country */
    const zipMaxLength = formData.country === "CA" ? 6 : formData.country === "UK" ? 7 : 5;

    useEffect(() => {
        if (formContext["countryZip"]?.status) {
            setFormContext("countryZip", { ...formContext["countryZip"], maxLength: zipMaxLength, status: MessageStatus.PENDING } as any, formContext["countryZip"], false, true);
        }
    }, [formData.country])

    const validateCountryZip = (value: string): string | undefined => {
        const country = formData.country;
        if ((country === "CA" || country === "UK") && !isLetterOrNumber(value)) {
            return "Please enter letters and numbers only.";
        }
        if (country === "CA" && value.length < 6) {
            return "Please enter at least 6 characters.";
        }
        if (country === "UK" && value.length < 7) {
            return "Please enter at least 7 characters.";
        }
        if ((country === "" || country === "US" || country === "MX") && !isNumber(value)) {
            return "Please enter numbers only.";
        }
        if ((country === "" || country === "US" || country === "MX") && value.length < 5) {
            return "Please enter a valid ZIP code.";
        }
        return undefined;
    };

    /* Function to validate form field values based on field name and its value */
    const validateField = (name: string, value: string): string | undefined => {
        switch (name) {
            case "nameOnCC":
                if (!value) {
                    return "This field is required.";
                }
                if (!/^[a-z\-.,()'"\s]+$/i.test(value) || value.trim().replace(/\s+/g, '').indexOf('--') !== -1) {
                    return "Letters or punctuation only please.";
                }
                break;
            case "cardNumber":
                if (!value) {
                    return "This field is required.";
                }
                if (name === "cardNumber" && window.ValidatePANChecksum(value) === false) {
                    return "The credit card number you entered isn't valid. Please try again.";
                }
                break;
            case "cvvNumber":
                if (!value) {
                    return "This field is required.";
                }
                if (name === "cvvNumber" && value.length < 3) {
                    return "Please enter at least 3 characters.";
                }
                break;
            case "countryZip":
                if (!value) {
                    return "This field is required.";
                }
                if (name === "countryZip") {
                    return validateCountryZip(value);
                }
                break;
        }
        return undefined;
    };

    const handleInputChange = (e: any) => {
        if (e.target) {
            const { name } = e.target;

            let value = e.target.value;
            if (name === "cardNumber") {
                value = e.target.value.replace(/\D/g, '')
            }

            setFormData((prev: any) => ({ ...prev, [name]: value }));

            const validationError = validateField(name, value);

            if (validationError) {
                setErrors((prev: any) => ({ ...prev, [name]: validationError }));
                setFormContext(name, { ...formContext[name], status: 'error', value, patternErrorMessage: validationError, showChecklist: true } as any, formContext[name], true, true);
            } else {
                setErrors((prev: any) => {
                    const { [name]: removedError, ...rest } = prev;
                    return rest;
                });
                setShowErrors(false);
            }
        } else if (e.value) {
            setFormData((prev: any) => ({ ...prev, ['state']: e.value }));
        }
    };

    const handleCountryChange = (event: any) => {
        setFormData((prev: any) => {
            const updatedFormData = { ...prev, country: event.value };
            if (prev.country !== updatedFormData.country) {
                setFormContext("countryZip", { ...formContext["countryZip"], value: "" } as any);
                updatedFormData.countryZip = "";
            }
            return updatedFormData;
        });
    }

    return (
        <fieldset>
            <div className="form-group">
                <div className="row card-form-row">
                    <div className="col-12">
                        <FormInput
                            helpMessage=""
                            id="name-on-cc"
                            name="nameOnCC"
                            className="name-on-cc form-control"
                            aria-label="Name on card"
                            required={true}
                            title={"Name on card"}
                            requiredMessage="This field is required"
                            maxLength={40}
                            type={FormInputTypes.TEXT}
                            value={formData.nameOnCC}
                            aria-describedby="txtAddressFirst-error"
                            data-automation-id="setup-name-on-card-text"
                            allowNumbers={true}
                            splCharacters={true}
                            placeholder="Full name on card"
                            onChange={handleInputChange}
                            onBlur={handleInputChange}
                        />
                    </div>
                </div>
                <div className="row card-form-row">
                    <div className="col-12 col-lg-8">
                        <FormInput
                            helpMessageTitle="Card number"
                            helpMessage="<div><p>We accept credit and debit cards with the following logos: </p> </br> <img src='https://webcdn.cox.com/content/dam/cox/residential/images/icons/credit_card_logos_horizontal.png'/></div>"
                            id="card-number"
                            name="cardNumber"
                            required={true}
                            className="card-number form-control"
                            aria-label="Card number"
                            requiredMessage="This field is required"
                            maxLength={19}
                            minLength={13}
                            title={"Card number"}
                            type={FormInputTypes.CARDNUMBER}
                            value={formData.cardNumber}
                            placeholder="0000 0000 0000 0000"
                            aria-describedby="setup-cardNumber-text"
                            data-automation-id="setup-cardNumber-text"
                            allowNumbers={true}
                            rows={2}
                            onChange={handleInputChange}
                            onBlur={handleInputChange}
                        />
                    </div>
                    <div className="col-12 col-lg-4">
                        <FormInput
                            helpMessageTitle="CVV"
                            helpMessage="<div><p>Find your CVV security code on the back (Visa, Mastercard, Discover) or front (AMEX) of your card.</p> <img src='https://webcdn.cox.com/ui/mybill/tsw_7/img/CVV.png' alt='not found'/></div>"
                            id="cvv-number"
                            name="cvvNumber"
                            className="cvv-number form-control"
                            aria-label="cvv-number"
                            required={true}
                            title={"CVV"}
                            requiredMessage="This field is required"
                            placeholder="CVV"
                            maxLength={4}
                            minLength={3}
                            type={FormInputTypes.TEXT}
                            pattern={/^\d{3,4}$/}
                            allowNumberOnly={true}
                            value={formData.cvvNumber}
                            aria-describedby="cvv-number-error"
                            data-automation-id="setup-cvvNumber-text"
                            onChange={handleInputChange}
                            onBlur={handleInputChange}
                        />
                    </div>
                </div>
                <div className="row card-form-row">
                    <div className="col-12 col-lg-6">
                        <FormDropdown
                            chevronIcon="/content/dam/cox/common/icons/ui_components/chevron-down-river-blue.svg"
                            id="ccMonth"
                            required={true}
                            requiredMessage="A selection is required"
                            title={"Expiration date"}
                            magnifyingGlass="/content/dam/cox/common/icons/ui_components/magnifying-glass-grey.svg"
                            magnifyingGlassAlt="magnifying-glass-alt"
                            name="ccMonth"
                            onChange={(event) => setFormData((prev: any) => ({ ...prev, ccMonth: event.value }))}
                            placeholder="Month"
                            searchEnabled={false}
                            type={FormOptionsTypes.dropdown}
                            items={Array.from({ length: 12 }, (_, i) => ({
                                disabled: false,
                                selected: false,
                                text: `${(i + 1).toString().padStart(2, '0')}`,
                                value: `${(i + 1).toString().padStart(2, '0')}`
                            }))}
                        />
                    </div>
                    <div className="col-12 col-lg-6">
                        <FormDropdown
                            chevronIcon="/content/dam/cox/common/icons/ui_components/chevron-down-river-blue.svg"
                            id="ccYear"
                            required={true}
                            requiredMessage="A selection is required"
                            title={""}
                            magnifyingGlass="/content/dam/cox/common/icons/ui_components/magnifying-glass-grey.svg"
                            magnifyingGlassAlt="magnifying-glass-alt"
                            name="ccYear"
                            onChange={(event) => setFormData((prev: any) => ({ ...prev, ccYear: event.value }))}
                            placeholder="Year"
                            searchEnabled={false}
                            type={FormOptionsTypes.dropdown}
                            items={listOfYears?.map((year) => ({
                                disabled: false,
                                selected: false,
                                text: year,
                                value: year,
                            }))}
                        />
                    </div>
                </div>
                <div className="row card-form-row">
                    <div className="col-12 col-lg-6">
                        <FormDropdown
                            helpMessageTitle="Country"
                            helpMessage="<div>Contact us if the country for your billing address is not listed.</div>"
                            chevronIcon="/content/dam/cox/common/icons/ui_components/chevron-down-river-blue.svg"
                            id="country"
                            required={true}
                            requiredMessage="A selection is required"
                            title={"Country"}
                            magnifyingGlass="/content/dam/cox/common/icons/ui_components/magnifying-glass-grey.svg"
                            magnifyingGlassAlt="magnifying-glass-alt"
                            name="country"
                            onChange={handleCountryChange}
                            placeholder="Country"
                            searchEnabled={false}
                            type={FormOptionsTypes.dropdown}
                            items={[
                                {
                                    disabled: false,
                                    selected: true,
                                    text: 'United States',
                                    value: 'US'
                                },
                                {
                                    disabled: false,
                                    selected: false,
                                    text: 'Mexico',
                                    value: 'MX'
                                },
                                {
                                    disabled: false,
                                    selected: false,
                                    text: 'Canada',
                                    value: 'CA'
                                },
                                {
                                    disabled: false,
                                    selected: false,
                                    text: 'UK',
                                    value: 'UK'
                                },
                            ]}
                        />
                    </div>

                    <div className="col-12 col-lg-6">
                        <FormInput
                            helpMessage=""
                            id="countryZip"
                            name="countryZip"
                            className="countryZip form-control"
                            aria-label="ZIP code"
                            required={true}
                            title={`${isCanadaUK() ? "Postal code" : "ZIP code"}`}
                            requiredMessage="This field is required"
                            maxLength={zipMaxLength}
                            splCharacters
                            type={FormInputTypes.TEXT}
                            value={formData.countryZip}
                            allowNumbers={true}
                            aria-describedby="txtCCZip-error"
                            data-automation-id="setup-country-zip-text"
                            onChange={handleInputChange}
                            onBlur={handleInputChange}
                        />
                    </div>
                </div>
                {oktaLogin && !isMultiAccount && (
                    <div className="row card-form-row">
                        <FormCheckbox
                            checkboxCheckMark="/content/dam/cox/common/icons/ui_components/white-check-mark.svg"
                            helpMessage=""
                            id="form-options-checkbox"
                            onChange={(event) => setFormData((prev: any) => ({ ...prev, setDefault: event[0].selected }))}
                            items={[
                                {
                                    disabled: false,
                                    selected: formData.setDefault,
                                    text: 'Set as default',
                                    value: 'on'
                                }
                            ]}
                            layout={FormOptionsLayout.HORIZONTAL}
                            name="externalMobileConsent"
                            radioCheckMark="/content/dam/cox/common/icons/ui_components/white-check-mark.svg"
                            requiredMessage="This field is required"
                            title=""
                            type={FormOptionsTypes.checkbox}
                        />
                    </div>
                )}
            </div>
        </fieldset>
    )
}

export default FormItems;
