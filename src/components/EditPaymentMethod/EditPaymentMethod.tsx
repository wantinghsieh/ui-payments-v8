import { useEffect, useRef, useState } from "react";
import {
  FormContainer,
  FormFieldsAlign,
  FormInputTypes,
  FormOptionsTypes,
  FormStatusPosition,
  Modal,
} from "@cox/core-ui8";
import { useAxios } from "@cox/core-ui8/dist/useAxios";
import ErrorAlert from "../Alerts/ErrorAlert";
import FormItems from "./FormItems";
import { ButtonTypes } from "@cox/core-ui8/dist/Button";
import Banner, { BannerType, BannerVariation } from "@cox/core-ui8/dist/Banner";

interface FormData {
  mopId: string;
  nameOnCC: string;
  country: string;
  countryZip: string;
  ccMonth: string;
  ccYear: string;
  setDefault: boolean;
  cardExpiration: string;
  integrityCheck: string;
}

const initialFormData: FormData = {
  mopId: "",
  nameOnCC: "",
  country: "US",
  countryZip: "",
  ccMonth: "",
  ccYear: "",
  setDefault: false,
  cardExpiration: "",
  integrityCheck: "",
};

interface RequestParams {
  [key: string]: string | undefined | boolean;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface EditPaymentMethodProps {
  id?: string;
  payment: any;
  card: any;
  cardInfo: any;
  title: string;
  showModal: boolean;
  setShowEditPaymentModal: (data: boolean) => void;
  updateCardDataApiUrl?: string;
  multiAccount?: boolean;
}

function EditPaymentMethod({
  id,
  payment,
  card,
  cardInfo,
  title,
  showModal,
  setShowEditPaymentModal,
  updateCardDataApiUrl,
  multiAccount,
}: EditPaymentMethodProps) {
  const {
    pciChaseEncryptKeyJs = "",
    pciChaseEncryptJs = "",
    listOfYears = [],
  } = payment;

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showErrors, setShowErrors] = useState<any>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  const { axiosAPI: axiosAPIToUpdateMop } = useAxios({
    autoFetch: false, // autoFetch will make a call on laod
    onCompleted: (data: any) => {
      handleMopDataResponse(data);
    },
    onError: (error) => {
      console.log("onAjaxErrorInGetMop", error);
      setIsSubmitting(false);
    },
  });

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
    if (cardInfo) {
      setFormData({
        ...formData,
        mopId: cardInfo?.mopId,
        nameOnCC: cardInfo?.holdername,
        country: cardInfo?.countryCode,
        countryZip: cardInfo?.zipCode,
        ccMonth: cardInfo?.cardExpiry?.substring(4, 6),
        ccYear: cardInfo?.cardExpiry?.substring(0, 4),
        setDefault: cardInfo?.isDefault === "true" ? true : false,
      });
    }

    setErrorMessage("");
  }, [cardInfo]);

  useEffect(() => {
    if (showModal) {
      setIsSubmitting(false);
      setShowErrors(false);
      setErrorMessage("");
    }
  }, [showModal]);

  const formButtons: any = [
    {
      isFormSubmit: false,
      buttonTypes: ButtonTypes.SECONDARY,
      text: "Cancel",
      customClickEvent: () => setShowEditPaymentModal(false),
      cssClass: "review-buttons text-center mt-2 mb-2",
      id: "back-btn",
    },
    {
      isFormSubmit: true,
      buttonTypes: ButtonTypes.PRIMARY,
      text: "Save",
      cssClass: "review-buttons text-center mt-2 mb-2",
      id: "add-btn",
    },
  ];

  const handleSubmit = async (card: any) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    if (Object.keys(errors).length === 0) {
      const currentUrl = window.location.href;
      if (currentUrl.includes("/ui/v8")) {
        console.log("Form submitted successfully!");
        setIsSubmitting(false);

        return;
      } else {
        /* Prepare request parameters for the API call */
        const requestParams: RequestParams = {};
        if (payment?.multiAccount) {
          requestParams.mopType = card?.type;
        } else {
          requestParams.mopId = formData.mopId;
          requestParams.setDefault = formData.setDefault;
        }
        requestParams.nameOnCC = formData.nameOnCC;
        requestParams.countryZip = formData.countryZip;
        requestParams.ccMonth = formData.ccMonth;
        requestParams.ccYear = formData.ccYear;
        requestParams.country = formData.country || "US";

        try {
          const host = window.location.origin;
          await axiosAPIToUpdateMop({
            url: `${host}${updateCardDataApiUrl}`,
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            data: JSON.stringify(requestParams),
          });
        } catch (error) {
          console.error("Error:", error);
        }
      }
    } else {
      console.log("Form validation error:", errors);
      setShowErrors(true);
      setIsSubmitting(false);
      if (dialogRef.current) {
        dialogRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleMopDataResponse = (data: any) => {
    setIsSubmitting(false);
    if (data?.errorMessages && data?.errorMessages.length > 0) {
      setErrorMessage(data?.errorMessages[0]);
      if (dialogRef.current) {
        dialogRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.location.reload();
    }
  };

  return (
    <Modal
      title={title}
      description={""}
      isParsed={false}
      show={showModal}
      modalId="edit-card-modal"
      handleClose={() => setShowEditPaymentModal(false)}
    >
      <div className={`${id}-mop-container`}>
        <div className="credit-card-container" ref={dialogRef}>
          {errorMessage && <ErrorAlert message={errorMessage} id={id} />}
          <div className="row modal-heading-title">
            <h2>Edit {card?.name}</h2>
          </div>
          <FormContainer
            formButtons={formButtons}
            errorIcon="/content/dam/cox/common/icons/ui_components/circle-exclamation-moderate-red.svg"
            errorMessage="Please correct the items marked below to continue."
            statusMessagePosition={FormStatusPosition.TOP}
            onSubmit={handleSubmit}
            formState={{
              nameOnCC: {
                inputType: FormInputTypes.TEXT,
                isRequired: true,
                value: formData.nameOnCC,
              },
              country: {
                inputType: FormOptionsTypes.dropdown,
                isRequired: true,
                value: formData.country,
              },
              countryZip: {
                inputType: FormInputTypes.ZIPCODE,
                isRequired: true,
                value: formData.countryZip,
              },
              ccMonth: {
                inputType: FormOptionsTypes.dropdown,
                isRequired: true,
                value: formData.ccMonth,
              },
              ccYear: {
                inputType: FormOptionsTypes.dropdown,
                isRequired: true,
                value: formData.ccYear,
              },
            }}
            method="post"
            successIcon="/content/dam/cox/common/icons/ui_components/circle-check-lime-green.svg"
            heading=""
            eyebrow=""
            fieldsAlignment={FormFieldsAlign.LEFT}
            cssClass="add-payment-form-container form"
          >
            {
              /* Show client side alert message */
              showErrors && (
                <Banner
                  bannerType={BannerType.DYNAMIC}
                  variation={BannerVariation.ERROR}
                  message={"Please correct the items marked below to continue."}
                  iconPath="/content/dam/cox/common/icons/ui_components/circle-exclamation-moderate-red.svg"
                  id={id + "-error"}
                />
              )
            }
            <FormItems
              formData={formData}
              setFormData={setFormData}
              setErrors={setErrors}
              setShowErrors={setShowErrors}
              listOfYears={listOfYears}
              multiAccount={multiAccount}
            />
          </FormContainer>
        </div>
      </div>
    </Modal>
  );
}

export default EditPaymentMethod;
