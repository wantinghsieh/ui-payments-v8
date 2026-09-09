import { useState } from "react";
import { Badge } from "@cox/core-ui8";
import { getMopIcon, resolveAemAssetPath } from "../../utils/helper-utlities";
import { Link } from "react-router-dom";
import RemoveOrMakeDefaultModal from "../RemoveOrMakeDefaultModal";
import EditPaymentMethod from "../../components/EditPaymentMethod";
import { useAxios } from "@cox/core-ui8/dist/useAxios";
import { Tooltip, TooltipPlacementProps } from "@cox/core-ui8/dist/Tooltip";

/**
 * Props for the SavedMop component.
 * - payment: full payment config object from the parent (contains modalData, trustlyJs, etc.)
 * - savedMop: list of saved payment methods returned by the API
 * - checkclass: currently selected mopId (drives radio checked state)
 * - flowName: context identifier (e.g. "make-payment") — controls disabled/edit visibility
 * - multiAccount: when true, all MOPs are shown as pre-selected (no radio toggle)
 */
interface SavedMopProps {
  payment: any;
  savedMop: [];
  checkclass: any;
  setCheckclass: any;
  showLinks?: boolean;
  flowName?: string;
  getCardDataApiUrl?: string;
  updateCardDataApiUrl?: string;
  getDeleteMopApiUrl?: string;
  postDeleteMopApiUrl?: string;
  makeDefaultApiUrl?: string;
  setSuccessMsg?: (msg: string) => void;
  multiAccount?: boolean;
}

