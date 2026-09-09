import { ButtonStates, LinkTypes } from "@cox/core-ui8"
import Banner, { BannerType, BannerVariation } from "@cox/core-ui8/dist/Banner"
// `linkText`/`linkUrl` are optional: when the server pairs a call to action with
// the message (e.g. "Contact us" on a failed payment), the Banner renders it as
// a chat entry point, matching the other confirmation views. Note the link only
// shows on pages where chat is enabled.
const ErrorAlert = ({ message, id, linkText, linkUrl }: any) => {
    return (
        <div className="custom-alert-container col-12 mb-2">
            <Banner
                altIcon="circle-exclamation-moderate-red"
                bannerType={BannerType.DYNAMIC}
                iconPath="/content/dam/cox/common/icons/ui_components/circle-exclamation-moderate-red.svg"
                message={message}
                variation={BannerVariation.ERROR}
                data-automation-id={id}
                {...(linkText && {
                    buttonStates: ButtonStates.ACTIVE,
                    linkType: LinkTypes.CHAT,
                    linkText,
                    linkUrl,
                })}
            />
        </div>
    )
}

export default ErrorAlert
