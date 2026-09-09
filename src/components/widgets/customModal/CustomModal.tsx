import { Modal } from "@cox/core-ui8";
interface ModalProps {
  header: string;
  data: string;
  isParsed: boolean;
  show: boolean;
  onHide: () => void;
  url: string;
  modalId: string;
}

const CustomModal: React.FC<ModalProps> = ({ header, data, isParsed, show, onHide, url, modalId }) => {
  return (
    <>
      <Modal
        componentName="modal-one-time-payment"
        description={data}
        isParsed={isParsed}
        modalType="withoutImage"
        show={show}
        handleClose={onHide}
        showFooter={true}
        primaryBtnText="Close"
        primaryBtnClick={onHide}
        title={header}
        modalId={modalId}
      />
    </>
  )
}

export default CustomModal
