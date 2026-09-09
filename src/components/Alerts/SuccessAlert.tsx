import Banner, { BannerType, BannerVariation } from '@cox/core-ui8/dist/Banner';
const SuccessAlert = ({ message, id }: any = {}) => {
    return (
        <div className="custom-alert-container col-12 mb-2">
            <Banner
                altIcon="circle-check-lime-green"
                bannerType={BannerType.DYNAMIC}
                iconPath="/content/dam/cox/common/icons/ui_components/circle-check-lime-green.svg"
                message={message}
                variation={BannerVariation.SUCCESS}
                data-automation-id={id}
            />
        </div>
    )
}

export default SuccessAlert