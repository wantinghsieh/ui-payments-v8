/** Prototype constants */
/* Make a payment flow */
export const MAKE_PAYMENT_REVIEW_PAGE_PROTOTYPE =
  "/ui/v8/payments/pay-now.html?protoversion=review";
export const MAKE_PAYMENT_CONFIRM_PAGE_PROTOTYPE =
  "/ui/v8/payments/pay-now.html?protoversion=confirm";
export const MAKE_PAYMENT_HOME_PAGE_PROTOTYPE = "/ui/v8/payments/pay-now.html";

/* Redirect urls for error pages */
export const MAKE_PAYMENT_CSRF_VALIDATION_FAILED_URL =
  "/payments/pay-now-error.html?errorCode=CSRF-VALIDATION-FAILED&errorMessage=CSRF validation failed";
export const MAKE_PAYMENT_AUTHORIZATION_FAILED_URL =
  "/payments/pay-now-error.html?errorCode=AUTHORIZATION_FAILED&errorMessage=Authorization failed";
/* POST call urls */
export const MAKE_PAYMENT_REVIEW_INFO_POST_URL = "/payments/reviewpayinfo.rest";
export const MAKE_PAYMENT_CONFIRM_INFO_POST_URL =
  "/payments/confirmpayinfo.rest";

/* Common constants */
/* Fetch bank name using routing number */
export const VALIDATE_ROUTING_NBR_PROTPTYPE_URL =
  "/ui/v8/payments/validate-routing.json";
export const GET_VALIDATE_ROUTING_NBR_URL = (routingNumber: string) => {
  return `/payments/validate-routing.rest?routingNumber=${routingNumber}`;
};

/* Fetch Trustly method approval */
export const FETCH_TRUSTLY_METHOD_APPROVAL_PROTPTYPE_URL =
  "/ui/v8/payments/trustly-method-approval.json";
/* For tokenized flow */
export const FETCH_TRUSTLY_METHOD_APPROVAL_URL =
  "/payments/trustly-method-approval.rest";
/* For OKTA flow */
export const FETCH_TRUSTLY_METHOD_APPROVAL_AUTH_URL =
  "/payments/trustly-method-approval-auth.rest";

/** Automatic Payment Flow Constants **/
/* Prototype constants */
export const EASYPAY_SETUP_PAGE_PROTOTYPE = "/ui/v8/payments/auto-pay.html";
export const EASYPAY_REVIEW_PAGE_PROTOTYPE =
  "/ui/v8/payments/auto-pay.html?protoversion=review";
export const EASYPAY_CONFIRM_PAGE_PROTOTYPE =
  "/ui/v8/payments/auto-pay.html?protoversion=confirm";

/* Redirect urls for error pages */
export const EASYPAY_ERROR_PAGE_URL = "/payments/auto-pay-error.html";
export const EASYPAY_CSRF_VALIDATION_FAILED_URL =
  "/payments/auto-pay-error.html?errorCode=CSRF-VALIDATION-FAILED&errorMessage=CSRF validation failed";
export const EASYPAY_AUTHORIZATION_FAILED_URL =
  "/payments/auto-pay-error.html?errorCode=AUTHORIZATION_FAILED&errorMessage=Authorization failed";

/* API call urls */
export const EASYPAY_REVIEW_POST_URL =
  "/payments/automatic-payments-review.rest";
export const EASYPAY_CONFIRM_POST_URL =
  "/payments/automatic-payments-confirm.rest";
export const EASYPAY_ADD_CARD_URL = "/payments/auto-pay-add-card-ajax.rest";

export const OKTA_EASYPAY_GET_ENROLLMENT_DATA_URL =
  "/payments/automatic-payments-enroll-easypay.rest";
export const OKTA_EASYPAY_GET_MOP_DATA_URL =
  "/payments/automatic-payments-setup-mop.rest";
