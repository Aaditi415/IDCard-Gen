import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import IDCardRenderer from "../components/IDCardRenderer";

function StudentData() {

    const [lists, setLists] = useState([]);
    const [submissions, setSubmissions] = useState([]);

    const [selectedSubmission, setSelectedSubmission] =
        useState(null);

    const [showPreview, setShowPreview] =
        useState(false);

    const params = new URLSearchParams(
        window.location.search
    );

    const selectedListId =
        params.get("listId");

    /* =====================================================
       LOAD DATA
    ===================================================== */

    useEffect(() => {

        try {

            const savedLists =
                JSON.parse(
                    localStorage.getItem(
                        "idCardLists"
                    )
                ) || [];

            const savedSubmissions =
                JSON.parse(
                    localStorage.getItem(
                        "idCardSubmissions"
                    )
                ) || [];

            setLists(
                Array.isArray(savedLists)
                    ? savedLists
                    : []
            );

            setSubmissions(
                Array.isArray(savedSubmissions)
                    ? savedSubmissions
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load student data:",
                error
            );

            setLists([]);
            setSubmissions([]);

        }

    }, []);

    /* =====================================================
       SELECTED CLASS LIST
    ===================================================== */

    const selectedList = useMemo(() => {

        return lists.find(
            list =>
                list.id === selectedListId
        );

    }, [
        lists,
        selectedListId
    ]);

    /* =====================================================
       CLASS SUBMISSIONS ONLY
    ===================================================== */

    const listSubmissions = useMemo(() => {

        if (!selectedList) {
            return [];
        }

        return submissions.filter(
            submission =>
                submission.listId ===
                selectedList.id
        );

    }, [
        submissions,
        selectedList
    ]);

    /* =====================================================
       FORM CONFIG
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

    }, []);

    const formFields =
        formConfig?.fields || [];

    /* =====================================================
       DESIGN
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

    }, []);

    /* =====================================================
       GET VALUE
    ===================================================== */

    const getSubmissionValue = (
        submission,
        field
    ) => {

        const value =
            submission?.data?.[
                field.id
            ];

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return "—";
        }

        if (
            Array.isArray(value)
        ) {
            return value.join(", ");
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
       NAME
    ===================================================== */

    const getStudentName = (
        submission
    ) => {

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
                        text.includes(
                            "student name"
                        )
                    );

                }
            );

        if (!nameField) {
            return "Student";
        }

        return (
            submission?.data?.[
                nameField.id
            ] || "Student"
        );

    };

    const handleEditSubmission = (submission) => {
        localStorage.setItem(
            "idCardEditSubmission",
            JSON.stringify(submission)
        );

        window.location.href = `/studentform/${submission.slug}?edit=${submission.id}`;
    };

    const handleDeleteSubmission = (submissionId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this student application?"
        );

        if (!confirmed) {
            return;
        }

        const updatedSubmissions = submissions.filter(
            submission => submission.id !== submissionId
        );

        localStorage.setItem(
            "idCardSubmissions",
            JSON.stringify(updatedSubmissions)
        );

        setSubmissions(updatedSubmissions);
    };

    /* =====================================================
       VIEW ID
    ===================================================== */

    const handleViewID = (submission) => {
        console.log("VIEW ID CLICKED:", submission);

        setSelectedSubmission({
            ...submission,
            data: submission.data || {}
        });

        setShowPreview(true);
    };

    /* =====================================================
       CLOSE
    ===================================================== */

    const closePreview = () => {

        setShowPreview(false);
        setSelectedSubmission(null);

    };


    /* =====================================================
   DELETE CLASS LIST
===================================================== */

