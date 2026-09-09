import React, { useEffect } from "react";
import ProfileIcon from "../../../assets/business/images/profile.svg";
import ArrowDown from "../../../assets/business/images/arrow_down.svg";
import ArrowUp from "../../../assets/business/images/arrow_up.svg";
import { Overlay, Popover } from "react-bootstrap";

interface MegaMenuProps {
    menuItems?: any;
    onCollapseChange?: any;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ menuItems, onCollapseChange }) => {
    const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);
    const [showMainMenu, setShowMainMenu] = React.useState(false);
    const isMobileDevice = window.innerWidth <= 767;
    const [showMainMenuPopover, setShowMainMenuPopover] = React.useState(false);
    const [mainMenuTarget, setMainMenuTarget] = React.useState<HTMLElement | null>(null);
    const [isMainMenuReady, setIsMainMenuReady] = React.useState(false);
    const mainMenuTimerRef = React.useRef<number | null>(null);
    const mainMenuDelay = 150;

    const darkBackgroundArr = [
        'COPYRIGHT_INFRINGEMENT',
        'PRODUCT_ADMINISTRATION',
        'LOG_IN_AS',
        'LOGOUT',
    ];

    useEffect(() => {
        document.addEventListener('click', handleClickOutside, true);
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, []);

    useEffect(() => {
        if (onCollapseChange) {
            onCollapseChange(isCollapsed);
        }
    }, [isCollapsed, onCollapseChange]);

    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const mainMenu = document.getElementById('main-menu');
        const megaMenuPopover = document.querySelector('.mainMenuLinkPopover');
        if (mainMenu && megaMenuPopover) {
            if (
                !mainMenu.contains(target) &&
                !megaMenuPopover.contains(target)
            ) {
                setIsCollapsed(false);
                setShowMainMenu(false);
            }
        }
    };

    // On click of list item navigate to respective path
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
        setShowMainMenu(false);

        // Absolute URLs
        if (path.startsWith('https') || path.startsWith('http')) {
            openInNewWindow
                ? window.open(path, '_blank')
                : window.location.replace(path);
            return;
        }

        // Relative path, open in new window
        if (openInNewWindow) {
            const url = `${window.location.origin}/cbma${path}`;
            window.open(url, '_blank');
            return;
        }

        onMegaMenuClick('close');
        //closeSideBar();
    };



    // Accessibility - close the menu when focus comes out of the list
    const outOfMegaMenu = (event: React.KeyboardEvent<HTMLElement>, elementId: string) => {
        if (elementId === 'LOGOUT') {
            if (event.key === 'Tab' && !event.shiftKey) {
                setIsCollapsed(false);
                setShowMainMenu(false);
            }
        }
    };

    const onMegaMenuClick = (value?: string) => {
        setIsCollapsed(!isCollapsed);
        setShowMainMenu(!showMainMenu);
        if (value === 'close') {
            setIsCollapsed(false);
            setShowMainMenu(false);
        }
    };

    const truncate = (
        value?: string,
        length: number = 10,
        suffix: string = '...'
    ) => {
        if (!value) return '';
        return value.length > length
            ? value.substring(0, length) + suffix
            : value;
    };

    const handleMainMenuMouseEnter = (
        e: React.MouseEvent<HTMLElement>
    ) => {
        if (showMainMenu) return;

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
            onMegaMenuClick();
        }
    };

    return (
        <section>
            {!isMobileDevice && <div
                id="main-menu"
                role="button"
                tabIndex={0}
                aria-label={`Hi, ${menuItems?.firstName} More Menu expanded`}
                className=" div-focus-visible"
                onClick={() => onMegaMenuClick('')}
                onMouseEnter={handleMainMenuMouseEnter}
                onMouseLeave={handleMainMenuMouseLeave}
                onKeyDown={handleKeyDown}
            >
                <div className="pad-left-p-20 main-menu-padding pt-0">
                        <div>
                            <img
                                src={ProfileIcon}
                                alt=""
                                role="presentation"
                                className="mb-2 pr-2"
                            />

                            <span className="font-size-p-14 font-weight-5 line-height-18 black">
                                Hi, {truncate(menuItems?.firstName, 10, '...')}
                            </span>
                            <div className="display-inline">
                                <img src={!isCollapsed ? ArrowDown : ArrowUp} alt="" className="mb-2 pl-1 mt-1 mr-2" role="presentation" />
                            </div>
                    </div>
                </div>
            </div>}

            {!isMobileDevice && mainMenuTarget && !showMainMenu && (
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
                            Main Menu
                        </Popover.Body>
                        </Popover>
                    );
                    }}
                </Overlay>
            )}

            {(showMainMenu || isMobileDevice) && (
                <div className={`${!isMobileDevice ? 'mainMenuLinkPopover' : ''}`}>
                    <div className="margin-top-10px">
                        <div
                            className={`${!isMobileDevice ? 'collection-of-items' : 'mobile-view'}`}
                            aria-hidden="true"
                        >
                            <ul>
                                {menuItems?.headerOptions?.map((item: any) => {
                                    const shouldRender =
                                        item?.name &&
                                        item?.enabled;

                                    if (!shouldRender) return null;

                                    return (
                                        <li
                                            key={item.name}
                                            className={`p-1 text-font-16 lh-22 font-cerapro-regular font-weight-5 ${darkBackgroundArr.includes(item.name)
                                                ? 'listDarkBackground'
                                                : ''
                                                } ${isMobileDevice ? 'width-100' : ''}`}
                                            onKeyDown={(e) =>
                                                outOfMegaMenu(e, item.name)
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

export default MegaMenu;
