import { useState } from "react";

import{
   ArrowRight
} from "lucide-react";


import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";



function ListForm() {
    const [listName, setListName] = useState("");
    const [tabName, setTabName] = useState("");

    const [listNameError, setListNameError] = useState(false);
    const [tabNameError, setTabNameError] = useState(false);

    const [showSuccess, setShowSuccess] = useState(false);

    const [toast, setToast] = useState("");
    const [toastVisible, setToastVisible] = useState(false);

    const showToast = (message) => {
        setToast(message);
        setToastVisible(true);

        setTimeout(() => {
            setToastVisible(false);
        }, 2500);
    };

    /* =========================
       VALIDATION
    ========================== */

    const validateForm = () => {
        let valid = true;

        const listValue = listName.trim();
        const tabValue = tabName.trim();

        if (!listValue) {
            setListNameError(true);
            valid = false;
        } else {
            setListNameError(false);
        }

        if (!tabValue) {
            setTabNameError(true);
            valid = false;
        } else {
            setTabNameError(false);
        }

        return valid;
    };

    /* =========================
       CONTINUE
    ========================== */

    const handleContinue = () => {
        if (!validateForm()) {
            showToast("Please complete the required fields.");
            return;
        }

        const list = listName.trim();
        const tab = tabName.trim();

        localStorage.setItem(
            "idCardList",
            JSON.stringify({
                listName: list,
                tabName: tab
            })
        );

        console.log("List created:", {
            listName: list,
            tabName: tab
        });

        setShowSuccess(true);

        showToast("List information saved.");
    };

    /* =========================
       CANCEL
    ========================== */

    const handleCancel = () => {
        const hasData =
            listName.trim() ||
            tabName.trim();

        if (hasData) {
            const confirmCancel = window.confirm(
                "Are you sure you want to cancel? Your entered information will be lost."
            );

            if (!confirmCancel) {
                return;
            }
        }

        setListName("");
        setTabName("");

        setListNameError(false);
        setTabNameError(false);
    };

    /* =========================
       ENTER KEY
    ========================== */

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleContinue();
        }
    };



    const getInitials = (name) => {
    const words = name.trim().split(/\s+/);

    if (!words.length || !words[0]) {
        return "A";
    }

    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }

    return (
        words[0].charAt(0) +
        words[1].charAt(0)
    ).toUpperCase();
};


    /* =========================
       NAVIGATION
    ========================== */


    const golistform = () => {
        window.location.href = "/listform";
    };


    const goImportData = () => {
        window.location.href = "/importdata";
    };

    return (
        <div className="app">

            {/* =========================
                 SIDEBAR
            ========================== */}

            <Sidebar activePage="listform" />


            {/* =========================
                 MAIN
            ========================== */}

            <main className="main">

                {/* TOPBAR */}

                <Topbar />


                {/* CONTENT */}

                <section className="content">

                    <div className="breadcrumb">

                        <button
                            onClick={golistform}
                        >
                            Master Data
                        </button>

                        <span>
                            ›
                        </span>

                        <span>
                            Create New List
                        </span>

                    </div>


                    {/* HEADER */}

                    <h1 className="page-title">Create a Student List</h1>

                    <p className="page-subtitle">
                        Organize your students by class or division. First create a list,
                        then import student records and review them before saving.
                    </p>



                    {/* STEPS */}

                    <div className="steps">

                        <div className="step active">

                            <div className="step-number">
                                1
                            </div>

                            <div className="step-label">
                                List Details
                            </div>

                        </div>


                        <div className="step-line"></div>


                        <div className="step">

                            <div className="step-number">
                                2
                            </div>

                            <div className="step-label">
                                Import Records
                            </div>

                        </div>


                        <div className="step-line"></div>


                        <div className="step">

                            <div className="step-number">
                                3
                            </div>

                            <div className="step-label">
                                Review Data
                            </div>

                        </div>

                    </div>


                    {/* MAIN LAYOUT */}

                    <div className="layout">

                        {/* FORM */}

                        <div>

                            {!showSuccess && (
                                <div
                                    className="form-card"
                                    id="formCard"
                                >

                                    <div className="form-card-header">

                                        <h2>Master List Details</h2>
                                        <p>
                                            First, identify the group you want to manage. You will add
                                            the actual student records in the next step.
                                        </p>

                                    </div>


                                    <div className="form-body">

                                        {/* LIST NAME */}

                                        <div className="field">

                                            <div className="field-label">

                                                <label htmlFor="listName">
                                                    List Name
                                                    <span className="required">
                                                        *
                                                    </span>
                                                </label>

                                            </div>


                                            <div className="input-wrap">

                                                <input
                                                    type="text"
                                                    id="listName"
                                                    className={`input ${
                                                        listNameError
                                                            ? "invalid"
                                                            : ""
                                                    }`}
                                                    placeholder="e.g. 1st Standard - A Students"
                                                    maxLength="80"
                                                    value={listName}
                                                    onChange={(event) => {
                                                        setListName(event.target.value);

                                                        if (
                                                            event.target.value.trim()
                                                        ) {
                                                            setListNameError(false);
                                                        }
                                                    }}
                                                    onKeyDown={handleKeyDown}
                                                />

                                                <p className="field-hint">
                                                    Give the complete group a recognizable name. For example,
                                                    use an academic year or a class name so you can find it later.
                                                </p>

                                            </div>


                                            <div
                                                className={`error ${
                                                    listNameError
                                                        ? "show"
                                                        : ""
                                                }`}
                                                id="listNameError"
                                            >
                                                Please enter a list name.
                                            </div>

                                        </div>


                                        {/* TAB NAME */}

                                        <div className="field">

                                            <div className="field-label">

                                                <label htmlFor="tabName">
                                                    Tab Name
                                                    <span className="required">
                                                        *
                                                    </span>
                                                </label>

                                               

                                            </div>


                                            <div className="input-wrap">

                                                <input
                                                    type="text"
                                                    id="tabName"
                                                    className={`input ${
                                                        tabNameError
                                                            ? "invalid"
                                                            : ""
                                                    }`}
                                                    placeholder="e.g. 1st A"
                                                    maxLength="30"
                                                    value={tabName}
                                                    onChange={(event) => {
                                                        setTabName(event.target.value);

                                                        if (
                                                            event.target.value.trim()
                                                        ) {
                                                            setTabNameError(false);
                                                        }
                                                    }}
                                                    onKeyDown={handleKeyDown}
                                                />

                                                <p className="field-hint">
                                                    This is the short label used to identify this group in your
                                                    student data view. Keep it brief, such as "10th A" or "5th B".
                                                </p>

                                            </div>


                                            <div
                                                className={`error ${
                                                    tabNameError
                                                        ? "show"
                                                        : ""
                                                }`}
                                                id="tabNameError"
                                            >
                                                Please enter a tab name.
                                            </div>

                                        </div>


                                        {/* PREVIEW */}

                                        <div className="preview-box">

                                            <div className="preview-label">
                                                Tab Preview
                                            </div>


                                            <div className="tab-preview">

                                                <div className="tab-icon">
                                                    {getInitials(tabName)}
                                                </div>

                                                <span id="tabPreview">
                                                    {tabName.trim() ||
                                                        "Your tab name"}
                                                </span>

                                            </div>

                                        </div>

                                    </div>


                                    {/* FOOTER */}

                                    <div className="form-footer">

                                        <div className="footer-note">
                                            You can change student records after importing them.
                                        </div>


                                        <div className="actions">

                                            <button
                                                type="button"
                                                className="ui-btn ui-btn--secondary"
                                                onClick={handleCancel}
                                            >
                                                Cancel
                                            </button>


                                            <button
                                                type="button"
                                                className="ui-btn ui-btn--primary "
                                                onClick={handleContinue}
                                            >
                                                Continue
                                                <ArrowRight size={10} />
                                                
                                            </button>

                                        </div>

                                    </div>

                                </div>
                            )}


                            {/* SUCCESS STATE */}

                            <div
                                className={`success-state ${
                                    showSuccess ? "show" : ""
                                }`}
                                id="successState"
                            >

                                <div className="success-icon">
                                    ✓
                                </div>

                                <h2>
                                    List Created
                                </h2>

                                <p>
                                    Your list has been prepared successfully.
                                    The next step will allow you to import the student data for this list.
                                </p>

                                <div
                                    className="next-step"
                                    id="nextStep"
                                    onClick={goImportData}
                                >
                                    Step 2&nbsp; → &nbsp;Import Student Data
                                </div>

                            </div>

                        </div>


                        {/* INFORMATION */}

                       <aside className="info-card">
                            <div className="info-card-heading">
                                <div className="info-heading-icon">i</div>

                                <div>
                                    <h3>Before you continue</h3>
                                    <p>Understand how your list will be organized.</p>
                                </div>
                            </div>

                            <div className="info-divider" />

                            <div className="info-item">
                                <div className="info-number">1</div>

                                <div>
                                    <strong>Master List Name</strong>
                                    <span>
                                        The main name of your student record group.
                                        Example: 2026–27 Student Records.
                                    </span>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-number">2</div>

                                <div>
                                    <strong>Tab Name</strong>
                                    <span>
                                        A short label to recognize the group in your
                                        student data view. Example: 10th A.
                                    </span>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-number">3</div>

                                <div>
                                    <strong>Import Student Records</strong>
                                    <span>
                                        Continue to upload your CSV or Excel file
                                        and review the records before saving.
                                    </span>
                                </div>
                            </div>

                            <div className="info-example">
                                <span className="info-example-label">EXAMPLE</span>

                                <div className="example-row">
                                    <span>Master List</span>
                                    <strong>10th Standard - A</strong>
                                </div>

                                <div className="example-row">
                                    <span>Tab Name</span>
                                    <strong>10th A</strong>
                                </div>

                                <div className="example-tab">
                                    <span className="example-tab-icon">1A</span>
                                    <span>10th A</span>
                                    <span className="example-tab-status">Preview</span>
                                </div>
                            </div>

                            <div className="info-tip">
                                <strong>Tip</strong>
                                <p>
                                    Use consistent class names and academic years to
                                    keep your student records organized.
                                </p>
                            </div>
                        </aside>

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

        </div>
    );
}

export default ListForm;