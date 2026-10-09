import { useEffect, useRef, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import '../styles/review.css'
function Review() {

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


    /* =====================================================
       EDIT STUDENT
    ===================================================== */

    const openEditModal = (index) => {
        const student = students[index];

        setEditingIndex(index);

        setEditValues(
            headers.map(
                (_, columnIndex) =>
                    student[columnIndex] || ""
            )
        );
    };


    /* =====================================================
       SAVE EDIT
    ===================================================== */

    const saveEdit = () => {
        if (editingIndex === null) {
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
       CLOSE EDIT
    ===================================================== */

    const closeEditModal = () => {
        setEditingIndex(null);
        setEditValues([]);
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
                                            className="secondary-btn"
                                            id="goImportBtn"
                                            onClick={goBackToImport}
                                        >
                                            ← Back to Import
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
                                    className="back-btn"
                                    id="backBtn"
                                    onClick={goBackToImport}
                                >
                                    ← Back
                                </button>


                                <button
                                    className="save-btn"
                                    id="saveBtn"
                                    onClick={saveStudentList}
                                >
                                    Save Student List

                                    <span>
                                        →
                                    </span>

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
                    editingIndex !== null
                        ? "show"
                        : ""
                }`}
                id="editModal"
                onClick={(event) => {

                    if (
                        event.target === event.currentTarget
                    ) {
                        closeEditModal();
                    }

                }}
            >

                <div className="edit-modal">


                    <div className="modal-header">

                        <div>

                            <h3>
                                Edit Student
                            </h3>

                            <p>
                                Update the student information.
                            </p>

                        </div>


                        <button
                            className="modal-close"
                            id="closeModal"
                            onClick={closeEditModal}
                        >
                            ×
                        </button>

                    </div>


                    <div
                        className="edit-fields"
                        id="editFields"
                    >

                        {headers.map(
                            (header, columnIndex) => (

                                <div
                                    className="edit-field"
                                    key={columnIndex}
                                >

                                    <label>
                                        {header || "Column"}
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            editValues[columnIndex] || ""
                                        }
                                        onChange={(event) => {

                                            setEditValues(
                                                (currentValues) => {

                                                    const updatedValues =
                                                        [...currentValues];

                                                    updatedValues[
                                                        columnIndex
                                                    ] =
                                                        event.target.value;

                                                    return updatedValues;

                                                }
                                            );

                                        }}
                                    />

                                </div>

                            )
                        )}

                    </div>


                    <div className="modal-actions">

                        <button
                            className="back-btn"
                            id="cancelEdit"
                            onClick={closeEditModal}
                        >
                            Cancel
                        </button>


                        <button
                            className="save-btn"
                            id="saveEdit"
                            onClick={saveEdit}
                        >
                            Save Changes
                        </button>

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
                    </strong>
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