const SavedMop = ({
  payment,
  savedMop,
  checkclass,
  setCheckclass,
  showLinks,
  flowName,
  getCardDataApiUrl,
  updateCardDataApiUrl,
  getDeleteMopApiUrl,
  postDeleteMopApiUrl,
  makeDefaultApiUrl,
  setSuccessMsg,
  multiAccount,
}: SavedMopProps) => {
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalPrompt, setModalPrompt] = useState<string>("");
  const [failureMsg, setFailureMsg] = useState<string[]>([]);
  const [warningMsg, setWarningMsg] = useState<string[]>([]);
  // const [successMsg, setSuccessMsg] = useState<string>("");
  const [cardData, setCardData] = useState<any>(null);
  const [modalType, setModalType] = useState<string>("");
  const [modalPrimaryBtnText, setModalPrimaryBtnText] = useState<string>("");
  const [modalSecondaryBtnText, setModalSecondaryBtnText] =
    useState<string>("Cancel");
  const [showRemoveOrMakeDefaultModal, setShowRemoveOrMakeDefaultModal] =
    useState<boolean>(false);
  const [showEditPaymentModal, setShowEditPaymentModal] =
    useState<boolean>(false);
  const [cardInfo, setCardInfo] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPromptAndCardDetails, setShowPromptAndCardDetails] =
    useState<boolean>(true);
  const [multiStatements, setMultiStatements] = useState<string[]>([]);

  // Determines EasyPay state: "single" | "multi" | "mobile-cannot-remove" | undefined
  // Controls remove-modal copy and button behaviour
  const isEasyPay = payment?.modalData?.isEasyPay;

  // Fetches full card details before opening the Edit modal
  const { axiosAPI: axiosAPIToGetMop } = useAxios({
    autoFetch: false,
    onCompleted: (data: any) => {
      handleMopDataResponse(data);
    },
    onError: (error) => {
      console.log("onAjaxErrorInGetMop", error);
    },
  });

  // Fetches remove-modal data (warnings, prompt text, EasyPay status) before showing the Remove modal
  const { axiosAPI: axiosAPIToGetRemoveModalMop } = useAxios({
    autoFetch: false,
    onCompleted: (data: any) => {
      console.log("@@@ API Call successful");
      handleRemoveMopDataResponse(data);
    },
    onError: (error) => {
      console.log("onAjaxErrorInGetRemoveModalMop", error);
    },
  });

  const handleEditCard = (card: any) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const currentUrl = window.location.href;
    // Prototype environment (/ui/v8) opens the modal directly without an API call;
    // production fetches fresh card data first
    if (!currentUrl.includes("/ui/v8")) {
      setCardData(card);
      getCardData(card);
    } else {
      setIsSubmitting(false);
      setCardData(card);
      setShowEditPaymentModal(true);
    }
  };

  const handleMakeDefault = (card: any) => {
    setModalTitle("Default payment method");
    setModalPrompt("Would you like to make this the default payment method?");
    setFailureMsg([]);
    setWarningMsg([]);
    setShowPromptAndCardDetails(true);
    setModalPrimaryBtnText("Make default");
    setModalSecondaryBtnText("Cancel");
    setCardData(card);
    setModalType("make-default");
    setShowRemoveOrMakeDefaultModal(true);
  };

  const handleRemoveMop = (card: any) => {
    setCardData(card);
    const currentUrl = window.location.href;
    // Prototype: build modal state locally based on isEasyPay flag
    // Production: fetch modal state from API (getDeleteMopApiUrl)
    if (currentUrl.includes("/ui/v8")) {
      if (isEasyPay === "mobile-cannot-remove") {
        setWarningMsg([
          "This payment method is currently linked to your mobile statement. To remove it, please first choose a new EasyPay payment method. Once that's set, you can delete this one.",
        ]);
        setModalPrompt("You can not remove this payment method.");
        setModalPrimaryBtnText("Close");
        setModalSecondaryBtnText("");
      } else if (isEasyPay === "single") {
        setModalPrompt("Are you sure you want to remove this payment method?");
        setWarningMsg([
          "This is your EasyPay payment method. Removing it will cancel EasyPay and disable it for other services unless you add it again.",
        ]);
        setModalPrimaryBtnText("Remove");
        setModalSecondaryBtnText("Cancel");
      } else if (isEasyPay === "multi") {
        setModalPrompt(
          `Remove your ${card.name}. This payment method is currently linked to the following statements and will no longer be available for them.`,
        );
        setWarningMsg([
          "This will cancel any scheduled payments or linked EasyPay accounts.",
        ]);
        setModalPrimaryBtnText("Remove");
        setMultiStatements([
          "Statement 001: [VIDEO, DATA, SECURITY, VOICE]",
          "Statement 701: [WIRELESS]",
        ]);
        setModalSecondaryBtnText("Cancel");
      } else {
        setModalPrompt("Are you sure you want to remove this payment method?");
        setWarningMsg([]);
        setModalPrimaryBtnText("Remove");
        setModalSecondaryBtnText("Cancel");
      }
      setFailureMsg([]);
      setShowPromptAndCardDetails(true);
      setModalTitle("Remove payment method");
      setModalType("remove");
      setShowRemoveOrMakeDefaultModal(true);
    } else {
      getRemoveModalData(card);
    }
  };

  // Non-reloadable gift cards can only fund a one-time transaction, so
  // one-time flows (make-payment, prepaid-recharge) leave them selectable;
  // recurring flows (EasyPay, AutoPay) keep them disabled.
  const ONE_TIME_PAYMENT_FLOWS = ["make-payment", "prepaid-recharge"];
  const isNonReloadableDisabled = (card: any) =>
    !ONE_TIME_PAYMENT_FLOWS.includes(flowName ?? "") && card.disabled;

  const handleCardSelection = (card: any) => {
    if (!isNonReloadableDisabled(card)) {
      setCheckclass(card.mopId);
    }
  };

  const getCardData = async (card: any) => {
    try {
      const host = window.location.origin;
      // multiAccount flows identify the card by type; single-account flows use mopId
      const queryParam = multiAccount
        ? `mopType=${card?.type}`
        : `mopId=${card.mopId}`;
      await axiosAPIToGetMop({
        url: `${host}${getCardDataApiUrl}?${queryParam}`,
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getRemoveModalData = async (card: any) => {
    try {
      const host = window.location.origin;
      // multiAccount flows identify the card by type; single-account flows use mopId
      const queryParam = multiAccount
        ? `mopType=${card?.type}`
        : `mopId=${card.mopId}`;
      await axiosAPIToGetRemoveModalMop({
        url: `${host}${getDeleteMopApiUrl}?${queryParam}`,
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleMopDataResponse = (data: any) => {
    setIsSubmitting(false);
    if (data) {
      setCardInfo(data);
      setShowEditPaymentModal(true);
    }
  };

  const handleRemoveMopDataResponse = (data: any) => {
    if (data) {
      setFailureMsg(data?.messages?.errorMessages);
      setWarningMsg(data?.messages?.warningMessages);
      setModalPrompt(data.modalPrompt);
      if (data.statements) {
        // Multi-statement accounts list affected statements in the remove modal
        setMultiStatements(data.statements);
      }
      // validMOPStatus "false" means the MOP is already invalid — hide card details in modal
      if (data.validMOPStatus === "false") {
        setShowPromptAndCardDetails(false);
      }
      // EasyPay wireless: MOP cannot be removed, only closed (no Cancel button)
      if (data.easyPayWirelessStatus === "true") {
        setModalPrimaryBtnText("Close");
        setModalSecondaryBtnText("");
      } else {
        setModalPrimaryBtnText("Remove");
        setModalSecondaryBtnText("Cancel");
      }
    }
    setModalTitle("Remove payment method");
    setModalType("remove");
    setShowRemoveOrMakeDefaultModal(true);
  };

  return (
    <>
      <EditPaymentMethod
        id="edit-payment-method"
        payment={payment}
        card={cardData}
        cardInfo={cardInfo}
        title="Edit payment method"
        showModal={showEditPaymentModal}
        setShowEditPaymentModal={setShowEditPaymentModal}
        updateCardDataApiUrl={updateCardDataApiUrl}
        multiAccount={multiAccount}
      />
      <RemoveOrMakeDefaultModal
        payment={payment}
        isEasyPay={isEasyPay}
        title={modalTitle}
        modalPrompt={modalPrompt}
        cardData={cardData}
        modalType={modalType}
        warningMsg={warningMsg}
        failureMsg={failureMsg}
        setWarningMsg={setWarningMsg}
        setFailureMsg={setFailureMsg}
        setSuccessMsg={setSuccessMsg}
        primaryBtnText={modalPrimaryBtnText}
        setPrimaryBtnText={setModalPrimaryBtnText}
        secondaryBtnText={modalSecondaryBtnText}
        setSecondaryBtnText={setModalSecondaryBtnText}
        showModal={showRemoveOrMakeDefaultModal}
        setShowModal={setShowRemoveOrMakeDefaultModal}
        postDeleteMopApiUrl={postDeleteMopApiUrl}
        makeDefaultApiUrl={makeDefaultApiUrl}
        showPromptAndCardDetails={showPromptAndCardDetails}
        setShowPromptAndCardDetails={setShowPromptAndCardDetails}
        multiStatements={multiStatements}
        handleMakeDefault={handleMakeDefault}
        handleRemoveMop={handleRemoveMop}
        setMultiStatements={setMultiStatements}
        multiAccount={multiAccount}
      />
      {/*
        NOTE: the saved-mop radios below stay raw input/label markup instead of core-ui8's
        FormRadioButton because FormRadioButton's option label is a plain string (FormItemProps)
        with no children/ReactNode slot and no way to bind a click handler to part of the label.
        Each option here renders a brand/type icon, a Tooltip for non-reloadable cards, a Badge
        for the default MOP, and independently-clickable "Make Default"/"Edit"/"Remove" links —
        none of which fit in a string, so FormRadioButton can't render them.
      */}
      <div className="select-payment-amount-step setup-saved-mop-container">
        <div
          className="payment-accordion custom-accordion"
          id="payment-accordion"
        >
          <div className="box-style-border-container">
            <div className="justify-content-center">
              <ul className="col-12">
                {savedMop &&
                  savedMop.map((card: any) => (
                    <li key={card.mopId}>
                      <div className="form-radio-button">
                        <div
                          className={
                            "card " +
                            (checkclass === card.mopId || multiAccount
                              ? "card-default-wrapper"
                              : "")
                          }
                          onClick={() => handleCardSelection(card)}
                        >
                          <div
                            className="card-body saved-mop-content showhide-trigger"
                            data-hide-div="payment-methods-form"
                            data-show-div="add-new-payment"
                          >
                            <input
                              type="radio"
                              name="saved-mop"
                              id={`radio-${card.mopId}`}
                              checked={
                                checkclass === card.mopId || multiAccount
                              }
                              value={card.mopId}
                              aria-label={`radio-${card.mopId}`}
                              disabled={isNonReloadableDisabled(card)}
                              onChange={(e) => {
                                setCheckclass(e.target.value);
                              }}
                            />
                            <label htmlFor={`radio-${card.mopId}`}>
                              <div
                                className={`custom-radio ${checkclass === card.mopId || multiAccount ? "checked" : ""} ${isNonReloadableDisabled(card) ? "disabled" : ""}`}
                                role="radio"
                                aria-label="Total balance due"
                                aria-checked="true"
                              ></div>
                              <span className="closedDiv">{card.name}</span>
                            </label>
                            <img
                              className="saved-mop-details-image"
                              src={getMopIcon(card.type, card.classType, card.paymentProviderId)}
                              alt="saved-mop-icon"
                            />
                            <div className="saved-mop-details">
                              <span
                                className={`saved-mop-name ${isNonReloadableDisabled(card) ? "grey-text" : ""}`}
                              >
                                {card.name}
                                {card.disabled && (
                                  <Tooltip
                                    id={`non-reloadable-card-tooltip-${card.mopId}`}
                                    placement={TooltipPlacementProps.right}
                                    isInteractive
                                    tooltipContent="Non-reloadable gift cards can only be used for a one-time payment. They cannot be used for EasyPay automatic payments or payment arrangements."
                                  >
                                    <span className="tooltip-disabled-mop">
                                      <img
                                        src={resolveAemAssetPath(
                                          "/content/dam/cox/common/icons/ui_components/circle-question.svg"
                                        )}
                                        alt="Non-reloadable card information"
                                        className="help-message-icon"
                                      />
                                    </span>
                                  </Tooltip>
                                )}
                                {showLinks && (
                                  <div className="saved-mop-links">
                                    {card.isDefaultMop === "false" &&
                                      !card.disabled &&
                                      !multiAccount && (
                                        <>
                                          <Link
                                            to="#"
                                            onClick={(event) => {
                                              event.preventDefault();
                                              handleMakeDefault(card);
                                            }}
                                            aria-label="Make default"
                                          >
                                            Make Default
                                          </Link>
                                          <span className="vertical-divider"></span>
                                        </>
                                      )}
                                    {card.type !== "BANK" && !card.disabled && (
                                      <>
                                        <Link
                                          to="#"
                                          onClick={(event) => {
                                            event.preventDefault();
                                            handleEditCard(card);
                                          }}
                                          role="button"
                                          data-toggle="modal"
                                          id="link-terms-of-service"
                                          data-target="#one-time-payment-terms-modal"
                                          data-automation-id="review-onetimepayment-terms-link"
                                          className="modal-link"
                                        >
                                          Edit
                                        </Link>
                                        <span className="vertical-divider"></span>
                                      </>
                                    )}
                                    <Link
                                      to={card.linkRemoveUrl}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleRemoveMop(card);
                                      }}
                                      aria-label="Remove"
                                    >
                                      Remove
                                    </Link>
                                  </div>
                                )}
                              </span>
                              {card.isDefaultMop === "true" &&
                                showLinks &&
                                !multiAccount && (
                                  <span className="badge-default-container">
                                    <Badge
                                      text="Default"
                                      variation="standard"
                                    />
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SavedMop;
