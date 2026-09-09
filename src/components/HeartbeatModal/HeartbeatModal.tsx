import { Modal } from '@cox/core-ui8';
import { useEffect, useRef, useState } from 'react';
import { checkProtoVersionEnabled, redirectToPage } from '../../utils/helper-utlities';

const TOTAL_SESSION_TIME = 30 * 60; // 30 minutes
const MODAL_APPEAR_TIME = 20 * 60;  // 20 minutes

interface HeartBeatModalProps {
    sections?: any;
}

const HeartbeatModal: React.FC<HeartBeatModalProps> =  ({sections}) => {
    const { payment = {} } = sections;
    const [timeLeft, setTimeLeft] = useState(TOTAL_SESSION_TIME);
    const [showModal, setShowModal] = useState(false);
    const intervalRef = useRef<number | null>(null);
    const lastActiveRef = useRef<number>(Date.now());

    // Updates the timer based on actual elapsed time
    const updateTimeLeft = () => {
        const now = Date.now();
        const elapsed = Math.floor((now - lastActiveRef.current) / 1000);
        const newTimeLeft = Math.max(0, timeLeft - elapsed);
        setTimeLeft(newTimeLeft);
        lastActiveRef.current = now;
    };

    useEffect(() => {
        if (checkProtoVersionEnabled()) {
            if (window.location.search.includes("show-inactivity-modal")) {
                setShowModal(true);
                // Optionally customize timeLeft
                // setTimeLeft(30);
            }
        }
    }, []);

    useEffect(() => {
        if (document.visibilityState === 'visible') {
            lastActiveRef.current = Date.now();
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                updateTimeLeft(); // Catch up on time lost
                startTimer();
            } else {
                stopTimer();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        startTimer(); // Start when mounted

        return () => {
            stopTimer();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
        // eslint-disable-next-line
    }, [timeLeft]);

    const startTimer = () => {
        if (intervalRef.current === null) {
            lastActiveRef.current = Date.now();
            intervalRef.current = window.setInterval(() => {
                updateTimeLeft();
            }, 1000);
        }
    };

    const stopTimer = () => {
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        const domain = (payment?.navigateTo && payment?.customerType === "business" && payment?.navigateTo.startsWith("https://")) ? new URL(payment.navigateTo).origin : null;
        if (timeLeft <= 0) {
            setShowModal(false);
            (payment?.customerType === "business" && domain) ? redirectToPage(`${domain}/cbma/unauth/logout`) : redirectToPage(`https://${window.location.hostname}/authres/logout`);
        } else if (timeLeft <= TOTAL_SESSION_TIME - MODAL_APPEAR_TIME) {
            setShowModal(true);
        }
    }, [timeLeft]);

    useEffect(() => {
        const resetTimer = () => {
            setTimeLeft(TOTAL_SESSION_TIME);
            setShowModal(false);
            lastActiveRef.current = Date.now();
        };

        window.addEventListener("click", resetTimer);
        return () => window.removeEventListener("click", resetTimer);
    }, []);

    return (
        <Modal
            description=""
            modalType="custom"
            primaryBtnText="OK"
            show={showModal}
            showFooter
            title="Timeout warning"
            handleClose={() => true}
            primaryBtnClick={() => {
                setShowModal(false);
                setTimeLeft(TOTAL_SESSION_TIME);
                lastActiveRef.current = Date.now();
            }}
            modalId="heartbeat"
        >
            <p>Your application will time out soon.</p>
            <p>
                For your safety and protection, your online session will be timed out if
                there is no additional activity. You will be redirected to the login
                screen.
            </p>
            <p>
                If you are still working in your online session, simply click OK to
                continue.
            </p>
        </Modal>
    );
};

export default HeartbeatModal;