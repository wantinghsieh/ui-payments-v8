import React, { useState, useRef, useEffect } from "react";
import MagGlassIcon from "../../../assets/business/images/magnifying-glass.svg";
import ArrowDownIcon from "../../../assets/business/images/arrow_down.svg";
import ArrowUpIcon from "../../../assets/business/images/arrow_up.svg";
import { Overlay, Popover } from "react-bootstrap";

const CB_SEARCH_URL = "https://www.cox.com/business/search.html";
const SEARCH_SUGGESTIONS = [
  "How do I change my WiFi password?",
  "Can I get assistance with my bill?",
  "What are the most popular plans?",
  "How can I test my Internet speed?",
];

const CbSearch: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isSearchSlideLeft, setIsSearchSlideLeft] = useState(false);
  const [isSearchOverlap, setIsSearchOverlap] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileDevice, setisMobileDevice] = useState(
    window.innerWidth <= 480 ? true : false,
  );
  const [showMainMenuPopover, setShowMainMenuPopover] = React.useState(false);
  const [mainMenuTarget, setMainMenuTarget] =
    React.useState<HTMLElement | null>(null);
  const [isMainMenuReady, setIsMainMenuReady] = React.useState(false);
  const mainMenuTimerRef = React.useRef<number | null>(null);
  const mainMenuDelay = 150;
  const searchBtnRef = useRef(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const isTabletDevice = window.innerWidth <= 768 && window.innerWidth > 480;

  useEffect(() => {
    if (window.innerWidth <= 480) {
      setisMobileDevice(true);
    }
  }, [isMobileDevice]);

  useEffect(() => {
    setIsSearchOverlap(isSearchVisible);
  }, [isSearchVisible]);

  useEffect(() => {
    document
      .getElementsByClassName("cox-header")[0]
      ?.classList.toggle("search-overlap", isSearchOverlap);
  }, [isSearchOverlap]);

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
        hasClass("custom_search_form") ||
        hasClass("search-btn") ||
        !!target.closest(".search-form-wrapper");

      const isOutsideClick =
        !hasClass("searchIcon") &&
        !hasClass("search-container") &&
        !hasClass("searchIconText") &&
        !hasClass("search-bar") &&
        !hasClass("search-wrapper");

      if (isSearchIconClick) {
        if (!isSearchDropdownOpen) {
          setIsSearchDropdownOpen(true);
          setShowDropdown(true);

          if (isMobileDevice) {
            setIsSearchSlideLeft(true);
          }

          searchOnInput();
        } else {
          setIsSearchDropdownOpen(false);
          setShowDropdown(false);
          setIsSearchVisible(false);

          if (isMobileDevice) {
            setIsSearchSlideLeft(false);
          }

          if (searchInputRef.current) {
            clearSearch(event);
          }
        }
      } else if (isSearchInputClick) {
        setIsSearchDropdownOpen(true);
        setIsSearchVisible(true);
      } else if (isOutsideClick) {
        setIsSearchDropdownOpen(false);
        setShowDropdown(false);

        if (searchInputRef.current?.value) {
          clearSearch(event);
        }

        if (isMobileDevice) {
          setIsSearchSlideLeft(false);
          setTimeout(() => {
            setIsSearchVisible(false);
          }, 500);
        } else {
          setIsSearchVisible(false);
        }
      }
    };

    window.addEventListener("click", onWindowEvent);
    window.addEventListener("keydown", onWindowEvent);

    return () => {
      window.removeEventListener("click", onWindowEvent);
      window.removeEventListener("keydown", onWindowEvent);
    };
  }, [isSearchDropdownOpen, isMobileDevice]);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      toggleDropdown();
    }
  };

  const clearSearch = (event: any) => {
    if (event.key === "Enter" || event.button === 0) {
      if (searchInputRef.current) {
        searchInputRef.current.value = "";
      }
    }
  };

  const searchOnInput = () => {
    setIsSearchVisible(true);
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.value = "";
        searchInputRef.current.focus();
      }
    });
  };

  const onSearch = () => {
    const input = searchInputRef.current;
    const query = input?.value.trim();
    if (!query) return;
    window.location.href = `${CB_SEARCH_URL}?query=${encodeURIComponent(query)}`;
    if (input) {
      input.value = "";
    }
    setIsSearchDropdownOpen(false);
    setShowDropdown(false);
    setIsSearchVisible(false);
    setIsSearchOverlap(false);
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  const onSuggestion = (text: string, event: React.SyntheticEvent) => {
    event.preventDefault();
    if (searchInputRef.current) {
      searchInputRef.current.value = text;
    }
    onSearch();
  };

  const onSearchFocusOut = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsSearchFocused(false);
    }
  };

  const handleMainMenuMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (showDropdown) return;

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

  return (
    <section>
      <div className="search-container">
        <div
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
          className={`search-bar popover-img-box div-focus-visible ${
            showDropdown ? "margin-bottom-neg-8px gray-bg-std" : ""
          } ${isMobileDevice ? "mobile-menu" : ""}`}
          aria-label={showDropdown ? "Search expanded" : "Search collapsed"}
          role="button"
          tabIndex={0}
          onMouseEnter={handleMainMenuMouseEnter}
          onMouseLeave={handleMainMenuMouseLeave}
        >
          <div
            ref={searchBtnRef}
            className={`globalHeaderStyle searchIconText ${
              showDropdown ? "hide" : ""
            } ${isTabletDevice ? "headerPopover hidePopover" : "headerPopover"}`}
            id="searchForm"
          >
            <img
              src={MagGlassIcon}
              alt="Search icon"
              role="presentation"
              className="searchIcon pad-top-p-2"
            />
            <img
              src={ArrowDownIcon}
              className="searchIcon"
              alt="arrow down"
              role="presentation"
            />
          </div>

          <div
            className={`searchIconText globalHeaderStyle ${
              !showDropdown ? "hide" : ""
            }`}
          >
            <img
              src={MagGlassIcon}
              alt="Search icon"
              role="presentation"
              className="searchIcon pad-top-p-2"
            />
            <img
              src={ArrowUpIcon}
              className="searchIcon"
              alt="arrow up"
              role="presentation"
            />
          </div>
        </div>

        <div
          className={`search-wrapper ${isSearchSlideLeft ? "slide-left" : ""}`}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={onSearchFocusOut}
        >
          <div
            className={`search-form-wrapper overflow-hidden ${!isSearchVisible ? "hide" : ""}`}
          >
            <input
              ref={searchInputRef}
              type="text"
              className="custom_search_form"
              placeholder="Search Cox Business"
              aria-label="Search Cox Business"
              onKeyDown={onSearchKeyDown}
            />
          </div>
          <button
            type="button"
            onClick={onSearch}
            className={`search-btn ${!isSearchVisible ? "search-btn--hidden" : ""}`}
            title="Search Icon"
            aria-label="Search"
            tabIndex={0}
          />
          {showDropdown && isSearchVisible && isSearchFocused && (
            <div className="search-dropdown">
              {SEARCH_SUGGESTIONS.map((suggestion) => (
                <a
                  key={suggestion}
                  href="#"
                  className="search-dropdown-item"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => onSuggestion(suggestion, e)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onSuggestion(suggestion, e);
                    }
                  }}
                >
                  {suggestion}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      {!isMobileDevice && mainMenuTarget && !showDropdown && (
        <Overlay
          show={showMainMenuPopover}
          target={mainMenuTarget}
          placement="bottom"
          popperConfig={{
            strategy: "fixed",
            modifiers: [
              {
                name: "offset",
                options: { offset: [0, 8] },
              },
            ],
          }}
        >
          {(props) => {
            const isPositioned = Boolean(
              props["data-popper-placement"] && props.style?.transform,
            );

            if (isPositioned && !isMainMenuReady) {
              setIsMainMenuReady(true);
            }

            return (
              <Popover
                {...props}
                className={`mainMenuPopover ${isPositioned ? "ready" : ""}`}
              >
                <Popover.Body className="px-3 py-1 text-center popover-body">
                  Search
                </Popover.Body>
              </Popover>
            );
          }}
        </Overlay>
      )}
    </section>
  );
};

export default CbSearch;
