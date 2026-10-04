import { useEffect, useState } from "react";

function Sidebar({ activePage = "dashboard" }) {
    const [storedLists, setStoredLists] = useState([]);
    const [studentLists, setStudentLists] = useState([]);

    const [selectedId, setSelectedId] = useState(null);
    const [selectedStudentListId, setSelectedStudentListId] =
        useState(null);

    const currentPath = window.location.pathname;

    const currentPage =
        currentPath.endsWith("/dashboard") ||
        currentPath === "/"
            ? "dashboard"
            : currentPath.endsWith("/stored-data") ||
              currentPath.endsWith("/stored-data.html")
            ? "stored-data"
            : currentPath.startsWith("/student-data")
            ? "student-data"
            : currentPath.startsWith("/studentform/")
            ? "student-form"
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
            : currentPath.endsWith("/create-form") ||
              currentPath.endsWith("/create-form.html")
            ? "createform"
            : currentPath.endsWith("/settings") ||
              currentPath.endsWith("/settings.html")
            ? "settings"
            : activePage;

    const [isDataOpen, setIsDataOpen] = useState(
        currentPage === "data" ||
        currentPage === "stored-data"
    );

    const [isStudentApplicationsOpen, setIsStudentApplicationsOpen] =
        useState(
            currentPage === "student-data" ||
            currentPage === "student-form"
        );

    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {
        loadStoredLists();
        loadStudentLists();

        const params = new URLSearchParams(
            window.location.search
        );

        setSelectedId(params.get("id"));
        setSelectedStudentListId(
            params.get("listId")
        );
    }, []);

    /* =====================================================
       LOAD STORED DATA LISTS
    ===================================================== */

    const loadStoredLists = () => {
        try {
            const stored =
                JSON.parse(
                    localStorage.getItem(
                        "idCardStoredLists"
                    )
                ) || [];

            const savedOrder =
                JSON.parse(
                    localStorage.getItem(
                        "idCardMenuOrder"
                    )
                ) || [];

            if (!savedOrder.length) {
                setStoredLists(stored);
                return;
            }

            const orderedLists = [];

            savedOrder.forEach((id) => {
                const list = stored.find(
                    (item) => item.id === id
                );

                if (list) {
                    orderedLists.push(list);
                }
            });

            stored.forEach((list) => {
                const alreadyExists =
                    orderedLists.some(
                        (item) =>
                            item.id === list.id
                    );

                if (!alreadyExists) {
                    orderedLists.push(list);
                }
            });

            setStoredLists(orderedLists);
        } catch (error) {
            console.error(
                "Failed to load stored lists:",
                error
            );

            setStoredLists([]);
        }
    };

    /* =====================================================
       LOAD STUDENT APPLICATION LISTS
    ===================================================== */

    const loadStudentLists = () => {
        try {
            const stored =
                JSON.parse(
                    localStorage.getItem(
                        "idCardLists"
                    )
                ) || [];

            setStudentLists(
                Array.isArray(stored)
                    ? stored
                    : []
            );
        } catch (error) {
            console.error(
                "Failed to load student lists:",
                error
            );

            setStudentLists([]);
        }
    };

    /* =====================================================
       NAVIGATION
    ===================================================== */

    const handleDashboard = () => {
        window.location.href = "/dashboard";
    };

    const handleImport = () => {
        window.location.href = "/listform";
    };

    const handleCreate = () => {
        window.location.href = "/create-form";
    };

    const handleStoredList = (id) => {
        window.location.href =
            "/stored-data?id=" +
            encodeURIComponent(id);
    };

    const handleStudentList = (list) => {
        window.location.href =
            "/student-data?listId=" +
            encodeURIComponent(list.id);
    };

    const handleCards = () => {
        window.location.href = "/idlistform";
    };

    const handleSettings = () => {
        window.location.href = "/settings";
    };

    const handleTemplates = () => {
        window.location.href = "/templates";
    };

    /* =====================================================
       DATA MENU TOGGLE
    ===================================================== */

    const handleDataToggle = () => {
        setIsDataOpen((prev) => !prev);
    };

    /* =====================================================
       STUDENT APPLICATIONS TOGGLE
    ===================================================== */

    const handleStudentApplicationsToggle = () => {
        setIsStudentApplicationsOpen(
            (prev) => !prev
        );
    };

    /* =====================================================
       INITIALS
    ===================================================== */

    const getInitials = (name) => {
        const words = name
            .trim()
            .split(/\s+/);

        if (!words.length || !words[0]) {
            return "A";
        }

        if (words.length === 1) {
            return words[0]
                .charAt(0)
                .toUpperCase();
        }

        return (
            words[0].charAt(0) +
            words[1].charAt(0)
        ).toUpperCase();
    };

    return (
        <aside className="sidebar">

            {/* =================================================
                LOGO
            ================================================= */}

            <div className="logo">

                <div className="logo-icon">
                    ID
                </div>

                <div className="logo-text">
                    ID Card Gen

                    <span>
                        Digital ID Management
                    </span>
                </div>

            </div>


            {/* =================================================
                WORKSPACE
            ================================================= */}

            <div className="nav-title">
                Workspace
            </div>


            <nav className="nav">

                {/* =================================================
                    DASHBOARD
                ================================================= */}

                <button
                    className={`nav-item ${
                        currentPage === "dashboard"
                            ? "active"
                            : ""
                    }`}
                    onClick={handleDashboard}
                >
                    <span className="nav-icon">
                        ⌂
                    </span>

                    <span>
                        Dashboard
                    </span>
                </button>


                {/* =================================================
                    DATA
                ================================================= */}

                <button
                    className={`nav-item ${
                        currentPage === "data" ||
                        currentPage === "stored-data"
                            ? "active"
                            : ""
                    }`}
                    onClick={handleDataToggle}
                >
                    <span className="nav-icon">
                        ⌂
                    </span>

                    <span>
                        Data
                    </span>

                    <span
                        style={{
                            marginLeft: "auto",
                            fontSize: "11px",
                            color: "#9ca3af",
                            transition:
                                "transform 0.2s ease",
                            transform: isDataOpen
                                ? "rotate(180deg)"
                                : "rotate(0deg)"
                        }}
                    >
                        ⌄
                    </span>
                </button>


                {/* =================================================
                    DATA SUBMENU
                ================================================= */}

                {isDataOpen && (
                    <div
                        id="storedList"
                        className="stored-list"
                    >

                        {!storedLists.length ? (
                            <div
                                style={{
                                    color: "#777b82",
                                    fontSize: "12px",
                                    padding: "8px 10px"
                                }}
                            >
                                No stored data
                            </div>
                        ) : (
                            storedLists.map((list) => (
                                <button
                                    key={list.id}
                                    className={`stored-item ${
                                        list.id ===
                                        selectedId
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleStoredList(
                                            list.id
                                        )
                                    }
                                >

                                    <span className="stored-letter">
                                        {getInitials(
                                            list.tabName ||
                                                "Untitled"
                                        )}
                                    </span>

                                    <span className="stored-name">
                                        {list.tabName ||
                                            "Untitled"}
                                    </span>

                                </button>
                            ))
                        )}

                    </div>
                )}


                {/* =================================================
                    STUDENT APPLICATIONS
                ================================================= */}

                <button
                    className={`nav-item ${
                        currentPage === "student-data" ||
                        currentPage === "student-form"
                            ? "active"
                            : ""
                    }`}
                    onClick={
                        handleStudentApplicationsToggle
                    }
                >

                    <span className="nav-icon">
                        ◉
                    </span>

                    <span>
                        Student Applications
                    </span>

                    <span
                        style={{
                            marginLeft: "auto",
                            fontSize: "11px",
                            color: "#9ca3af",
                            transition:
                                "transform 0.2s ease",
                            transform:
                                isStudentApplicationsOpen
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)"
                        }}
                    >
                        ⌄
                    </span>

                </button>


                {/* =================================================
                    STUDENT APPLICATION LISTS
                ================================================= */}

                {isStudentApplicationsOpen && (
                    <div
                        className="stored-list"
                    >

                        {!studentLists.length ? (
                            <div
                                style={{
                                    color: "#777b82",
                                    fontSize: "12px",
                                    padding: "8px 10px"
                                }}
                            >
                                No student lists
                            </div>
                        ) : (
                            studentLists.map((list) => (
                                <button
                                    key={list.id}
                                    className={`stored-item ${
                                        list.id ===
                                        selectedStudentListId
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleStudentList(
                                            list
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
                                            "Untitled"}
                                    </span>

                                </button>
                            ))
                        )}

                    </div>
                )}


                {/* =================================================
                    ID CARDS
                ================================================= */}

                <button
                    className={`nav-item ${
                        currentPage === "cards"
                            ? "active"
                            : ""
                    }`}
                    onClick={handleCards}
                >
                    <span className="nav-icon">
                        ▣
                    </span>

                    <span>
                        ID Cards
                    </span>
                </button>


                {/* =================================================
                    TEMPLATES
                ================================================= */}

                <button
                    className={`nav-item ${
                        currentPage === "templates"
                            ? "active"
                            : ""
                    }`}
                    onClick={handleTemplates}
                >
                    <span className="nav-icon">
                        ▤
                    </span>

                    <span>
                        Templates
                    </span>
                </button>


                {/* =================================================
                    IMPORT DATA
                ================================================= */}

                <button
                    className={`nav-item ${
                        currentPage === "import"
                            ? "active"
                            : ""
                    }`}
                    onClick={handleImport}
                >
                    <span className="nav-icon">
                        ↓
                    </span>

                    <span>
                        Import Data
                    </span>
                </button>


                {/* =================================================
                    ADD SINGLE RECORD
                ================================================= */}

                <button
                    className={`nav-item ${
                        currentPage === "single-record"
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        (window.location.href =
                            "/single-record")
                    }
                >
                    <span className="nav-icon">
                        ＋
                    </span>

                    <span>
                        Add Single Record
                    </span>
                </button>


                {/* =================================================
                    CREATE ID CARD
                ================================================= */}

                <button
                    className={`nav-item create-nav ${
                        currentPage === "createform"
                            ? "active"
                            : ""
                    }`}
                    onClick={handleCreate}
                >
                    <span className="nav-icon">
                        ＋
                    </span>

                    <span>
                        Create ID Card
                    </span>
                </button>

            </nav>


            {/* =================================================
                SYSTEM
            ================================================= */}

            <div
                className="nav-title"
                style={{
                    marginTop: "28px"
                }}
            >
                System
            </div>


            <nav className="nav">

                <button
                    className={`nav-item ${
                        currentPage === "settings"
                            ? "active"
                            : ""
                    }`}
                    onClick={handleSettings}
                >
                    <span className="nav-icon">
                        ⚙
                    </span>

                    <span>
                        Settings
                    </span>
                </button>

            </nav>


            {/* =================================================
                SIDEBAR USER
            ================================================= */}

            <div className="sidebar-bottom">

                <div className="sidebar-user">

                    <div className="avatar">
                        AG
                    </div>

                    <div className="user-info">

                        <div className="user-name">
                            Aaditi
                        </div>

                        <div className="user-role">
                            Administrator
                        </div>

                    </div>

                </div>

            </div>

        </aside>
    );
}

export default Sidebar;