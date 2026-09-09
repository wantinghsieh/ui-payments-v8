import { useState } from "react";
import DOMPurify from "dompurify";
import warningIcon from "../../assets/icons/circle-exclamation-warning.svg";
const STATEMENTS_LIMIT = 5;

const formatMessage = (message: string, showAll: boolean): string => {
    const [mainMessage, ...statements] = message.split('<br/>').filter(Boolean);
    if (!statements.length) return message;
    const visible = showAll ? statements : statements.slice(0, STATEMENTS_LIMIT);
    const bullets = visible.map((s) => `• <span style="padding-left:30px">${s}</span>`).join('<br/>');
    return `${mainMessage}<br/>${bullets}`;
};

const getStatementCount = (message: string): number => {
    return message.split('<br/>').filter(Boolean).length - 1;
};

const WarningAlertWithViewMore = ({ message, id }: any = {}) => {
    const [showAll, setShowAll] = useState(false);
    const statementCount = getStatementCount(message);
    const hasMoreStatements = statementCount > STATEMENTS_LIMIT;
    const sanitizedHtml = DOMPurify.sanitize(formatMessage(message, showAll), { ADD_ATTR: ["target", "rel"] });

    return (
        <div className="custom-alert-container col-12 mb-2">
            <div className="banner-container" id={`${id}-warning`}>
                <div className="dynamic-banner">
                    <div className="banner-container warning">
                        <div className="banner-container__body">
                            <img src={warningIcon} className="all-variations-banner-icon warning-banner-icon" alt="warning icon" />
                            <div className="banner-content-container warning-content-container">
                                <div className="banner-content">
                                    <div className="word-wrap rte">
                                        <span dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
                                    </div>
                                    {hasMoreStatements && (
                                        <div className="mt-2 viewAll">
                                            <span style={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setShowAll(!showAll)}>
                                                {showAll ? 'View less' : 'View all'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarningAlertWithViewMore;