export const OKTA_EASYPAY_CANCEL_PUT_URL = "/payments/cancel-easypay-put.rest";
export const OKTA_EASYPAY_REVIEW_POST_URL =
  "/payments/automatic-payments-okta-review.rest";
export const OKTA_EASYPAY_CONFIRM_POST_URL =
  "/payments/automatic-payments-okta-confirm.rest";
export const OKTA_EASYPAY_GET_CANCEL_EASYPAY_DATA_URL =
  "/payments/cancel-easypay-data.get.rest";

export const ADD_PAYMENT_METHOD_ADD_CARD_URL =
  "/payments/add-method-add-card-ajax.rest";

/** Okta Automatic Payment Method Flow Constants **/
/* Prototype constants */
export const OKTA_EASYPAY_LANDING_PAGE_PROTOTYPE =
  "/ui/v8/payments/automatic-payments.html";
export const OKTA_EASYPAY_MANAGE_PAGE_PROTOTYPE =
  "/ui/v8/payments/automatic-payments.html?protoversion=manage-statement";
export const OKTA_EASYPAY_STATEMENT_PAGE_PROTOTYPE =
  "/ui/v8/payments/automatic-payments.html?protoversion=select-statements";
export const OKTA_EASYPAY_SETUP_PAGE_PROTOTYPE =
  "/ui/v8/payments/automatic-payments.html?protoversion=setup-mop";
export const OKTA_EASYPAY_REVIEW_PAGE_PROTOTYPE =
  "/ui/v8/payments/automatic-payments.html?protoversion=review-single-without-past-due-and-no-scheduled-payment";
export const OKTA_EASYPAY_CONFIRM_PAGE_PROTOTYPE =
  "/ui/v8/payments/automatic-payments.html?protoversion=confirm";
export const OKTA_EASYPAY_CANCEL_EASYPAY_SUCCESS_PROTOTYPE =
  "/ui/v8/payments/automatic-payments.html?protoversion=success-cancel-easy-pay";

/**  One time payment flow constants  **/
/* Prototype constants */
export const ONE_TIME_PAYMENT_STATEMENT_PAGE_PROTOTYPE =
  "/ui/v8/payments/make-payment.html";
export const ONE_TIME_PAYMENT_SETUP_MOP_PAGE_PROTOTYPE =
  "/ui/v8/payments/make-payment.html?protoversion=setup-mop";
export const ONE_TIME_PAYMENT_REVIEW_MOP_PAGE_PROTOTYPE =
  "/ui/v8/payments/make-payment.html?protoversion=review";
export const ONE_TIME_PAYMENT_CONFIRM_MOP_PAGE_PROTOTYPE =
  "/ui/v8/payments/make-payment.html?protoversion=confirm-mop-multi-statement";
/* POST call urls */
export const ONE_TIME_PAYMENT_STATEMENT_POST_URL =
  "/payments/one-time-payment-setup-mop.rest";

export const ONE_TIME_PAYMENT_REVIEW_POST_URL =
  "/payments/one-time-payment-review.rest";
export const ONE_TIME_PAYMENT_CONFIRM_POST_URL =
  "/payments/one-time-payment-confirm.rest";

/**  Prepaid recharge flow constants  **/
/* Dedicated page/URL for the residential prepaid recharge flow. Prepaid content
   and rules (card-only MOP, renewal copy, 30-day recharge block) are data-driven,
   rendered by the PrepaidRecharge templates composed from shared components. */
export const PREPAID_RECHARGE_SETUP_MOP_PAGE_PROTOTYPE =
  "/ui/v8/payments/prepaid-recharge.html";
export const PREPAID_RECHARGE_REVIEW_PAGE_PROTOTYPE =
  "/ui/v8/payments/prepaid-recharge.html?protoversion=review";
export const PREPAID_RECHARGE_CONFIRM_PAGE_PROTOTYPE =
  "/ui/v8/payments/prepaid-recharge.html?protoversion=confirm";