const handleDeleteList = () => {

    const confirmed = window.confirm(
        `Are you sure you want to delete "${selectedList.listName}"?\n\nThis will also delete all student applications for this list.`
    );

    if (!confirmed) {
        return;
    }

    try {

        /* ---------------------------------------------
           DELETE CLASS LIST
        --------------------------------------------- */

        const savedLists =
            JSON.parse(
                localStorage.getItem("idCardLists")
            ) || [];

        const updatedLists =
            savedLists.filter(
                list =>
                    list.id !== selectedList.id
            );

        localStorage.setItem(
            "idCardLists",
            JSON.stringify(updatedLists)
        );


        /* ---------------------------------------------
           DELETE SUBMISSIONS OF THIS LIST
        --------------------------------------------- */

        const savedSubmissions =
            JSON.parse(
                localStorage.getItem(
                    "idCardSubmissions"
                )
            ) || [];

        const updatedSubmissions =
            savedSubmissions.filter(
                submission =>
                    submission.listId !==
                    selectedList.id
            );

        localStorage.setItem(
            "idCardSubmissions",
            JSON.stringify(updatedSubmissions)
        );


        /* ---------------------------------------------
           GO BACK TO DASHBOARD
        --------------------------------------------- */

        window.location.href = "/dashboard";

    } catch (error) {

        console.error(
            "Failed to delete class list:",
            error
        );

        window.alert(
            "Failed to delete the class list."
        );

    }

};

    /* =====================================================
       NO LIST
    ===================================================== */

    if (!selectedList) {

        return (

            <div className="app">

                <Sidebar
                    activePage="student-data"
                />

                <main className="main">

                    <Topbar />

                    <section className="content">

                        <div className="breadcrumb">

                            <span>
                                Student Applications
                            </span>

                        </div>

                        <div className="stored-page-header">

                            <div>

                                <h1 className="page-title">
                                    Student Applications
                                </h1>

                                <p className="page-subtitle">
                                    Select a class list
                                    from the sidebar.
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

            <Sidebar
                activePage="student-data"
            />

            <main className="main">

                <Topbar />

                <section className="content">

                    {/* BREADCRUMB */}

                    <div className="breadcrumb">

                        <button
                            onClick={() =>
                                window.location.href =
                                    "/dashboard"
                            }
                        >
                            Student Applications
                        </button>

                        <span>
                            ›
                        </span>

                        <span>
                            {selectedList.tabName}
                        </span>

                    </div>


                    {/* HEADER */}

                    <div className="stored-page-header">

                        <div>

                            <h1 className="page-title">
                                {selectedList.listName}
                            </h1>

                            <p className="page-subtitle">
                                Student applications
                                submitted through this
                                class link.
                            </p>

                        </div>


                        <div className="stored-header-actions">



                            <button
                                className="delete-list-btn"
                                onClick={handleDeleteList}
                            >
                                <span>×</span>
                                Delete List
                            </button>

                            
                            <button
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
                                            item.status ===
                                            "approved"
                                    ).length
                                }
                            </div>

                        </div>

                    </div>


                    {/* TABLE */}

                    <div className="table-card">

                        <div className="table-card-top">

                            <div className="table-card-inside">

                                <div className="table-header">

                                    {listSubmissions.length}
                                    {" "}
                                    Applications

                                </div>

                                <div className="table-description">

                                    Submitted through
                                    {" "}
                                    <strong>
                                        /studentform/
                                        {selectedList.slug}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        <div className="table-wrapper">

                            {!listSubmissions.length ? (

                                <div className="empty">

                                    No student applications
                                    available for this list.

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
                                                Status
                                            </th>

                                            <th>
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {listSubmissions.map(
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
                                                                        )
                                                                    }

                                                                </td>

                                                            )
                                                        )}


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
                                                                onClick={() => handleViewID(submission)}
                                                                className="view-btn"
                                                            >
                                                                View ID
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEditSubmission(submission)}
                                                                className="edit-btn"
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteSubmission(submission.id)}
                                                                className="delete-btn"
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

                            )}

                        </div>

                    </div>

                </section>

            </main>


            {/* =================================================
                ID PREVIEW
            ================================================= */}

            {showPreview &&
                selectedSubmission && (

                    <div
                        className="id-preview-overlay"
                        onClick={closePreview}
                    >

                        <div
                            className="id-preview-modal"
                            onClick={event =>
                                event.stopPropagation()
                            }
                        >

                            <div className="id-preview-modal-header">

                                <div>

                                    <h2>
                                        ID Card Preview
                                    </h2>

                                    <p>
                                        {
                                            getStudentName(
                                                selectedSubmission
                                            )
                                        }
                                    </p>

                                </div>

                                <button
                                    className="id-preview-close"
                                    onClick={
                                        closePreview
                                    }
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
                                    className="cancel-record-btn"
                                    onClick={
                                        closePreview
                                    }
                                >
                                    Close Preview
                                </button>

                            </div>

                        </div>

                    </div>

                )}

        </div>

    );

}

export default StudentData;