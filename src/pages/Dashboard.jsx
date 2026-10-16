
import { useEffect, useMemo, useState } from "react";
import {
    ArrowRight,
    BellRing,
    ClipboardList,
    Database,
    FileUp,
    GraduationCap,
    Layers3,
    Palette,
    ShieldAlert,
    Trash2,
    Users,
    X,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/dashboard.css";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const DATA_KEYS = [
    "idCardStoredLists",
    "idCardMenuOrder",
    "idCardLists",
    "idCardSubmissions",
    "idCardMasterLists",
    "idCardForm",
    "idCardDesign",
    "idCardDemoData",
    "idCardTemplates",
];

const readArray = (key) => {
    try {
        const value = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
};

const readObject = (key) => {
    try {
        return JSON.parse(localStorage.getItem(key) || "{}") || {};
    } catch {
        return {};
    }
};

function Dashboard() {
    const [storedLists, setStoredLists] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [templates, setTemplates] = useState([]);

    const [greeting, setGreeting] = useState("Hello");
    const [currentDate, setCurrentDate] = useState("");

    const [flushOpen, setFlushOpen] = useState(false);
    const [flushText, setFlushText] = useState("");
    const [flushError, setFlushError] = useState("");
    const [flushLoading, setFlushLoading] = useState(false);
    const [dashboardError, setDashboardError] = useState("");

    const loadDashboard = async () => {
        const tokenKeys = [
            "token",
            "authToken",
            "idFoundryToken",
            "accessToken",
        ];

        const token = tokenKeys
            .map((key) => localStorage.getItem(key))
            .find(Boolean);

        // Templates remain local until their backend API is connected.
        setTemplates(readArray("idCardTemplates"));

        if (!token) {
            setDashboardError(
                "Login session not found. Please sign in again."
            );
            setStoredLists([]);
            setSubmissions([]);
            return;
        }

        try {
            setDashboardError("");

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const [masterResponse, submissionResponse] =
                await Promise.all([
                    fetch(`${API_BASE_URL}/api/master-lists`, {
                        headers,
                    }),
                    fetch(`${API_BASE_URL}/api/student-submissions`, {
                        headers,
                    }),
                ]);

            if (
                !masterResponse.ok ||
                !submissionResponse.ok
            ) {
                throw new Error(
                    "Unable to load dashboard data. Please check your login session."
                );
            }

            const masterResult = await masterResponse.json();
            const submissionResult =
                await submissionResponse.json();

            setStoredLists(
                Array.isArray(masterResult.lists)
                    ? masterResult.lists
                    : []
            );

            setSubmissions(
                Array.isArray(submissionResult.submissions)
                    ? submissionResult.submissions
                    : []
            );
        } catch (error) {
            console.error("Dashboard loading error:", error);
            setDashboardError(error.message);
        }
    };

    useEffect(() => {
        loadDashboard();

        const now = new Date();

        setGreeting(
            now.getHours() < 12
                ? "Good morning"
                : now.getHours() < 17
                    ? "Good afternoon"
                    : "Good evening"
        );

        setCurrentDate(
            now.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
            })
        );
    }, []);

    const totalStudents = useMemo(
        () =>
            storedLists.reduce((total, list) => {
                if (Array.isArray(list.records)) {
                    return total + list.records.length;
                }

                if (Array.isArray(list.students)) {
                    return total + list.students.length;
                }

                return total;
            }, 0),
        [storedLists]
    );

    const getStatus = (submission) =>
        String(
            submission.status ||
            submission.verification?.status ||
            "pending"
        ).toLowerCase();

    const pendingSubmissions = useMemo(
        () =>
            submissions.filter(
                (item) => getStatus(item) === "pending"
            ).length,
        [submissions]
    );

    const recentSubmissions = useMemo(
        () =>
            [...submissions]
                .sort((a, b) => {
                    const dateA = new Date(
                        a.updatedAt || a.submittedAt || 0
                    ).getTime();

                    const dateB = new Date(
                        b.updatedAt || b.submittedAt || 0
                    ).getTime();

                    return dateB - dateA;
                })
                .slice(0, 5),
        [submissions]
    );

    const getStudentName = (submission) => {
        const values = submission?.data || {};
        const form = readObject("idCardForm");

        const nameField = (form.fields || []).find((field) => {
            const label = String(
                field.label || field.name || ""
            ).toLowerCase();

            return (
                label === "name" ||
                label.includes("student name") ||
                label.includes("full name")
            );
        });

        if (
            nameField &&
            values[nameField.id] !== undefined &&
            values[nameField.id] !== ""
        ) {
            return String(values[nameField.id]);
        }

        // Fallback when the local form configuration isn't available.
        const submittedName = Object.entries(values).find(
            ([key, value]) =>
                /^(name|studentname|fullname)$/i.test(key) &&
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
        );

        return (
            submission.studentName ||
            submission.name ||
            submission.fullName ||
            submittedName?.[1] ||
            "Student"
        );
    };

    const formatDate = (date) => {
        if (!date) return "—";

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) return "—";

        const diff = Math.max(
            0,
            Math.floor((Date.now() - value.getTime()) / 1000)
        );

        if (diff < 60) return "Just now";
        if (diff < 3600) {
            return `${Math.floor(diff / 60)} min ago`;
        }
        if (diff < 86400) {
            return `${Math.floor(diff / 3600)} hr ago`;
        }

        return value.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
        });
    };

    const navigate = (path) => {
        window.location.href = path;
    };

    const handleFlush = async () => {
        setFlushError("");

        if (flushText.trim() !== "DELETE") {
            setFlushError("Type DELETE to confirm this action.");
            return;
        }

        if (flushLoading) return;

        // IMPORTANT:
        // Replace these keys with the actual JWT storage key
        // used by your login code if it is different.
        const tokenKeys = [
            "token",
            "authToken",
            "idFoundryToken",
            "accessToken",
        ];

        const token = tokenKeys
            .map((key) => localStorage.getItem(key))
            .find(Boolean);

        if (!token) {
            setFlushError(
                "Login session not found. Please sign in again."
            );
            return;
        }

        setFlushLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/student-submissions/flush-all`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    "Unable to clear organization data."
                );
            }

            // Remove local data only after server success.
            DATA_KEYS.forEach((key) => {
                localStorage.removeItem(key);
            });

            setStoredLists([]);
            setSubmissions([]);
            setTemplates([]);

            setFlushText("");
            setFlushError("");
            setFlushOpen(false);
            setDashboardError("");

            window.dispatchEvent(
                new Event("idfoundry:data-cleared")
            );
        } catch (error) {
            console.error("Flush Data failed:", error);

            setFlushError(
                error.message ||
                "Unable to clear data. Please try again."
            );
        } finally {
            setFlushLoading(false);
        }
    };

    const quickActions = [
        {
            icon: <FileUp size={21} />,
            title: "Import Master Data",
            description:
                "Upload student records and organize them into class and division lists.",
            detail: "Step 1 · Prepare your data",
            path: "/listform",
        },
        {
            icon: <ClipboardList size={21} />,
            title: "Create Student Form",
            description:
                "Choose a master list, configure the form, and get a link to share.",
            detail: "Step 2 · Collect information",
            path: "/idlistform",
        },
        {
            icon: <Users size={21} />,
            title: "Review Submissions",
            description:
                "Review student details and check them against your master records.",
            detail: "Step 3 · Verify records",
            path: "/student-data",
        },
        {
            icon: <Palette size={21} />,
            title: "Design ID Card",
            description:
                "Choose a layout, arrange fields, and preview the final card.",
            detail: "Step 4 · Design your card",
            path: "/create-form",
        },
    ];

    const hasData =
        storedLists.length > 0 ||
        submissions.length > 0 ||
        templates.length > 0;

    return (
        <div className="app dashboard-page">
            <Sidebar activePage="dashboard" />

            <main className="main">
                <Topbar />

                <section className="dashboard-content">
                    <header className="dashboard-welcome">
                        <div>
                            <div className="dashboard-date">
                                {currentDate}
                            </div>

                            <h1 className="page-title">
                                {greeting}, Aaditi <span>👋</span>
                            </h1>

                            <p className="page-subtitle">
                                Manage your school's student data and ID card
                                workflow from one place.
                            </p>
                        </div>

                        <div className="dashboard-header-actions">
                            <button
                                type="button"
                                className="flush-trigger"
                                onClick={() => {
                                    setFlushText("");
                                    setFlushError("");
                                    setFlushOpen(true);
                                }}
                                disabled={flushLoading}
                            >
                                <Trash2 size={16} />
                                Flush Data
                            </button>
                        </div>
                    </header>

                    {dashboardError && (
                        <div className="flush-error" role="alert">
                            {dashboardError}
                            <button
                                type="button"
                                onClick={loadDashboard}
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Statistics */}
                    <div className="dashboard-stats">
                        <div className="stat-card">
                            <div className="stat-top">
                                <span className="stat-label">
                                    Master Lists
                                </span>
                                <div className="stat-icon icon-blue">
                                    <Database size={19} />
                                </div>
                            </div>
                            <div className="stat-number">
                                {storedLists.length}
                            </div>
                            <div className="stat-description">
                                Saved class and student lists
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-top">
                                <span className="stat-label">
                                    Student Records
                                </span>
                                <div className="stat-icon icon-violet">
                                    <GraduationCap size={19} />
                                </div>
                            </div>
                            <div className="stat-number">
                                {totalStudents}
                            </div>
                            <div className="stat-description">
                                Records in saved master lists
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-top">
                                <span className="stat-label">
                                    Pending Submissions
                                </span>
                                <div className="stat-icon icon-amber">
                                    <BellRing size={19} />
                                </div>
                            </div>
                            <div className="stat-number">
                                {pendingSubmissions}
                            </div>
                            <div className="stat-description">
                                Awaiting verification
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-top">
                                <span className="stat-label">
                                    Saved Templates
                                </span>
                                <div className="stat-icon icon-green">
                                    <Layers3 size={19} />
                                </div>
                            </div>
                            <div className="stat-number">
                                {templates.length}
                            </div>
                            <div className="stat-description">
                                Reusable ID card designs
                            </div>
                        </div>
                    </div>

                    {/* Recent Submissions */}
                    <div className="section-header dashboard-section-header">
                        <div>
                            <h2 className="section-title">
                                Recent Submissions
                            </h2>
                            <p className="section-description">
                                The latest student form responses
                            </p>
                        </div>

                        {submissions.length > 0 && (
                            <button
                                type="button"
                                className="view-all"
                                onClick={() => navigate("/student-data")}
                            >
                                View submissions <ArrowRight size={15} />
                            </button>
                        )}
                    </div>

                    <div className="table-card dashboard-table-card">
                        {recentSubmissions.length === 0 ? (
                            <div className="dashboard-empty">
                                <div className="empty-illustration">
                                    <ClipboardList size={30} />
                                    <span>✦</span>
                                </div>

                                <h3>
                                    {hasData
                                        ? "No submissions yet"
                                        : "Your workspace is ready"}
                                </h3>

                                <p>
                                    {hasData
                                        ? "Student form responses will appear here when students submit their information."
                                        : "Start by importing your school's student records. Then create a student form and share its link."}
                                </p>

                                <button
                                    type="button"
                                    className="primary-btn"
                                    onClick={() => navigate("/listform")}
                                >
                                    <FileUp size={16} />
                                    Import Master Data
                                    <ArrowRight size={15} />
                                </button>
                            </div>
                        ) : (
                            <div className="dashboard-table-scroll">
                                <table className="dashboard-table">
                                    <thead>
                                        <tr>
                                            <th>STUDENT</th>
                                            <th>LIST</th>
                                            <th>STATUS</th>
                                            <th>UPDATED</th>
                                            <th aria-label="Actions" />
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {recentSubmissions.map(
                                            (submission, index) => {
                                                const name =
                                                    getStudentName(submission);

                                                const status =
                                                    getStatus(submission);

                                                const initials = name
                                                    .split(/\s+/)
                                                    .filter(Boolean)
                                                    .slice(0, 2)
                                                    .map((word) => word[0])
                                                    .join("")
                                                    .toUpperCase();

                                                return (
                                                    <tr
                                                        key={
                                                            submission._id ||
                                                            submission.id ||
                                                            `${name}-${index}`
                                                        }
                                                    >
                                                        <td>
                                                            <div className="id-person">
                                                                <div className="person-photo">
                                                                    {initials || "S"}
                                                                </div>
                                                                <div>
                                                                    <div className="person-name">
                                                                        {name}
                                                                    </div>
                                                                    <div className="person-type">
                                                                        Student
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="template">
                                                            {submission.listName ||
                                                                submission.tabName ||
                                                                "—"}
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={`status-pill status-${status}`}
                                                            >
                                                                <span className="status-dot" />
                                                                {status
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                    status.slice(1)}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            {formatDate(
                                                                submission.updatedAt ||
                                                                submission.submittedAt
                                                            )}
                                                        </td>

                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="action-btn"
                                                                aria-label={`Review ${name}`}
                                                                title="Review submission"
                                                                onClick={() => {
                                                                    if (submission.slug) {
                                                                        navigate(
                                                                            `/studentform/${submission.slug}`
                                                                        );
                                                                    } else {
                                                                        navigate(
                                                                            "/student-data"
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                <ArrowRight size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="section-header dashboard-section-header quick-heading">
                        <div>
                            <h2 className="section-title">
                                Your Workflow
                            </h2>
                            <p className="section-description">
                                Follow these steps to create student ID cards
                            </p>
                        </div>
                    </div>

                    <div className="quick-actions">
                        {quickActions.map((action, index) => (
                            <button
                                type="button"
                                className="quick-card"
                                key={action.title}
                                onClick={() => navigate(action.path)}
                            >
                                <div
                                    className={`quick-icon quick-icon-${index + 1}`}
                                >
                                    {action.icon}
                                </div>

                                <div className="quick-step">
                                    {action.detail}
                                </div>

                                <div className="quick-title">
                                    {action.title}
                                </div>

                                <div className="quick-description">
                                    {action.description}
                                </div>

                                <div className="quick-card-link">
                                    Get started <ArrowRight size={15} />
                                </div>
                            </button>
                        ))}
                    </div>
                </section>
            </main>

            {/* Flush Data Confirmation */}
            {flushOpen && (
                <div
                    className="dashboard-modal-backdrop"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !flushLoading
                        ) {
                            setFlushOpen(false);
                        }
                    }}
                >
                    <section
                        className="dashboard-modal flush-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="flush-title"
                    >
                        <button
                            type="button"
                            className="modal-close"
                            onClick={() => setFlushOpen(false)}
                            disabled={flushLoading}
                            aria-label="Close confirmation"
                        >
                            <X size={19} />
                        </button>

                        <div className="flush-sticker">
                            <div className="flush-sticker-circle">
                                <ShieldAlert size={34} />
                            </div>
                            <span className="flush-spark flush-spark-one">
                                ✦
                            </span>
                            <span className="flush-spark flush-spark-two">
                                ✧
                            </span>
                        </div>

                        <div className="modal-eyebrow">
                            DESTRUCTIVE ACTION
                        </div>

                        <h2 id="flush-title">
                            Clear your IDFoundry data?
                        </h2>

                        <p className="modal-description">
                            This permanently deletes this organization's
                            master lists, student submissions, and student
                            form configurations from the server. Saved
                            browser data will also be removed. This cannot
                            be undone.
                        </p>

                        <div className="flush-list">
                            <div>
                                <Database size={16} />
                                Master lists and student records
                            </div>
                            <div>
                                <Users size={16} />
                                Student submissions
                            </div>
                            <div>
                                <Layers3 size={16} />
                                Form configurations
                            </div>
                            <div>
                                <Palette size={16} />
                                Local templates, designs and demo data
                            </div>
                        </div>

                        <div className="flush-preserve-note">
                            Your login session is preserved. Data belonging
                            to other organizations is not deleted.
                        </div>

                        <label
                            className="flush-confirm-label"
                            htmlFor="flush-confirm"
                        >
                            Type <strong>DELETE</strong> to confirm
                        </label>

                        <input
                            id="flush-confirm"
                            className="flush-confirm-input"
                            value={flushText}
                            onChange={(event) => {
                                setFlushText(event.target.value);
                                setFlushError("");
                            }}
                            placeholder="Type DELETE"
                            autoComplete="off"
                            disabled={flushLoading}
                        />

                        {flushError && (
                            <p className="flush-error" role="alert">
                                {flushError}
                            </p>
                        )}

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="modal-cancel"
                                onClick={() => setFlushOpen(false)}
                                disabled={flushLoading}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="modal-delete"
                                onClick={handleFlush}
                                disabled={flushLoading}
                            >
                                <Trash2 size={16} />
                                {flushLoading
                                    ? "Clearing data..."
                                    : "Clear all data"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
