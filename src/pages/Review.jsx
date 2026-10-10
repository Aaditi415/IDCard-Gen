import { useEffect, useRef, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import '../styles/review.css'
import { ArrowLeft, ArrowRight } from "lucide-react";
function Review() {
    const [editErrors, setEditErrors] = useState({});
    const [deleteIndex, setDeleteIndex] = useState(null);

    /* =====================================================
       CURRENT LIST
    ===================================================== */

    const [savedList] = useState(() => {
        try {
            return JSON.parse(
                localStorage.getItem("idCardList")
            );
        } catch {
            return null;
        }
    });


    /* =====================================================
       IMPORTED DATA
    ===================================================== */

    const [savedImport] = useState(() => {
        try {
            return JSON.parse(
                localStorage.getItem("idCardImportedData")
            );
        } catch {
            return null;
        }
    });


    /* =====================================================
       DATA
    ===================================================== */

    const [headers, setHeaders] = useState(() => {
        if (
            savedImport &&
            Array.isArray(savedImport.headers)
        ) {
            return [...savedImport.headers];
        }

        return [];
    });


    const [students, setStudents] = useState(() => {
        if (
            savedImport &&
            Array.isArray(savedImport.rows)
        ) {
            return savedImport.rows.map((row) => [...row]);
        }

        return [];
    });


    const [removedCount, setRemovedCount] = useState(() => {
        if (
            savedImport &&
            typeof savedImport.removedCount === "number"
        ) {
            return savedImport.removedCount;
        }

        return 0;
    });


    const [editingIndex, setEditingIndex] = useState(null);

    const [editValues, setEditValues] = useState([]);

    const [toast, setToast] = useState("");

    const [toastVisible, setToastVisible] = useState(false);

    const toastTimerRef = useRef(null);


    /* =====================================================
       TOAST
    ===================================================== */

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


    /* =====================================================
       CLEANUP
    ===================================================== */

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current);
            }
        };
    }, []);


    /* =====================================================
       SAVE IMPORTED DATA
    ===================================================== */

    const saveImportedData = (
        currentStudents = students,
        currentRemovedCount = removedCount
    ) => {
        localStorage.setItem(
            "idCardImportedData",
            JSON.stringify({
                headers: headers,
                rows: currentStudents,
                removedCount: currentRemovedCount
            })
        );
    };

    
    
    const getFieldType = (header) => {
        const name = String(header || "")
            .trim()
            .toLowerCase()
            .replace(/[_-]+/g, " ")
            .replace(/\s+/g, " ");

        if (/\b(dob|date of birth|birth date|birthdate)\b/.test(name)) {
            return "date";
        }

        if (/\b(email|email address)\b/.test(name)) {
            return "email";
        }

        if (/\b(phone|mobile|contact number|phone number|mobile number)\b/.test(name)) {
            return "tel";
        }

        if (/\b(website|website url|url)\b/.test(name)) {
            return "url";
        }

        if (/\b(age|quantity|marks|score)\b/.test(name)) {
            return "number";
        }

        return "text";
    };

    const getFieldLimits = (header) => {
        const name = String(header || "").trim().toLowerCase();

        if (/\b(email|email address)\b/.test(name)) {
            return { minLength: 5, maxLength: 254 };
        }

        if (/\b(phone|mobile|contact number|phone number|mobile number)\b/.test(name)) {
            return { minLength: 7, maxLength: 15 };
        }

        if (/\b(name|student name|father name|mother name)\b/.test(name)) {
            return { minLength: 2, maxLength: 100 };
        }

        if (/\b(address)\b/.test(name)) {
            return { minLength: 5, maxLength: 250 };
        }

        return { minLength: 1, maxLength: 100 };
    };

    const validateField = (header, value) => {
        const type = getFieldType(header);
        const name = String(header || "This field").trim();
        const input = String(value ?? "").trim();

        // All fields required.
        if (!input) {
            return `${name} is required.`;
        }

        if (type === "date") {
            let dateValue = input;

            // Also accept common typed date formats:
            // 7 10 2026, 07/10/2026, 07-10-2026.
            const match = input.match(
                /^(\d{1,2})[\/\s-](\d{1,2})[\/\s-](\d{4})$/
            );

            if (match) {
                const [, first, second, year] = match;

                // Interpret these formats as DD/MM/YYYY.
                dateValue = `${year}-${second.padStart(2, "0")}-${first.padStart(2, "0")}`;
            }

            const isoMatch = dateValue.match(
                /^(\d{4})-(\d{2})-(\d{2})$/
            );

            if (!isoMatch) {
                return "Enter date as DD/MM/YYYY, for example 07/10/2026.";
            }

            const [, year, month, day] = isoMatch;
            const date = new Date(
                Number(year),
                Number(month) - 1,
                Number(day)
            );

            if (
                date.getFullYear() !== Number(year) ||
                date.getMonth() !== Number(month) - 1 ||
                date.getDate() !== Number(day)
            ) {
                return "Enter a real calendar date.";
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (date > today) {
                return "Date of birth cannot be in the future.";
            }

            return "";
        }

        const { minLength, maxLength } = getFieldLimits(header);

        if (input.length < minLength) {
            return `${name} must contain at least ${minLength} characters.`;
        }

        if (input.length > maxLength) {
            return `${name} cannot exceed ${maxLength} characters.`;
        }

        if (type === "email") {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
                return "Enter a valid email address.";
            }
        }

        if (type === "tel") {
            const digits = input.replace(/\D/g, "");

            if (digits.length < 7 || digits.length > 15) {
                return "Phone number must contain 7–15 digits.";
            }
        }

        if (type === "number") {
            if (!/^\d+(\.\d+)?$/.test(input)) {
                return `${name} must be a valid number.`;
            }
        }

        if (type === "url") {
            try {
                const url = new URL(input);

                if (!["http:", "https:"].includes(url.protocol)) {
                    return "URL must start with http:// or https://.";
                }
            } catch {
                return "Enter a valid URL, including https://.";
            }
        }

        return "";
    };

    /* =====================================================
       EDIT STUDENT
    ===================================================== */

    const openEditModal = (index) => {
    const student = students[index];

        setEditingIndex(index);
        setEditValues(
            headers.map((_, columnIndex) =>
                student[columnIndex] ?? ""
            )
        );
        setEditErrors({});
    };

    const closeEditModal = () => {
        setEditingIndex(null);
        setEditValues([]);
        setEditErrors({});
    };


    /* =====================================================
       SAVE EDIT
    ===================================================== */

    const saveEdit = () => {
        if (editingIndex === null) {
            return;
        }
        const errors = {};

        headers.forEach((header, index) => {
            const error = validateField(header, editValues[index]);

            if (error) {
                errors[index] = error;
            }
        });

        setEditErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        const updatedStudents = students.map(
            (student, index) => {
                if (index === editingIndex) {
                    return editValues.map(
                        (value) => value.trim()
                    );
                }

                return student;
            }
        );

        setStudents(updatedStudents);

        setEditingIndex(null);

        setEditValues([]);

        saveImportedData(
            updatedStudents,
            removedCount
        );

        showToast(
            "Student information updated."
        );
    };


 


    /* =====================================================
       DELETE STUDENT
    ===================================================== */



    const [studentToDelete, setStudentToDelete] = useState(null);

    const deleteStudent = (index) => {
        setStudentToDelete({
            index,
            name: students[index]?.[0] || "this student",
        });
    };

    const cancelDelete = () => {
        setStudentToDelete(null);
    };

    const confirmDeleteStudent = () => {
        if (studentToDelete === null) return;

        const { index, name } = studentToDelete;

        const updatedStudents = students.filter(
            (_, studentIndex) => studentIndex !== index
        );

        const newRemovedCount = removedCount + 1;

        setStudents(updatedStudents);
        setRemovedCount(newRemovedCount);
        setStudentToDelete(null);

        saveImportedData(updatedStudents, newRemovedCount);

        showToast(`${name} deleted successfully.`);
    };


    /* =====================================================
       FINAL SAVE
    ===================================================== */

    const saveStudentList = () => {

    if (!students.length) {

        showToast(
            "There are no student records to save."
        );

        return;
    }


    /* =====================================================
       GET EXISTING STORED LISTS
    ===================================================== */

    let storedLists = [];

    try {

        storedLists =
            JSON.parse(
                localStorage.getItem(
                    "idCardStoredLists"
                )
            ) || [];

    } catch {

        storedLists = [];

    }


    if (!Array.isArray(storedLists)) {
        storedLists = [];
    }


    /* =====================================================
       GENERATE NEXT LETTER
    ===================================================== */

    const shortName =
        String.fromCharCode(
            65 + storedLists.length
        );


    /* =====================================================
       CREATE MASTER LIST
    ===================================================== */

    const masterListId =
        "master_" + Date.now();


    const storedList = {

        id:
            masterListId,

        shortName:
            shortName,

        listName:
            savedList
                ? savedList.listName
                : "Untitled List",

        tabName:
            savedList
                ? savedList.tabName
                : "List " + shortName,

        headers:
            [...headers],

        students:
            students.map(
                row => [...row]
            ),

        totalRecords:
            students.length,

        validRecords:
            students.length,

        removedRecords:
            removedCount,

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };


    /* =====================================================
       SAVE TO EXISTING STORED LISTS
    ===================================================== */

    const updatedStoredLists = [
        ...storedLists,
        storedList
    ];


    localStorage.setItem(
        "idCardStoredLists",
        JSON.stringify(
            updatedStoredLists
        )
    );


    /* =====================================================
       SAVE AS MASTER LIST
       ---------------------------------------------
       This is what StudentForm verification uses.
    ===================================================== */

    let masterLists = [];

    try {

        masterLists =
            JSON.parse(
                localStorage.getItem(
                    "idCardMasterLists"
                )
            ) || [];

    } catch {

        masterLists = [];

    }


    if (!Array.isArray(masterLists)) {
        masterLists = [];
    }


    /* =====================================================
       REMOVE OLD VERSION OF SAME MASTER LIST
    ===================================================== */

    const updatedMasterLists = [
        ...masterLists.filter(
            master =>
                master.id !==
                masterListId
        ),
        storedList
    ];


    localStorage.setItem(
        "idCardMasterLists",
        JSON.stringify(
            updatedMasterLists
        )
    );


    /* =====================================================
       KEEP OLD FINAL LIST
    ===================================================== */

    localStorage.setItem(
        "idCardFinalList",
        JSON.stringify(
            storedList
        )
    );


    /* =====================================================
       TOAST
    ===================================================== */

    showToast(
        "Student list saved successfully."
    );


    /* =====================================================
       GO TO STORED DATA
    ===================================================== */

    setTimeout(() => {

        window.location.href =
            "/stored-data?id=" +
            storedList.id;

    }, 800);

};

    /* =====================================================
       NAVIGATION
    ===================================================== */




    const golistform = () => {
        window.location.href = "/listform";
    };


    const goBackToImport = () => {
        window.location.href = "/importdata";
    };


    /* =====================================================
       RENDER
    ===================================================== */

    const hasData =
        headers.length > 0 &&
        students.length > 0;


    return (
        <>
            {/* =====================================================
                SIDEBAR
            ===================================================== */}

            <Sidebar activePage="review" />


            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="main">

                {/* TOPBAR */}

                <Topbar />


                {/* CONTENT */}

                <section className="content">

                    {/* BREADCRUMB */}

                    <div className="breadcrumb">

                        <button
                            id="importdataBtn"
                            onClick={golistform}
                        >
                            Import Data
                        </button>

                        <span>
                            ›
                        </span>

                        <span>
                            Review Student Data
                        </span>

                    </div>


                    {/* HEADER */}

                    <h1 className="page-title">
                        Review Student Data
                    </h1>

                    <p className="page-subtitle">
                        Review your imported student records before
                        saving them to this list. You can edit or
                        remove individual records.
                    </p>


                    {/* STEPS */}

                    <div className="steps">

                        <div className="step completed">

                            <div className="step-number">
                                ✓
                            </div>

                            <div className="step-label">
                                Create List
                            </div>

                        </div>


                        <div className="step-line completed"></div>


                        <div className="step completed">

                            <div className="step-number">
                                ✓
                            </div>

                            <div className="step-label">
                                Import Data
                            </div>

                        </div>


                        <div className="step-line completed"></div>


                        <div className="step active">

                            <div className="step-number">
                                3
                            </div>

                            <div className="step-label">
                                Review
                            </div>

                        </div>

                    </div>


                    {/* CURRENT LIST */}

                    <div className="list-info">

                        <div className="list-info-left">

                            <div className="list-info-label">
                                Importing into
                            </div>

                            <div
                                className="list-name"
                                id="listName"
                            >
                                {savedList?.listName || ""}
                            </div>

                        </div>


                        <div className="list-info-right">

                            <span
                                className="tab-badge"
                                id="tabName"
                            >
                                {savedList?.tabName || ""}
                            </span>

                        </div>

                    </div>


                    {/* PAGE GRID */}

                    <div className="page-grid">


                        <div>

                            {/* REVIEW CARD */}

                            <div className="review-card">


                                {/* HEADER */}

                                <div className="review-header">

                                    <div>

                                        <h3>
                                            Review Data
                                        </h3>

                                        <p>
                                            Check every record before saving.
                                        </p>

                                    </div>


                                    <div className="review-count">

                                        <span id="recordCount">

                                            {students.length}{" "}

                                            {students.length === 1
                                                ? "record"
                                                : "records"}

                                        </span>

                                    </div>

                                </div>


                                {/* TABLE */}

                                {hasData && (

                                    <div className="review-table-wrap">

                                        <table>

                                            <thead>

                                                <tr>

                                                    {headers.map(
                                                        (header, index) => (

                                                            <th
                                                                key={index}
                                                            >
                                                                {header || "Column"}
                                                            </th>

                                                        )
                                                    )}

                                                    <th className="actions-cell">
                                                        Actions
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {students.map(
                                                    (student, rowIndex) => (

                                                        <tr
                                                            key={rowIndex}
                                                        >

                                                            {headers.map(
                                                                (_, columnIndex) => (

                                                                    <td
                                                                        key={columnIndex}
                                                                        className={
                                                                            columnIndex === 0
                                                                                ? "student-cell"
                                                                                : ""
                                                                        }
                                                                    >
                                                                        {student[columnIndex] || "—"}
                                                                    </td>

                                                                )
                                                            )}


                                                            <td className="actions-cell">

                                                                <div className="row-actions">

                                                                    <button
                                                                        className="edit-btn"
                                                                        onClick={() =>
                                                                            openEditModal(
                                                                                rowIndex
                                                                            )
                                                                        }
                                                                    >
                                                                        Edit
                                                                    </button>


                                                                    <button
                                                                        className="delete-btn"
                                                                        onClick={() =>
                                                                            deleteStudent(
                                                                                rowIndex
                                                                            )
                                                                        }
                                                                    >
                                                                        Delete
                                                                    </button>

                                                                </div>

                                                            </td>

                                                        </tr>

                                                    )
                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                )}


                                {/* EMPTY STATE */}

                                {!hasData && (

                                    <div
                                        className="empty-state"
                                        id="emptyState"
                                    >

                                        <div className="empty-icon">
                                            !
                                        </div>

                                        <h3>
                                            No student data found
                                        </h3>

                                        <p>
                                            Go back to Import Data and
                                            upload your student file.
                                        </p>

                                        <button
                                            className="ui-btn ui-btn--primary"
                                            id="goImportBtn"
                                            onClick={goBackToImport}
                                        >
                                            <ArrowRight size={10}/> Back to Import
                                        </button>

                                    </div>

                                )}

                            </div>


                            {/* SUMMARY */}

                            <div className="review-summary">


                                <div className="review-summary-item">

                                    <span>
                                        Total Students
                                    </span>

                                    <strong id="totalRecords">
                                        {students.length}
                                    </strong>

                                </div>


                                <div className="review-summary-item">

                                    <span>
                                        Ready
                                    </span>

                                    <strong
                                        id="validRecords"
                                        className="success-text"
                                    >
                                        {students.length}
                                    </strong>

                                </div>


                                <div className="review-summary-item">

                                    <span>
                                        Removed
                                    </span>

                                    <strong
                                        id="removedRecords"
                                        className="danger-text"
                                    >
                                        {removedCount}
                                    </strong>

                                </div>

                            </div>


                            {/* BOTTOM ACTIONS */}

                            <div className="bottom-actions">

                                <button
                                    className="ui-btn ui-btn--secondary"
                                    id="backBtn"
                                    onClick={goBackToImport}
                                >
                                    <ArrowLeft size={10} /> Back
                                </button>


                                <button
                                    className="ui-btn ui-btn--primary"
                                    id="saveBtn"
                                    onClick={saveStudentList}
                                >
                                    Save Student List

                                    <ArrowRight size={10} />

                                </button>

                            </div>

                        </div>


                        {/* =================================================
                            RIGHT COLUMN
                        ================================================= */}

                        

                            {/* HOW IT WORKS */}

                           
                            <aside className="info-card">
                                <div className="info-card-heading">
                                    <div className="info-heading-icon">i</div>

                                    <div>
                                        <h3>How Review &amp; Save Works</h3>
                                        <p>Follow these steps before generating ID cards.</p>
                                    </div>
                                </div>

                                <div className="info-divider" />

                                <div className="info-item">
                                    <div className="info-number">1</div>

                                    <div>
                                        <strong>Review Records</strong>
                                        <span>
                                            Check all imported student records and make sure
                                            the information is correct.
                                        </span>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <div className="info-number">2</div>

                                    <div>
                                        <strong>Edit Information</strong>
                                        <span>
                                            Use the Edit action to update or correct student
                                            information before generating ID cards.
                                        </span>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <div className="info-number">3</div>

                                    <div>
                                        <strong>Remove Records</strong>
                                        <span>
                                            Delete student records you don't want to include.
                                            Removed records are tracked automatically.
                                        </span>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <div className="info-number">4</div>

                                    <div>
                                        <strong>Save Your List</strong>
                                        <span>
                                            Save the final reviewed student list and continue
                                            to the ID card generation process.
                                        </span>
                                    </div>
                                </div>

                                <div className="info-tip">
                                    <strong>Tip</strong>
                                    <p>
                                        Double-check student names, roll numbers, and other
                                        details before saving your final list.
                                    </p>
                                </div>
                            </aside>



                    </div>

                </section>

            </main>


            {/* =====================================================
                EDIT MODAL
            ===================================================== */}

            <div
                className={`modal-overlay ${
                    editingIndex !== null ? "show" : ""
                }`}
                id="editModal"
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        closeEditModal();
                    }
                }}
                aria-hidden={editingIndex === null}
            >
                <div
                    className="edit-modal modern-edit-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="editModalTitle"
                >
                    {/* Header */}
                    <div className="modern-modal-header">
                        <div className="modern-modal-heading">
                            <div className="modern-modal-icon">
                                ✎
                            </div>

                            <div>
                                <span className="modern-modal-eyebrow">
                                    STUDENT RECORD
                                </span>

                                <h3 id="editModalTitle">
                                    Edit Student Record
                                </h3>

                                <p>
                                    Update the details below and save your changes.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="modern-modal-close"
                            onClick={closeEditModal}
                            aria-label="Close edit dialog"
                        >
                            ×
                        </button>
                    </div>

                    {/* Record information */}
                    <div className="modern-record-strip">
                        <span className="modern-record-dot" />

                        <span>
                            Editing record
                        </span>

                        <strong>
                            #{editingIndex !== null ? editingIndex + 1 : "—"}
                        </strong>

                        <span className="modern-record-separator">·</span>

                        <span>
                            {headers.length} fields
                        </span>
                    </div>

                    {/* Form fields */}
                    <div className="modern-edit-fields">
                        {headers.map((header, columnIndex) => (
                            <div
                                className="modern-edit-field"
                                key={columnIndex}
                            >
                                <label htmlFor={`edit-field-${columnIndex}`}>
                                    {header || `Column ${columnIndex + 1}`}
                                    <span className="modern-field-index">
                                        {String(columnIndex + 1).padStart(2, "0")}
                                    </span>
                                </label>

                                
                                <input
                                    id={`edit-field-${columnIndex}`}
                                    type={getFieldType(header)}
                                    value={editValues[columnIndex] ?? ""}
                                    placeholder={
                                        getFieldType(header) === "date"
                                            ? "Select date of birth"
                                            : `Enter ${String(header || "value").toLowerCase()}`
                                    }
                                    max={getFieldType(header) === "date"
                                        ? new Date().toISOString().slice(0, 10)
                                        : undefined
                                    }
                                    aria-invalid={Boolean(editErrors[columnIndex])}
                                    aria-describedby={
                                        editErrors[columnIndex]
                                            ? `edit-error-${columnIndex}`
                                            : undefined
                                    }
                                    onChange={(event) => {
                                        const updatedValues = [...editValues];
                                        updatedValues[columnIndex] = event.target.value;
                                        setEditValues(updatedValues);

                                        setEditErrors((current) => ({
                                            ...current,
                                            [columnIndex]: validateField(
                                                header,
                                                event.target.value
                                            ),
                                        }));
                                    }}
                                />

                                {editErrors[columnIndex] && (
                                    <span
                                        className="modern-field-error"
                                        id={`edit-error-${columnIndex}`}
                                        role="alert"
                                    >
                                        {editErrors[columnIndex]}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="modern-modal-footer">
                        <span className="modern-modal-note">
                            Changes apply when you save.
                        </span>

                        <div className="modern-modal-actions">
                            <button
                                type="button"
                                className="modern-cancel-btn"
                                onClick={closeEditModal}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="modern-save-btn"
                                onClick={saveEdit}
                            >
                                <span>Save Changes</span>
                                <span className="modern-save-arrow">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* DELETE CONFIRMATION MODAL */}

            <div
                className={`delete-overlay ${
                    studentToDelete !== null ? "show" : ""
                }`}
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        cancelDelete();
                    }
                }}
                aria-hidden={studentToDelete === null}
            >
                <div
                    className="delete-modal"
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="deleteModalTitle"
                    aria-describedby="deleteModalDescription"
                >
                    <div className="delete-modal-icon">!</div>

                    <h3 id="deleteModalTitle">
                        Delete student record?
                    </h3>

                    <p id="deleteModalDescription">
                        Are you sure you want to delete{" "} 
                        <strong>
                            {studentToDelete?.name || "this student"}
                        </strong> record
                        ? This action cannot be undone.
                    </p>

                    <div className="delete-modal-actions">
                        <button
                            type="button"
                            className="delete-cancel-btn"
                            onClick={cancelDelete}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="delete-confirm-btn"
                            onClick={confirmDeleteStudent}
                        >
                            Delete Record
                        </button>
                    </div>
                </div>
            </div>


            {/* TOAST */}

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

        </>
    );
}

export default Review;