import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function AppTheme() {
    const [theme, setTheme] = useState("light");
    const [savedTheme, setSavedTheme] = useState("light");
    const [toast, setToast] = useState("");
    const [toastVisible, setToastVisible] = useState(false);

    /* =========================
       LOAD THEME
    ========================== */

    useEffect(() => {
        const saved =
            localStorage.getItem("idCardTheme") || "light";

        setTheme(saved);
        setSavedTheme(saved);
    }, []);


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

        setSavedTheme(theme);

        showToast("Theme saved successfully.");
    };


    /* =========================
       RESET
    ========================== */

    const handleReset = () => {
        setTheme("light");

        localStorage.setItem(
            "idCardTheme",
            "light"
        );

        setSavedTheme("light");

        showToast("Theme reset to light.");
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


                            <div className="theme-options">

                                {themes.map((item) => (

                                    <button
                                        type="button"
                                        key={item.id}
                                        className={`theme-option ${
                                            theme === item.id
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setTheme(item.id)
                                        }
                                    >

                                        <div className="theme-option-icon">
                                            {item.icon}
                                        </div>


                                        <div className="theme-option-content">

                                            <strong>
                                                {item.name}
                                            </strong>

                                            <span>
                                                {item.description}
                                            </span>

                                        </div>


                                        <div className="theme-radio">

                                            {theme === item.id && (
                                                <span>
                                                    ✓
                                                </span>
                                            )}

                                        </div>

                                    </button>

                                ))}

                            </div>


                            {/* =========================
                                FOOTER
                            ========================== */}

                            <div className="theme-card-footer">

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleReset}
                                >
                                    Reset
                                </button>


                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                    disabled={
                                        theme === savedTheme
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

                            <div className="theme-preview-header">

                                <div>

                                    <h3>
                                        Preview
                                    </h3>

                                    <span>
                                        {theme === "light"
                                            ? "Light theme"
                                            : theme === "dark"
                                            ? "Dark theme"
                                            : "System theme"}
                                    </span>

                                </div>

                            </div>


                            <div
                                className={`theme-preview ${
                                    theme === "dark"
                                        ? "preview-dark"
                                        : ""
                                }`}
                            >

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

                                </div>


                                <div className="preview-main">

                                    <div className="preview-topbar">
                                        <span></span>
                                        <span></span>
                                    </div>


                                    <div className="preview-content">

                                        <div className="preview-title">
                                            Dashboard
                                        </div>


                                        <div className="preview-stats">

                                            <div></div>
                                            <div></div>
                                            <div></div>

                                        </div>


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