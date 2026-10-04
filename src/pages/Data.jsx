import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import IDCardRenderer from "../components/IDCardRenderer";

function Data() {

    /* =====================================================
       EXISTING STORED LISTS
    ===================================================== */

    const [storedLists, setStoredLists] =
        useState([]);

    const [currentPage, setCurrentPage] =
        useState(1);


    /* =====================================================
       EXISTING FORM
    ===================================================== */

    const [showForm, setShowForm] =
        useState(false);

    const [editingIndex, setEditingIndex] =
        useState(null);

    const [formData, setFormData] =
        useState([]);


    /* =====================================================
       EXISTING MODALS
    ===================================================== */

    const [showDeleteModal, setShowDeleteModal] =
        useState(false);

    const [deleteIndex, setDeleteIndex] =
        useState(null);

    const [showDeleteListModal, setShowDeleteListModal] =
        useState(false);


    /* =====================================================
       STUDENT SUBMISSIONS
    ===================================================== */

    const [submissions, setSubmissions] =
        useState([]);

    const [submissionPage, setSubmissionPage] =
        useState(1);


    /* =====================================================
       ID PREVIEW
    ===================================================== */

    const [selectedSubmission, setSelectedSubmission] =
        useState(null);

    const [showIDPreview, setShowIDPreview] =
        useState(false);


    /* =====================================================
       TOAST
    ===================================================== */

    const [toast, setToast] =
        useState("");


    const formRef =
        useRef(null);


    const recordsPerPage = 10;


    /* =====================================================
       GET SELECTED ID
    ===================================================== */

    const params =
        new URLSearchParams(
            window.location.search
        );

    const selectedId =
        params.get("id");


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


    /* =====================================================
       LOAD STUDENT SUBMISSIONS
    ===================================================== */

    const loadSubmissions = () => {

        try {

            const stored =
                JSON.parse(
                    localStorage.getItem(
                        "idCardSubmissions"
                    )
                ) || [];

            setSubmissions(
                Array.isArray(stored)
                    ? stored
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load submissions:",
                error
            );

            setSubmissions([]);

        }

    };


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {

        loadStoredLists();

        loadSubmissions();

    }, []);


    /* =====================================================
       SELECTED IMPORTED LIST
    ===================================================== */

    const selectedList = useMemo(() => {

        return storedLists.find(
            (list) =>
                list.id === selectedId
        );

    }, [
        storedLists,
        selectedId
    ]);


    /* =====================================================
       IMPORTED LIST RECORDS
    ===================================================== */

    const students =
        selectedList?.students || [];


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                students.length /
                recordsPerPage
            )
        );


    useEffect(() => {

        if (
            currentPage >
            totalPages
        ) {

            setCurrentPage(
                totalPages
            );

        }

    }, [
        currentPage,
        totalPages
    ]);


    const startIndex =
        (currentPage - 1) *
        recordsPerPage;


    const endIndex =
        startIndex +
        recordsPerPage;


    const currentRecords =
        students.slice(
            startIndex,
            endIndex
        );


    /* =====================================================
       STUDENT SUBMISSION PAGINATION
    ===================================================== */

    const submissionTotalPages =
        Math.max(
            1,
            Math.ceil(
                submissions.length /
                recordsPerPage
            )
        );


    useEffect(() => {

        if (
            submissionPage >
            submissionTotalPages
        ) {

            setSubmissionPage(
                submissionTotalPages
            );

        }

    }, [
        submissionPage,
        submissionTotalPages
    ]);


    const submissionStartIndex =
        (submissionPage - 1) *
        recordsPerPage;


    const submissionEndIndex =
        submissionStartIndex +
        recordsPerPage;


    const currentSubmissions =
        submissions.slice(
            submissionStartIndex,
            submissionEndIndex
        );


    /* =====================================================
       LOAD FORM CONFIG
    ===================================================== */

    const formConfig = useMemo(() => {

        try {

            return (
                JSON.parse(
                    localStorage.getItem(
                        "idCardForm"
                    )
                ) || null
            );

        } catch {

            return null;

        }

    }, [submissions]);


    /* =====================================================
       FORM FIELDS
    ===================================================== */

    const formFields =
        formConfig?.fields || [];


    /* =====================================================
       LOAD DESIGN
    ===================================================== */

    const design = useMemo(() => {

        try {

            return (
                JSON.parse(
                    localStorage.getItem(
                        "idCardDesign"
                    )
                ) || {}
            );

        } catch {

            return {};

        }

    }, [submissions]);


    /* =====================================================
       FORM AUTO SCROLL
    ===================================================== */

    useEffect(() => {

        if (!showForm) {
            return;
        }

        const timer =
            setTimeout(() => {

                if (!formRef.current) {
                    return;
                }

                formRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

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
       SUBMISSION PAGE NUMBERS
    ===================================================== */

    const submissionPageNumbers = [];

    for (
        let page = 1;
        page <= submissionTotalPages;
        page++
    ) {

        submissionPageNumbers.push(
            page
        );

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

    const showToast = (
        message
    ) => {

        setToast(message);

        setTimeout(() => {

            setToast("");

        }, 2500);

    };


    /* =====================================================
       SAVE STORED LISTS
    ===================================================== */

    const saveStoredLists = (
        updatedLists
    ) => {

        localStorage.setItem(
            "idCardStoredLists",
            JSON.stringify(
                updatedLists
            )
        );

        setStoredLists(
            updatedLists
        );

    };


    /* =====================================================
       ADD IMPORTED DATA
    ===================================================== */

    const handleAdd = () => {

        if (!selectedList) {
            return;
        }

        setEditingIndex(null);

        setFormData(
            selectedList.headers.map(
                () => ""
            )
        );

        setShowForm(true);

    };


    /* =====================================================
       EDIT IMPORTED DATA
    ===================================================== */

    const handleEdit = (
        actualIndex
    ) => {

        if (!selectedList) {
            return;
        }

        setEditingIndex(
            actualIndex
        );

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

        setFormData(
            (previous) => {

                const updated = [
                    ...previous
                ];

                updated[index] =
                    value;

                return updated;

            }
        );

    };


    /* =====================================================
       SAVE IMPORTED DATA
    ===================================================== */

    const handleSave = () => {

        if (!selectedList) {
            return;
        }

        const updatedStudents = [
            ...(selectedList.students || [])
        ];


        if (
            editingIndex === null
        ) {

            updatedStudents.push(
                formData
            );

        } else {

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
            storedLists.map(
                (list) =>
                    list.id === selectedId
                        ? updatedList
                        : list
            );


        saveStoredLists(
            updatedLists
        );


        setShowForm(false);

        setEditingIndex(null);

        setFormData([]);


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
       DELETE IMPORTED RECORD
    ===================================================== */

    const handleDelete = (
        actualIndex
    ) => {

        if (!selectedList) {
            return;
        }

        setDeleteIndex(
            actualIndex
        );

        setShowDeleteModal(
            true
        );

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


        updatedStudents.splice(
            deleteIndex,
            1
        );


        const previousRemovedRecords =
            Number(
                selectedList.removedRecords ||
                0
            );


        const updatedList = {

            ...selectedList,

            students:
                updatedStudents,

            totalRecords:
                updatedStudents.length,

            validRecords:
                updatedStudents.length,

            removedRecords:
                previousRemovedRecords + 1

        };


        const updatedLists =
            storedLists.map(
                (list) =>
                    list.id === selectedId
                        ? updatedList
                        : list
            );


        saveStoredLists(
            updatedLists
        );


        const newTotalPages =
            Math.max(
                1,
                Math.ceil(
                    updatedStudents.length /
                    recordsPerPage
                )
            );


        if (
            currentPage >
            newTotalPages
        ) {

            setCurrentPage(
                newTotalPages
            );

        }


        setShowDeleteModal(
            false
        );

        setDeleteIndex(null);


        showToast(
            "Record deleted successfully."
        );

    };


    /* =====================================================
       CANCEL DELETE
    ===================================================== */

    const cancelDelete = () => {

        setShowDeleteModal(
            false
        );

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

        setShowDeleteListModal(
            true
        );

    };


    /* =====================================================
       CONFIRM DELETE LIST
    ===================================================== */

    const confirmDeleteList = () => {

        if (!selectedList) {
            return;
        }


        const updatedLists =
            storedLists.filter(
                (list) =>
                    list.id !== selectedId
            );


        localStorage.setItem(
            "idCardStoredLists",
            JSON.stringify(
                updatedLists
            )
        );


        try {

            const finalList =
                JSON.parse(
                    localStorage.getItem(
                        "idCardFinalList"
                    )
                );


            if (
                finalList?.id ===
                selectedId
            ) {

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


        setShowDeleteListModal(
            false
        );


        window.location.href =
            "/";

    };


    /* =====================================================
       CANCEL DELETE LIST
    ===================================================== */

    const cancelDeleteList = () => {

        setShowDeleteListModal(
            false
        );

    };


    /* =====================================================
       GET FIELD VALUE
    ===================================================== */

    const getSubmissionValue = (
        submission,
        field
    ) => {

        if (
            !submission ||
            !field
        ) {

            return "";

        }

        const value =
            submission.data?.[
                field.id
            ];

        if (
            value === undefined ||
            value === null
        ) {

            return "";

        }

        if (
            Array.isArray(value)
        ) {

            return value.join(
                ", "
            );

        }

        if (
            typeof value === "boolean"
        ) {

            return value
                ? "Yes"
                : "No";

        }

        return String(value);

    };


    /* =====================================================
       VIEW ID
    ===================================================== */

    const handleViewID = (
        submission
    ) => {

        setSelectedSubmission(
            submission
        );

        setShowIDPreview(
            true
        );

    };


    /* =====================================================
       CLOSE ID PREVIEW
    ===================================================== */

    const closeIDPreview = () => {

        setShowIDPreview(
            false
        );

        setSelectedSubmission(
            null
        );

    };


    /* =====================================================
       NO IMPORTED LIST SELECTED
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


                        <div className="stored-page-header">

                            <div>

                                <h1 className="page-title">
                                    Stored Data
                                </h1>

                                <p className="page-subtitle">
                                    Manage your stored
                                    student information.
                                </p>

                            </div>

                        </div>


                        {/* =================================================
                            STUDENT FORM SUBMISSIONS
                        ================================================= */}

                        <div className="submission-section">

                            <div className="submission-section-header">

                                <div>

                                    <h2>
                                        Student Form Submissions
                                    </h2>

                                    <p>
                                        Students submitted
                                        through the public
                                        student form.
                                    </p>

                                </div>


                                <div className="submission-count">

                                    {submissions.length}
                                    {" "}
                                    Records

                                </div>

                            </div>


                            <div className="table-card">

                                <div className="table-wrapper">

                                    {submissions.length === 0 ? (

                                        <div className="empty">

                                            No student
                                            submissions
                                            available.

                                        </div>

                                    ) : (

                                        <table>

                                            <thead>

                                                <tr>

                                                    {formFields
                                                        .filter(
                                                            field =>
                                                                field.type !==
                                                                "media"
                                                        )
                                                        .map(
                                                            field => (

                                                                <th
                                                                    key={
                                                                        field.id
                                                                    }
                                                                >
                                                                    {
                                                                        field.label ||
                                                                        field.name
                                                                    }
                                                                </th>

                                                            )
                                                        )}

                                                    <th>
                                                        Actions
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {currentSubmissions.map(
                                                    submission => (

                                                        <tr
                                                            key={
                                                                submission.id
                                                            }
                                                        >

                                                            {formFields
                                                                .filter(
                                                                    field =>
                                                                        field.type !==
                                                                        "media"
                                                                )
                                                                .map(
                                                                    field => (

                                                                        <td
                                                                            key={
                                                                                field.id
                                                                            }
                                                                        >

                                                                            {
                                                                                getSubmissionValue(
                                                                                    submission,
                                                                                    field
                                                                                ) ||
                                                                                "—"
                                                                            }

                                                                        </td>

                                                                    )
                                                                )}


                                                            <td>

                                                                <button
                                                                    className="view-id-btn"
                                                                    onClick={() =>
                                                                        handleViewID(
                                                                            submission
                                                                        )
                                                                    }
                                                                >
                                                                    View ID
                                                                </button>

                                                            </td>

                                                        </tr>

                                                    )
                                                )}

                                            </tbody>

                                        </table>

                                    )}

                                </div>


                                {/* PAGINATION */}

                                {submissions.length >
                                    recordsPerPage && (

                                    <div className="pagination">

                                        <button
                                            className="pagination-btn"
                                            disabled={
                                                submissionPage ===
                                                1
                                            }
                                            onClick={() =>
                                                setSubmissionPage(
                                                    page =>
                                                        page - 1
                                                )
                                            }
                                        >
                                            ← Previous
                                        </button>


                                        <div className="page-numbers">

                                            {submissionPageNumbers.map(
                                                page => (

                                                    <button
                                                        key={
                                                            page
                                                        }
                                                        className={`page-number ${
                                                            submissionPage ===
                                                            page
                                                                ? "active"
                                                                : ""
                                                        }`}
                                                        onClick={() =>
                                                            setSubmissionPage(
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
                                                submissionPage ===
                                                submissionTotalPages
                                            }
                                            onClick={() =>
                                                setSubmissionPage(
                                                    page =>
                                                        page + 1
                                                )
                                            }
                                        >
                                            Next →
                                        </button>

                                    </div>

                                )}

                            </div>

                        </div>

                    </section>

                </main>


                {/* =================================================
                    ID PREVIEW
                ================================================= */}

                {showIDPreview && selectedSubmission && (

                    <IDPreviewModal
                        submission={
                            selectedSubmission
                        }
                        formFields={
                            formFields
                        }
                        design={
                            design
                        }
                        onClose={
                            closeIDPreview
                        }
                    />

                )}

            </div>

        );

    }


    /* =====================================================
       NORMAL SELECTED LIST PAGE
    ===================================================== */

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
                            {
                                selectedList.tabName ||
                                "Data"
                            }
                        </span>

                    </div>


                    <div className="stored-page-header">

                        <div>

                            <h1 className="page-title">
                                {
                                    selectedList.listName
                                }
                            </h1>

                            <p className="page-subtitle">
                                Manage student records,
                                edit existing data or
                                add new records.
                            </p>

                        </div>


                        <div className="stored-header-actions">

                            <button
                                className="delete-list-btn"
                                onClick={
                                    handleDeleteList
                                }
                            >
                                × Delete List
                            </button>


                            <button
                                className="add-record-btn"
                                onClick={
                                    handleAdd
                                }
                            >
                                ＋ Add New Data
                            </button>

                        </div>

                    </div>


                    <div className="list-info">

                        <div>

                            <div className="list-info-label">
                                Stored List
                            </div>

                            <div className="list-name">
                                {
                                    selectedList.listName
                                }
                            </div>

                        </div>


                        <div>

                            <span className="tab-badge">
                                {
                                    selectedList.tabName
                                }
                            </span>

                        </div>

                    </div>


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
                                        {
                                            editingIndex === null
                                                ? "Add New Data"
                                                : "Edit Data"
                                        }
                                    </h2>

                                    <p>
                                        {
                                            editingIndex === null
                                                ? "Enter the information for the new record."
                                                : "Update the information for this record."
                                        }
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
                                                {
                                                    header ||
                                                    `Column ${index + 1}`
                                                }
                                            </label>


                                            <input
                                                type="text"
                                                value={
                                                    formData[
                                                        index
                                                    ] || ""
                                                }
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
                                                onChange={event =>
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
                                    {
                                        editingIndex === null
                                            ? "Add Record"
                                            : "Save Changes"
                                    }
                                </button>

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        EXISTING TABLE
                    ================================================= */}

                    <div className="table-card">

                        <div className="table-card-top">

                            <div className="table-card-inside">

                                <div className="table-header">
                                    {
                                        students.length
                                    } Records
                                </div>

                                <div className="table-description">

                                    Showing{" "}
                                    {
                                        students.length
                                            ? startIndex + 1
                                            : 0
                                    }
                                    –
                                    {
                                        Math.min(
                                            endIndex,
                                            students.length
                                        )
                                    }
                                    {" "}of{" "}
                                    {
                                        students.length
                                    }

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
                                                        key={
                                                            index
                                                        }
                                                    >
                                                        {
                                                            header ||
                                                            "Column"
                                                        }
                                                    </th>

                                                )
                                            )}


                                            <th>
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
                                            page =>
                                                page - 1
                                        )
                                    }
                                >
                                    ← Previous
                                </button>


                                <div className="page-numbers">

                                    {pageNumbers.map(
                                        page => (

                                            <button
                                                key={
                                                    page
                                                }
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
                                            page =>
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
                DELETE RECORD MODAL
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
                        onClick={event =>
                            event.stopPropagation()
                        }
                    >

                        <div className="delete-modal-icon">
                            !
                        </div>


                        <div className="delete-modal-content">

                            <h2>
                                Delete Record?
                            </h2>

                            <p>
                                Are you sure you want
                                to delete this record?
                                This action cannot be undone.
                            </p>

                        </div>


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
                DELETE LIST MODAL
            ===================================================== */}

            {showDeleteListModal && (

                <div
                    className="delete-modal-overlay"
                    onClick={
                        cancelDeleteList
                    }
                >

                    <div
                        className="delete-modal delete-list-modal"
                        onClick={event =>
                            event.stopPropagation()
                        }
                    >

                        <div className="delete-modal-icon">
                            !
                        </div>


                        <div className="delete-modal-content">

                            <h2>
                                Delete List?
                            </h2>

                            <p>

                                Are you sure you want
                                to delete{" "}

                                <strong>
                                    {
                                        selectedList.listName
                                    }
                                </strong>

                                ?

                                <br />

                                All records in this list
                                will be permanently removed.

                            </p>

                        </div>


                        <div className="delete-modal-actions">

                            <button
                                className="delete-cancel-btn"
                                onClick={
                                    cancelDeleteList
                                }
                            >
                                Cancel
                            </button>


                            <button
                                className="delete-confirm-btn"
                                onClick={
                                    confirmDeleteList
                                }
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


/* =========================================================
   ID PREVIEW MODAL

   This uses the saved design + submitted student data.
========================================================= */

function IDPreviewModal({
    submission,
    formFields,
    design,
    onClose
}) {

    const [previewSide, setPreviewSide] =
        useState(
            design?.previewSide || "front"
        );


    const getName = () => {

        const nameField =
            formFields.find(
                field => {

                    const text =
                        (
                            field.label ||
                            field.name ||
                            ""
                        ).toLowerCase();

                    return (
                        text === "name" ||
                        text.includes("student name")
                    );

                }
            );


        if (!nameField) {
            return "Student";
        }


        const value =
            submission?.data?.[
                nameField.id
            ];


        return value || "Student";

    };


    return (

        <div
            className="id-preview-overlay"
            onClick={onClose}
        >

            <div
                className="id-preview-modal"
                onClick={event =>
                    event.stopPropagation()
                }
            >

                {/* HEADER */}

                <div className="id-preview-modal-header">

                    <div>

                        <h2>
                            ID Card Preview
                        </h2>

                        <p>
                            {getName()}
                        </p>

                    </div>


                    <button
                        className="id-preview-close"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>


                {/* FRONT / BACK */}

                {Number(
                    design?.sides || 1
                ) === 2 && (

                    <div className="id-preview-side-switcher">

                        <button
                            className={
                                previewSide === "front"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setPreviewSide(
                                    "front"
                                )
                            }
                        >
                            Front
                        </button>


                        <button
                            className={
                                previewSide === "back"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setPreviewSide(
                                    "back"
                                )
                            }
                        >
                            Back
                        </button>

                    </div>

                )}


                {/* CARD */}

                <div className="id-preview-stage">

                    <div className="stored-id-card">

                        <IDCardRenderer
                            formFields={
                                formFields
                            }
                            data={
                                submission?.data ||
                                {}
                            }
                            design={
                                design
                            }
                            activeSide={
                                previewSide
                            }
                        />

                    </div>

                </div>


                {/* FOOTER */}

                <div className="id-preview-modal-footer">

                    <button
                        className="cancel-record-btn"
                        onClick={onClose}
                    >
                        Close Preview
                    </button>

                </div>

            </div>

        </div>

    );

}


export default Data;