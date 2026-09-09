import Banner, { BannerType, BannerVariation } from "@cox/core-ui8/dist/Banner";

// Renders via the core-ui8 Banner, matching ui-mybill-v8's notification alert
// (PRIMARY variation + circle-info icon) and the sibling alerts (Error/Warning/
// Success). Like those, the message is passed straight to the Banner — core-ui8
// renders it through RichText and handles sanitization, so no app-side DOMPurify.
const InfoAlert = ({ message, id }: any = {}) => {
    return (
        <div className="custom-alert-container col-12 mb-2">
            <Banner
                id={`${id}-notification`}
                bannerType={BannerType.DYNAMIC}
                altIcon="circle-info-deep-sky-line"
                iconPath="/content/dam/cox/common/icons/ui_components/circle-info-deep-sky-line.svg"
                variation={BannerVariation.PRIMARY}
                message={message}
                data-automation-id={id}
            />
        </div>
    );
};

export default InfoAlert;
