import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function DataMenuSettings() {
    const [storedLists, setStoredLists] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [toast, setToast] = useState("");

    useEffect(() => {
        loadLists();
    }, []);

    const loadLists = () => {
        try {
            const stored =
                JSON.parse(
                    localStorage.getItem("idCardStoredLists")
                ) || [];

            const savedOrder =
                JSON.parse(
                    localStorage.getItem("idCardMenuOrder")
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

                if (list) orderedLists.push(list);
            });

            stored.forEach((list) => {
                const exists = orderedLists.some(
                    (item) => item.id === list.id
                );

                if (!exists) orderedLists.push(list);
            });

            setStoredLists(orderedLists);
        } catch (error) {
            console.error("Failed to load menu:", error);
            setStoredLists([]);
        }
    };

    const getInitials = (name) => {
        const words = (name || "Untitled")
            .trim()
            .split(/\s+/);

        if (!words[0]) return "A";

        if (words.length === 1) {
            return words[0].charAt(0).toUpperCase();
        }

        return (
            words[0].charAt(0) +
            words[1].charAt(0)
        ).toUpperCase();
    };

    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (event, targetIndex) => {
        event.preventDefault();

        if (
            draggedIndex === null ||
            draggedIndex === targetIndex
        ) {
            return;
        }

        const updatedLists = [...storedLists];
        const [draggedItem] = updatedLists.splice(
            draggedIndex,
            1
        );

        updatedLists.splice(targetIndex, 0, draggedItem);

        setStoredLists(updatedLists);
        setDraggedIndex(targetIndex);
        setHasChanges(true);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const saveOrder = () => {
        const order = storedLists.map((list) => list.id);

        localStorage.setItem(
            "idCardMenuOrder",
            JSON.stringify(order)
        );

        setHasChanges(false);
        setToast("Data menu order saved successfully.");

        setTimeout(() => setToast(""), 2500);
    };

    const resetOrder = () => {
        const alphabetical = [...storedLists].sort(
            (a, b) =>
                (a.tabName || "Untitled").localeCompare(
                    b.tabName || "Untitled"
                )
        );

        setStoredLists(alphabetical);
        setHasChanges(true);
    };

    return (
        <div className="app">
            <Sidebar activePage="settings" />

            <main className="main">
                <Topbar />

                <section className="content data-menu-page">
                    {/* PAGE HEADER */}
                    <header className="page-header data-menu-header">
                        <div className="data-menu-heading">
                            <div className="breadcrumb">
                                <span>Settings</span>
                                <span>/</span>
                                <span>Data Menu</span>
                            </div>

                            <h1>Data Menu</h1>

                            <p>
                                Organize your stored student lists
                                and control the order they appear
                                in your sidebar.
                            </p>
                        </div>

                    </header>

                    {/* MAIN CONTENT + ASIDE */}
                    <div className="layout">
                        <section className="settings-card data-menu-card">
                            <div className="settings-card-header">
                                <div>

                                    <h2>Stored Data</h2>

                                    <p>
                                        Drag items to change their
                                        position in your Data menu.
                                    </p>
                                </div>

                                <span className="list-count-badge">
                                    {storedLists.length}{" "}
                                    {storedLists.length === 1
                                        ? "list"
                                        : "lists"}
                                </span>
                            </div>

                            <div className="drag-menu">
                                {!storedLists.length ? (
                                    <div className="empty-menu">
                                        <div className="empty-menu-icon">
                                            <span aria-hidden="true">
                                                ▤
                                            </span>
                                        </div>

                                        <h3>No stored data yet</h3>

                                        <p>
                                            Create or import a student
                                            list to start organizing
                                            your Data menu.
                                        </p>
                                    </div>
                                ) : (
                                    storedLists.map((list, index) => (
                                        <div
                                            key={list.id}
                                            className={`drag-menu-item ${
                                                draggedIndex === index
                                                    ? "dragging"
                                                    : ""
                                            }`}
                                            draggable
                                            onDragStart={() =>
                                                handleDragStart(index)
                                            }
                                            onDragOver={(event) =>
                                                handleDragOver(
                                                    event,
                                                    index
                                                )
                                            }
                                            onDragEnd={handleDragEnd}
                                        >
                                            <div
                                                className="drag-handle"
                                                title="Drag to reorder"
                                                aria-label="Drag to reorder"
                                            >
                                                ⠿
                                            </div>

                                            <div className="menu-letter">
                                                {getInitials(
                                                    list.tabName
                                                )}
                                            </div>

                                            <div className="menu-info">
                                                <div className="menu-name">
                                                    {list.tabName ||
                                                        "Untitled"}
                                                </div>

                                                <div className="menu-meta">
                                                    {list.listName ||
                                                        "Student data list"}
                                                </div>
                                            </div>

                                            <div className="menu-position">
                                                {index + 1}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="bottom-actions">
                                <button
                                    type="button"
                                    className="ui-btn ui-btn--secondary"
                                    onClick={resetOrder}
                                    disabled={!storedLists.length}
                                >
                                    Sort A–Z
                                </button>

                                <button
                                    type="button"
                                    className="ui-btn ui-btn--primary"
                                    onClick={saveOrder}
                                    disabled={!hasChanges}
                                >
                                    Save Order
                                </button>
                            </div>
                        </section>

                        <aside className="info-card">
                            <div className="info-card-heading">
                                <div className="info-heading-icon">i</div>

                                <div>
                                    <h3>How Data Menu Works</h3>
                                    <p>Arrange your stored student lists in the order that works best for your daily workflow.</p>
                                </div>
                            </div>

                            <div className="info-divider" />

                            <div className="info-item">
                                <div className="info-number">1</div>

                                <div>
                                    <strong>Drag a list</strong>
                                    <span>
                                        Move any list up or down using its drag handle.
                                    </span>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-number">2</div>

                                <div>
                                    <strong>Review the order</strong>
                                    <span>
                                       Check the numbered positions before saving.
                                    </span>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-number">3</div>

                                <div>
                                    <strong>Save changes</strong>
                                    <span>
                                        Keep your preferred order for the sidebar.
                                    </span>
                                </div>
                            </div>


                        </aside>


                    </div>
                </section>
            </main>

            {toast && (
                <div className="settings-toast" role="status">
                    <span aria-hidden="true">✓</span>
                    {toast}
                </div>
            )}
        </div>
    );
}

export default DataMenuSettings;
