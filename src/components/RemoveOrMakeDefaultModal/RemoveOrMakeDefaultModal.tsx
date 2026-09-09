import { useState, useEffect } from "react";
// components
import { Modal } from "@cox/core-ui8";
import BankIcon from "../../assets/icons/bank.svg";
import WarningAlert from "../Alerts/WarningAlert";
import ErrorAlert from "../Alerts/ErrorAlert";
import { useAxios } from "@cox/core-ui8/dist/useAxios";

interface RequestParams {
  [key: string]: string | undefined | boolean;
}

const RemoveOrMakeDefaultModal = ({
  payment,
  isEasyPay,
  title,
  modalPrompt,
  cardData,
  modalType,
  failureMsg,
  setFailureMsg,
  warningMsg,
  setWarningMsg,
  setSuccessMsg,
  primaryBtnText,
  setPrimaryBtnText,
  secondaryBtnText,
  setSecondaryBtnText,
  showModal,
  setShowModal,
  postDeleteMopApiUrl,
  makeDefaultApiUrl,
  showPromptAndCardDetails,
  setShowPromptAndCardDetails,
  multiStatements,
  handleMakeDefault,
  handleRemoveMop,
  setMultiStatements,
  multiAccount
}: any) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  console.log("@@@ modal 1", primaryBtnText, " 2 ", secondaryBtnText);

  const { axiosAPI } = useAxios({
    autoFetch: false, // autoFetch will make a call on laod
    onCompleted: (data: any) => {
      handleOnComplete(data);
    },
    onError: (error) => {
      console.log("onAjaxErrorInGetMop", error);
      setIsSubmitting(false);
    },
  });

  let iconSrc;

  try {
    iconSrc = cardData.classType
      ? require(`../../assets/icons/${cardData.classType}.svg`)
      : BankIcon;
  } catch (error) {
    iconSrc = BankIcon; // fallback if image not found
  }

  const handlePrimaryBtnClicked = async () => {
    if (primaryBtnText === "Close") {
      const currentUrl = window.location.href;
      // ONLY FOR PROTOTYPES (RESETTING)
      if (currentUrl.includes("/ui/v8")) {
        if (modalType === "remove") {
          handleRemoveMop(cardData);
        }
        if (modalType === "make-default") {
          handleMakeDefault(cardData);
        }
      }
      // CHANGING PRIMARY BUTTON FUNCTIONALITY (IMPORTANT!)
      setMultiStatements([]);
      setIsSubmitting(false);
      setShowModal(false);
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    const currentUrl = window.location.href;

    const requestParams: RequestParams = {};
    if (multiAccount) {
      requestParams.mopType = cardData?.type;
    } else {
      requestParams.mopId = cardData.mopId;
    }

    // prototypes
    if (currentUrl.includes("/ui/v8")) {
      console.log("Form submitted successfully - prototype flow!");
      setIsSubmitting(false);

      // Mocking api call for case 1 - Make default
      if (modalType === "make-default") {
        // failure scenario
        const failureScenario = payment?.modalData?.makeDefaultFailure;
        if (failureScenario) {
          setFailureMsg(["Something went wrong. Please try later."]);
          setShowPromptAndCardDetails(false);
          setPrimaryBtnText("Close");
          // Hide secondary button
          setSecondaryBtnText("");
        }

        // success scenario
        const successScenario = payment?.modalData?.makeDefaultSuccess;
        if (successScenario) {
          setSuccessMsg(
            `Your ${cardData.name} has been set as your default payment method.`
          );
          //close modal
          setShowModal(false);
        }
      }

      // Mocking api call for case 2 - Remove
      if (modalType === "remove") {
        // failure scenario
        const failureScenario = payment?.modalData?.removeFailure;
        if (failureScenario) {
          setWarningMsg([]);
          setShowPromptAndCardDetails(false);
          setFailureMsg(["Something went wrong. Please try later."]);
          setPrimaryBtnText("Close");
          // Hide secondary button
          setSecondaryBtnText("");
        }

        // mobile statements - cannot remove payment method
        if (isEasyPay === "mobile-cannot-remove") {
          setShowModal(false);
        }

        // success scenario
        // single or multi statement with or without easy pay
        if (payment?.modalData?.removeSuccess) {
          setSuccessMsg("You have successfully removed your payment method.");
          setShowModal(false);
        }
      }
      return;
    }

    // api call for case 1 - Make default
    else if (modalType === "make-default") {
      {
        try {
          const host = window.location.origin;
          await axiosAPI({
            url: `${host}${makeDefaultApiUrl}`,
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
    }

    // api call for case 2 - Remove
    if (modalType === "remove") {
      try {
        const host = window.location.origin;
        await axiosAPI({
          url: `${host}${postDeleteMopApiUrl}`,
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
  };

  const handleOnComplete = (data: any) => {
    setIsSubmitting(false);
    if (
      data?.messages?.errorMessages &&
      data?.messages?.errorMessages.length > 0
    ) {
      setFailureMsg(data?.messages?.errorMessages);
      setPrimaryBtnText("Close");
      setSecondaryBtnText("");
      if (data.validMOPStatus === "false") {
        setShowPromptAndCardDetails(false);
      }
    } else {
      window.location.reload();
    }
  };

  const handleClose = () => {
    setFailureMsg([]);
    setWarningMsg([]);
    setMultiStatements([]);
    setShowPromptAndCardDetails(true);
    setIsSubmitting(false);
    setShowModal(false);
  };

  return (
    <Modal
      title={title}
      description={""}
      isParsed={false}
      show={showModal}
      handleClose={handleClose}
      primaryBtnText={primaryBtnText}
      primaryBtnClick={handlePrimaryBtnClicked}
      secondaryBtnText={secondaryBtnText}
      secondaryBtnClick={handleClose}
      modalId="disable-savedMop-modal"
    >
      <div className="rmd-modal-container">
        {showPromptAndCardDetails && (
          <h5 className="rmd-prompt">{modalPrompt}</h5>
        )}
        {warningMsg &&
          warningMsg.length > 0 &&
          warningMsg.map((msg: string) => {
            return <WarningAlert message={msg} id={`${modalType}-warning`} />;
          })}
        {failureMsg &&
          failureMsg.length > 0 &&
          failureMsg.map((msg: string) => {
            return <ErrorAlert message={msg} id={`${modalType}-error`} />;
          })}
        {!(multiStatements.length > 0) && showPromptAndCardDetails && (
          <div className="rmd-card">
            <img src={iconSrc} alt="bank-or-card" />
            <span>{cardData?.name}</span>
          </div>
        )}
        {modalType === "remove" &&
          multiStatements.length > 0 &&
          showPromptAndCardDetails &&
          multiStatements.map((statement: any) => {
            return <div className="rmd-card">{statement}</div>;
          })}
      </div>
    </Modal>
  );
};

export default RemoveOrMakeDefaultModal;