/* PREPAID RECHARGE POST call urls */
export const PREPAID_RECHARGE_REVIEW_POST_URL =
  "/payments/prepaid/recharge/review";
export const PREPAID_RECHARGE_CONFIRM_POST_URL =
  "/payments/prepaid/recharge/confirm";

/**  Prepaid automatic recharge flow constants  **/
/* Dedicated page/URL for the residential prepaid automatic recharge (EasyPay)
   flow. Card-only MOP and "StraightUp Internet" naming are data-driven, same
   as the prepaid recharge flow; the breadcrumb is always "Billing home". */
export const PREPAID_AUTOMATIC_RECHARGE_LANDING_PAGE_PROTOTYPE =
  "/ui/v8/payments/prepaid-automatic-recharge.html";
export const PREPAID_AUTOMATIC_RECHARGE_MANAGE_PAGE_PROTOTYPE =
  "/ui/v8/payments/prepaid-automatic-recharge.html?protoversion=manage";
export const PREPAID_AUTOMATIC_RECHARGE_SETUP_MOP_PAGE_PROTOTYPE =
  "/ui/v8/payments/prepaid-automatic-recharge.html?protoversion=setup";
export const PREPAID_AUTOMATIC_RECHARGE_REVIEW_PAGE_PROTOTYPE =
  "/ui/v8/payments/prepaid-automatic-recharge.html?protoversion=review";
export const PREPAID_AUTOMATIC_RECHARGE_CONFIRM_PAGE_PROTOTYPE =
  "/ui/v8/payments/prepaid-automatic-recharge.html?protoversion=confirm";
export const PREPAID_AUTOMATIC_RECHARGE_CANCEL_SUCCESS_PROTOTYPE =
  "/ui/v8/payments/prepaid-automatic-recharge.html?protoversion=cancel-success";
/* PREPAID AUTOMATIC RECHARGE POST call urls */
export const PREPAID_AUTOMATIC_RECHARGE_SETUP_MOP_POST_URL =
  "/payments/prepaid/automatic-recharge/setup-mop";
export const PREPAID_AUTOMATIC_RECHARGE_REVIEW_POST_URL =
  "/payments/prepaid/automatic-recharge/review";
export const PREPAID_AUTOMATIC_RECHARGE_CONFIRM_POST_URL =
  "/payments/prepaid/automatic-recharge/confirm";

/*Future payment method flow constants */
export const FUTURE_PAYMENT_STATEMENT_SELECTOR_PROTOTYPE =
  "/ui/v8/payments/future-payment.html";
export const FUTURE_PAYMENT_SETUP_MOP_PROTOTYPE =
  "/ui/v8/payments/future-payment.html?protoversion=setup-mop-saved-mop";
export const FUTURE_PAYMENT_REVIEW_PROTOTYPE =
  "/ui/v8/payments/future-payment.html?protoversion=review";
export const FUTURE_PAYMENT_CONFIRM_PROTOTYPE =
  "/ui/v8/payments/future-payment.html?protoversion=confirm";

/*Extend payment method flow constants */
export const EXTEND_PAYMENT_STATEMENT_PROTOTYPE =
  "/ui/v8/payments/payment-extension.html";
export const EXTEND_PAYMENT_SETUP_PROTOTYPE =
  "/ui/v8/payments/payment-extension.html?protoversion=setup";
export const EXTEND_PAYMENT_REVIEW_PROTOTYPE =
  "/ui/v8/payments/payment-extension.html?protoversion=review";
export const EXTEND_PAYMENT_CONFIRM_PROTOTYPE =
  "/ui/v8/payments/payment-extension.html?protoversion=confirm";
/* EXTEND PAYMENT POST call urls */
export const EXTEND_PAYMENT_SETUP_URL =
  "/payments/payment-extension-setup.rest";
export const EXTEND_PAYMENT_REVIEW_URL =
  "/payments/payment-extension-review.rest";
