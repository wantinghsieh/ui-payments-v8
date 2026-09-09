import Banner, { BannerType, BannerVariation } from '@cox/core-ui8/dist/Banner';
const WarningAlert = ({ message, id }: any = {}) => {
    return (
        <div className="custom-alert-container col-12 mb-2">
            <Banner
                altIcon="circle-exclamation-pure-orange"
                bannerType={BannerType.DYNAMIC}
                iconPath="/content/dam/cox/common/icons/ui_components/circle-exclamation-pure-orange.svg"
                message={message}
                variation={BannerVariation.WARNING}
                data-automation-id={id}
            />
        </div>
    )
}

export default WarningAlert