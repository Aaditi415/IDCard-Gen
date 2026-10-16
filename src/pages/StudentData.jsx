
import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import IDCardRenderer from "../components/IDCardRenderer";


const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

function StudentData() {
    const [lists, setLists] = useState([]);
    const [submissions, setSubmissions] = useState([]);

    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);        
    const params = new URLSearchParams(window.location.search);
    const selectedListId = params.get("listId");

    /* =====================================================
       LOAD DATA
    ===================================================== */

    useEffect(() => {
        const loadData = async () => {
            try {
                const token = localStorage.getItem("idFoundryToken");

                const headers = {
                    Authorization: `Bearer ${token}`,
                };

                const [listsResponse, submissionsResponse] =
                    await Promise.all([
                        fetch(`${API_BASE_URL}/api/master-lists`, {
                            headers,
                        }),
                        fetch(`${API_BASE_URL}/api/student-submissions`, {
                            headers,
                        }),
                    ]);

                const listsResult = await listsResponse.json();
                const submissionsResult =
                    await submissionsResponse.json();

                if (!listsResponse.ok || !listsResult.success) {
                    throw new Error(
                        listsResult.message || "Unable to load master lists."
                    );
                }

                if (
                    !submissionsResponse.ok ||
                    !submissionsResult.success
                ) {
                    throw new Error(
                        submissionsResult.message ||
                        "Unable to load student applications."
                    );
                }

                const mongoLists = (listsResult.lists || []).map(list => ({
                    ...list,
                    id: String(list._id || list.id),
                }));

                const mongoSubmissions = (
                    submissionsResult.submissions || []
                ).map(submission => ({
                    ...submission,
                    id: String(submission._id || submission.id),
                    masterListId: String(
                        submission.masterListId?._id ||
                        submission.masterListId ||
                        ""
                    ),
                    status:
                        submission.verification?.status ||
                        submission.status ||
                        "pending",
                    data: submission.data || {},
                }));

                // Resolve an old localStorage list ID to its MongoDB list.
                const oldLists = JSON.parse(
                    localStorage.getItem("idCardLists") || "[]"
                );

                const oldSelectedList = oldLists.find(
                    list => String(list.id) === String(selectedListId)
                );

                let resolvedList = mongoLists.find(
                    list => String(list.id) === String(selectedListId)
                );

                if (!resolvedList && oldSelectedList) {
                    resolvedList = mongoLists.find(list =>
                        String(list.listName).trim().toLowerCase() ===
                            String(oldSelectedList.listName).trim().toLowerCase() &&
                        String(list.tabName).trim().toLowerCase() ===
                            String(oldSelectedList.tabName).trim().toLowerCase()
                    );
                }

                setLists(mongoLists);
                setSubmissions(mongoSubmissions);

                // Update the URL to use the actual MongoDB ID.
                if (resolvedList && resolvedList.id !== selectedListId) {
                    window.history.replaceState(
                        {},
                        "",
                        `/student-data?listId=${encodeURIComponent(resolvedList.id)}`
                    );
                }
            } catch (error) {
                console.error("Failed to load student data:", error);
                window.alert(error.message);
            }
        };

        loadData();
    }, []);

    /* =====================================================
       SELECTED CLASS LIST
    ===================================================== */

    const selectedList = useMemo(() => {
        return lists.find(
            list => String(list.id) === String(selectedListId)
        );
    }, [lists, selectedListId]);

    /* =====================================================
       CLASS SUBMISSIONS ONLY
    ===================================================== */

    const listSubmissions = useMemo(() => {
        if (!selectedList) return [];

        return submissions.filter(
            submission =>
                String(submission.masterListId) ===
                String(selectedList.id)
        );
    }, [submissions, selectedList]);

    /* =====================================================
       FORM CONFIG
    ===================================================== */

    const formConfig = useMemo(() => {
        try {
            return (
                JSON.parse(localStorage.getItem("idCardForm")) || null
            );
        } catch {
            return null;
        }
    }, []);

    const formFields = formConfig?.fields || [];

    /* =====================================================
       DESIGN
    ===================================================== */

    const design = useMemo(() => {
        try {
            return (
                JSON.parse(localStorage.getItem("idCardDesign")) || {}
            );
        } catch {
            return {};
        }
    }, []);

    /* =====================================================
       GET SUBMISSION VALUE
    ===================================================== */

    const getSubmissionValue = (submission, field) => {
        const value = submission?.data?.[field.id];

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return "—";
        }

        if (Array.isArray(value)) {
            return value.join(", ");
        }

        if (typeof value === "boolean") {
            return value ? "Yes" : "No";
        }

        return String(value);
    };

    /* =====================================================
       STUDENT NAME
    ===================================================== */

    const getStudentName = submission => {
        const nameField = formFields.find(field => {
            const text = (
                field.label ||
                field.name ||
                ""
            ).toLowerCase();

            return (
                text === "name" ||
                text.includes("student name")
            );
        });

        if (!nameField) return "Student";

        return (
            submission?.data?.[nameField.id] ||
            "Student"
        );
    };

    /* =====================================================
       EDIT SUBMISSION
    ===================================================== */

    const handleEditSubmission = submission => {
        localStorage.setItem(
            "idCardEditSubmission",
            JSON.stringify(submission)
        );

        window.location.href =
            `/studentform/${submission.slug}?edit=${submission.id}`;
    };

    /* =====================================================
       OPEN DELETE MODAL
    ===================================================== */

    const openDeleteModal = (type, item = null) => {
        setDeleteTarget({
            type,
            item
        });

        setShowDeleteModal(true);
    };

    /* =====================================================
       CANCEL DELETE
    ===================================================== */

    const cancelDelete = () => {
        if (isDeleting) return;

        setShowDeleteModal(false);
        setDeleteTarget(null);
    };

    /* =====================================================
       CONFIRM DELETE
    ===================================================== */

    const confirmDelete = () => {
        if (!deleteTarget || isDeleting) return;

        setIsDeleting(true);

        try {
            // Delete individual student application
            if (deleteTarget.type === "submission") {
                const submissionId = deleteTarget.item.id;

                const updatedSubmissions = submissions.filter(
                    submission => submission.id !== submissionId
                );

                localStorage.setItem(
                    "idCardSubmissions",
                    JSON.stringify(updatedSubmissions)
                );

                setSubmissions(updatedSubmissions);
                setShowDeleteModal(false);
                setDeleteTarget(null);
                return;
            }

            // Delete class list and its associated applications
            if (deleteTarget.type === "list") {
                if (!selectedList) {
                    setIsDeleting(false);
                    return;
                }

                const updatedLists = lists.filter(
                    list => list.id !== selectedList.id
                );

                const updatedSubmissions = submissions.filter(
                    submission =>
                        submission.listId !== selectedList.id
                );

                localStorage.setItem(
                    "idCardLists",
                    JSON.stringify(updatedLists)
                );

                localStorage.setItem(
                    "idCardSubmissions",
                    JSON.stringify(updatedSubmissions)
                );

                window.location.href = "/dashboard";
                return;
            }
        } catch (error) {
            console.error("Failed to delete:", error);
            window.alert("Failed to delete. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    /* =====================================================
       VIEW ID
    ===================================================== */

    const handleViewID = submission => {
        setSelectedSubmission({
            ...submission,
            data: submission.data || {}
        });

        setShowPreview(true);
    };

    /* =====================================================
       CLOSE ID PREVIEW
    ===================================================== */

    const closePreview = () => {
        setShowPreview(false);
        setSelectedSubmission(null);
    };

    /* =====================================================
       NO LIST SELECTED
    ===================================================== */

    if (!selectedList) {
        return (
            <div className="app">
                <Sidebar activePage="student-data" />

                <main className="main">
                    <Topbar />

                    <section className="content">
                        <div className="breadcrumb">
                            <span>Student Applications</span>
                        </div>

                        <div className="stored-page-header">
                            <div>
                                <h1 className="page-title">
                                    Student Applications
                                </h1>

                                <p className="page-subtitle">
                                    Select a class list from the sidebar.
                                </p>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        );
    }

    /* =====================================================
       NORMAL PAGE
    ===================================================== */

    return (
        <div className="app">
            <Sidebar activePage="student-data" />

            <main className="main">
                <Topbar />

                <section className="content">

                    {/* BREADCRUMB */}

                    <div className="breadcrumb">
                        <button
                            type="button"
                            onClick={() => {
                                window.location.href = "/dashboard";
                            }}
                        >
                            Student Applications
                        </button>

                        <span>›</span>

                        <span>{selectedList.tabName}</span>
                    </div>

                    {/* HEADER */}

                    <div className="stored-page-header">
                        <div>
                            <h1 className="page-title">
                                {selectedList.listName}
                            </h1>

                            <p className="page-subtitle">
                                Student applications submitted through this
                                class link.
                            </p>
                        </div>

                        <div className="stored-header-actions">
                            <button
                                type="button"
                                className="delete-list-btn"
                                onClick={() =>
                                    openDeleteModal("list")
                                }
                            >
                                <span>×</span>
                                Delete List
                            </button>

                            <button
                                type="button"
                                className="add-record-btn"
                                onClick={() =>
                                    window.open(
                                        `/studentform/${selectedList.slug}`,
                                        "_blank"
                                    )
                                }
                            >
                                <span>＋</span>
                                Add New Data
                            </button>
                        </div>
                    </div>

                    {/* LIST INFO */}

                    <div className="list-info">
                        <div>
                            <div className="list-info-label">
                                Student List
                            </div>

                            <div className="list-name">
                                {selectedList.listName}
                            </div>
                        </div>

                        <div>
                            <span className="tab-badge">
                                {selectedList.tabName}
                            </span>
                        </div>
                    </div>

                    {/* STATS */}

                    <div className="stats">
                        <div className="stat-card">
                            <div className="stat-label">
                                Applications
                            </div>

                            <div className="stat-value">
                                {listSubmissions.length}
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">
                                Pending
                            </div>

                            <div className="stat-value">
                                {
                                    listSubmissions.filter(
                                        item =>
                                            item.status === "pending" ||
                                            item.verification?.status === "pending"
                                    ).length
                                }
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">
                                Approved
                            </div>

                            <div className="stat-value success-text">
                                {
                                    listSubmissions.filter(
                                        item =>
                                            item.status === "approved"
                                    ).length
                                }
                            </div>
                        </div>
                    </div>

                    {/* APPLICATIONS TABLE */}

                    <div className="table-card">
                        <div className="table-card-top">
                            <div className="table-card-inside">
                                <div className="table-header">
                                    {listSubmissions.length} Applications
                                </div>

                                <div className="table-description">
                                    Submitted through{" "}
                                    <strong>
                                        /studentform/{selectedList.slug}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <div className="table-wrapper">
                            {!listSubmissions.length ? (
                                <div className="empty">
                                    No student applications available for
                                    this list.
                                </div>
                            ) : (
                                <table>
                                    <thead>
                                        <tr>
                                            {formFields
                                                .filter(
                                                    field =>
                                                        field.type !== "media"
                                                )
                                                .map(field => (
                                                    <th key={field.id}>
                                                        {field.label || field.name}
                                                    </th>
                                                ))}

                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {listSubmissions.map(submission => (
                                            <tr key={submission.id}>
                                                {formFields
                                                    .filter(
                                                        field =>
                                                            field.type !== "media"
                                                    )
                                                    .map(field => (
                                                        <td key={field.id}>
                                                            {getSubmissionValue(
                                                                submission,
                                                                field
                                                            )}
                                                        </td>
                                                    ))}

                                                <td>
                                                    <span
                                                        className={
                                                            submission.status === "approved"
                                                                ? "success-text-status"
                                                                : submission.status === "rejected"
                                                                ? "danger-text-status"
                                                                : ""
                                                        }
                                                    >
                                                        {submission.status || "pending"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="submission-actions">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleViewID(submission)
                                                            }
                                                            className="view-btn"
                                                        >
                                                            View ID
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleEditSubmission(submission)
                                                            }
                                                            className="edit-btn"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    "submission",
                                                                    submission
                                                                )
                                                            }
                                                            className="delete-btn"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* =================================================
                ID PREVIEW MODAL
            ================================================= */}

            {showPreview && selectedSubmission && (
                <div
                    className="id-preview-overlay"
                    onClick={closePreview}
                >
                    <div
                        className="id-preview-modal"
                        onClick={event => event.stopPropagation()}
                    >
                        <div className="id-preview-modal-header">
                            <div>
                                <h2>ID Card Preview</h2>

                                <p>
                                    {getStudentName(selectedSubmission)}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="id-preview-close"
                                onClick={closePreview}
                            >
                                ×
                            </button>
                        </div>

                        <div className="id-preview-stage">
                            <div className="stored-id-card">
                                <IDCardRenderer
                                    formFields={formFields}
                                    data={selectedSubmission?.data || {}}
                                    design={design}
                                    activeSide="front"
                                />
                            </div>
                        </div>

                        <div className="id-preview-modal-footer">
                            <button
                                type="button"
                                className="cancel-record-btn"
                                onClick={closePreview}
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =================================================
                DELETE CONFIRMATION MODAL
            ================================================= */}

            {showDeleteModal && deleteTarget && (

                <div
                    className="delete-modal-overlay"
                    onClick={cancelDelete}
                >

                    <div
                        className="delete-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-modal-title"
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

                            <h2 id="delete-modal-title">
                                {deleteTarget.type === "list"
                                    ? "Delete Class List?"
                                    : "Delete Student Application?"}
                            </h2>

                            <p>
                                {deleteTarget.type === "list"
                                    ? `Are you sure you want to delete "${selectedList.listName}"? All student applications in this list will also be deleted. This action cannot be undone.`
                                    : `Are you sure you want to delete the application of "${getStudentName(deleteTarget.item)}"? This action cannot be undone.`}
                            </p>

                        </div>

                        {/* Actions */}

                        <div className="delete-modal-actions">

                            <button
                                type="button"
                                className="delete-cancel-btn"
                                onClick={cancelDelete}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="delete-confirm-btn"
                                onClick={confirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting
                                    ? "Deleting..."
                                    : deleteTarget.type === "list"
                                    ? "Delete List"
                                    : "Delete Record"}
                            </button>

                        </div>

                    </div>

                </div>

            )}
        </div>
    );
}

export default StudentData;
