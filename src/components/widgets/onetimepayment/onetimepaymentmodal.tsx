import { Button, Modal} from "@cox/core-ui8";
import OneTimePaymentModalBody from "./onetimepaymentmodalbody";

interface OneTimePaymentModalProps {
  oneTimePaymentHeader: string;
  oneTimePaymentData: string;
  show: boolean;
  onHide: () => void;
  url: string;
  modalId: string;
}

const OneTimePaymentModal: React.FC<OneTimePaymentModalProps> = ({
  oneTimePaymentHeader,
  oneTimePaymentData,
  show,
  onHide,
  modalId,
  url,
}) => {
  return (
    <Modal
      componentName="modal-one-time-payment"
      description={oneTimePaymentData}
      modalType="withoutImage"
      show={show}
      handleClose={onHide}
      showFooter={true}
      primaryBtnText="Close"
      primaryBtnClick={onHide}
      title={oneTimePaymentHeader}
      modalId="one-time-payment-terms-modal"
    />

    // <Modal
    //   show={show}
    //   onHide={onHide}
    //   className="modal modal-lg modal-dialog-centered"
    //   id="one-time-payment-terms-modal"
    //   tabIndex={-1}
    //   role="dialog"
    //   aria-labelledby="one-time-payment-terms-modal"
    //   data-backdrop="static"
    //   aria-hidden="true"
    // >
    //   <Modal.Header>
    //     <Modal.Title
    //       className="modal-title"
    //       data-automation-id="otp-terms-modal-title"
    //     >
    //       {oneTimePaymentHeader}
    //     </Modal.Title>
    //     <Button variant="close" onClick={onHide} aria-label="close"></Button>
    //   </Modal.Header>
    //   <Modal.Body>
    //     <OneTimePaymentModalBody oneTimePaymentData={oneTimePaymentData} />
    //   </Modal.Body>
    //   <Modal.Footer className="modal-footer justify-content-right border-0">
    //     <a
    //       onClick={onHide}
    //       id="closing"
    //       className="btn-primary"
    //       tabIndex={-1}
    //       data-automation-id="otp-terms-modal-close"
    //       data-dismiss="modal"
    //     >
    //       Close
    //     </a>
    //   </Modal.Footer>
    // </Modal>
  );
};

export default OneTimePaymentModal;
