
import { useEffect, useMemo, useState } from "react";
import {
    ArrowRight,
    BellRing,
    ClipboardList,
    Database,
    FileUp,
    GraduationCap,
    IdCard,
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
 

    const loadDashboard = () => {
        setStoredLists(readArray("idCardStoredLists"));
        setSubmissions(readArray("idCardSubmissions"));
        setTemplates(readArray("idCardTemplates"));
    };

    useEffect(() => {
        loadDashboard();

        const now = new Date();
        const hour = now.getHours();

        setGreeting(
            hour < 12
                ? "Good morning"
                : hour < 17
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
                if (Array.isArray(list.students)) {
                    return total + list.students.length;
                }

                if (Array.isArray(list.records)) {
                    return total + list.records.length;
                }

                return total;
            }, 0),
        [storedLists]
    );

    const pendingSubmissions = useMemo(
        () =>
            submissions.filter((item) => {
                const status =
                    item.status || item.verification?.status || "pending";

                return status.toLowerCase() === "pending";
            }).length,
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

    const studentForm = useMemo(
        () => readObject("idCardForm"),
        []
    );

    const getStudentName = (submission) => {
        const values = submission?.data || {};

        const form = readObject("idCardForm");
        const nameField = form.fields?.find((field) => {
            const label = (
                field.label ||
                field.name ||
                ""
            ).toLowerCase();

            return (
                label === "name" ||
                label.includes("student name") ||
                label.includes("full name")
            );
        });

        if (nameField && values[nameField.id]) {
            return String(values[nameField.id]);
        }

        return (
            submission.studentName ||
            submission.name ||
            submission.fullName ||
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
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;

        return value.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
        });
    };

    const getStatus = (submission) =>
        (
            submission.status ||
            submission.verification?.status ||
            "pending"
        ).toLowerCase();

    const navigate = (path) => {
        window.location.href = path;
    };

    const handleFlush = () => {
        setFlushError("");

        if (flushText.trim() !== "DELETE") {
            setFlushError('Type DELETE to confirm this action.');
            return;
        }

        try {
            DATA_KEYS.forEach((key) => localStorage.removeItem(key));

            setStoredLists([]);
            setSubmissions([]);
            setTemplates([]);
            setFlushText("");
            setFlushOpen(false);

            window.dispatchEvent(new Event("idfoundry:data-cleared"));
        } catch (error) {
            console.error("Failed to clear IDFoundry data:", error);
            setFlushError(
                "Some data could not be cleared. Please try again."
            );
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

                <section className="content dashboard-content">
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
                            >
                                <Trash2 size={16} />
                                Flush Data
                            </button>
                        </div>
                    </header>

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

                    {/* Recent activity */}
                    <div className="section-header dashboard-section-header">
                        <div>
                            <h2 className="section-title">Recent Submissions</h2>
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
                                        {recentSubmissions.map((submission, index) => {
                                            const name = getStudentName(submission);
                                            const status = getStatus(submission);
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
                                                        submission.id ||
                                                        submission.slug ||
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
                                                            {status.charAt(0).toUpperCase() +
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
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="section-header dashboard-section-header quick-heading">
                        <div>
                            <h2 className="section-title">Your Workflow</h2>
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
                                <div className={`quick-icon quick-icon-${index + 1}`}>
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

            {/* Flush Data confirmation */}
            {flushOpen && (
                <div
                    className="dashboard-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
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
                            aria-label="Close confirmation"
                        >
                            <X size={19} />
                        </button>

                        <div className="flush-sticker">
                            <div className="flush-sticker-circle">
                                <ShieldAlert size={34} />
                            </div>
                            <span className="flush-spark flush-spark-one">✦</span>
                            <span className="flush-spark flush-spark-two">✧</span>
                        </div>

                        <div className="modal-eyebrow">DESTRUCTIVE ACTION</div>
                        <h2 id="flush-title">Clear your IDFoundry data?</h2>

                        <p className="modal-description">
                            This removes saved application data from this
                            browser. This action cannot be undone.
                        </p>

                        <div className="flush-list">
                            <div><Database size={16} /> Imported master lists and list order</div>
                            <div><Users size={16} /> Student lists and submissions</div>
                            <div><Layers3 size={16} /> Saved templates, forms and card designs</div>
                        </div>

                        <div className="flush-preserve-note">
                            Your theme preference is preserved. This does not
                            delete data stored on another device or server.
                        </div>

                        <label className="flush-confirm-label" htmlFor="flush-confirm">
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
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="modal-delete"
                                onClick={handleFlush}
                            >
                                <Trash2 size={16} />
                                Clear all data
                            </button>
                        </div>
                    </section>
                </div>
            )}

           
        </div>
    );
}

export default Dashboard;