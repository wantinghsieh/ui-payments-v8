import React, { useEffect, useState } from "react";
interface BlurCbBackgroundProps {
    sections?: any;
}

const BlurCbBackground: React.FC<BlurCbBackgroundProps> = ({ sections }) => {
    const { payment = {} } = sections;
    const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

    useEffect(() => {

        const onWindowEvent = (event: any) => {
            if (event.type === "keydown" && event.key !== "Enter") return;

            const target = event.target;
            if (!(target instanceof HTMLElement)) return;

            const hasClass = (cls: any) => target.classList.contains(cls);

            const isSearchIconClick =
                hasClass("searchIcon") ||
                hasClass("searchIconText") ||
                hasClass("search-bar") ||
                hasClass("searchBtnIcon");

            const isSearchInputClick =
                hasClass("yxt-SearchBar-input") ||
                hasClass("yxt-SearchBar-button");

            const isOutsideClick =
                !hasClass("searchIcon") &&
                !hasClass("search-container") &&
                !hasClass("searchIconText") &&
                !hasClass("search-bar") &&
                !hasClass("yxt-SearchBar-container") &&
                !hasClass("search-wrapper") &&
                !hasClass("yxt-SearchBar-wrapper");

            if (isSearchIconClick) {
                if (!isSearchDropdownOpen) {
                    setIsSearchDropdownOpen(true);
                } else {
                    setIsSearchDropdownOpen(false);
                }
            }

            else if (isSearchInputClick) {
                setIsSearchDropdownOpen(true);
            }

            else if (isOutsideClick) {
                setIsSearchDropdownOpen(false);
            }
        };
        window.addEventListener("click", onWindowEvent);
        window.addEventListener("keydown", onWindowEvent);

        return () => {
            window.removeEventListener("click", onWindowEvent);
            window.removeEventListener("keydown", onWindowEvent);
        };
    }, [isSearchDropdownOpen]);

    return (
        <>
            {isSearchDropdownOpen && (<div className="grey-background"></div>)}
        </>
    );
};

export default BlurCbBackground;