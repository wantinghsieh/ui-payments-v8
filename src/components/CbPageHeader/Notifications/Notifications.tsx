import React, { useEffect } from "react";
import NotificationIcon from "../../../assets/business/images/notification.svg";
import NotificationIconActive from "../../../assets/business/images/notification_active.svg";
import { Overlay, Popover } from "react-bootstrap";

interface MegaMenuProps {
    menuItems?: any;
}

const Notifications: React.FC<MegaMenuProps> = ({ menuItems }) => {
    const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);
    const [showNotificationMenu, setShowNotificationMenu] = React.useState(false);
    const isMobileDevice = window.innerWidth <= 767;
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
        const notificationMenu = document.getElementById('notification-menu');
        const notificationMenuPopover = document.querySelector('.notificationPopover');
        if (notificationMenu && notificationMenuPopover) {
            if (
                !notificationMenu.contains(target) &&
                !notificationMenuPopover.contains(target)
            ) {
                setIsCollapsed(false);
                setShowNotificationMenu(false);
            }
        }
    };

    const navigateOnClick = (
        path: string,
        openInNewWindow: boolean,
        name?: string
    ) => {
        if (!path) return;
        //closeSideBar();
        setIsCollapsed(false);
        setShowNotificationMenu(false);

        // Absolute URLs
        if (path.startsWith('https') || path.startsWith('http')) {
            openInNewWindow
                ? window.open(path, '_blank')
                : (window.location.href = path);
            return;
        }

        onNotificationClick('close');
        //closeSideBar();
    };

    // Accessibility - close the menu when focus comes out of the list
    const outOfNotification = (event: React.KeyboardEvent<HTMLElement>, elementId: string) => {
        if (elementId === 'View_Messages') {
            if (event.key === 'Tab' && !event.shiftKey) {
                setIsCollapsed(false);
                setShowNotificationMenu(false);
            }
        }
    };

    const onNotificationClick = (value?: string) => {
        setIsCollapsed(!isCollapsed);
        setShowNotificationMenu(!showNotificationMenu);
        if (value === 'close') {
            setIsCollapsed(false);
            setShowNotificationMenu(false);
        }
    };

    const handleMainMenuMouseEnter = (
        e: React.MouseEvent<HTMLElement>
    ) => {
        if (showNotificationMenu) return;

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
            onNotificationClick();
        }
    };

    return (
        <section>
            
            {!isMobileDevice && <div
                id="notification-menu"
                role="button"
                tabIndex={0}
                aria-label={`Notifications`}
                onClick={() => onNotificationClick('')}
                onMouseEnter={handleMainMenuMouseEnter}
                onMouseLeave={handleMainMenuMouseLeave}
                onKeyDown={handleKeyDown}
                className="div-focus-visible"
            >
                <div id="notification-popover" className={`popover-img-box ${isCollapsed ? 'gray-bg-std ' : ''}`}>
                                    <div role="application" aria-label={`Notifications ${isCollapsed ? 'expanded' : 'collapsed'}`}>
                                        <div  role="presentation">
                                            <div>
                                                <img src={!isCollapsed ? NotificationIcon : NotificationIconActive} alt="Support icon" role="presentation" />
                                            </div>
                                        </div>
                                        
                                    </div>
                                </div>
            </div>}

            {!isMobileDevice && mainMenuTarget && !showNotificationMenu && (
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
                            Notifications
                        </Popover.Body>
                        </Popover>
                    );
                    }}
                </Overlay>
            )}

            {(showNotificationMenu || isMobileDevice) && (
                <div className={`${!isMobileDevice ? 'notificationPopover' : ''}`}>
                    <div className="margin-top-10px">
                        <div
                            className={`${!isMobileDevice ? 'notificationIconBody' : 'mobile-view'}`}
                            aria-hidden="true"
                        >
                            
                            {menuItems?.notificationOption?.name &&
                                menuItems?.notificationOption?.enabled && <ul>

                                    <li
                                        key={menuItems?.notificationOption.name}
                                        className={`p-1 text-font-16 lh-22 font-cerapro-regular font-weight-5`}
                                        onKeyDown={(e) =>
                                            outOfNotification(e, menuItems?.notificationOption.name)
                                        }
                                    >
                                        <a
                                            href="#"
                                            className="ml-3 d-block"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigateOnClick(
                                                    menuItems?.notificationOption.url,
                                                    menuItems?.notificationOption.openInNewWindow,
                                                    menuItems?.notificationOption.name
                                                );
                                            }}
                                        >
                                            {menuItems?.notificationOption.displayName}
                                        </a>
                                    </li>


                                </ul>
                            }
                        </div>
                    </div>
                </div>
            )}

            <div id="closeMsgs" className="sr-only" aria-live="polite"></div>

        </section>
    )
};

export default Notifications;
