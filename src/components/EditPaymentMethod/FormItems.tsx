import {
    FormInput,
    FormDropdown,
    FormInputTypes,
    FormOptionsTypes,
    useFormContext,
    FormOptionsLayout,
    FormCheckbox,
    MessageStatus
} from "@cox/core-ui8";
import { useEffect } from "react";

interface FormItemsProps {
    formData: {
        nameOnCC: string;
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
    multiAccount?: boolean;
}

const FormItems = ({ formData, setFormData, setErrors, setShowErrors, listOfYears, multiAccount }: FormItemsProps) => {

    const { formContext, setFormContext } = useFormContext();

    useEffect(() => {
        if (formData) {
            if (!formData?.country) {
                setFormData({ ...formData, country: "US" });
            }
            setFormContext("nameOnCC", { ...formContext["nameOnCC"], value: formData.nameOnCC } as any, formContext["nameOnCC"], false, true);
            setFormContext("country", { ...formContext["country"], value: formData.country } as any, formContext["country"], false, true);
            setFormContext("countryZip", { ...formContext["countryZip"], value: formData.countryZip } as any, formContext["countryZip"], false, true);
            setFormContext("ccMonth", { ...formContext["ccMonth"], value: formData.ccMonth } as any, formContext["ccMonth"], false, true);
            setFormContext("ccYear", { ...formContext["ccYear"], value: formData.ccYear } as any, formContext["ccYear"], false, true);
            setFormContext("setDefault", { ...formContext["setDefault"], value: formData.setDefault } as any, formContext["setDefault"], false, true);
        }
    }, [formData])

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
            const { name, value } = e.target;

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
                <div className="row">
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
                <div className="row">
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
                <div className="row">
                    <div className="col-12 col-lg-6">
                        <FormDropdown
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
                {!multiAccount && (
                    <div className="row">
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
