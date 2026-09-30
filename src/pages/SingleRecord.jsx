import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function SingleRecord() {
    const [listSetup, setListSetup] = useState(null);
    const [formData, setFormData] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        try {
            const savedSetup = JSON.parse(
                sessionStorage.getItem("singleRecordListSetup")
            );

            if (
                !savedSetup ||
                !savedSetup.listName ||
                !savedSetup.tabName ||
                !Array.isArray(savedSetup.headers) ||
                savedSetup.headers.length === 0
            ) {
                window.location.href = "/add-single-record";
                return;
            }

            setListSetup(savedSetup);
            setFormData(savedSetup.headers.map(() => ""));
        } catch (error) {
            console.error(
                "Failed to load list setup:",
                error
            );

            window.location.href = "/add-single-record";
        }
    }, []);

    const handleChange = (index, value) => {
        const updated = [...formData];

        updated[index] = value;

        setFormData(updated);
        setError("");
    };

    const handleContinue = () => {
        if (!listSetup) return;

        const hasEmptyField = formData.some(
            (value) => !String(value).trim()
        );

        if (hasEmptyField) {
            setError(
                "Please fill all fields before continuing."
            );

            return;
        }

        /*
         * Existing Review.jsx expects:
         *
         * idCardList
         * idCardImportedData
         */

        localStorage.setItem(
            "idCardList",
            JSON.stringify({
                listName: listSetup.listName,
                tabName: listSetup.tabName
            })
        );

        localStorage.setItem(
            "idCardImportedData",
            JSON.stringify({
                headers: listSetup.headers,
                rows: [formData],
                removedCount: 0
            })
        );

        // Remove temporary new-list setup
        sessionStorage.removeItem(
            "singleRecordListSetup"
        );

        // Existing Review screen
        window.location.href = "/review";
    };

    const handleBack = () => {
        window.location.href = "/add-single-record";
    };

    if (!listSetup) {
        return null;
    }

    return (
        <div className="app">

            <Sidebar />

            <main className="main">

                <Topbar />

                <div className="content">

                    {/* =====================================================
                        BREADCRUMB
                    ===================================================== */}

                    <div className="breadcrumb">

                        <span>
                            Add Single Record
                        </span>

                        <span className="breadcrumb-separator">
                            /
                        </span>

                        <span>
                            Enter Record
                        </span>

                    </div>


                    {/* =====================================================
                        TITLE
                    ===================================================== */}

                    <div className="page-title">
                        Enter Record
                    </div>

                    <div className="page-subtitle">
                        Add the first record to your new list.
                    </div>


                    {/* =====================================================
                        STEPS
                    ===================================================== */}

                    <div className="steps">

                        <div className="step completed">

                            <div className="step-number">
                                ✓
                            </div>

                            <div className="step-label">
                                List
                            </div>

                        </div>


                        <div className="step-line completed"></div>


                        <div className="step active">

                            <div className="step-number">
                                2
                            </div>

                            <div className="step-label">
                                Add Record
                            </div>

                        </div>


                        <div className="step-line"></div>


                        <div className="step">

                            <div className="step-number">
                                3
                            </div>

                            <div className="step-label">
                                Review
                            </div>

                        </div>

                    </div>


                    {/* =====================================================
                        MAIN LAYOUT
                    ===================================================== */}

                    <div className="layout">


                        {/* =================================================
                            LEFT — FORM
                        ================================================= */}

                        <section className="form-card">

                            <div className="form-card-header">

                                <div>

                                    <h3>
                                        {listSetup.listName}
                                    </h3>

                                    <p>
                                        Enter information for the
                                        first record.
                                    </p>

                                </div>

                            </div>


                            <div className="form-body">


                                {/* =================================================
                                    LIST INFORMATION
                                ================================================= */}

                                <div className="record-list-info">

                                    <div className="record-list-info-item">

                                        <span className="record-list-info-label">
                                            List
                                        </span>

                                        <strong>
                                            {listSetup.listName}
                                        </strong>

                                    </div>


                                    <div className="record-list-info-item">

                                        <span className="record-list-info-label">
                                            Tab
                                        </span>

                                        <strong>
                                            {listSetup.tabName}
                                        </strong>

                                    </div>

                                </div>


                                {/* =================================================
                                    RECORD FIELDS
                                ================================================= */}

                                <div className="single-record-fields">

                                    {listSetup.headers.map(
                                        (header, index) => (

                                            <div
                                                className="field"
                                                key={index}
                                            >

                                                <label className="field-label">
                                                    {header}
                                                </label>


                                                <div className="input-wrap">

                                                    <input
                                                        type="text"
                                                        className="input"
                                                        value={
                                                            formData[index] ||
                                                            ""
                                                        }
                                                        placeholder={`Enter ${header}`}
                                                        onChange={(event) =>
                                                            handleChange(
                                                                index,
                                                                event.target.value
                                                            )
                                                        }
                                                    />

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>


                                {/* =================================================
                                    ERROR
                                ================================================= */}

                                {error && (
                                    <div className="error show">
                                        {error}
                                    </div>
                                )}

                            </div>


                            {/* =================================================
                                FOOTER
                            ================================================= */}

                            <div className="form-footer">

                                <div className="footer-note">

                                    <span>
                                        {listSetup.headers.length}
                                    </span>

                                    {listSetup.headers.length === 1
                                        ? " field"
                                        : " fields"}{" "}
                                    to complete

                                </div>


                                <div className="actions">

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleBack}
                                    >
                                        Back
                                    </button>


                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleContinue}
                                    >
                                        Continue to Review
                                    </button>

                                </div>

                            </div>

                        </section>


                        {/* =================================================
                            RIGHT — HOW THIS WORKS
                        ================================================= */}

                        <aside className="info-card">

                            <h3>
                                How this works
                            </h3>


                            <div className="info-item">

                                <div className="info-number">
                                    1
                                </div>

                                <div>

                                    <strong>
                                        List created
                                    </strong>

                                    <span>
                                        Your new list and its
                                        columns have been
                                        created.
                                    </span>

                                </div>

                            </div>


                            <div className="info-item">

                                <div className="info-number">
                                    2
                                </div>

                                <div>

                                    <strong>
                                        Add one record
                                    </strong>

                                    <span>
                                        Enter the student's
                                        information in the
                                        fields on the left.
                                    </span>

                                </div>

                            </div>


                            <div className="info-item">

                                <div className="info-number">
                                    3
                                </div>

                                <div>

                                    <strong>
                                        Review & save
                                    </strong>

                                    <span>
                                        Check the record on
                                        the review screen
                                        before saving the list.
                                    </span>

                                </div>

                            </div>


                          

                        </aside>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default SingleRecord;