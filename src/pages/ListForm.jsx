import { useState } from "react";

import{
    Info,
    ArrowRight,
} from "lucide-react";


import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";



function ListForm() {
    const [listName, setListName] = useState("");
    const [tabName, setTabName] = useState("");

    const [listNameError, setListNameError] = useState("");
    const [tabNameError, setTabNameError] = useState("");

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

        // Read previously saved lists
        const savedLists = JSON.parse(
            localStorage.getItem("idCardLists") || "[]"
        );

        // Include the existing single-list storage format
        const existingList = localStorage.getItem("idCardList");

        if (existingList) {
            try {
                const parsed = JSON.parse(existingList);

                const alreadyIncluded = savedLists.some(
                    (item) =>
                        item.listName?.trim().toLowerCase() ===
                            parsed.listName?.trim().toLowerCase() &&
                        item.tabName?.trim().toLowerCase() ===
                            parsed.tabName?.trim().toLowerCase()
                );

                if (!alreadyIncluded) {
                    savedLists.push(parsed);
                }
            } catch {
                // Ignore invalid saved data
            }
        }

        const normalizedList = listValue.toLowerCase();
        const normalizedTab = tabValue.toLowerCase();

        // List name validation
        if (!listValue) {
            setListNameError("Please enter a list name.");
            valid = false;
        } else if (listValue.length > 50) {
            setListNameError("List name cannot exceed 50 characters.");
            valid = false;
        } else if (
            savedLists.some(
                (item) =>
                    item.listName?.trim().toLowerCase() === normalizedList
            )
        ) {
            setListNameError("This list name already exists.");
            valid = false;
        } else {
            setListNameError("");
        }

        // Tab name validation
        if (!tabValue) {
            setTabNameError("Please enter a tab name.");
            valid = false;
        } else if (tabValue.length > 50) {
            setTabNameError("Tab name cannot exceed 50 characters.");
            valid = false;
        } else if (
            savedLists.some(
                (item) =>
                    item.tabName?.trim().toLowerCase() === normalizedTab
            )
        ) {
            setTabNameError("This tab name already exists.");
            valid = false;
        } else {
            setTabNameError("");
        }

        return valid;
    };

    /* =========================
       CONTINUE
    ========================== */

    
    const handleContinue = () => {
        if (!validateForm()) {
            showToast("Please correct the errors before continuing.");
            return;
        }

        const list = listName.trim();
        const tab = tabName.trim();

        const savedLists = JSON.parse(
            localStorage.getItem("idCardLists") || "[]"
        );

        const newList = {
            listName: list,
            tabName: tab
        };

        savedLists.push(newList);

        // Save all created lists
        localStorage.setItem(
            "idCardLists",
            JSON.stringify(savedLists)
        );

        // Keep compatibility with your Import Data page
        localStorage.setItem(
            "idCardList",
            JSON.stringify(newList)
        );

        console.log("List created:", newList);

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
                                                    maxLength="50"
                                                    value={listName}
                                                    onChange={(event) => {
                                                        setListName(event.target.value);
                                                        if (listNameError) {
                                                            setListNameError("");
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
                                                {listNameError}
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
                                                    maxLength="10"
                                                    value={tabName}
                                                    onChange={(event) => {
                                                        setTabName(event.target.value);

                                                        if (tabNameError) {
                                                            setTabNameError("");
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
                                                 {tabNameError}
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

                                    
                                    <div className="bottom-actions">

                                        <button
                                            type="button"
                                            className="ui-btn ui-btn--secondary"
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </button>


                                        <button
                                            type="button"
                                            className="ui-btn ui-btn--primary"
                                            onClick={handleContinue}
                                        >
                                            Continue
                                            <ArrowRight size={10} />
                                            
                                        </button>

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