import { useEffect, useState } from "react";
import {
  AlignmentProps,
  Button,
  ButtonStates,
  ButtonTypes,
  useAxios,
} from "@cox/core-ui8";
import {
  OKTA_ADD_CARD_URL,
  OKTA_EDIT_CARD_GET_URL,
  OKTA_EDIT_CARD_POST_URL,
  OKTA_DELETE_MOP_DATA_DELETE_GET_URL,
  OKTA_DELETE_MOP_DATA_DELETE_POST_URL,
  OKTA_MAKE_DEFAULT_MOP_DATA_POST_URL,
  FETCH_TRUSTLY_METHOD_APPROVAL_AUTH_URL,
} from "../../hooks/constants";
import { isPrototypeUrl } from "../../utils/helper-utlities";
import {
  buildStepRequest,
  buildBackRequest,
  getPrototypeStepUrl,
} from "../../services/paymentsService";
import { usePaymentStepSubmit } from "../../hooks/usePaymentStepSubmit";
import {
  MopActionDetails,
  PaymentAlert,
  PaymentData,
  SavedMop,
} from "../../types/payment";
import AddPaymentMethod from "../../components/AddPaymentMethod";
import Throbber from "../../components/common/Throbber";
import AlertList from "../../components/common/AlertList";

interface PrepaidAutomaticRechargeSetupTemplateProps {
  payment: PaymentData;
  onPostSubmitResponse: (data: PaymentData) => void;
  setPaymentData: (data: PaymentData) => void;
}

/** Payload keys carrying a card add / edit outcome, in display order. */
const MOP_ACTION_KEYS = ["addCardMopDetails", "updateCardMopDetails"] as const;

// `status` is the string "true" / "false", not a boolean.
const toActionAlert = (details?: MopActionDetails): PaymentAlert | undefined => {
  if (details?.status === "true" && details.successMessage) {
    return { message: details.successMessage, iconType: "success" };
  }
  if (details?.status === "false" && details.errorMessage) {
    return { message: details.errorMessage, iconType: "error" };
  }
  return undefined;
};

/**
 * Banners for the saved-card actions. Add and edit land as `*MopDetails` objects;
 * remove and make default land as plain success messages — all of them on the
 * payload of the reload the action triggers.
 */
const getMopActionAlerts = (payment: PaymentData): PaymentAlert[] => {
  const actionAlerts = MOP_ACTION_KEYS.map((key) =>
    toActionAlert(payment[key]),
  ).filter((alert): alert is PaymentAlert => Boolean(alert));

  const seen = new Set(actionAlerts.map(({ message }) => message));

  (payment.messages?.successMessages ?? []).forEach((message) => {
    if (message && !seen.has(message)) {
      seen.add(message);
      actionAlerts.push({ message, iconType: "success" });
    }
  });

  return actionAlerts;
};

/** Warning banners for saved cards nearing expiration, derived from `savedMop`. */
const getExpiringSoonAlerts = (
  savedMop: SavedMop[] | null | undefined,
): PaymentAlert[] =>
  (savedMop ?? [])
    .filter((card) => card.expiringSoon && card.expiringSoonWarning)
    .map((card) => ({
      message: card.expiringSoonWarning as string,
      iconType: "warning",
    }));

/**
 * Prepaid automatic recharge setup view. Reuses the shared AddPaymentMethod
 * selector (card-only) and blocks the flow (red alert, no form) when card
 * payments are restricted — same shape as PrepaidRechargeSetupTemplate, minus
 * the one-time renewal date summary (this step enrolls, it doesn't charge).
 */
