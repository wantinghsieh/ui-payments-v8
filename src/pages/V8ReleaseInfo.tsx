import React, { useEffect } from 'react'

/**
 * V8ReleaseInfo Component
 *
 * Renders the v8-release.html content as plain text from window.__BUILD_INFO__
 * This component is accessed via the /v8-release.html route
 */
const V8ReleaseInfo: React.FC = () => {
    const buildInfo = (window as any).__BUILD_INFO__ || {}

    useEffect(() => {
        document.title = 'v8-release.txt'
    }, [])

    // Format the content to match the original script format, now including appName
    const textContent = `App-Name: ${buildInfo.appName || 'N/A'}
                         Build-Date: ${buildInfo.buildDate || 'N/A'}
                         Release-Tag: ${buildInfo.releaseTag || 'unknown'}
                         UI8-Base-Tag: ${buildInfo.ui8BaseTag || 'N/A'}`

    return (
        <div style={{
            fontFamily: 'monospace',
            backgroundColor: '#f8f9fa',
            padding: '16px 32px',
            textAlign: 'left'
        }}>
            <p>App-Name: {buildInfo.appName || 'N/A'}</p>
            <p>Build-Date: {buildInfo.buildDate || 'N/A'}</p>
            <p>Release-Tag: {buildInfo.releaseTag || 'unknown'}</p>
            <p>UI8-Base-Tag: {buildInfo.ui8BaseTag || 'N/A'}</p>
        </div>
    )
}

export default V8ReleaseInfo