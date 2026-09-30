import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function StoredData() {
    const [storedLists, setStoredLists] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [showForm, setShowForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [formData, setFormData] = useState([]);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);

    const [showDeleteListModal, setShowDeleteListModal] =
    useState(false);


    const [toast, setToast] = useState("");

    const formRef = useRef(null);

    const recordsPerPage = 10;

    /* =====================================================
       GET SELECTED ID
    ===================================================== */

    const params = new URLSearchParams(
        window.location.search
    );

    const selectedId = params.get("id");


    /* =====================================================
       LOAD STORED LISTS
    ===================================================== */

    const loadStoredLists = () => {
        try {
            const stored =
                JSON.parse(
                    localStorage.getItem(
                        "idCardStoredLists"
                    )
                ) || [];

            setStoredLists(stored);

        } catch (error) {
            console.error(
                "Failed to load stored data:",
                error
            );

            setStoredLists([]);
        }
    };


    useEffect(() => {
        loadStoredLists();
    }, []);


    /* =====================================================
       SELECTED LIST
    ===================================================== */

    const selectedList = useMemo(() => {
        return storedLists.find(
            (list) => list.id === selectedId
        );
    }, [storedLists, selectedId]);


    /* =====================================================
       CURRENT RECORDS
    ===================================================== */

    const students = selectedList?.students || [];

    const totalPages = Math.max(
        1,
        Math.ceil(
            students.length / recordsPerPage
        )
    );


    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);


    const startIndex =
        (currentPage - 1) *
        recordsPerPage;

    const endIndex =
        startIndex + recordsPerPage;

    const currentRecords =
        students.slice(
            startIndex,
            endIndex
        );


    /* =====================================================
       FORM AUTO SCROLL + FOCUS
    ===================================================== */

    useEffect(() => {
        if (!showForm) {
            return;
        }

        const timer = setTimeout(() => {
            if (!formRef.current) {
                return;
            }

            /*
             * Scroll to the form
             */
            formRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            /*
             * Focus first input
             */
            const firstInput =
                formRef.current.querySelector(
                    "input"
                );

            if (firstInput) {
                firstInput.focus();
            }
        }, 50);

        return () => {
            clearTimeout(timer);
        };
    }, [showForm]);


    /* =====================================================
       PAGE NUMBERS
    ===================================================== */

    const pageNumbers = [];

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {
        pageNumbers.push(page);
    }


    /* =====================================================
       NAVIGATION
    ===================================================== */

    const goDashboard = () => {
        window.location.href = "/";
    };


    /* =====================================================
       TOAST
    ===================================================== */

    const showToast = (message) => {
        setToast(message);

        setTimeout(() => {
            setToast("");
        }, 2500);
    };


    /* =====================================================
       SAVE ALL STORED LISTS
    ===================================================== */

    const saveStoredLists = (updatedLists) => {
        localStorage.setItem(
            "idCardStoredLists",
            JSON.stringify(updatedLists)
        );

        setStoredLists(updatedLists);
    };


    /* =====================================================
       ADD NEW DATA
    ===================================================== */

    const handleAdd = () => {
        if (!selectedList) {
            return;
        }

        setEditingIndex(null);

        /*
         * Keep inputs empty.
         *
         * The first existing record will be used
         * only as a placeholder.
         */
        setFormData(
            selectedList.headers.map(() => "")
        );

        setShowForm(true);
    };


    /* =====================================================
       EDIT DATA
    ===================================================== */

    const handleEdit = (actualIndex) => {
        if (!selectedList) {
            return;
        }

        setEditingIndex(actualIndex);

        setFormData([
            ...(selectedList.students[
                actualIndex
            ] || [])
        ]);

        setShowForm(true);
    };


    /* =====================================================
       FORM CHANGE
    ===================================================== */

    const handleFormChange = (
        index,
        value
    ) => {
        setFormData((previous) => {
            const updated = [
                ...previous
            ];

            updated[index] = value;

            return updated;
        });
    };


    /* =====================================================
       SAVE DATA
    ===================================================== */

    const handleSave = () => {
        if (!selectedList) {
            return;
        }

        const updatedStudents = [
            ...(selectedList.students || [])
        ];

        /*
         * ADD
         */
        if (editingIndex === null) {
            updatedStudents.push(
                formData
            );
        }

        /*
         * EDIT
         */
        else {
            updatedStudents[
                editingIndex
            ] = formData;
        }

        const updatedList = {
            ...selectedList,

            students:
                updatedStudents,

            totalRecords:
                updatedStudents.length,

            validRecords:
                updatedStudents.length
        };

        const updatedLists =
            storedLists.map((list) =>
                list.id === selectedId
                    ? updatedList
                    : list
            );

        saveStoredLists(
            updatedLists
        );

        /*
         * Close form
         */
        setShowForm(false);
        setEditingIndex(null);
        setFormData([]);

        /*
         * After adding a record,
         * move to the last page.
         */
        if (
            editingIndex === null
        ) {
            setCurrentPage(
                Math.ceil(
                    updatedStudents.length /
                    recordsPerPage
                )
            );
        }

        showToast(
            editingIndex === null
                ? "Record added successfully."
                : "Record updated successfully."
        );
    };


    /* =====================================================
       OPEN DELETE MODAL
    ===================================================== */

    const handleDelete = (actualIndex) => {
        if (!selectedList) {
            return;
        }

        setDeleteIndex(actualIndex);
        setShowDeleteModal(true);
    };


    /* =====================================================
       CONFIRM DELETE
    ===================================================== */

    const confirmDelete = () => {
        if (
            !selectedList ||
            deleteIndex === null
        ) {
            return;
        }

        const updatedStudents = [
            ...(selectedList.students || [])
        ];

        /*
         * Remove selected record
         */
        updatedStudents.splice(
            deleteIndex,
            1
        );

        /*
         * Preserve previous removed count
         */
        const previousRemovedRecords =
            Number(
                selectedList.removedRecords || 0
            );

        const updatedList = {
            ...selectedList,

            students:
                updatedStudents,

            /*
             * Total decreases
             */
            totalRecords:
                updatedStudents.length,

            /*
             * Valid decreases
             */
            validRecords:
                updatedStudents.length,

            /*
             * Removed increases
             */
            removedRecords:
                previousRemovedRecords + 1
        };

        const updatedLists =
            storedLists.map((list) =>
                list.id === selectedId
                    ? updatedList
                    : list
            );

        /*
         * Save to localStorage
         */
        saveStoredLists(
            updatedLists
        );

        /*
         * Recalculate pages
         */
        const newTotalPages =
            Math.max(
                1,
                Math.ceil(
                    updatedStudents.length /
                    recordsPerPage
                )
            );

        /*
         * If current page no longer exists,
         * move to the last page.
         */
        if (
            currentPage >
            newTotalPages
        ) {
            setCurrentPage(
                newTotalPages
            );
        }

        /*
         * Close modal
         */
        setShowDeleteModal(false);
        setDeleteIndex(null);

        showToast(
            "Record deleted successfully."
        );
    };


    /* =====================================================
       CANCEL DELETE
    ===================================================== */

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setDeleteIndex(null);
    };


    /* =====================================================
       CANCEL FORM
    ===================================================== */

    const handleCancel = () => {
        setShowForm(false);
        setEditingIndex(null);
        setFormData([]);
    };




    /* =====================================================
    DELETE ENTIRE LIST
    ===================================================== */

    const handleDeleteList = () => {
        if (!selectedList) {
            return;
        }

        setShowDeleteListModal(true);
    };


    /* =====================================================
    CONFIRM DELETE ENTIRE LIST
    ===================================================== */

    const confirmDeleteList = () => {
        if (!selectedList) {
            return;
        }

        const updatedLists = storedLists.filter(
            (list) => list.id !== selectedId
        );

        localStorage.setItem(
            "idCardStoredLists",
            JSON.stringify(updatedLists)
        );

        /*
        * Also remove any final-list reference
        * if it points to this list.
        */
        try {
            const finalList = JSON.parse(
                localStorage.getItem("idCardFinalList")
            );

            if (finalList?.id === selectedId) {
                localStorage.removeItem(
                    "idCardFinalList"
                );
            }
        } catch (error) {
            console.error(
                "Failed to clear final list:",
                error
            );
        }

        setShowDeleteListModal(false);

        /*
        * Redirect to dashboard after
        * deleting the complete list.
        */
        window.location.href = "/";
    };


    /* =====================================================
    CANCEL DELETE LIST
    ===================================================== */

    const cancelDeleteList = () => {
        setShowDeleteListModal(false);
    };

    /* =====================================================
       NO LIST SELECTED
    ===================================================== */

    if (!selectedList) {
        return (
            <div className="app">

                <Sidebar
                    activePage="stored-data"
                />

                <main className="main">

                    <Topbar />

                    <section className="content">

                        <div className="breadcrumb">

                            <button
                                onClick={
                                    goDashboard
                                }
                            >
                                Stored Data
                            </button>

                            <span>
                                ›
                            </span>

                            <span>
                                Data
                            </span>

                        </div>


                        <h1 className="page-title">
                            Stored Data
                        </h1>


                        <p className="page-subtitle">
                            Select a stored list from
                            the sidebar to manage its
                            records.
                        </p>


                        <div className="empty">
                            Select a stored list to
                            continue.
                        </div>

                    </section>

                </main>

            </div>
        );
    }


    return (
        <div className="app">

            {/* =====================================================
                SIDEBAR
            ===================================================== */}

            <Sidebar
                activePage="stored-data"
            />


            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="main">

                <Topbar />

                <section className="content">

                    {/* =================================================
                        BREADCRUMB
                    ================================================= */}

                    <div className="breadcrumb">

                        <button
                            onClick={
                                goDashboard
                            }
                        >
                            Stored Data
                        </button>

                        <span>
                            ›
                        </span>

                        <span>
                            {selectedList.tabName ||
                                "Data"}
                        </span>

                    </div>


                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="stored-page-header">

                        <div>

                            <h1 className="page-title">
                                {selectedList.listName}
                            </h1>

                            <p className="page-subtitle">
                                Manage student records,
                                edit existing data or add
                                new records.
                            </p>

                        </div>


                        <div className="stored-header-actions">

                            <button
                                className="delete-list-btn"
                                onClick={handleDeleteList}
                            >
                                <span>
                                    ×
                                </span>

                                Delete List
                            </button>

                            <button
                                className="add-record-btn"
                                onClick={handleAdd}
                            >
                                <span>
                                    ＋
                                </span>

                                Add New Data
                            </button>

                        </div>

                    </div>


                    {/* =================================================
                        LIST INFO
                    ================================================= */}

                    <div className="list-info">

                        <div className="list-info-left">

                            <div className="list-info-label">
                                Stored List
                            </div>

                            <div className="list-name">
                                {selectedList.listName}
                            </div>

                        </div>


                        <div className="list-info-right">

                            <span className="tab-badge">
                                {selectedList.tabName}
                            </span>

                        </div>

                    </div>


                    {/* =================================================
                        STATISTICS
                    ================================================= */}

                    <div className="stats">

                        <div className="stat-card">

                            <div className="stat-label">
                                Total Records
                            </div>

                            <div className="stat-value">
                                {
                                    selectedList.totalRecords ??
                                    students.length
                                }
                            </div>

                        </div>


                        <div className="stat-card">

                            <div className="stat-label">
                                Valid Records
                            </div>

                            <div className="stat-value success-text">
                                {
                                    selectedList.validRecords ??
                                    students.length
                                }
                            </div>

                        </div>


                        <div className="stat-card">

                            <div className="stat-label">
                                Removed Records
                            </div>

                            <div className="stat-value danger-text">
                                {
                                    selectedList.removedRecords ??
                                    0
                                }
                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        ADD / EDIT FORM
                    ================================================= */}

                    {showForm && (

                        <div
                            className="record-form-card"
                            ref={formRef}
                        >

                            <div className="record-form-header">

                                <div>

                                    <h2>
                                        {editingIndex === null
                                            ? "Add New Data"
                                            : "Edit Data"}
                                    </h2>

                                    <p>
                                        {editingIndex === null
                                            ? "Enter the information for the new record."
                                            : "Update the information for this record."}
                                    </p>

                                </div>

                            </div>


                            <div className="record-form-grid">

                                {selectedList.headers.map(
                                    (
                                        header,
                                        index
                                    ) => (

                                        <div
                                            className="record-field"
                                            key={index}
                                        >

                                            <label>
                                                {header ||
                                                    `Column ${
                                                        index + 1
                                                    }`}
                                            </label>


                                            <input
                                                type="text"

                                                value={
                                                    formData[
                                                        index
                                                    ] || ""
                                                }

                                                /*
                                                 * For a new record:
                                                 *
                                                 * Roll No  → [1]
                                                 * Name     → [Rahul]
                                                 * Class    → [1st A]
                                                 *
                                                 * These are only
                                                 * placeholders.
                                                 *
                                                 * They are NOT saved
                                                 * unless the user
                                                 * types them.
                                                 */
                                                placeholder={
                                                    editingIndex === null
                                                        ? selectedList
                                                              .students?.[0]?.[
                                                              index
                                                          ] ||
                                                          `Enter ${
                                                              header ||
                                                              "value"
                                                          }`
                                                        : ""
                                                }

                                                onChange={(event) =>
                                                    handleFormChange(
                                                        index,
                                                        event.target.value
                                                    )
                                                }
                                            />

                                        </div>

                                    )
                                )}

                            </div>


                            <div className="record-form-actions">

                                <button
                                    className="cancel-record-btn"
                                    onClick={
                                        handleCancel
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    className="save-record-btn"
                                    onClick={
                                        handleSave
                                    }
                                >
                                    {editingIndex === null
                                        ? "Add Record"
                                        : "Save Changes"}
                                </button>

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        DATA TABLE
                    ================================================= */}

                    <div className="table-card">

                        <div className="table-card-top">

                            <div className="table-card-inside">

                                <div className="table-header">
                                    {students.length} Records
                                </div>

                                <div className="table-description">

                                    Showing{" "}

                                    {students.length
                                        ? startIndex + 1
                                        : 0}

                                    –

                                    {Math.min(
                                        endIndex,
                                        students.length
                                    )}

                                    {" "}of{" "}

                                    {students.length}

                                </div>

                            </div>

                        </div>


                        <div className="table-wrapper">

                            {!selectedList.headers?.length ||
                            !students.length ? (

                                <div className="empty">
                                    No records available.
                                </div>

                            ) : (

                                <table>

                                    <thead>

                                        <tr>

                                            {selectedList.headers.map(
                                                (
                                                    header,
                                                    index
                                                ) => (

                                                    <th
                                                        key={index}
                                                    >
                                                        {header ||
                                                            "Column"}
                                                    </th>

                                                )
                                            )}


                                            <th className="actions-column">
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {currentRecords.map(
                                            (
                                                row,
                                                rowIndex
                                            ) => {

                                                const actualIndex =
                                                    startIndex +
                                                    rowIndex;

                                                return (
                                                    <tr
                                                        key={
                                                            actualIndex
                                                        }
                                                    >

                                                        {selectedList.headers.map(
                                                            (
                                                                _,
                                                                columnIndex
                                                            ) => (

                                                                <td
                                                                    key={
                                                                        columnIndex
                                                                    }
                                                                >
                                                                    {
                                                                        row[
                                                                            columnIndex
                                                                        ] ||
                                                                        "—"
                                                                    }
                                                                </td>

                                                            )
                                                        )}


                                                        <td className="row-actions">

                                                            <button
                                                                className="edit-btn"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        actualIndex
                                                                    )
                                                                }
                                                                title="Edit record"
                                                            >
                                                                Edit
                                                            </button>


                                                            <button
                                                                className="delete-btn"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        actualIndex
                                                                    )
                                                                }
                                                                title="Delete record"
                                                            >
                                                                Delete
                                                            </button>

                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>

                            )}

                        </div>


                        {/* =================================================
                            PAGINATION
                        ================================================= */}

                        {students.length >
                            recordsPerPage && (

                            <div className="pagination">

                                <button
                                    className="pagination-btn"

                                    disabled={
                                        currentPage ===
                                        1
                                    }

                                    onClick={() =>
                                        setCurrentPage(
                                            (page) =>
                                                page - 1
                                        )
                                    }
                                >
                                    ← Previous
                                </button>


                                <div className="page-numbers">

                                    {pageNumbers.map(
                                        (page) => (

                                            <button
                                                key={page}

                                                className={`page-number ${
                                                    currentPage ===
                                                    page
                                                        ? "active"
                                                        : ""
                                                }`}

                                                onClick={() =>
                                                    setCurrentPage(
                                                        page
                                                    )
                                                }
                                            >
                                                {page}
                                            </button>

                                        )
                                    )}

                                </div>


                                <button
                                    className="pagination-btn"

                                    disabled={
                                        currentPage ===
                                        totalPages
                                    }

                                    onClick={() =>
                                        setCurrentPage(
                                            (page) =>
                                                page + 1
                                        )
                                    }
                                >
                                    Next →
                                </button>

                            </div>

                        )}

                    </div>

                </section>

            </main>


            {/* =====================================================
                TOAST
            ===================================================== */}

            {toast && (

                <div className="settings-toast">
                    {toast}
                </div>

            )}


            {/* =====================================================
                DELETE CONFIRMATION MODAL
            ===================================================== */}

            {showDeleteModal && (

                <div
                    className="delete-modal-overlay"
                    onClick={
                        cancelDelete
                    }
                >

                    <div
                        className="delete-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* Warning Icon */}

                        <div className="delete-modal-icon">
                            !
                        </div>


                        {/* Content */}

                        <div className="delete-modal-content">

                            <h2>
                                Delete Record?
                            </h2>

                            <p>
                                Are you sure you want to
                                delete this record?
                                This action cannot be undone.
                            </p>

                        </div>


                        {/* Actions */}

                        <div className="delete-modal-actions">

                            <button
                                className="delete-cancel-btn"
                                onClick={
                                    cancelDelete
                                }
                            >
                                Cancel
                            </button>


                            <button
                                className="delete-confirm-btn"
                                onClick={
                                    confirmDelete
                                }
                            >
                                Delete Record
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* =====================================================
                DELETE LIST CONFIRMATION MODAL
            ===================================================== */}

            {showDeleteListModal && (

                <div
                    className="delete-modal-overlay"
                    onClick={cancelDeleteList}
                >

                    <div
                        className="delete-modal delete-list-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* Warning Icon */}

                        <div className="delete-modal-icon">
                            !
                        </div>


                        {/* Content */}

                        <div className="delete-modal-content">

                            <h2>
                                Delete List?
                            </h2>

                            <p>
                                Are you sure you want to delete{" "}
                                <strong>
                                    {selectedList.listName}
                                </strong>
                                ?
                                <br />
                                All records in this list will
                                be permanently removed.
                            </p>

                        </div>


                        {/* Actions */}

                        <div className="delete-modal-actions">

                            <button
                                className="delete-cancel-btn"
                                onClick={cancelDeleteList}
                            >
                                Cancel
                            </button>


                            <button
                                className="delete-confirm-btn"
                                onClick={confirmDeleteList}
                            >
                                Delete List
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default StoredData;