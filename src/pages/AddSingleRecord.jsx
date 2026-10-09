import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function AddSingleRecord() {
    const [mode, setMode] = useState("existing");

    const [storedLists, setStoredLists] = useState([]);
    const [selectedListId, setSelectedListId] = useState("");

    const [listName, setListName] = useState("");
    const [tabName, setTabName] = useState("");

    const [columnCount, setColumnCount] = useState(3);
    const [headers, setHeaders] = useState([]);

    const [selectionError, setSelectionError] =
        useState(false);

    const [listNameError, setListNameError] =
        useState(false);

    const [duplicateListNameError, setDuplicateListNameError] =
        useState(false);

    const [tabNameError, setTabNameError] =
        useState(false);

    const [columnCountError, setColumnCountError] =
        useState(false);

    const [headersError, setHeadersError] =
        useState(false);

    const [toast, setToast] = useState("");
    const [toastVisible, setToastVisible] =
        useState(false);

    /* =====================================================
       LOAD STORED LISTS
    ===================================================== */

    useEffect(() => {
        try {
            const savedLists =
                JSON.parse(
                    localStorage.getItem(
                        "idCardStoredLists"
                    )
                ) || [];

            const savedOrder =
                JSON.parse(
                    localStorage.getItem(
                        "idCardMenuOrder"
                    )
                ) || [];

            let orderedLists = savedLists;

            if (savedOrder.length) {
                orderedLists = savedOrder
                    .map((id) =>
                        savedLists.find(
                            (list) =>
                                list.id === id
                        )
                    )
                    .filter(Boolean);

                const remainingLists =
                    savedLists.filter(
                        (list) =>
                            !savedOrder.includes(
                                list.id
                            )
                    );

                orderedLists = [
                    ...orderedLists,
                    ...remainingLists
                ];
            }

            setStoredLists(orderedLists);

            if (orderedLists.length) {
                setSelectedListId(
                    orderedLists[0].id
                );
            }
        } catch (error) {
            console.error(
                "Unable to load stored lists:",
                error
            );

            setStoredLists([]);
        }
    }, []);

    /* =====================================================
       TOAST
    ===================================================== */

    const showToast = (message) => {
        setToast(message);
        setToastVisible(true);

        setTimeout(() => {
            setToastVisible(false);
        }, 2500);
    };

    /* =====================================================
       HELPERS
    ===================================================== */

    const getInitials = (name) => {
        const value = String(
            name || ""
        ).trim();

        if (!value) {
            return "A";
        }

        const words =
            value.split(/\s+/);

        if (words.length === 1) {
            return words[0]
                .charAt(0)
                .toUpperCase();
        }

        return (
            words[0].charAt(0) +
            words[1].charAt(0)
        ).toUpperCase();
    };

    /* =====================================================
       MODE
    ===================================================== */

    const handleExistingMode = () => {
        setMode("existing");
        setSelectionError(false);
    };

    const handleNewMode = () => {
        setMode("new");
        setSelectionError(false);
    };

    /* =====================================================
       SELECT EXISTING LIST
    ===================================================== */

    const handleListSelect = (id) => {
        setSelectedListId(id);
        setSelectionError(false);
    };

    /* =====================================================
       EXISTING LIST
       
       IMPORTANT:
       Existing list goes directly to StoredData.
    ===================================================== */

    const handleExistingContinue = () => {
        if (!selectedListId) {
            setSelectionError(true);

            showToast(
                "Please select a list."
            );

            return;
        }

        window.location.href =
            `/stored-data?id=${encodeURIComponent(
                selectedListId
            )}`;
    };

    /* =====================================================
       NEW LIST - BASIC VALIDATION
    ===================================================== */

     const validateBasicInformation = () => {
        let valid = true;

        const cleanListName = listName.trim();

        /* LIST NAME */
        if (!cleanListName) {
            setListNameError(true);
            setDuplicateListNameError(false);
            valid = false;
        } else {
            setListNameError(false);

            const listNameExists = storedLists.some(
                (list) =>
                    String(list.listName || "")
                        .trim()
                        .toLowerCase() ===
                    cleanListName.toLowerCase()
            );

            if (listNameExists) {
                setDuplicateListNameError(true);
                valid = false;
            } else {
                setDuplicateListNameError(false);
            }
        }

        /* TAB NAME */
        if (!tabName.trim()) {
            setTabNameError(true);
            valid = false;
        } else {
            setTabNameError(false);
        }

        return valid;
    };

    /* =====================================================
       COLUMN COUNT
    ===================================================== */

    const handleColumnCountChange = (
        event
    ) => {
        let value =
            Number(event.target.value);

        if (Number.isNaN(value)) {
            value = 1;
        }

        if (value < 1) {
            value = 1;
        }

        if (value > 20) {
            value = 20;
        }

        setColumnCount(value);
        setColumnCountError(false);

        setHeaders((currentHeaders) => {
            const updated = [...currentHeaders];

            while (
                updated.length < value
            ) {
                updated.push("");
            }

            return updated.slice(
                0,
                value
            );
        });
    };

    /* =====================================================
       HEADER CHANGE
    ===================================================== */

    const handleHeaderChange = (
        index,
        value
    ) => {
        setHeaders((currentHeaders) => {
            const updated = [
                ...currentHeaders
            ];

            updated[index] = value;

            return updated;
        });

        setHeadersError(false);
    };

    /* =====================================================
       PREPARE NEW LIST
       
       We do NOT create idCardStoredLists here.
       
       Review.jsx will create the final stored list.
    ===================================================== */

    const handleCreateList = () => {
    if (!validateBasicInformation()) {
        showToast(
            "Please complete the required fields."
        );

        return;
    }

    if (!columnCount || columnCount < 1) {
        setColumnCountError(true);

        showToast(
            "Please enter the number of columns."
        );

        return;
    }

    const cleanHeaders = headers.map((header) =>
        String(header || "").trim()
    );

    const hasEmptyHeader = cleanHeaders.some(
        (header) => !header
    );

    if (hasEmptyHeader) {
        setHeadersError(true);

        showToast(
            "Please enter all column names."
        );

        return;
    }

    // Store the NEW LIST setup temporarily.
    // No stored list is created yet.
    sessionStorage.setItem(
        "singleRecordListSetup",
        JSON.stringify({
            listName: listName.trim(),
            tabName: tabName.trim(),
            headers: cleanHeaders
        })
    );

    showToast("List information saved.");

    setTimeout(() => {
        window.location.href = "/single-record";
    }, 400);
};

    /* =====================================================
       CANCEL
    ===================================================== */

    const handleCancel = () => {
        const hasData =
            mode === "new" &&
            (
                listName.trim() ||
                tabName.trim() ||
                headers.some(
                    (header) =>
                        String(
                            header || ""
                        ).trim()
                )
            );

        if (hasData) {
            const confirmed =
                window.confirm(
                    "Are you sure you want to cancel? Your entered information will be lost."
                );

            if (!confirmed) {
                return;
            }
        }

        setListName("");
        setTabName("");
        setColumnCount(3);
        setHeaders([]);

        setListNameError(false);
        setDuplicateListNameError(false);
        setTabNameError(false);
        setColumnCountError(false);
        setHeadersError(false);

        setMode("existing");

        if (storedLists.length) {
            setSelectedListId(
                storedLists[0].id
            );
        }
    };

    /* =====================================================
       KEYBOARD
    ===================================================== */

    const handleKeyDown = (event) => {
        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();

        if (mode === "existing") {
            handleExistingContinue();
        }
    };

    /* =====================================================
       NAVIGATION
    ===================================================== */

    const goImportData = () => {
        window.location.href =
            "/importdata";
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="app">

            <Sidebar
                activePage="single-record"
            />

            <main className="main">

                <Topbar />

                <section className="content">

                    {/* BREADCRUMB */}

                    <div className="breadcrumb">

                        <button
                            onClick={
                                goImportData
                            }
                        >
                            Import Data
                        </button>

                        <span>
                            ›
                        </span>

                        <span>
                            Add Single Record
                        </span>

                    </div>


                    {/* TITLE */}

                    <h1 className="page-title">
                        Add Single Record
                    </h1>

                    <p className="page-subtitle">
                        Add one student record to an
                        existing list or create a new
                        list before adding the record.
                    </p>


                    {/* STEPS */}

                    <div className="steps">

                        <div className="step active">

                            <div className="step-number">
                                1
                            </div>

                            <div className="step-label">
                                List
                            </div>

                        </div>

                        <div className="step-line"></div>

                        <div className="step">

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


                    {/* LAYOUT */}

                    <div className="layout">

                        <div>

                            <div className="form-card">

                                <div className="form-card-header">

                                    <h2>
                                        Choose List
                                    </h2>

                                    <p>
                                        Select an existing
                                        student list or create
                                        a new list for this
                                        record.
                                    </p>

                                </div>


                                <div className="form-body">

                                    {/* =================================================
                                        LIST TYPE
                                    ================================================= */}

                                    <div className="field">

                                        <div className="field-label">

                                            <label>
                                                List Type
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <span className="field-hint">
                                                Choose an option
                                            </span>

                                        </div>


                                        <div className="list-type-options">

                                            <button
                                                type="button"
                                                className={`list-type-option ${
                                                    mode === "existing"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={
                                                    handleExistingMode
                                                }
                                            >

                                                <div className="list-type-icon">
                                                    ☷
                                                </div>

                                                <div className="list-type-content">

                                                    <strong>
                                                        Existing List
                                                    </strong>

                                                    <span>
                                                        Add the record
                                                        to a list that
                                                        already exists.
                                                    </span>

                                                </div>

                                                <div className="list-type-check">
                                                    {mode === "existing"
                                                        ? "●"
                                                        : "○"}
                                                </div>

                                            </button>


                                            <button
                                                type="button"
                                                className={`list-type-option ${
                                                    mode === "new"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={
                                                    handleNewMode
                                                }
                                            >

                                                <div className="list-type-icon">
                                                    ＋
                                                </div>

                                                <div className="list-type-content">

                                                    <strong>
                                                        Create New List
                                                    </strong>

                                                    <span>
                                                        Create a new
                                                        list before
                                                        adding the
                                                        record.
                                                    </span>

                                                </div>

                                                <div className="list-type-check">
                                                    {mode === "new"
                                                        ? "●"
                                                        : "○"}
                                                </div>

                                            </button>

                                        </div>

                                    </div>


                                    {/* =================================================
                                        EXISTING LIST
                                    ================================================= */}

                                    {mode === "existing" && (

                                        <div className="field">

                                            <div className="field-label">

                                                <label>
                                                    Select List
                                                    <span className="required">
                                                        *
                                                    </span>
                                                </label>

                                                <span className="field-hint">
                                                    Choose a stored list
                                                </span>

                                            </div>


                                            {storedLists.length === 0 ? (

                                                <div className="list-empty-state">

                                                    <div className="list-empty-icon">
                                                        +
                                                    </div>

                                                    <div className="list-empty-content">

                                                        <strong>
                                                            No lists available
                                                        </strong>

                                                        <span>
                                                            Create a new
                                                            list to add
                                                            your first
                                                            record.
                                                        </span>

                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleNewMode
                                                        }
                                                    >
                                                        Create New List
                                                    </button>

                                                </div>

                                            ) : (

                                                <div className="stored-list-selector">

                                                    {storedLists.map(
                                                        (list) => {

                                                            const selected =
                                                                selectedListId ===
                                                                list.id;

                                                            const name =
                                                                list.tabName ||
                                                                list.listName ||
                                                                "Untitled";

                                                            const count =
                                                                Array.isArray(
                                                                    list.students
                                                                )
                                                                    ? list.students.length
                                                                    : list.totalRecords ||
                                                                      0;

                                                            return (

                                                                <button
                                                                    type="button"
                                                                    key={list.id}
                                                                    className={`stored-list-option ${
                                                                        selected
                                                                            ? "selected"
                                                                            : ""
                                                                    }`}
                                                                    onClick={() =>
                                                                        handleListSelect(
                                                                            list.id
                                                                        )
                                                                    }
                                                                >

                                                                    <div className="stored-list-avatar">
                                                                        {getInitials(
                                                                            name
                                                                        )}
                                                                    </div>

                                                                    <div className="stored-list-details">

                                                                        <strong>
                                                                            {name}
                                                                        </strong>

                                                                        <span>
                                                                            {count}{" "}
                                                                            {count === 1
                                                                                ? "record"
                                                                                : "records"}
                                                                        </span>

                                                                    </div>

                                                                    <div className="stored-list-radio">
                                                                        {selected
                                                                            ? "●"
                                                                            : "○"}
                                                                    </div>

                                                                </button>
                                                            );
                                                        }
                                                    )}

                                                </div>
                                            )}


                                            <div
                                                className={`error ${
                                                    selectionError
                                                        ? "show"
                                                        : ""
                                                }`}
                                            >
                                                Please select a list.
                                            </div>

                                        </div>
                                    )}


                                    {/* =================================================
                                        NEW LIST
                                    ================================================= */}

                                    {mode === "new" && (

                                        <>

                                            {/* LIST NAME */}

                                            <div className="field">

                                                <div className="field-label">

                                                    <label htmlFor="listName">
                                                        List Name
                                                        <span className="required">
                                                            *
                                                        </span>
                                                    </label>

                                                    <span className="field-hint">
                                                        Full name
                                                    </span>

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
                                                        value={
                                                            listName
                                                        }
                                                        onChange={(event) => {
                                                            const value = event.target.value;

                                                            setListName(value);

                                                            setListNameError(false);
                                                            setDuplicateListNameError(false);
                                                        }}
                                                    />

                                                </div>

                                                <div
                                                    className={`error ${
                                                        listNameError ||
                                                        duplicateListNameError
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                >
                                                    {duplicateListNameError
                                                        ? "This list name already exists. Please choose a different name."
                                                        : "Please enter a list name."}
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

                                                    <span className="field-hint">
                                                        Short name
                                                    </span>

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
                                                        value={
                                                            tabName
                                                        }
                                                        onChange={(
                                                            event
                                                        ) => {

                                                            setTabName(
                                                                event
                                                                    .target
                                                                    .value
                                                            );

                                                            if (
                                                                event
                                                                    .target
                                                                    .value
                                                                    .trim()
                                                            ) {
                                                                setTabNameError(
                                                                    false
                                                                );
                                                            }

                                                        }}
                                                    />

                                                </div>

                                                <div
                                                    className={`error ${
                                                        tabNameError
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                >
                                                    Please enter a
                                                    tab name.
                                                </div>

                                            </div>


                                            {/* COLUMN COUNT */}

                                            <div className="field">

                                                <div className="field-label">

                                                    <label htmlFor="columnCount">
                                                        Number of Columns
                                                        <span className="required">
                                                            *
                                                        </span>
                                                    </label>

                                                    <span className="field-hint">
                                                        Number of fields
                                                    </span>

                                                </div>


                                                <div className="input-wrap">

                                                    <input
                                                        type="number"
                                                        id="columnCount"
                                                        className={`input ${
                                                            columnCountError
                                                                ? "invalid"
                                                                : ""
                                                        }`}
                                                        min="1"
                                                        max="20"
                                                        value={
                                                            columnCount
                                                        }
                                                        onChange={
                                                            handleColumnCountChange
                                                        }
                                                    />

                                                </div>


                                                <div
                                                    className={`error ${
                                                        columnCountError
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                >
                                                    Please enter a
                                                    valid number of
                                                    columns.
                                                </div>

                                            </div>


                                            {/* COLUMN NAMES */}

                                            <div className="field">

                                                <div className="field-label">

                                                    <label>
                                                        Column Names
                                                        <span className="required">
                                                            *
                                                        </span>
                                                    </label>

                                                    <span className="field-hint">
                                                        Name each field
                                                    </span>

                                                </div>


                                                <div className="new-list-columns">

                                                    {Array.from(
                                                        {
                                                            length:
                                                                columnCount
                                                        }
                                                    ).map(
                                                        (
                                                            _,
                                                            index
                                                        ) => (

                                                            <div
                                                                className="column-name-field"
                                                                key={
                                                                    index
                                                                }
                                                            >

                                                                <div className="column-number">
                                                                    {index +
                                                                        1}
                                                                </div>

                                                                <input
                                                                    type="text"
                                                                    className={`input ${
                                                                        headersError &&
                                                                        !headers[
                                                                            index
                                                                        ]?.trim()
                                                                            ? "invalid"
                                                                            : ""
                                                                    }`}
                                                                    placeholder={`e.g. ${
                                                                        index ===
                                                                        0
                                                                            ? "Roll No"
                                                                            : index ===
                                                                              1
                                                                            ? "Student Name"
                                                                            : index ===
                                                                              2
                                                                            ? "Class"
                                                                            : "Column " +
                                                                              (index +
                                                                                  1)
                                                                    }`}
                                                                    value={
                                                                        headers[
                                                                            index
                                                                        ] ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        handleHeaderChange(
                                                                            index,
                                                                            event
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                />

                                                            </div>

                                                        )
                                                    )}

                                                </div>


                                                <div
                                                    className={`error ${
                                                        headersError
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                >
                                                    Please enter all
                                                    column names.
                                                </div>

                                            </div>


                                            {/* TAB PREVIEW */}

                                            <div className="preview-box">

                                                <div className="preview-label">
                                                    Tab Preview
                                                </div>

                                                <div className="tab-preview">

                                                    <div className="tab-icon">
                                                        {getInitials(
                                                            tabName
                                                        )}
                                                    </div>

                                                    <span>
                                                        {tabName.trim() ||
                                                            "Your tab name"}
                                                    </span>

                                                </div>

                                            </div>

                                        </>
                                    )}

                                </div>


                                {/* FOOTER */}

                                <div className="form-footer">

                                    <div className="footer-note">

                                        {mode === "existing"
                                            ? "The existing list will open in Stored Data where you can add the record."
                                            : "Your column names will be used to create the single-record form."}

                                    </div>


                                    <div className="actions">

                                        <button
                                            type="button"
                                            className="ui-btn ui-btn--secondary"
                                            onClick={
                                                handleCancel
                                            }
                                        >
                                            Cancel
                                        </button>


                                        {mode === "existing" ? (

                                            <button
                                                type="button"
                                                className="ui-btn ui-btn--primary"
                                                onClick={
                                                    handleExistingContinue
                                                }
                                            >
                                                Continue
                                                <span
                                                    style={{
                                                        marginLeft:
                                                            "5px"
                                                    }}
                                                >
                                                    →
                                                </span>
                                            </button>

                                        ) : (

                                            <button
                                                type="button"
                                                className="ui-btn ui-btn--primary"
                                                onClick={
                                                    handleCreateList
                                                }
                                            >
                                                Continue
                                                <span
                                                    style={{
                                                        marginLeft:
                                                            "5px"
                                                    }}
                                                >
                                                    →
                                                </span>
                                            </button>

                                        )}

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* INFO CARD */}

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
                                        Choose a list
                                    </strong>

                                    <span>
                                        Select an existing list
                                        or create a new one.
                                    </span>

                                </div>

                            </div>


                            <div className="info-item">

                                <div className="info-number">
                                    2
                                </div>

                                <div>

                                    <strong>
                                        Define fields
                                    </strong>

                                    <span>
                                        For a new list, decide
                                        how many columns you
                                        need and name them.
                                    </span>

                                </div>

                            </div>


                            <div className="info-item">

                                <div className="info-number">
                                    3
                                </div>

                                <div>

                                    <strong>
                                        Add one record
                                    </strong>

                                    <span>
                                        Enter the student's
                                        information and review
                                        it before saving.
                                    </span>

                                </div>

                            </div>

                        </aside>

                    </div>

                </section>

            </main>


            <div
                className={`toast ${
                    toastVisible
                        ? "show"
                        : ""
                }`}
                id="toast"
            >
                {toast}
            </div>

        </div>
    );
}

export default AddSingleRecord;