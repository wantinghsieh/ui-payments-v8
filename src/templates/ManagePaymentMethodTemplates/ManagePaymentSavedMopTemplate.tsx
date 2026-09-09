import { useState, useEffect } from "react";
import AddPaymentMethod from "../../components/AddPaymentMethod";
import ErrorAlert from "../../components/Alerts/ErrorAlert";
import SuccessAlert from "../../components/Alerts/SuccessAlert";
import WarningAlert from "../../components/Alerts/WarningAlert";
// Residential URLs for Edit, Delete, and Make Default MOP actions
import {
  OKTA_EDIT_CARD_GET_URL,
  OKTA_EDIT_CARD_POST_URL,
  OKTA_DELETE_MOP_DATA_DELETE_GET_URL,
  OKTA_DELETE_MOP_DATA_DELETE_POST_URL,
  OKTA_MAKE_DEFAULT_MOP_DATA_POST_URL,
  // Cox Business (CB) equivalents
  OKTA_CB_EDIT_CARD_GET_URL,
  OKTA_CB_EDIT_CARD_POST_URL,
  OKTA_CB_DELETE_MOP_DATA_DELETE_GET_URL,
  OKTA_CB_DELETE_MOP_DATA_DELETE_POST_URL,
  OKTA_CB_MAKE_DEFAULT_MOP_DATA_POST_URL,
} from "../../hooks/constants";

/**
 * ManagePaymentSavedMopTemplate
 *
 * Renders the Manage Payment Methods page, displaying the customer's saved
 * payment methods (MOPs) with Edit, Remove, and Make Default actions.
 *
 * - Tabs and radio buttons are intentionally hidden via CSS (#manage-payment-method)
 *   since this page is for managing MOPs, not selecting one for payment.
 * - API URLs are chosen based on customerType (residential vs. business).
 */