export const EXTEND_PAYMENT_CONFIRM_URL =
  "/payments/payment-extension-confirm.rest";
export const EXTEND_PAYMENT_DONE_URL = "/payments/payment-extension-done.rest";

/* Common urls for OKTA flow */
export const OKTA_FLOW_PAYMENT_BACK_URL = "/payments/payments-back.html";
export const OKTA_ADD_CARD_URL = "/payments/add-card.rest";
export const OKTA_EDIT_CARD_GET_URL = "/payments/edit-card-get.rest";
export const OKTA_EDIT_CARD_POST_URL = "/payments/edit-card-post.rest";
export const OKTA_DELETE_MOP_DATA_DELETE_GET_URL =
  "/payments/delete-mop-get.rest";
export const OKTA_DELETE_MOP_DATA_DELETE_POST_URL =
  "/payments/delete-mop-post.rest";
export const OKTA_MAKE_DEFAULT_MOP_DATA_POST_URL =
  "/payments/make-default-post.rest";

/* Common urls for Tokenized flow */
export const TOKENIZED_FLOW_PAYMENT_BACK_URL =
  "/payments/payments-back-token.html";

/**  My bill home page link  **/
export const MY_BILL_HOME_PAGE = "/ibill/home.html";

/**  My bill payment options page link  **/
export const MY_BILL_PAYMENT_OPTIONS_PAGE = "/ibill/payment-options.html";

/* Common urls for OKTA CB flow */
export const OKTA_FLOW_CB_PAYMENT_BACK_URL =
  "/payments/business/payments-back.html";
export const FETCH_CB_TRUSTLY_METHOD_APPROVAL_AUTH_URL =
  "/payments/business/trustly-method-approval-auth.rest";
export const OKTA_CB_ADD_CARD_URL = "/payments/business/add-card.rest";
export const OKTA_CB_ADD_CARD_MULTI_ACCOUNT_URL =
  "/payments/business/multi-acc-add-card.rest";
export const OKTA_CB_EDIT_CARD_GET_URL =
  "/payments/business/edit-card-get.rest";
export const OKTA_CB_EDIT_CARD_POST_URL =
  "/payments/business/edit-card-post.rest";
export const OKTA_CB_DELETE_MOP_DATA_DELETE_GET_URL =
  "/payments/business/delete-mop-get.rest";
export const OKTA_CB_DELETE_MOP_DATA_DELETE_POST_URL =
  "/payments/business/delete-mop-post.rest";
export const OKTA_CB_MAKE_DEFAULT_MOP_DATA_POST_URL =
  "/payments/business/make-default-post.rest";
export const OKTA_CB_KEEP_ALIVE_URL = "/payments/business/keep-alive.rest";
export const OKTA_CB_MULTI_ACCOUNT_DELETE_MOP_DATA_DELETE_GET_URL =
  "/payments/business/multi-acc-delete-mop-get.rest";
export const OKTA_CB_MULTI_ACCOUNT_DELETE_MOP_DATA_DELETE_POST_URL =
  "/payments/business/multi-acc-delete-mop-post.rest";
export const OKTA_CB_MULTI_ACCOUNT_EDIT_CARD_GET_URL =
  "/payments/business/multi-acc-edit-mop-get.rest";
export const OKTA_CB_MULTI_ACCOUNT_EDIT_CARD_POST_URL =
  "/payments/business/multi-acc-edit-mop-post.rest";

export const ONE_TIME_PAYMENT_CB_REVIEW_POST_URL =
  "/payments/business/one-time-payment-review.rest";
export const ONE_TIME_PAYMENT_CB_CONFIRM_POST_URL =
  "/payments/business/one-time-payment-confirm.rest";

/** API call urls for CB Automatic payments flow  **/
export const OKTA_CB_EASYPAY_REVIEW_POST_URL =
  "/payments/business/automatic-payments-okta-review.rest";
export const OKTA_CB_EASYPAY_CONFIRM_POST_URL =
  "/payments/business/automatic-payments-okta-confirm.rest";

