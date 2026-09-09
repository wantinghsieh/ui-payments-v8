import { useCallback, useState } from "react";
import { useAxios } from "@cox/core-ui8";
import { isPrototypeUrl } from "../utils/helper-utlities";
import {
  getPrototypeStepUrl,
  PaymentRequestConfig,
} from "../services/paymentsService";
import { PaymentData, PaymentFlowName, PaymentStep } from "../types/payment";

const GENERIC_ERROR = "Something went wrong. Please try again later.";

interface UsePaymentStepSubmitArgs {
  flow: PaymentFlowName;
  /** Called with the next-step payload on a successful (error-free) response. */
  onSuccess: (data: PaymentData) => void;
}

/**
 * Encapsulates a single forward step transition (setup → review → confirm) shared
 * by the payment templates:
 *  - Prototype: hard-redirect to the step's protoversion URL.
 *  - Production: POST the request via the CSRF-aware useAxios transport, then route
 *    the response to `onSuccess` or surface server / network errors.
 *
 * Owns `isSubmitting` and `errorMessages` so templates don't re-implement the
 * submit/response/scroll/spinner boilerplate. `setErrorMessages` is exposed for
 * callers that surface errors from other sources (e.g. add-card responses).
 */
export function usePaymentStepSubmit({
  flow,
  onSuccess,
}: UsePaymentStepSubmitArgs) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const handleResponse = (data: PaymentData) => {
    if (data?.pageName !== "error" && (data?.errorMessages?.length ?? 0) > 0) {
      setErrorMessages(data.errorMessages!);
    } else {
      onSuccess(data);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { axiosAPI } = useAxios({
    autoFetch: false,
    onCompleted: (data: any) => handleResponse(data),
    onError: () => {
      setErrorMessages([GENERIC_ERROR]);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  });

  const submit = useCallback(
    async (prototypeStep: PaymentStep, request: PaymentRequestConfig) => {
      if (isSubmitting) return;

      if (isPrototypeUrl()) {
        const nextUrl = getPrototypeStepUrl(flow, prototypeStep);
        // Only enter the submitting state when we can actually navigate,
        // otherwise the spinner would hang with no transition.
        if (nextUrl) {
          setIsSubmitting(true);
          window.location.href = nextUrl;
        }
        return;
      }

      setIsSubmitting(true);
      // useAxios resolves internally and reports failures via onError; the
      // finally guarantees the spinner clears on the (rare) throw path too.
      try {
        await axiosAPI(request);
      } finally {
        setIsSubmitting(false);
      }
    },
    [axiosAPI, flow, isSubmitting],
  );

  return { isSubmitting, errorMessages, setErrorMessages, submit };
}
