import React, { useEffect } from "react";
import supportIcon from "../../../assets/business/images/support.svg";
import supportIconActive from "../../../assets/business/images/support_active.svg";
import { Overlay, Popover } from "react-bootstrap";

interface MegaMenuProps {
    menuItems?: any;
}

const Support: React.FC<MegaMenuProps> = ({ menuItems }) => {
    const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);
    const [showSupportMenu, setShowSupportMenu] = React.useState(false);
    const isMobileDevice = window.innerWidth <= 767;
    const supportOptions = menuItems?.supportOptions ? [...menuItems.supportOptions].reverse() : [];
    const [showMainMenuPopover, setShowMainMenuPopover] = React.useState(false);
    const [mainMenuTarget, setMainMenuTarget] = React.useState<HTMLElement | null>(null);
    const [isMainMenuReady, setIsMainMenuReady] = React.useState(false);
    const mainMenuTimerRef = React.useRef<number | null>(null);
    const mainMenuDelay = 150;

    useEffect(() => {
        document.addEventListener('click', handleClickOutside, true);
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, []);

    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const supportMenu = document.getElementById('support-menu');
        const supportMenuPopover = document.querySelector('.supportPopover');
        if (supportMenu && supportMenuPopover) {
            if (
                !supportMenu.contains(target) &&
                !supportMenuPopover.contains(target)
            ) {
                setIsCollapsed(false);
                setShowSupportMenu(false);
            }
        }
    };

    const navigateOnClick = (
        path: string,
        openInNewWindow: boolean,
        name?: string
    ) => {
        if (!path) return;

        const featureName = name
            ? name.split('_').join('').toLowerCase()
            : '';

        //closeSideBar();
        setIsCollapsed(false);
        setShowSupportMenu(false);

        // Absolute URLs
        if (path.startsWith('https') || path.startsWith('http')) {
            openInNewWindow
                ? window.open(path, '_blank')
                : (window.location.href = path);
            return;
        }

        // Relative path, open in new window
        if (openInNewWindow) {
            const url = `${window.location.origin}/cbma${path}`;
            window.open(url, '_blank');
            return;
        }

        onSupportClick('close');
        //closeSideBar();
    };



    // Accessibility - close the menu when focus comes out of the list
    const outOfSupportMenu = (event: React.KeyboardEvent<HTMLElement>, elementId: string) => {
        if (elementId === 'HELP_AND_SUPPORT') {
            if (event.key === 'Tab' && !event.shiftKey) {
                setIsCollapsed(false);
                setShowSupportMenu(false);
            }
        }
    };

    const onSupportClick = (value?: string) => {
        setIsCollapsed(!isCollapsed);
        setShowSupportMenu(!showSupportMenu);
        if (value === 'close') {
            setIsCollapsed(false);
            setShowSupportMenu(false);
        }
    };

    const handleMainMenuMouseEnter = (
        e: React.MouseEvent<HTMLElement>
    ) => {
        if (showSupportMenu) return;

        const target = e.currentTarget;

        mainMenuTimerRef.current = window.setTimeout(() => {
            setMainMenuTarget(target);
            setShowMainMenuPopover(true);
            setIsMainMenuReady(false);
        }, mainMenuDelay);
    };

    const handleMainMenuMouseLeave = () => {
        if (mainMenuTimerRef.current) {
            clearTimeout(mainMenuTimerRef.current);
        }

        setShowMainMenuPopover(false);
        setMainMenuTarget(null);
        setIsMainMenuReady(false);
    };

    const handleKeyDown = (e: any) => {
        if (e.key === "Enter") {
            onSupportClick();
        }
    };

    return (
        <section>           
            {!isMobileDevice && <div
                id="support-menu"
                role="button"
                tabIndex={0}
                aria-label={`Get Support`}
                onClick={() => onSupportClick('')}
                onMouseEnter={handleMainMenuMouseEnter}
                onMouseLeave={handleMainMenuMouseLeave}
                onKeyDown={handleKeyDown}
                className="div-focus-visible"
            >
                <div className={`popover-img-box ${isCollapsed ? 'gray-bg-std ' : ''}`}>
                    <div role="application" aria-label={`Get Support ${isCollapsed ? 'expanded' : 'collapsed'}`}>
                        <div role="presentation">
                            <div>
                                <img src={!isCollapsed ? supportIcon : supportIconActive} alt="Support icon" role="presentation" />
                            </div>
                        </div>

                    </div>
                </div>
            </div>}

            {!isMobileDevice && mainMenuTarget && !showSupportMenu && (
                <Overlay
                    show={showMainMenuPopover}
                    target={mainMenuTarget}
                    placement="bottom"
                    popperConfig={{
                    strategy: 'fixed',
                    modifiers: [
                        {
                        name: 'offset',
                        options: { offset: [0, 8] },
                        },
                    ],
                    }}
                >
                    {(props) => {
                    const isPositioned = Boolean(
                        props['data-popper-placement'] && props.style?.transform
                    );

                    if (isPositioned && !isMainMenuReady) {
                        setIsMainMenuReady(true);
                    }

                    return (
                        <Popover
                        {...props}
                        className={`mainMenuPopover ${
                            isPositioned ? 'ready' : ''
                        }`}
                        >
                        <Popover.Body className="px-3 py-1 text-center popover-body">
                            Get Support
                        </Popover.Body>
                        </Popover>
                    );
                    }}
                </Overlay>
            )}

            {(showSupportMenu || isMobileDevice) && (
                <div className={`${!isMobileDevice ? 'supportPopover' : ''}`}>
                    <div className="margin-top-10px">
                        <div
                            className={`${!isMobileDevice ? 'supportIconBody' : 'mobile-view'}`}
                            aria-hidden="true"
                        >

                            <ul>
                                {supportOptions?.map((item: any) => {
                                    const shouldRender =
                                        item?.name &&
                                        item?.enabled;

                                    if (!shouldRender) return null;

                                    return (
                                        <li
                                            key={item.name}
                                            className={`p-1 text-font-16 lh-22 font-cerapro-regular font-weight-5`}
                                            onKeyDown={(e) =>
                                                outOfSupportMenu(e, item.name)
                                            }
                                        >
                                            <a
                                                href="#"
                                                className="ml-3 d-block"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigateOnClick(
                                                        item.url,
                                                        item.openInNewWindow,
                                                        item.name
                                                    );
                                                }}
                                            >
                                                {item.displayName}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <div id="closeMsgs" className="sr-only" aria-live="polite"></div>

        </section>
    )
};

export default Support;