/**  CB More menu & Header urls  **/
export const OKTA_CB_MORE_MENU_URL = "/payments/business/more-menu.rest";
export const GET_CB_HEADER_URL = "/payments/business/header-menu.rest";

/**  One time payment and easy pay CB flow constants  **/
/* Prototype constants */
export const ONE_TIME_PAYMENT_CB_SETUP_MOP_PAGE_PROTOTYPE =
  "/ui/v8/payments/business/make-payment.html";
export const ONE_TIME_PAYMENT_CB_REVIEW_MOP_PAGE_PROTOTYPE =
  "/ui/v8/payments/business/make-payment.html?protoversion=review-business";
export const ONE_TIME_PAYMENT_CB_CONFIRM_MOP_PAGE_PROTOTYPE =
  "/ui/v8/payments/business/make-payment.html?protoversion=confirm-business";
export const OKTA_CB_EASYPAY_LANDING_PAGE_PROTOTYPE =
  "/ui/v8/payments/business/automatic-payments.html";
export const OKTA_CB_EASYPAY_REVIEW_PAGE_PROTOTYPE =
  "/ui/v8/payments/business/automatic-payments.html?protoversion=review";
export const OKTA_CB_EASYPAY_CONFIRM_PAGE_PROTOTYPE =
  "/ui/v8/payments/business/automatic-payments.html?protoversion=confirm";
export const FUTURE_PAYMENT_CB_SETUP_MOP_PROTOTYPE =
  "/ui/v8/payments/business/future-payment.html";
export const FUTURE_PAYMENT_CB_REVIEW_PROTOTYPE =
  "/ui/v8/payments/business/future-payment.html?protoversion=review";
export const FUTURE_PAYMENT_CB_CONFIRM_PROTOTYPE =
  "/ui/v8/payments/business/future-payment.html?protoversion=confirm";
/* Multi Account Make payment constants */
export const MULTI_ACCOUNT_ONE_TIME_PAYMENT_CB_SETUP_MOP_PAGE_PROTOTYPE =
  "/ui/v8/payments/business/multi-acct-make-payment.html";
export const MULTI_ACCOUNT_ONE_TIME_PAYMENT_CB_REVIEW_MOP_PAGE_PROTOTYPE =
  "/ui/v8/payments/business/multi-acct-make-payment.html?protoversion=review";
export const MULTI_ACCOUNT_ONE_TIME_PAYMENT_CB_CONFIRM_MOP_PAGE_PROTOTYPE =
  "/ui/v8/payments/business/multi-acct-make-payment.html?protoversion=confirm";

/* API call urls for Future payments */
export const FUTURE_PAYMENT_SETUP_URL = "/payments/future-payment-setup.rest";
export const FUTURE_PAYMENT_REVIEW_URL = "/payments/future-payment-review.rest";
export const FUTURE_PAYMENT_CONFIRM_URL =
  "/payments/future-payment-confirm.rest";
export const FUTURE_PAYMENT_BACKBUTTON_URL =
  "/payments/future-payment-back.rest";

export const FUTURE_PAYMENT_BACKBUTTON_DONE =
  "/payments/future-payment-done.rest";

/* API call urls for CB Future payments */
export const FUTURE_PAYMENT_CB_REVIEW_URL =
  "/payments/business/future-payment-review.rest";
export const FUTURE_PAYMENT_CB_CONFIRM_URL =
  "/payments/business/future-payment-confirm.rest";
export const FUTURE_PAYMENT_CB_BACKBUTTON_URL =
  "/payments/business/future-payment-back.rest";

/* Multi Account urls */
export const MULTI_ACCOUNT_CB_REVIEW_POST_URL =
  "/payments/business/multi-acc-review.rest";
export const MULTI_ACCOUNT_CB_CONFIRM_POST_URL =
  "/payments/business/multi-acc-confirm.rest";
