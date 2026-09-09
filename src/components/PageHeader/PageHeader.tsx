import React from 'react'
interface PageHeaderProps {
    id?: string;
    primaryHeader: string;
    secondaryHeader?: string;
}

const PageHeader = ({ id, primaryHeader, secondaryHeader }: PageHeaderProps) => {
    return (
        <>
            <div id="page-header" className="autoreg_content">
                <div className="header-content">
                    <h1 data-automation-id={`${id}-header`} className={`${id}-header primary-header`} id={`${id}-header`}>{primaryHeader}</h1>
                    {secondaryHeader &&
                        <h3 data-automation-id={`${id}-subheader`} className={`${id}-subheader secondary-header`} id={`${id}-subheader`}>{secondaryHeader}</h3>
                    }
                </div>
            </div>
        </>
    )
}

export default PageHeader