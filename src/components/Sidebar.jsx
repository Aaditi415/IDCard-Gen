import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Database,
    ClipboardList,
    IdCard,
    PanelsTopLeft,
    ClipboardPenLine,
    FileUp,
    UserRoundPlus,
    Settings,
    Palette,
    ListOrdered,
    ChevronDown,
    Menu,
    X,
    FolderOpen,
    Users,
} from "lucide-react";

import "../styles/sidebar.css";

function Sidebar({ activePage = "dashboard" }) {
    const [storedLists, setStoredLists] = useState([]);
    const [studentLists, setStudentLists] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedStudentListId, setSelectedStudentListId] =
        useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    const currentPath = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    const currentPage =
        currentPath === "/" ||
        currentPath.endsWith("/dashboard")
            ? "dashboard"
            : currentPath.endsWith("/stored-data") ||
              currentPath.endsWith("/stored-data.html")
            ? "stored-data"
            : currentPath.startsWith("/student-data")
            ? "student-data"
            : currentPath.startsWith("/studentform/")
            ? "studentform"
            : currentPath.endsWith("/listform") ||
              currentPath.endsWith("/listform.html") ||
              currentPath.endsWith("/importdata") ||
              currentPath.endsWith("/importdata.html")
            ? "import"
            : currentPath.endsWith("/add-single-record") ||
              currentPath.endsWith("/single-record") ||
              currentPath.endsWith("/single-record-review")
            ? "single-record"
            : currentPath.endsWith("/idlistform") ||
              currentPath.endsWith("/idlistform.html")
            ? "cards"
            : currentPath.endsWith("/templates") ||
              currentPath.endsWith("/templates.html")
            ? "templates"
            : currentPath.endsWith("/create-form") ||
              currentPath.endsWith("/create-form.html")
            ? "createform"
            : currentPath.endsWith("/settings") ||
              currentPath.endsWith("/settings.html")
            ? "settings"
            : currentPath.endsWith("/data-menu-settings") ||
              currentPath.endsWith("/data-menu-settings.html")
            ? "data-menu-settings"
            : activePage;

    const isMasterDataPage =
        currentPage === "data" ||
        currentPage === "stored-data" ||
        currentPage === "import";

    const isSubmissionsPage =
        currentPage === "student-data" ||
        currentPage === "studentform" ||
        currentPage === "single-record";

    // Only one expandable section can be open.
    const [openSection, setOpenSection] = useState(() => {
        if (isMasterDataPage) return "master-data";
        if (isSubmissionsPage) return "submissions";

        if (
            currentPage === "settings" ||
            currentPage === "data-menu-settings"
        ) {
            return "settings";
        }

        return null;
    });

    /* =====================================================
       LOAD MASTER DATA FROM MONGODB
       KEEP SUBMISSIONS SEPARATE
    ===================================================== */

    useEffect(() => {
        setSelectedId(params.get("id"));
        setSelectedStudentListId(params.get("listId"));

        let cancelled = false;

        const loadSidebarData = async () => {
            let savedStudentLists = [];
            let masterListIds = new Set();

            try {
                // Existing submission-list storage.
                const savedLists = JSON.parse(
                    localStorage.getItem("idCardLists") || "[]"
                );

                savedStudentLists = Array.isArray(savedLists)
                    ? savedLists
                    : [];
            } catch (error) {
                console.error(
                    "Failed to load submission lists:",
                    error
                );
            }

            try {
                const token = localStorage.getItem("idFoundryToken");
                const apiBaseUrl =
                    import.meta.env.VITE_API_URL ||
                    "http://localhost:5000";

                if (!token) {
                    if (!cancelled) {
                        setStoredLists([]);
                        setStudentLists(savedStudentLists);
                    }
                    return;
                }

                const response = await fetch(
                    `${apiBaseUrl}/api/master-lists`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to load master lists (${response.status})`
                    );
                }

                const result = await response.json();

                // Normalize MongoDB IDs for navigation and selection.
                const validLists = (result.lists || [])
                    .filter((list) => list._id || list.id)
                    .map((list) => ({
                        ...list,
                        id: String(list._id || list.id),
                    }));

                masterListIds = new Set(
                    validLists.map((list) => String(list.id))
                );

                // Preserve the user's saved menu ordering.
                let savedOrder = [];

                try {
                    const parsedOrder = JSON.parse(
                        localStorage.getItem("idCardMenuOrder") || "[]"
                    );

                    savedOrder = Array.isArray(parsedOrder)
                        ? parsedOrder.map(String)
                        : [];
                } catch {
                    savedOrder = [];
                }

                const orderedLists = [
                    ...savedOrder
                        .map((id) =>
                            validLists.find(
                                (list) => String(list.id) === id
                            )
                        )
                        .filter(Boolean),

                    ...validLists.filter(
                        (list) => !savedOrder.includes(String(list.id))
                    ),
                ];

                if (!cancelled) {
                    setStoredLists(orderedLists);

                    // Do not show MongoDB master lists as submission lists.
                    const separateStudentLists = savedStudentLists.filter(
                        (list) => {
                            const listId = String(
                                list._id || list.id || ""
                            );

                            return !masterListIds.has(listId);
                        }
                    );

                    setStudentLists(separateStudentLists);
                }
            } catch (error) {
                console.error(
                    "Failed to load master lists:",
                    error
                );

                if (!cancelled) {
                    setStoredLists([]);

                    // Keep existing submissions available if the API fails.
                    setStudentLists(savedStudentLists);
                }
            }
        };

        loadSidebarData();

        return () => {
            cancelled = true;
        };
    }, []);

    /* =====================================================
       MOBILE SIDEBAR
    ===================================================== */

    useEffect(() => {
        if (!mobileOpen) return;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setMobileOpen(false);
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleEscape);
        };
    }, [mobileOpen]);

    const navigate = (url) => {
        setMobileOpen(false);
        window.location.href = url;
    };

    const toggleSection = (section) => {
        setOpenSection((current) =>
            current === section ? null : section
        );
    };

    const getInitials = (name = "") => {
        const words = name.trim().split(/\s+/).filter(Boolean);

        if (!words.length) return "—";

        return words
            .slice(0, 2)
            .map((word) => word[0].toUpperCase())
            .join("");
    };

    const navItemClass = (page, extraClass = "") =>
        `nav-item ${currentPage === page ? "active" : ""} ${extraClass}`
            .trim();

    const isDataActive = isMasterDataPage;

    const isSubmissionActive = isSubmissionsPage;

    return (
        <>
            {/* Mobile menu trigger */}
            <button
                type="button"
                className="sidebar-mobile-toggle"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
                aria-controls="idfoundry-sidebar"
            >
                <Menu size={21} />
            </button>

            {/* Mobile backdrop */}
            {mobileOpen && (
                <button
                    type="button"
                    className="sidebar-overlay"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close navigation menu"
                />
            )}

            <aside
                id="idfoundry-sidebar"
                className={`sidebar ${
                    mobileOpen ? "sidebar-open" : ""
                }`}
                aria-label="Main navigation"
            >
                {/* Brand */}
                <div className="sidebar-brand">
                    <div className="logo-icon" aria-hidden="true">
                        ID
                    </div>

                    <div className="logo-text">
                        <span className="brand-name">IDFoundry</span>
                        <span className="brand-tagline">
                            Create. Verify. Identify.
                        </span>
                    </div>

                    <button
                        type="button"
                        className="sidebar-close"
                        onClick={() => setMobileOpen(false)}
                        aria-label="Close navigation menu"
                    >
                        <X size={19} />
                    </button>
                </div>

                {/* Scrollable navigation */}
                <div className="sidebar-scroll">
                    <div className="nav-title">Workspace</div>

                    <nav className="nav" aria-label="Workspace">
                        <button
                            type="button"
                            className={navItemClass("dashboard")}
                            onClick={() => navigate("/dashboard")}
                        >
                            <LayoutDashboard className="nav-icon" />
                            <span className="nav-label">Dashboard</span>
                        </button>

                        {/* Master Data */}
                        <button
                            type="button"
                            className={`nav-item ${
                                isDataActive ? "section-active" : ""
                            }`}
                            onClick={() => toggleSection("master-data")}
                            aria-expanded={openSection === "master-data"}
                            aria-controls="master-data-submenu"
                        >
                            <Database className="nav-icon" />
                            <span className="nav-label">Master Data</span>
                            <ChevronDown
                                className={`nav-chevron ${
                                    openSection === "master-data"
                                        ? "rotated"
                                        : ""
                                }`}
                            />
                        </button>

                        {openSection === "master-data" && (
                            <div
                                id="master-data-submenu"
                                className="nav-submenu"
                            >
                                <button
                                    type="button"
                                    className={`stored-item ${
                                        currentPage === "import"
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() => navigate("/listform")}
                                >
                                    <FileUp className="submenu-icon" />
                                    <span className="stored-name">
                                        Import Data
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    className={`stored-item ${
                                        currentPage === "single-record"
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        navigate("/single-record")
                                    }
                                >
                                    <UserRoundPlus className="submenu-icon" />
                                    <span className="stored-name">
                                        Add Single Record
                                    </span>
                                </button>

                                {storedLists.length > 0 && (
                                    <div className="submenu-caption">
                                        Your lists
                                    </div>
                                )}

                                {storedLists.length === 0 ? (
                                    <div className="nav-empty">
                                        <FolderOpen size={15} />
                                        <span>No master lists yet</span>
                                    </div>
                                ) : (
                                    storedLists.map((list) => (
                                        <button
                                            type="button"
                                            key={list.id}
                                            className={`stored-item ${
                                                currentPage === "stored-data" &&
                                                String(list.id) ===
                                                    String(selectedId)
                                                    ? "active"
                                                    : ""
                                            }`}
                                            title={
                                                list.tabName ||
                                                "Untitled list"
                                            }
                                            onClick={() =>
                                                navigate(
                                                    "/stored-data?id=" +
                                                        encodeURIComponent(
                                                            list.id
                                                        )
                                                )
                                            }
                                        >
                                            <span className="stored-letter">
                                                {getInitials(
                                                    list.tabName ||
                                                        list.listName ||
                                                        "List"
                                                )}
                                            </span>

                                            <span className="stored-name">
                                                {list.tabName ||
                                                    list.listName ||
                                                    "Untitled list"}
                                            </span>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Submissions */}
                        <button
                            type="button"
                            className={`nav-item ${
                                isSubmissionActive
                                    ? "section-active"
                                    : ""
                            }`}
                            onClick={() => toggleSection("submissions")}
                            aria-expanded={openSection === "submissions"}
                            aria-controls="submissions-submenu"
                        >
                            <ClipboardList className="nav-icon" />
                            <span className="nav-label">Submissions</span>
                            <ChevronDown
                                className={`nav-chevron ${
                                    openSection === "submissions"
                                        ? "rotated"
                                        : ""
                                }`}
                            />
                        </button>

                        {openSection === "submissions" && (
                            <div
                                id="submissions-submenu"
                                className="nav-submenu"
                            >
                                {studentLists.length > 0 && (
                                    <div className="submenu-caption">
                                        Submission lists
                                    </div>
                                )}

                                {studentLists.length === 0 ? (
                                    <div className="nav-empty">
                                        <Users size={15} />
                                        <span>
                                            No submission lists yet
                                        </span>
                                    </div>
                                ) : (
                                    studentLists.map((list) => (
                                        <button
                                            type="button"
                                            key={list.id || list._id}
                                            className={`stored-item ${
                                                currentPage === "student-data" &&
                                                String(
                                                    list.id || list._id
                                                ) ===
                                                    String(
                                                        selectedStudentListId
                                                    )
                                                    ? "active"
                                                    : ""
                                            }`}
                                            title={
                                                list.tabName ||
                                                list.listName ||
                                                "Untitled list"
                                            }
                                            onClick={() =>
                                                navigate(
                                                    "/student-data?listId=" +
                                                        encodeURIComponent(
                                                            list.id ||
                                                                list._id
                                                        )
                                                )
                                            }
                                        >
                                            <span className="stored-letter">
                                                {getInitials(
                                                    list.tabName ||
                                                        list.listName ||
                                                        "List"
                                                )}
                                            </span>

                                            <span className="stored-name">
                                                {list.tabName ||
                                                    list.listName ||
                                                    "Untitled list"}
                                            </span>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        <div className="nav-divider" />

                        <button
                            type="button"
                            className={navItemClass("student-forms")}
                            onClick={() => navigate("/idlistform")}
                        >
                            <ClipboardPenLine className="nav-icon" />
                            <span className="nav-label">
                                Student Forms
                            </span>
                        </button>

                        <button
                            type="button"
                            className={navItemClass("templates")}
                            onClick={() => navigate("/templates")}
                        >
                            <PanelsTopLeft className="nav-icon" />
                            <span className="nav-label">Templates</span>
                        </button>

                        <button
                            type="button"
                            className={navItemClass(
                                "createform",
                                "create-nav"
                            )}
                            onClick={() => navigate("/create-form")}
                        >
                            <IdCard className="nav-icon" />
                            <span className="nav-label">
                                Create Design
                            </span>
                        </button>
                    </nav>

                    <div className="nav-title nav-title-system">
                        System
                    </div>

                    <nav className="nav" aria-label="System">
                        {/* Settings */}
                        <button
                            type="button"
                            className={`nav-item ${
                                currentPage === "settings" ||
                                currentPage === "data-menu-settings"
                                    ? "section-active"
                                    : ""
                            }`}
                            onClick={() => toggleSection("settings")}
                            aria-expanded={openSection === "settings"}
                            aria-controls="settings-submenu"
                        >
                            <Settings className="nav-icon" />
                            <span className="nav-label">Settings</span>
                            <ChevronDown
                                className={`nav-chevron ${
                                    openSection === "settings"
                                        ? "rotated"
                                        : ""
                                }`}
                            />
                        </button>

                        {openSection === "settings" && (
                            <div
                                id="settings-submenu"
                                className="nav-submenu"
                            >
                                <button
                                    type="button"
                                    className={`stored-item ${
                                        currentPage === "settings"
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        navigate("/settings")
                                    }
                                >
                                    <Palette className="submenu-icon" />
                                    <span className="stored-name">
                                        Appearance
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    className={`stored-item ${
                                        currentPage ===
                                        "data-menu-settings"
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        navigate("/data-menu-settings")
                                    }
                                >
                                    <ListOrdered className="submenu-icon" />
                                    <span className="stored-name">
                                        Data Menu
                                    </span>
                                </button>
                            </div>
                        )}
                    </nav>
                </div>

                {/* Pinned account footer */}
                <div className="sidebar-bottom">
                    <div className="sidebar-user">
                        <div className="avatar">AG</div>

                        <div className="user-info">
                            <div className="user-name">Aaditi</div>
                            <div className="user-role">
                                Administrator
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;