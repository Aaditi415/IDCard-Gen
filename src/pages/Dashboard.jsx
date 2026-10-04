import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function Dashboard() {

    const [lists, setLists] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [masterLists, setMasterLists] = useState([]);

    /* =====================================================
       LOAD DATA
    ===================================================== */

    useEffect(() => {

        try {

            const savedLists =
                JSON.parse(
                    localStorage.getItem("idCardLists")
                ) || [];

            const savedSubmissions =
                JSON.parse(
                    localStorage.getItem("idCardSubmissions")
                ) || [];

            const savedMasterLists =
                JSON.parse(
                    localStorage.getItem("idCardMasterLists")
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

            setMasterLists(
                Array.isArray(savedMasterLists)
                    ? savedMasterLists
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load dashboard data:",
                error
            );

        }

    }, []);


    /* =====================================================
       STATISTICS
    ===================================================== */

    const totalStudents = useMemo(() => {

        return masterLists.reduce(
            (total, list) => {

                if (Array.isArray(list.students)) {
                    return total + list.students.length;
                }

                if (Array.isArray(list.records)) {
                    return total + list.records.length;
                }

                return total;

            },
            0
        );

    }, [masterLists]);


    const pendingApplications = useMemo(() => {

        return submissions.filter(
            submission =>
                submission.status === "pending" ||
                submission.verification?.status === "pending"
        ).length;

    }, [submissions]);


    const approvedApplications = useMemo(() => {

        return submissions.filter(
            submission =>
                submission.status === "approved"
        ).length;

    }, [submissions]);


    /* =====================================================
       RECENT SUBMISSIONS
    ===================================================== */

    const recentSubmissions = useMemo(() => {

        return [...submissions]
            .sort(
                (a, b) =>
                    new Date(
                        b.updatedAt ||
                        b.submittedAt ||
                        0
                    ) -
                    new Date(
                        a.updatedAt ||
                        a.submittedAt ||
                        0
                    )
            )
            .slice(0, 5);

    }, [submissions]);


    /* =====================================================
       CREATE
    ===================================================== */

    const handleCreate = () => {

        window.location.href = "/card";

    };


    /* =====================================================
       IMPORT DATA
    ===================================================== */

    const handleImport = () => {

        window.location.href = "/import-data";

    };


    /* =====================================================
       APPLICATIONS
    ===================================================== */

    const handleApplications = () => {

        if (lists.length > 0) {

            window.location.href =
                `/student-data?listId=${lists[0].id}`;

        } else {

            window.location.href =
                "/dashboard";

        }

    };


    /* =====================================================
       FORMAT DATE
    ===================================================== */

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }

        const value =
            new Date(date);

        const now =
            new Date();

        const diff =
            Math.floor(
                (now - value) / 1000
            );

        if (diff < 60) {
            return "Just now";
        }

        if (diff < 3600) {
            return `${Math.floor(diff / 60)} min ago`;
        }

        if (diff < 86400) {
            return `${Math.floor(diff / 3600)} hour ago`;
        }

        return value.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short"
            }
        );

    };


    /* =====================================================
       STATUS
    ===================================================== */

    const getStatusClass = (status) => {

        if (status === "approved") {
            return "ready";
        }

        if (status === "rejected") {
            return "rejected";
        }

        return "draft";

    };


    /* =====================================================
       STUDENT NAME
    ===================================================== */

    const getStudentName = (submission) => {

        const values =
            submission?.data || {};

        const form =
            JSON.parse(
                localStorage.getItem(
                    "idCardForm"
                )
            ) || {};

        const nameField =
            form.fields?.find(
                field => {

                    const label =
                        (
                            field.label ||
                            field.name ||
                            ""
                        ).toLowerCase();

                    return (
                        label === "name" ||
                        label.includes(
                            "student name"
                        ) ||
                        label.includes(
                            "full name"
                        )
                    );

                }
            );

        if (
            nameField &&
            values[nameField.id]
        ) {
            return values[nameField.id];
        }

        return "Student";

    };


    return (

        <div className="app">

            <Sidebar activePage="dashboard" />

            <main className="main">

                <Topbar />

                <section className="content">


                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="page-header">

                        <div>

                            <h1 className="page-title">
                                Good afternoon, Aaditi 👋
                            </h1>

                            <p className="page-subtitle">
                                Manage student ID cards and
                                verification from one place.
                            </p>

                        </div>

                        <button
                            className="primary-btn"
                            onClick={handleCreate}
                        >

                            <span>＋</span>

                            Create ID Card

                        </button>

                    </div>


                    {/* =================================================
                        STATISTICS
                    ================================================= */}

                    <div className="dashboard-stats">

                        <div className="stat-card">

                            <div className="stat-top">

                                <span className="stat-label">
                                    Student Lists
                                </span>

                                <div className="stat-icon">
                                    ▤
                                </div>

                            </div>

                            <div className="stat-number">
                                {lists.length}
                            </div>

                            <div className="stat-description">
                                Classes and divisions
                            </div>

                        </div>


                        <div className="stat-card">

                            <div className="stat-top">

                                <span className="stat-label">
                                    Students
                                </span>

                                <div className="stat-icon">
                                    ♙
                                </div>

                            </div>

                            <div className="stat-number">
                                {totalStudents}
                            </div>

                            <div className="stat-description">
                                Students in master lists
                            </div>

                        </div>


                        <div className="stat-card">

                            <div className="stat-top">

                                <span className="stat-label">
                                    Pending
                                </span>

                                <div className="stat-icon">
                                    ◷
                                </div>

                            </div>

                            <div className="stat-number">
                                {pendingApplications}
                            </div>

                            <div className="stat-description">
                                Applications waiting for review
                            </div>

                        </div>


                        <div className="stat-card">

                            <div className="stat-top">

                                <span className="stat-label">
                                    Approved
                                </span>

                                <div className="stat-icon">
                                    ✓
                                </div>

                            </div>

                            <div className="stat-number">
                                {approvedApplications}
                            </div>

                            <div className="stat-description">
                                Verified student applications
                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        RECENT ACTIVITY
                    ================================================= */}

                    <div className="section-header">

                        <div>

                            <h2 className="section-title">
                                Recent Activity
                            </h2>

                            <p className="section-description">
                                Latest student applications
                            </p>

                        </div>

                        <button
                            className="view-all"
                            onClick={handleApplications}
                        >
                            View applications →
                        </button>

                    </div>


                    <div className="table-card">

                        {recentSubmissions.length === 0 ? (

                            <div className="empty">

                                <div className="empty-title">
                                    No student applications yet
                                </div>

                                <div className="empty-description">
                                    Once students submit their
                                    information, their applications
                                    will appear here.
                                </div>

                            </div>

                        ) : (

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            STUDENT
                                        </th>

                                        <th>
                                            LIST
                                        </th>

                                        <th>
                                            STATUS
                                        </th>

                                        <th>
                                            UPDATED
                                        </th>

                                        <th></th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {recentSubmissions.map(
                                        submission => (

                                            <tr
                                                key={
                                                    submission.id
                                                }
                                            >

                                                <td>

                                                    <div className="id-person">

                                                        <div className="person-photo">

                                                            {getStudentName(
                                                                submission
                                                            )
                                                                .split(" ")
                                                                .map(
                                                                    word =>
                                                                        word[0]
                                                                )
                                                                .slice(0, 2)
                                                                .join("")
                                                                .toUpperCase()}

                                                        </div>

                                                        <div>

                                                            <div className="person-name">

                                                                {
                                                                    getStudentName(
                                                                        submission
                                                                    )
                                                                }

                                                            </div>

                                                            <div className="person-type">

                                                                Student

                                                            </div>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td className="template">

                                                    {
                                                        submission.listName ||
                                                        "—"
                                                    }

                                                </td>


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

                                                    {
                                                        formatDate(
                                                            submission.updatedAt ||
                                                            submission.submittedAt
                                                        )
                                                    }

                                                </td>


                                                <td>

                                                    <button
                                                        className="action-btn"
                                                        onClick={() => {

                                                            if (
                                                                submission.slug
                                                            ) {

                                                                window.location.href =
                                                                    `/studentform/${submission.slug}`;

                                                            }

                                                        }}
                                                    >
                                                        •••
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        )}

                    </div>


                  

                    {/* =================================================
                        QUICK ACTIONS
                    ================================================= */}

                    <div className="section-header">

                        <div>

                            <h2 className="section-title">
                                Quick Actions
                            </h2>

                        </div>

                    </div>


                    <div className="quick-actions">

                        <div
                            className="quick-card"
                            onClick={handleCreate}
                        >

                            <div className="quick-icon">
                                ＋
                            </div>

                            <div className="quick-title">
                                Create ID Card
                            </div>

                            <div className="quick-description">
                                Create a new student ID card.
                            </div>

                        </div>


                        <div
                            className="quick-card"
                            onClick={handleImport}
                        >

                            <div className="quick-icon">
                                ↑
                            </div>

                            <div className="quick-title">
                                Import Master Data
                            </div>

                            <div className="quick-description">
                                Upload student records from CSV or Excel.
                            </div>

                        </div>


                        <div
                            className="quick-card"
                            onClick={handleApplications}
                        >

                            <div className="quick-icon">
                                ✓
                            </div>

                            <div className="quick-title">
                                Student Applications
                            </div>

                            <div className="quick-description">
                                Review and verify submitted information.
                            </div>

                        </div>

                    </div>

                </section>

            </main>

        </div>

    );

}

export default Dashboard;