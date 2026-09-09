/**
 * Domain models for the payment flows.
 *
 * These describe the server-driven `sections.payment` payload that every payment
 * page consumes. Introduced as the typed contract that replaces `payment: any`
 * across pages/templates, so the compiler can protect refactors and callers stop
 * re-deriving the payload shape by hand.
 *
 * Fields are optional/permissive by design: the payload varies by flow and step,
 * and only a subset is present in any given view.
 */

/** Which view of a flow is rendered — driven by the payload, not the router. */
export type PaymentStep =
  | "setup"
  | "setup-mop"
  | "review"
  | "confirm"
  | "error"
  | "landing"
  | "easyPay-statements"
  | "manage-statement";

/** Flows rendered by these shared modules; add other flows here as they adopt
 *  the shared payment templates/service. */
export type PaymentFlowName = "prepaid-recharge" | "prepaid-automatic-recharge";

/** Payment method as shown on the review/confirm views (single, resolved method). */
export interface PaymentMethod {
  /** "card" | "bank" (case-insensitive downstream). */
  type?: string;
  /** Card brand used to resolve the brand icon, e.g. "visa", "mastercard". */
  classType?: string;
  /** Display string, e.g. "Visa ending in 6576". */
  cclast4: string;
  /** Bank provider id used to resolve a bank logo. */
  paymentProviderId?: string;
}

/** A saved payment method (MOP) shown in the setup selector. */
export interface SavedMop {
  mopId: string;
  /** "CARD" | "BANK". */
  type: string;
  name: string;
  classType?: string;
  lastFourDigits?: string;
  paymentProviderId?: string;
  /** Server sends this as a "true"/"false" string in several flows. */
  isDefaultMop?: boolean | "true" | "false";
  disabled?: boolean;
  expiringSoon?: boolean;
  expiringSoonWarning?: string;
  cardExpiredWarning?: string;
  selected?: boolean;
}

/** Enrollment status shown on the prepaid automatic recharge manage view.
 *  Prepaid accounts always have exactly one service, so this is a single
 *  object rather than EasyPay's per-statement array. */
export interface EasyPayStatus {
  serviceName?: string;
  enrolled?: boolean;
  /** Display string for the enrolled payment method, e.g. "Visa ending in 6576". */
  paymentMethod?: string;
  expired?: boolean;
}

/** A service's EasyPay enrollment row, as returned in `statements` on the
 *  automatic recharge landing view. Prepaid accounts return exactly one entry. */
export interface EasyPayStatement {
  statementCode?: string;
  name?: string;
  /** Display string for the enrolled payment method, e.g. "Visa ending in 6576". */
  paymentMethod?: string;
  enrolled?: boolean;
  expired?: boolean;
}

export interface PaymentRestrictions {
  restrictBankPayment?: boolean;
  restrictCardPayment?: boolean;
  allPaymentRestricted?: boolean;
  /** Optional restriction copy (HTML); shown in place of the setup form when set. */
  message?: string;
}

/**
 * Static "Payment details" copy for the setup view. Other flows post additional
 * fields under this key (balances, due dates); only what the typed views read is
 * modelled here.
 */
export interface PaymentSetupDetails {
  /** Summary sentence for the payment being set up; may contain markup. */
  description?: string;
  /** MM/DD/YYYY; formatted for display by the view. */
  paymentDate?: string;
  paymentAmount?: string;
  /** Analytics variables reported when the setup view is shown. */
  udoVars?: Record<string, unknown>;
}

export interface AccountDetails {
  accountNumber?: string;
  serviceAddress?: string;
}

export interface Billing {
  paymentAmount?: string;
  /** MM/DD/YYYY. */
  paymentDate?: string;
}

export interface PaymentDetailLine {
  statementCode?: string;
  serviceName?: string;
  totalAmount?: string;
  confirmation?: string;
  /** "Succeeded" | "Failed". */
  status?: string;
  /** Card brand for the icon, e.g. "Visa" (matched case-insensitively against bundled brand SVGs). */
  type?: string;
  /** Display string, e.g. "Visa ending in 6576". */
  cclast4?: string;
  /** Bank/card provider id used to resolve a bank logo. */
  paymentProviderId?: string;
  /** MM/DD/YYYY; formatted for display by the view. */
  paymentDate?: string;
}

export interface BillingOptions {
  showEasyPayCheckbox?: boolean;
  showPaperlessCheck?: boolean;
  /** EasyPay enrollment pitch shown above the consent copy. */
  easyPayOptInText?: string;
  /** "Click to cancel" body copy. */
  clickToCancelText?: string;
  /** Combined EasyPay enrollment pitch used by the prepaid recharge flow. */
  easyPayEnrollText?: string;
  /** Full consent sentence; the `easyPayModalHeader` phrase within it opens the modal. */
  easyPayTermsText?: string;
  easyPayModalHeader?: string;
  easyPayModalBody?: string;
  mailId?: string;
  cbMailId?: string;
}

export interface TermsAndConditions {
  /** Link label for the terms modal, e.g. "StraightUp Payment Terms of Service". */
  linkText?: string;
  otpModalHeader?: string;
  otpModalBody?: string;
}

export interface PaymentReviewDetails {
  accountDetails?: AccountDetails;
  /** Absent when the payment method/date instead travel per line in `paymentDetails`. */
  paymentMethod?: PaymentMethod;
  billing?: Billing;
  paymentDetails?: PaymentDetailLine[];
  billingOptions?: BillingOptions;
  cardExpiredWarning?: string;
  /** Sub-header copy for the review step. */
  reviewDescription?: string;
}

export interface EasyPayTerms {
  headerText?: string;
  termsAndConditionsText?: string;
}

/** Review-step contract for the prepaid automatic recharge (EasyPay) flow. */
export interface EasyPayReviewDetails {
  accountDetails?: AccountDetails;
  paymentDetails?: PaymentDetailLine[];
  easyPayTerms?: EasyPayTerms;
  achOfferAlertStatus?: boolean;
  oneTimePayment?: boolean;
  scheduledPayment?: boolean;
  expiringSoon?: boolean;
  easyPayEnrolled?: boolean;
  alreadyEnrolledOnThisMop?: boolean;
}

export interface PaymentConfirmDetails {
  /** "success" | "failed". */
  paymentStatus?: string;
  /** Outcome banners for this step. */
  alerts?: PaymentAlert[];
  /** Whether the confirmation can be printed. */
  showPrint?: boolean;
  enrolledInEasyPay?: boolean;
  accountDetails?: AccountDetails;
  /** Absent when the payment method/date instead travel per line in `paymentDetails`. */
  paymentMethod?: PaymentMethod;
  billing?: Billing;
  paymentDetails?: PaymentDetailLine[];
  /** Confirm-step heading/description, used by flows whose page header travels with the step payload (e.g. prepaid automatic recharge). */
  paymentDetailsInfo?: {
    headerText?: string;
    description?: string;
    errorMessage?: string | null;
  };
}

/** Banner style requested for a server-driven alert. */
export type AlertIconType = "info" | "warning" | "error" | "success";

/**
 * A page-level alert supplied by the server (card expiry notices, eligibility
 * and restriction blocks). `iconType` selects the banner variation; anything
 * unrecognized falls back to the error banner.
 */
export interface PaymentAlert {
  message: string;
  iconType?: AlertIconType;
  /** Optional call to action rendered inside the banner. */
  linkText?: string;
  linkUrl?: string;
}

export interface PaymentMessages {
  warningMessages?: string[];
  successMessages?: string[];
  errorMessages?: string[];
}

/**
 * Outcome of a saved-payment-method action, returned on the payload of the reload
 * the action triggers — never on the action's own POST response. `status` is the
 * string "true" / "false".
 */
export interface MopActionDetails {
  status?: string;
  successMessage?: string;
  errorMessage?: string;
}

/** The full `sections.payment` payload consumed by a payment page/template. */
export interface PaymentData {
  pageName?: PaymentStep;
  headerText?: string;
  subHeaderText?: string;
  /** Sub-header copy for the prepaid automatic recharge landing and review views. */
  subTitle?: string;
  navigateTo?: string;
  oktaLogin?: boolean;
  hasFullIbillAccess?: boolean;

  /** Server-driven banners shown at the top of the view. */
  alerts?: PaymentAlert[];
  /** Page-level error for the prepaid automatic recharge landing view. */
  pageError?: string | null;

  // Prepaid recharge specifics
  prepaid?: boolean;

  // Prepaid automatic recharge (EasyPay) landing/manage specifics
  easyPayStatus?: EasyPayStatus;
  /** Per-service EasyPay enrollment rows on the landing view. */
  statements?: EasyPayStatement[];
  isprepaidCustomer?: boolean;
  easyPayEligibilityError?: string;
  /** Present on the landing payload the browser lands on after a successful cancel. */
  cancelEasyPayDetails?: { successMessage?: string };

  // Eligibility / restrictions
  notEligibleforPayment?: boolean;
  paymentEligibilityErrorMessage?: string;
  paymentRestrictions?: PaymentRestrictions;

  // Setup
  paymentSetupDetails?: PaymentSetupDetails;
  savedMop?: SavedMop[] | null;
  listOfYears?: string[];

  // Review / confirm
  paymentReviewDetails?: PaymentReviewDetails;
  /** Review step for the prepaid automatic recharge flow (see PrepaidAutomaticRechargeReviewTemplate). */
  easyPayReviewDetails?: EasyPayReviewDetails;
  paymentConfirmDetails?: PaymentConfirmDetails;
  termsAndConditions?: TermsAndConditions;
  /** Top-level success/error messages returned by some step POST responses (e.g. cancel-easypay-put.rest). */
  successMessages?: string[];
  errorMessages?: string[];
  messages?: PaymentMessages;

  // Saved-card action outcomes (present only on the reloaded payload)
  addCardMopDetails?: MopActionDetails;
  updateCardMopDetails?: MopActionDetails;

  coxAppContent?: { url?: string };

  // AddPaymentMethod (card form) plumbing
  trustlyJs?: string;
  trustlyWidgetProps?: Record<string, unknown>;
  pciChaseEncryptKeyJs?: string;
  pciChaseEncryptJs?: string;

  // Analytics
  udoVars?: Record<string, unknown>;
}
