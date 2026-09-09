import { useEffect } from "react";
import { Modal } from "@cox/core-ui8";
import { Spinner } from "@cox/core-ui8/dist/Spinner";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.scss";
import "@cox/core-ui8/dist/index.css";
import "@cox/ui-tokens/tokens/residential";
import "@cox/ui-tokens/tokens/business";

export default {
    title: "Payments/TrustlyLoading",
};

// The Trustly loading modal body after migration to the UI8 Spinner (color="gradient").
// Both brands render the same markup; the gradient colours are token-driven by the
// .cox-resi / .cox-busi theme class on an ancestor (set on <html> at runtime by
// AppRoutes) — residential is blue → green, business is blue → navy, matching the
// minimal header/footer gradients.
const TrustlyLoadingModal = ({ brand }: { brand: "cox-resi" | "cox-busi" }) => {
    useEffect(() => {
        const html = document.documentElement;
        const previous = html.className;
        html.className = brand;
        return () => {
            html.className = previous;
        };
    }, [brand]);

    return (
        <Modal
            title="Connecting your bank account"
            description=""
            isParsed={false}
            show={true}
            showFooter={false}
            modalId="trustly-loading-modal"
        >
            <div className="trustly-loading-text">
                <h2>We are connecting your bank account.</h2>
                <h2>This could take up to a minute.</h2>
                <p>Please be patient while we connect your bank account.</p>
                <Spinner size="xl" color="gradient" />
            </div>
        </Modal>
    );
};

// Residential — blue → green gradient
export const Residential = () => <TrustlyLoadingModal brand="cox-resi" />;

// Business — blue → navy gradient (same colours as the minimal header/footer)
export const Business = () => <TrustlyLoadingModal brand="cox-busi" />;
