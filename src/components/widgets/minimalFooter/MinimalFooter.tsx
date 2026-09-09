interface MinimalFooterProps {
    customerType: string;
    // When true, the footer transition bar uses the Spectrum brand gradient
    // (see globals.scss .cox-footer.spectrum / .cox-cb-footer.spectrum).
    spectrumLogoEnabled?: boolean;
}

const MinimalFooter: React.FC<MinimalFooterProps> = ({ customerType, spectrumLogoEnabled }) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer>
            <div className={`${customerType === "business" ? "cox-cb-footer" : "cox-footer"}${spectrumLogoEnabled ? " spectrum" : ""}`}>
                <div className="cox-hr"></div>
                <div className="footer-footer custom-footer">
                    <p className="copyright-note">
                        © 1998 -{" "}
                        <span id="currYear">{currentYear}</span> Cox Communications
                    </p>
                    {customerType !== "business" &&
                        <p>
                            <a className="langLink" href="https://espanol.cox.com/"
                                data-href="https://espanol.cox.com/" data-lang="es"
                                data-di-id="di-id-6c9418dc-d7e91e43">
                                Español
                            </a>
                        </p>
                    }
                </div>
            </div>
        </footer>
    )
};

export default MinimalFooter;