function ManagePaymentSavedMopTemplate({ payment, customerType, setPaymentData }: any) {
  const {
    oktaLogin = false,
    savedMop = [],
    paymentRestrictions = {},
  } = payment;

  // Always show the existing payment methods tab
  const [activeTab, setActiveTab] = useState('existingPaymentMethods');
  // Warning messages for cards expiring soon
  const [expiringSoonMessages, setExpiringSoonMessages] = useState([]);
  // Error messages for already-expired cards
  const [expiredCardMessages, setExpiredCardMessages] = useState([]);
  // Success message surfaced from Edit / Remove / Make Default modal actions
  const [successMsgSetupMopRMDModal, setSuccessMsgSetupMopRMDModal] = useState<string>("");

  // Derive expiring-soon and expired alert messages from the saved MOP list
  useEffect(() => {
    if (savedMop && savedMop.length > 0) {
      const expiringSoonMops = savedMop
        .filter((card: any) => card.expiringSoon)
        .map((card: any) => card.expiringSoonWarning);
      setExpiringSoonMessages(expiringSoonMops);

      const expiredMops = savedMop
        .filter((card: any) => card.cardExpiredWarning)
        .map((card: any) => card.cardExpiredWarning);
      setExpiredCardMessages(expiredMops);
    }
  }, [savedMop]);

  // Scroll to top whenever alerts become visible
  const hasAlerts = Boolean(
    successMsgSetupMopRMDModal ||
    expiredCardMessages?.length > 0 ||
    payment?.messages?.successMessages?.length > 0 ||
    payment?.updateCardMopDetails?.status === "true"
  );

  useEffect(() => {
    if (hasAlerts) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [hasAlerts]);

  // On mount: prevent browser scroll restoration from overriding React's scroll,
  // and honour the sessionStorage flag set before a post-action reload
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (sessionStorage.getItem('scrollToTopAfterReload') === 'true') {
      sessionStorage.removeItem('scrollToTopAfterReload');
      window.scrollTo(0, 0);
    }

    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  /**
   * Callback passed to AddPaymentMethod for Edit / Remove / Make Default responses.
   * - On error: updates payment data state and scrolls the error into view.
   * - On success: flags sessionStorage so the page scrolls to top after reload,
   *   then reloads to reflect the updated MOP list.
   */
  const handleResponse = (response: any) => {
    if (response?.messages?.errorMessages?.length > 0) {
      setPaymentData((prev: any) => ({
        ...prev,
        messages: response?.messages,
      }));
      const element = document.getElementById('manage-payment-method');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      sessionStorage.setItem('scrollToTopAfterReload', 'true');
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.location.reload();
    }
  };

  return (
    <div id="manage-payment-method" className="card-theme-futurepay ml-0">
      {/* Success message from Edit / Remove / Make Default modal */}
      {successMsgSetupMopRMDModal && (
        <SuccessAlert message={successMsgSetupMopRMDModal} id="manage-payment-method" />
      )}

      {/* Success alert after a card update (updateCardMopDetails) */}
      {payment?.updateCardMopDetails?.status === "true" && (
        <SuccessAlert
          message={payment?.updateCardMopDetails?.successMessage}
          id="manage-payment-method"
        />
      )}

      {/* Server-side success messages returned on page load (e.g. after reload) */}
      {payment?.messages?.successMessages?.length > 0 && (
        <>
          {payment.messages.successMessages.map((message: any, index: number) => (
            <div key={index}>
              <SuccessAlert message={message} id="manage-payment-method" />
            </div>
          ))}
        </>
      )}

      {/* Warning banners for cards that are expiring soon */}
      {expiringSoonMessages?.length > 0 &&
        expiringSoonMessages.map((message: any) => (
          <WarningAlert message={message} id="expiring-soon-error" key={message} />
        ))
      }

      {/* Error banners for cards that have already expired */}
      {expiredCardMessages?.length > 0 &&
        expiredCardMessages.map((message: any) => (
          <ErrorAlert message={message} id="expired-card-alert" key={message} />
        ))
      }

      <div className="payment-container future-pay chat-payment pl-0 pr-0">
        <div className="autoreg_content"></div>
        <h3 data-automation-id="add-payment-method-header" className="mt-4 add-payment-method-subheader">Payment methods</h3>
        <div className="row">
          <div className="col-sm-12 custom-payment-margin pl-0">
            <AddPaymentMethod
              id="manage-payment"
              payment={payment}
              showExistingPaymentMethodsTab={true}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              // Show Edit / Remove / Make Default links only for authenticated (okta) users
              showLinks={oktaLogin}
              paymentRestrictions={paymentRestrictions}
              formButtons={[]}
              // No MOP selection on this page; no-op prevents runtime errors in SavedMop
              setCheckclass={() => {}}
              // flowName drives SavedMop behavior; only set for authenticated sessions
              flowName={oktaLogin ? "manage-payment-method" : ""}
              // Route to residential or CB endpoints based on customerType
              getCardDataApiUrl={customerType !== "business" ? OKTA_EDIT_CARD_GET_URL : OKTA_CB_EDIT_CARD_GET_URL}
              updateCardDataApiUrl={customerType !== "business" ? OKTA_EDIT_CARD_POST_URL : OKTA_CB_EDIT_CARD_POST_URL}
              getDeleteMopApiUrl={customerType !== "business" ? OKTA_DELETE_MOP_DATA_DELETE_GET_URL : OKTA_CB_DELETE_MOP_DATA_DELETE_GET_URL}
              postDeleteMopApiUrl={customerType !== "business" ? OKTA_DELETE_MOP_DATA_DELETE_POST_URL : OKTA_CB_DELETE_MOP_DATA_DELETE_POST_URL}
              makeDefaultApiUrl={customerType !== "business" ? OKTA_MAKE_DEFAULT_MOP_DATA_POST_URL : OKTA_CB_MAKE_DEFAULT_MOP_DATA_POST_URL}
              onResponse={handleResponse}
              setSuccessMsgSetupMopRMDModal={setSuccessMsgSetupMopRMDModal}
              isSPMAccount={payment?.spmaccount}
              customerType={customerType}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagePaymentSavedMopTemplate;
