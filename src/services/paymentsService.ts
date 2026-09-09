import {
  OKTA_FLOW_PAYMENT_BACK_URL,
  PREPAID_RECHARGE_SETUP_MOP_PAGE_PROTOTYPE,
  PREPAID_RECHARGE_REVIEW_PAGE_PROTOTYPE,
  PREPAID_RECHARGE_CONFIRM_PAGE_PROTOTYPE,
  PREPAID_RECHARGE_REVIEW_POST_URL,
  PREPAID_RECHARGE_CONFIRM_POST_URL,
  PREPAID_AUTOMATIC_RECHARGE_LANDING_PAGE_PROTOTYPE,
  PREPAID_AUTOMATIC_RECHARGE_MANAGE_PAGE_PROTOTYPE,
  PREPAID_AUTOMATIC_RECHARGE_SETUP_MOP_PAGE_PROTOTYPE,
  PREPAID_AUTOMATIC_RECHARGE_REVIEW_PAGE_PROTOTYPE,
  PREPAID_AUTOMATIC_RECHARGE_CONFIRM_PAGE_PROTOTYPE,
  PREPAID_AUTOMATIC_RECHARGE_SETUP_MOP_POST_URL,
  PREPAID_AUTOMATIC_RECHARGE_REVIEW_POST_URL,
  PREPAID_AUTOMATIC_RECHARGE_CONFIRM_POST_URL,
  OKTA_EASYPAY_CANCEL_PUT_URL,
} from "../hooks/constants";
import { PaymentFlowName, PaymentStep } from "../types/payment";

/**
 * Central place for payment flow transport concerns:
 *  - which prototype (Storybook/QA) URL a flow step maps to, and
 *  - the REST request configs used for the production step transitions.
 *
 * Note on transport: the actual HTTP call stays with core-ui8's `useAxios`
 * inside the component, because it injects the X-CSRF-TOKEN and credentials on
 * unsafe methods and handles server redirects. This service therefore returns an
 * `AxiosRequestConfig` for the component to run through `axiosAPI(...)`, rather
 * than issuing the request itself — centralizing URLs/params without bypassing
 * the CSRF-aware transport. Origin is prepended here so callers stop hand-building
 * `${window.location.origin}${path}`.
 */

const JSON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
} as const;

/**
 * Minimal request-config shape. Kept intentionally structural (not `axios`'s
 * `AxiosRequestConfig`) so it stays assignable to core-ui8's `useAxios` transport
 * regardless of which axios version each package resolves — an object of this
 * shape is what `axiosAPI(...)` expects.
 */
export interface PaymentRequestConfig {
  url: string;
  method: "POST";
  headers: Record<string, string>;
  data: string;
}

const origin = (): string =>
  typeof window !== "undefined" ? window.location.origin : "";

const post = (
  path: string,
  params: Record<string, unknown>,
): PaymentRequestConfig => ({
  url: `${origin()}${path}`,
  method: "POST",
  headers: { ...JSON_HEADERS },
  data: JSON.stringify(params),
});

/**
 * Prototype protoversion URL for each flow step — the single source of truth for
 * the hard redirects that used to be scattered across templates as `window.location`
 * assignments to per-flow `*_PAGE_PROTOTYPE` constants.
 */
const PROTOTYPE_STEP_URLS: Partial<
  Record<PaymentFlowName, Partial<Record<PaymentStep, string>>>
> = {
  "prepaid-recharge": {
    "setup-mop": PREPAID_RECHARGE_SETUP_MOP_PAGE_PROTOTYPE,
    review: PREPAID_RECHARGE_REVIEW_PAGE_PROTOTYPE,
    confirm: PREPAID_RECHARGE_CONFIRM_PAGE_PROTOTYPE,
  },
  "prepaid-automatic-recharge": {
    landing: PREPAID_AUTOMATIC_RECHARGE_LANDING_PAGE_PROTOTYPE,
    "manage-statement": PREPAID_AUTOMATIC_RECHARGE_MANAGE_PAGE_PROTOTYPE,
    "setup-mop": PREPAID_AUTOMATIC_RECHARGE_SETUP_MOP_PAGE_PROTOTYPE,
    review: PREPAID_AUTOMATIC_RECHARGE_REVIEW_PAGE_PROTOTYPE,
    confirm: PREPAID_AUTOMATIC_RECHARGE_CONFIRM_PAGE_PROTOTYPE,
  },
};

/**
 * Production POST url a flow submits to in order to transition *into* a given
 * step (e.g. `"review"` is the url the setup step's submit posts to). Steps
 * that are only ever redirect targets (e.g. `"landing"`) have no entry here.
 */
const POST_URLS: Partial<
  Record<PaymentFlowName, Partial<Record<PaymentStep, string>>>
> = {
  "prepaid-recharge": {
    review: PREPAID_RECHARGE_REVIEW_POST_URL,
    confirm: PREPAID_RECHARGE_CONFIRM_POST_URL,
  },
  "prepaid-automatic-recharge": {
    "setup-mop": PREPAID_AUTOMATIC_RECHARGE_SETUP_MOP_POST_URL,
    review: PREPAID_AUTOMATIC_RECHARGE_REVIEW_POST_URL,
    confirm: PREPAID_AUTOMATIC_RECHARGE_CONFIRM_POST_URL,
  },
};

/** Prototype redirect URL for a flow step (undefined if the flow has no such step). */
const getPrototypeStepUrl = (
  flow: PaymentFlowName,
  step: PaymentStep,
): string | undefined => PROTOTYPE_STEP_URLS[flow]?.[step];

/** Submit that transitions a flow into `step` (production). */
const buildStepRequest = (
  flow: PaymentFlowName,
  step: PaymentStep,
  params: Record<string, unknown> = {},
): PaymentRequestConfig => {
  const url = POST_URLS[flow]?.[step];
  if (!url) {
    throw new Error(`No POST url configured for ${flow} → ${step}`);
  }
  return post(url, params);
};

/** Back navigation between Okta-flow steps (production). */
const buildBackRequest = (
  params: Record<string, unknown> = {},
): PaymentRequestConfig => post(OKTA_FLOW_PAYMENT_BACK_URL, params);

/** Cancel EasyPay (production). Not a forward step transition, so it isn't a `buildStepRequest` case. */
const buildCancelEasyPayRequest = (
  params: Record<string, unknown> = {},
): PaymentRequestConfig => post(OKTA_EASYPAY_CANCEL_PUT_URL, params);

const paymentsService = {
  getPrototypeStepUrl,
  buildStepRequest,
  buildBackRequest,
  buildCancelEasyPayRequest,
};

export default paymentsService;
export {
  getPrototypeStepUrl,
  buildStepRequest,
  buildBackRequest,
  buildCancelEasyPayRequest,
};