const PrepaidAutomaticRechargeSetupTemplate = ({
  payment,
  onPostSubmitResponse,
  setPaymentData,
}: PrepaidAutomaticRechargeSetupTemplateProps) => {
  const {
    savedMop = [],
    paymentRestrictions = {},
    alerts = [],
  } = payment;

  // Prepaid accepts card only, so the bank tab is always restricted.
  const cardRestricted =
    paymentRestrictions?.allPaymentRestricted ||
    paymentRestrictions?.restrictCardPayment;

  // Outcome banners for the saved-card actions, read off the payload of the
  // reload those actions trigger.
  const actionAlerts = getMopActionAlerts(payment);
  const expiringSoonAlerts = getExpiringSoonAlerts(savedMop);

  // Saved cards are managed by any signed-in customer: prepaid accounts are not
  // granted full billing access, so that flag cannot gate these links.
  const canManageSavedCards = payment?.oktaLogin;

  const [activeTab, setActiveTab] = useState("existingPaymentMethods");
  const [showMopTab, setShowMopTab] = useState(true);
  const [checkclass, setCheckclass] = useState<string>(() => {
    const cards: SavedMop[] = savedMop ?? [];
    const selectedCard = cards.find((c) => c.selected && !c.disabled);
    const defaultCard = cards.find((c) => c.isDefaultMop && !c.disabled);
    const firstEnabledCard = cards.find((c) => !c.disabled);
    return (
      selectedCard?.mopId ||
      defaultCard?.mopId ||
      firstEnabledCard?.mopId ||
      ""
    );
  });
  const { isSubmitting, errorMessages, setErrorMessages, submit } =
    usePaymentStepSubmit({
      flow: "prepaid-automatic-recharge",
      onSuccess: onPostSubmitResponse,
    });

  const { axiosAPI: axiosAPIForBack } = useAxios({
    autoFetch: false,
    onCompleted: (data: any) => {
      setPaymentData(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: () => {
      setErrorMessages(["Something went wrong. Please try again later."]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  });

  useEffect(() => {
    // With no saved card the tabbed picker collapses straight to the card form.
    if (!savedMop || savedMop.length === 0) {
      setShowMopTab(false);
      setActiveTab("creditCard");
    }
  }, [savedMop]);

  // The saved-card actions reload the page; the browser restores the previous
  // scroll offset, which would leave the outcome banner off-screen.
  useEffect(() => {
    if (actionAlerts.length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [actionAlerts.length]);

  const formButtons: any = [
    {
      isFormSubmit: false,
      buttonTypes: ButtonTypes.SECONDARY,
      text: "Back",
      cssClass: "review-buttons text-center mt-2 mb-2",
      customClickEvent: handleBackBtnClick,
      id: "back-btn",
    },
    {
      isFormSubmit: true,
      buttonTypes: ButtonTypes.PRIMARY,
      text: "Add Card",
      cssClass: "review-buttons text-center mt-2 mb-2",
      id: "add-btn",
    },
  ];

  // Setup is only ever reached from the landing view (Enroll) or manage view
  // (Change), so Back always returns there — not to the outer app.
  async function handleBackBtnClick() {
    if (isPrototypeUrl()) {
      const landingUrl = getPrototypeStepUrl(
        "prepaid-automatic-recharge",
        "landing",
      );
      if (landingUrl) window.location.href = landingUrl;
      return;
    }
    try {
      await axiosAPIForBack(
        buildBackRequest({
          pageName: "easyPay-statements",
          flowName: "prepaid-automatic-recharge",
        }),
      );
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const handleSubmit = () => {
    const params = checkclass ? { mopId: checkclass } : {};
    submit(
      "review",
      buildStepRequest("prepaid-automatic-recharge", "review", params),
    );
  };

  const handleAddMethodResponse = (response: PaymentData) => {
    if ((response?.messages?.errorMessages?.length ?? 0) > 0) {
      setErrorMessages(response.messages!.errorMessages!);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.reload();
    }
  };

  // Enrollment blocked: card payments are not enabled on the account. Any
  // other page alert (e.g. an expired saved card) renders inline below,
  // alongside the form.
  if (cardRestricted) {
    return <AlertList alerts={alerts} id="prepaid-automatic-recharge" />;
  }

  return (
    <>
      <Throbber show={isSubmitting} />

      <AlertList
        alerts={[...actionAlerts, ...expiringSoonAlerts, ...alerts]}
        messages={errorMessages}
        id="prepaid-automatic-recharge"
      />

      <div id="prepaid-automatic-recharge-setup">
        <div className="content">
          <div className="form wrap-errors collapse-form-validate">
            <div
              className="payment-method-header-wrapper"
              data-testid="paymentMethod-content"
            >
              <h3
                className="mt-4 add-payment-method-subheader"
                data-automation-id="paymentMethod-header"
              >
                Select an EasyPay automatic payment method
              </h3>
            </div>

            <div
              className="payment-methods"
              data-automation-id="payment-methods-container"
            >
              <div className="row">
                <div className="col-sm-12 custom-payment-margin pl-0">
                  <AddPaymentMethod
                    id="prepaid-automatic-recharge"
                    payment={payment}
                    showExistingPaymentMethodsTab={showMopTab}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    showLinks={canManageSavedCards}
                    checkclass={checkclass}
                    setCheckclass={setCheckclass}
                    paymentRestrictions={paymentRestrictions}
                    formButtons={formButtons}
                    trustlyMethodUrl={FETCH_TRUSTLY_METHOD_APPROVAL_AUTH_URL}
                    saveCardApiUrl={OKTA_ADD_CARD_URL}
                    flowName="prepaid-automatic-recharge"
                    getCardDataApiUrl={OKTA_EDIT_CARD_GET_URL}
                    updateCardDataApiUrl={OKTA_EDIT_CARD_POST_URL}
                    getDeleteMopApiUrl={OKTA_DELETE_MOP_DATA_DELETE_GET_URL}
                    postDeleteMopApiUrl={OKTA_DELETE_MOP_DATA_DELETE_POST_URL}
                    makeDefaultApiUrl={OKTA_MAKE_DEFAULT_MOP_DATA_POST_URL}
                    onResponse={handleAddMethodResponse}
                    customerType="residential"
                  />
                </div>
              </div>
            </div>

            <div className="form-group submit-button d-block d-md-flex pt-0 button-group mb-0">
              {(activeTab === "existingPaymentMethods" ||
                activeTab === "bankAccount") && (
                <div>
                  <Button
                    openInNewTab={false}
                    alignment={AlignmentProps.CENTER}
                    text="Back"
                    size=""
                    buttonStates={ButtonStates.ACTIVE}
                    buttonTypes={ButtonTypes.SECONDARY}
                    className="custom-secondary-btn"
                    customClickEvent={handleBackBtnClick}
                    data-automation-id="setup-back-button"
                  />
                </div>
              )}
              {activeTab === "existingPaymentMethods" && (
                <div className="payment-submit-btn">
                  <Button
                    isFormSubmit={true}
                    openInNewTab={false}
                    alignment={AlignmentProps.CENTER}
                    text="Continue"
                    size=""
                    buttonStates={
                      checkclass ? ButtonStates.ACTIVE : ButtonStates.DISABLED
                    }
                    buttonTypes={ButtonTypes.PRIMARY}
                    customClickEvent={handleSubmit}
                    data-automation-id="setup-continue-button"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrepaidAutomaticRechargeSetupTemplate;
