// "Cox is now Spectrum" rebrand.
// When cox.com.payments.header-spectrum-logo.enabled is ON, the minimal header logo
// is fetched from the centrally-managed AEM source so it can be updated without a
// Payments UI release.
const AEM_BASE =
    "https://webcdn.cox.com/content/dam/cox/residential/dynamic-media/spectrum/cox-spectrum-logo-lockup";

const SPECTRUM_LOGOS = {
    residential: {
        aemUrl: `${AEM_BASE}/Resi_CoxSpectrum_Transition_Horizontal_Fullcolor.svg`,
        alt: "Cox is now Spectrum",
        className: "cox-spectrum-logo",
    },
    business: {
        aemUrl: `${AEM_BASE}/CoxSpectrum_Transition_Horizontal_FullColor.svg`,
        alt: "Cox Business is now Spectrum",
        className: "cox-cb-spectrum-logo", // renders at height: 31px
    },
};

interface MinimalHeaderProps {
    customerType: string;
    sections?: any;
    // cox.com.payments.header-spectrum-logo.enabled, surfaced by the backend through the
    // same channel as displayHeader/displayCbHeader. Defaults to false so the header stays
    // BAU when the flag is absent.
    spectrumLogoEnabled?: boolean;
}

const MinimalHeader: React.FC<MinimalHeaderProps> = ({ customerType, spectrumLogoEnabled }) => {
    const renderLogo = () => {
        // Flag OFF (or absent): keep the existing CSS-background Cox logo. No change.
        if (!spectrumLogoEnabled) {
            return (
                <div className={`cox-logo ${customerType === "business" ? "cox-cb-logo" : ""}`}></div>
            );
        }

        // Flag ON: render the "Cox is now Spectrum" logo from AEM.
        const logo =
            customerType === "business" ? SPECTRUM_LOGOS.business : SPECTRUM_LOGOS.residential;
        return (
            <img
                className={logo.className}
                src={logo.aemUrl}
                alt={logo.alt}
            />
        );
    };

    return (
        <header>
            <div className="cox-header-wraper">
                {renderLogo()}
            </div>
            <div className={`${customerType === "business" ? "cox-cb-hr" : "cox-hr"}${spectrumLogoEnabled ? " spectrum" : ""}`}></div>
        </header>
    )
};

export default MinimalHeader;
