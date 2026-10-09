import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function AppTheme() {

    const [theme, setTheme] = useState("light");
    const [savedTheme, setSavedTheme] = useState("light");

    const [toast, setToast] = useState("");
    const [toastVisible, setToastVisible] =
        useState(false);


    /* =========================
       APPLY THEME
    ========================== */

    const applyTheme = (selectedTheme) => {

        const root =
            document.documentElement;


        root.classList.remove(
            "theme-light",
            "theme-dark"
        );


        if (
            selectedTheme === "dark"
        ) {

            root.classList.add(
                "theme-dark"
            );

            return;
        }


        if (
            selectedTheme === "system"
        ) {

            const prefersDark =
                window.matchMedia(
                    "(prefers-color-scheme: dark)"
                ).matches;


            root.classList.add(
                prefersDark
                    ? "theme-dark"
                    : "theme-light"
            );

            return;
        }


        root.classList.add(
            "theme-light"
        );
    };


    /* =========================
       LOAD SAVED THEME
    ========================== */

    useEffect(() => {

        const saved =
            localStorage.getItem(
                "idCardTheme"
            ) || "light";


        setTheme(saved);

        setSavedTheme(saved);

        applyTheme(saved);

    }, []);


    /* =========================
       SYSTEM THEME LISTENER
    ========================== */

    useEffect(() => {

        if (theme !== "system") {
            return;
        }


        const mediaQuery =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            );


        const handleSystemTheme = () => {

            applyTheme("system");

        };


        mediaQuery.addEventListener(
            "change",
            handleSystemTheme
        );


        return () => {

            mediaQuery.removeEventListener(
                "change",
                handleSystemTheme
            );

        };

    }, [theme]);


    /* =========================
       TOAST
    ========================== */

    const showToast = (message) => {

        setToast(message);

        setToastVisible(true);


        setTimeout(() => {

            setToastVisible(false);

        }, 2500);

    };


    /* =========================
       SAVE THEME
    ========================== */

    const handleSave = () => {

        localStorage.setItem(
            "idCardTheme",
            theme
        );


        applyTheme(theme);


        setSavedTheme(theme);


        showToast(
            "Theme saved successfully."
        );

    };


    /* =========================
       RESET THEME
    ========================== */

    const handleReset = () => {

        setTheme("light");


        localStorage.setItem(
            "idCardTheme",
            "light"
        );


        applyTheme("light");


        setSavedTheme("light");


        showToast(
            "Theme reset to light."
        );

    };


    /* =========================
       THEME OPTIONS
    ========================== */

    const themes = [

        {
            id: "light",

            name: "Light",

            description:
                "Clean and bright interface",

            icon: "☀"
        },

        {
            id: "dark",

            name: "Dark",

            description:
                "Comfortable for low-light use",

            icon: "☾"
        },

        {
            id: "system",

            name: "System",

            description:
                "Follow your device appearance",

            icon: "◐"
        }

    ];


    /* =========================
       PREVIEW THEME
    ========================== */

    const isDarkPreview =
        theme === "dark" ||
        (
            theme === "system" &&
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches
        );


    /* =========================
       THEME NAME
    ========================== */

    const getThemeName = () => {

        if (theme === "dark") {
            return "Dark theme";
        }


        if (theme === "system") {
            return "System theme";
        }


        return "Light theme";

    };


    return (

        <div className="app">

            {/* =========================
                SIDEBAR
            ========================== */}

            <Sidebar
                activePage="Settings"
            />


            <main className="main">

                <Topbar />


                <section className="content">


                    {/* =========================
                        BREADCRUMB
                    ========================== */}

                    <div className="breadcrumb">

                        <span>
                            Settings
                        </span>


                        <span>
                            ›
                        </span>


                        <span>
                            Appearance
                        </span>

                    </div>


                    {/* =========================
                        HEADER
                    ========================== */}

                    <div className="theme-page-header">

                        <div>

                            <h1 className="page-title">
                                App Theme
                            </h1>


                            <p className="page-subtitle">
                                Customize how ID Card Gen
                                looks for you.
                            </p>

                        </div>

                    </div>


                    {/* =========================
                        MAIN LAYOUT
                    ========================== */}

                    <div className="theme-layout">


                        {/* =========================
                            THEME SETTINGS
                        ========================== */}

                        <div className="theme-card">


                            {/* HEADER */}

                            <div className="theme-card-header">

                                <div>

                                    <h2>
                                        Appearance
                                    </h2>


                                    <p>
                                        Choose your preferred
                                        application theme.
                                    </p>

                                </div>

                            </div>


                            {/* OPTIONS */}

                            <div className="theme-options">

                                {themes.map(
                                    (item) => (

                                        <button
                                            type="button"
                                            key={
                                                item.id
                                            }
                                            className={`theme-option ${
                                                theme ===
                                                item.id
                                                    ? "selected"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setTheme(
                                                    item.id
                                                )
                                            }
                                        >


                                            {/* ICON */}

                                            <div className="theme-option-icon">

                                                {item.icon}

                                            </div>


                                            {/* CONTENT */}

                                            <div className="theme-option-content">

                                                <strong>
                                                    {
                                                        item.name
                                                    }
                                                </strong>


                                                <span>
                                                    {
                                                        item.description
                                                    }
                                                </span>

                                            </div>


                                            {/* RADIO */}

                                            <div className="theme-radio">

                                                {theme ===
                                                    item.id && (
                                                    <span>
                                                        ✓
                                                    </span>
                                                )}

                                            </div>

                                        </button>

                                    )
                                )}

                            </div>


                            {/* FOOTER */}

                            <div className="theme-card-footer">


                                <button
                                    type="button"
                                    className="ui-btn ui-btn--secondary"
                                    onClick={
                                        handleReset
                                    }
                                >
                                    Reset
                                </button>


                                <button
                                    type="button"
                                    className="ui-btn ui-btn--primary"
                                    onClick={
                                        handleSave
                                    }
                                    disabled={
                                        theme ===
                                        savedTheme
                                    }
                                >
                                    Save Changes
                                </button>

                            </div>

                        </div>


                        {/* =========================
                            PREVIEW
                        ========================== */}

                        <aside className="theme-preview-card">


                            {/* PREVIEW HEADER */}

                            <div className="theme-preview-header">

                                <div>

                                    <h3>
                                        Preview
                                    </h3>


                                    <span>
                                        {
                                            getThemeName()
                                        }
                                    </span>

                                </div>

                            </div>


                            {/* PREVIEW */}

                            <div
                                className={`theme-preview ${
                                    isDarkPreview
                                        ? "preview-dark"
                                        : ""
                                }`}
                            >


                                {/* PREVIEW SIDEBAR */}

                                <div className="preview-sidebar">


                                    <div className="preview-logo">
                                        ID
                                    </div>


                                    <div className="preview-nav active">
                                        Dashboard
                                    </div>


                                    <div className="preview-nav">
                                        ID Cards
                                    </div>


                                    <div className="preview-nav">
                                        Import Data
                                    </div>


                                    <div className="preview-nav">
                                        Settings
                                    </div>

                                </div>


                                {/* PREVIEW MAIN */}

                                <div className="preview-main">


                                    {/* TOPBAR */}

                                    <div className="preview-topbar">

                                        <span></span>

                                        <span></span>

                                    </div>


                                    {/* CONTENT */}

                                    <div className="preview-content">


                                        <div className="preview-title">
                                            Dashboard
                                        </div>


                                        {/* STATS */}

                                        <div className="preview-stats">

                                            <div></div>

                                            <div></div>

                                            <div></div>

                                        </div>


                                        {/* TABLE */}

                                        <div className="preview-table">

                                            <div></div>

                                            <div></div>

                                            <div></div>

                                            <div></div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </aside>

                    </div>

                </section>

            </main>


            {/* =========================
                TOAST
            ========================== */}

            <div
                className={`toast ${
                    toastVisible
                        ? "show"
                        : ""
                }`}
            >
                {toast}
            </div>

        </div>

    );

}

export default AppTheme;