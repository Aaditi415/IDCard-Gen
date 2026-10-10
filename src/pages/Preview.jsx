import { useEffect, useRef, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
function Preview() {
    const [zoom, setZoom] = useState(1);
    const [toast, setToast] = useState("");
    const [toastVisible, setToastVisible] = useState(false);

    const toastTimerRef = useRef(null);
    const exportTimerRef = useRef(null);

    /* =========================
       TOAST
    ========================= */

    const showToast = (message) => {
        setToast(message);
        setToastVisible(true);

        if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
        }

        toastTimerRef.current = setTimeout(() => {
            setToastVisible(false);
        }, 2500);
    };

    /* =========================
       CLEANUP
    ========================= */

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current);
            }

            if (exportTimerRef.current) {
                clearTimeout(exportTimerRef.current);
            }
        };
    }, []);

    /* =========================
       ZOOM
    ========================= */

    const zoomIn = () => {
        setZoom((currentZoom) => {
            if (currentZoom < 1.6) {
                return Number((currentZoom + 0.1).toFixed(1));
            }

            return currentZoom;
        });
    };

    const zoomOut = () => {
        setZoom((currentZoom) => {
            if (currentZoom > 0.5) {
                return Number((currentZoom - 0.1).toFixed(1));
            }

            return currentZoom;
        });
    };

    const resetZoom = () => {
        setZoom(1);
    };

    /* =========================
       SAVE
    ========================= */

    const saveCard = () => {
        showToast("ID card saved successfully.");
    };

    /* =========================
       GENERATE
    ========================= */

    const generateCard = () => {
        showToast("ID card generated successfully.");
    };

    /* =========================
       PRINT
    ========================= */

    const printCard = () => {
        window.print();
    };

    /* =========================
       PNG EXPORT
    ========================= */

    const downloadPNG = () => {
        showToast("Preparing PNG download...");

        if (exportTimerRef.current) {
            clearTimeout(exportTimerRef.current);
        }

        exportTimerRef.current = setTimeout(() => {
            showToast("PNG export is ready to connect.");
        }, 800);
    };

    /* =========================
       PDF EXPORT
    ========================= */

    const downloadPDF = () => {
        showToast("Preparing PDF download...");

        if (exportTimerRef.current) {
            clearTimeout(exportTimerRef.current);
        }

        exportTimerRef.current = setTimeout(() => {
            showToast("PDF export is ready to connect.");
        }, 800);
    };

    /* =========================
       NAVIGATION
    ========================= */

    const goDashboard = () => {
        window.location.href = "/";
    };

    const goCreateCard = () => {
        window.location.href = "/card";
    };


    const goBackToDesign = () => {
        /*
         * Keep this as design.html until Design
         * is converted to React.
         */
        window.location.href = "design.html";
    };

    return (
        <>
            {/* =========================
                SIDEBAR
            ========================= */}

            <Sidebar activePage="preview" />


            {/* =========================
                MAIN
            ========================= */}

            <main className="main">

                <Topbar />

                <section className="content">

                    {/* BREADCRUMB */}

                    <div className="breadcrumb">

                        <button onClick={goDashboard}>
                            Dashboard
                        </button>

                        <span>
                            ›
                        </span>

                        <button onClick={goCreateCard}>
                            Create ID Card
                        </button>

                        <span>
                            ›
                        </span>

                        <span>
                            Final Preview
                        </span>

                    </div>


                    <h1 className="page-title">
                        Final Preview
                    </h1>

                    <p className="page-subtitle">
                        Review your ID card before generating the final file.
                    </p>


                    {/* STEPS */}

                    <div className="steps">

                        <div className="step completed">

                            <div className="step-number">
                                ✓
                            </div>

                            <div className="step-label">
                                Card Type
                            </div>

                        </div>


                        <div className="step-line completed"></div>


                        <div className="step completed">

                            <div className="step-number">
                                ✓
                            </div>

                            <div className="step-label">
                                Details
                            </div>

                        </div>


                        <div className="step-line completed"></div>


                        <div className="step completed">

                            <div className="step-number">
                                ✓
                            </div>

                            <div className="step-label">
                                Design
                            </div>

                        </div>


                        <div className="step-line completed"></div>


                        <div className="step">

                            <div className="step-number">
                                4
                            </div>

                            <div className="step-label">
                                Preview
                            </div>

                        </div>

                    </div>


                    {/* =========================
                        PREVIEW LAYOUT
                    ========================= */}

                    <div className="preview-layout">


                        {/* LEFT PREVIEW */}

                        <div className="card-panel">

                            <div className="panel-header">

                                <div>
                                    <h3>
                                        ID Card Preview
                                    </h3>
                                </div>

                                <div className="preview-toolbar">

                                    <button
                                        className="toolbar-btn"
                                        onClick={zoomOut}
                                    >
                                        −
                                    </button>

                                    <div
                                        className="zoom-value"
                                        id="zoomValue"
                                    >
                                        {Math.round(zoom * 100)}%
                                    </div>

                                    <button
                                        className="toolbar-btn"
                                        onClick={zoomIn}
                                    >
                                        +
                                    </button>

                                    <button
                                        className="toolbar-btn"
                                        onClick={resetZoom}
                                    >
                                        ↺
                                    </button>

                                </div>

                            </div>


                            <div className="canvas">

                                <div
                                    className="card-wrapper"
                                    id="cardWrapper"
                                    style={{
                                        transform: `scale(${zoom})`
                                    }}
                                >

                                    <div
                                        className="id-card"
                                        id="idCard"
                                    >

                                        {/* TOP */}

                                        <div className="card-top">

                                            <div className="card-logo">
                                                LOGO
                                            </div>

                                            <div>

                                                <div className="org-name">
                                                    ABC PUBLIC SCHOOL
                                                </div>

                                                <div className="org-subtitle">
                                                    Pune, Maharashtra
                                                </div>

                                            </div>

                                        </div>


                                        {/* BODY */}

                                        <div className="card-body">

                                            <div className="student-photo">
                                                PHOTO
                                            </div>

                                            <div className="student-info">

                                                <div className="student-name">
                                                    Aaditi Parmar
                                                </div>

                                                <div className="info-row">

                                                    <div className="info-label">
                                                        ID Number
                                                    </div>

                                                    <div className="info-value">
                                                        STU-2026-001
                                                    </div>

                                                </div>

                                                <div className="info-row">

                                                    <div className="info-label">
                                                        Class
                                                    </div>

                                                    <div className="info-value">
                                                        10th A
                                                    </div>

                                                </div>

                                                <div className="info-row">

                                                    <div className="info-label">
                                                        Roll No.
                                                    </div>

                                                    <div className="info-value">
                                                        24
                                                    </div>

                                                </div>

                                                <div className="info-row">

                                                    <div className="info-label">
                                                        Valid Until
                                                    </div>

                                                    <div className="info-value">
                                                        March 2027
                                                    </div>

                                                </div>

                                            </div>

                                        </div>


                                        {/* FOOTER */}

                                        <div className="card-footer">

                                            <span>
                                                www.abcschool.edu
                                            </span>

                                            <span>
                                                Authorized ID
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* RIGHT PANEL */}

                        <aside className="side-panel">


                            {/* CARD INFORMATION */}

                            <div className="info-box">

                                <h3>
                                    Card Information
                                </h3>

                                <div className="detail-row">

                                    <span className="detail-label">
                                        Card Type
                                    </span>

                                    <span className="detail-value">
                                        Student ID
                                    </span>

                                </div>

                                <div className="detail-row">

                                    <span className="detail-label">
                                        Template
                                    </span>

                                    <span className="detail-value">
                                        Modern
                                    </span>

                                </div>

                                <div className="detail-row">

                                    <span className="detail-label">
                                        Orientation
                                    </span>

                                    <span className="detail-value">
                                        Landscape
                                    </span>

                                </div>

                                <div className="detail-row">

                                    <span className="detail-label">
                                        Size
                                    </span>

                                    <span className="detail-value">
                                        CR80
                                    </span>

                                </div>

                                <div className="detail-row">

                                    <span className="detail-label">
                                        Dimensions
                                    </span>

                                    <span className="detail-value">
                                        85.6 × 54 mm
                                    </span>

                                </div>

                            </div>


                            {/* QUALITY */}

                            <div className="info-box">

                                <h3>
                                    Generation Status
                                </h3>

                                <div className="detail-row">

                                    <span className="detail-label">
                                        Design
                                    </span>

                                    <span className="status">

                                        <span className="status-dot"></span>

                                        Ready

                                    </span>

                                </div>

                                <div className="detail-row">

                                    <span className="detail-label">
                                        Information
                                    </span>

                                    <span className="status">

                                        <span className="status-dot"></span>

                                        Complete

                                    </span>

                                </div>

                                <div className="detail-row">

                                    <span className="detail-label">
                                        Export
                                    </span>

                                    <span className="status">

                                        <span className="status-dot"></span>

                                        Ready

                                    </span>

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div className="action-box">

                                <h3>
                                    Generate Card
                                </h3>

                                <p>
                                    Choose an export format or save this ID card
                                    to your dashboard.
                                </p>

                                <button
                                    className="action-btn primary"
                                    onClick={downloadPNG}
                                >
                                    ↓ &nbsp; Download PNG
                                </button>

                                <button
                                    className="action-btn"
                                    onClick={downloadPDF}
                                >
                                    ↓ &nbsp; Download PDF
                                </button>

                                <div className="action-row">

                                    <button
                                        className="action-btn"
                                        onClick={printCard}
                                    >
                                        Print
                                    </button>

                                    <button
                                        className="action-btn"
                                        onClick={saveCard}
                                    >
                                        Save
                                    </button>

                                </div>

                            </div>

                        </aside>

                    </div>


                    {/* =========================
                        BOTTOM ACTIONS
                    ========================= */}

                    <div className="bottom-actions">

                        <button
                            className="ui-btn ui-btn--secondary"
                            id="backBtn"
                            onClick={goBackToDesign}
                        >
                            ← Back to Design
                        </button>

                        <button
                            className="generate-btn"
                            onClick={generateCard}
                        >
                            Generate ID Card
                        </button>

                    </div>

                </section>

            </main>


            {/* TOAST */}

            <div
                className={`toast ${toastVisible ? "show" : ""}`}
                id="toast"
            >
                {toast}
            </div>
        </>
    );
}

export default Preview;