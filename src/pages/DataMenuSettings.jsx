
import { useCallback, useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

// Match these token keys to the ones used by your working Dashboard.
const getAuthToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("idFoundryToken") ||
    localStorage.getItem("accessToken");

function DataMenuSettings() {
    const [storedLists, setStoredLists] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [toast, setToast] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const showToast = (message) => {
        setToast(message);
        window.setTimeout(() => setToast(""), 2500);
    };

    const request = useCallback(async (path, options = {}) => {
        const token = getAuthToken();

        if (!token) {
            throw new Error(
                "Authentication token not found. Please sign in again."
            );
        }

        const response = await fetch(
            `${API_BASE_URL}${path}`,
            {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    ...options.headers,
                },
            }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok || result.success === false) {
            throw new Error(
                result.message || "Unable to complete the request."
            );
        }

        return result;
    }, []);

    const loadLists = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [masterResult, orderResult] = await Promise.all([
                request("/api/master-lists"),
                request("/api/master-lists/menu-order"),
            ]);

            const lists = Array.isArray(masterResult.lists)
                ? masterResult.lists
                : [];

            const savedOrder = Array.isArray(orderResult.listOrder)
                ? orderResult.listOrder
                : [];

            const orderedLists = [];
            const usedIds = new Set();

            savedOrder.forEach((id) => {
                const list = lists.find(
                    (item) => String(item._id || item.id) === String(id)
                );

                if (list) {
                    const listId = String(list._id || list.id);

                    if (!usedIds.has(listId)) {
                        orderedLists.push(list);
                        usedIds.add(listId);
                    }
                }
            });

            // Add newly created lists that aren't in the saved order yet.
            lists.forEach((list) => {
                const id = String(list._id || list.id);

                if (!usedIds.has(id)) {
                    orderedLists.push(list);
                    usedIds.add(id);
                }
            });

            setStoredLists(orderedLists);
            setHasChanges(false);
        } catch (err) {
            console.error("Load Data Menu error:", err);
            setError(err.message || "Unable to load stored data.");
        } finally {
            setLoading(false);
        }
    }, [request]);

    useEffect(() => {
        loadLists();
    }, [loadLists]);

    const getListId = (list) => String(list._id || list.id);

    const getInitials = (name) => {
        const words = (name || "Untitled").trim().split(/\s+/);

        if (!words[0]) return "A";

        if (words.length === 1) {
            return words[0].charAt(0).toUpperCase();
        }

        return (
            words[0].charAt(0) + words[1].charAt(0)
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

        setStoredLists((currentLists) => {
            const updatedLists = [...currentLists];

            const [draggedItem] = updatedLists.splice(
                draggedIndex,
                1
            );

            updatedLists.splice(targetIndex, 0, draggedItem);

            return updatedLists;
        });

        setDraggedIndex(targetIndex);
        setHasChanges(true);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const saveOrder = async () => {
        setSaving(true);
        setError("");

        try {
            const listOrder = storedLists.map(getListId);

            await request("/api/master-lists/menu-order", {
                method: "PUT",
                body: JSON.stringify({ listOrder }),
            });

            setHasChanges(false);
            showToast("Data menu order saved successfully.");
        } catch (err) {
            console.error("Save Data Menu order error:", err);
            setError(err.message || "Unable to save Data Menu order.");
        } finally {
            setSaving(false);
        }
    };

    const resetOrder = () => {
        const alphabetical = [...storedLists].sort((a, b) =>
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

                            {error && (
                                <div className="data-menu-error" role="alert">
                                    <p>{error}</p>

                                    <button
                                        type="button"
                                        className="ui-btn ui-btn--secondary"
                                        onClick={loadLists}
                                        disabled={loading}
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}

                            <div className="drag-menu">
                                {loading ? (
                                    <div className="empty-menu">
                                        <h3>Loading stored data...</h3>
                                        <p>
                                            Fetching your Master Lists from
                                            the server.
                                        </p>
                                    </div>
                                ) : storedLists.length === 0 ? (
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
                                            key={getListId(list)}
                                            className={`drag-menu-item ${
                                                draggedIndex === index
                                                    ? "dragging"
                                                    : ""
                                            }`}
                                            draggable={!saving}
                                            onDragStart={() =>
                                                handleDragStart(index)
                                            }
                                            onDragOver={(event) =>
                                                handleDragOver(event, index)
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
                                                {getInitials(list.tabName)}
                                            </div>

                                            <div className="menu-info">
                                                <div className="menu-name">
                                                    {list.tabName || "Untitled"}
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
                                    disabled={
                                        loading ||
                                        saving ||
                                        !storedLists.length
                                    }
                                >
                                    Sort A–Z
                                </button>

                                <button
                                    type="button"
                                    className="ui-btn ui-btn--primary"
                                    onClick={saveOrder}
                                    disabled={
                                        loading ||
                                        saving ||
                                        !hasChanges
                                    }
                                >
                                    {saving ? "Saving..." : "Save Order"}
                                </button>
                            </div>
                        </section>

                        <aside className="info-card">
                            <div className="info-card-heading">
                                <div className="info-heading-icon">i</div>

                                <div>
                                    <h3>How Data Menu Works</h3>

                                    <p>
                                        Arrange your stored student lists
                                        in the order that works best for
                                        your daily workflow.
                                    </p>
                                </div>
                            </div>

                            <div className="info-divider" />

                            <div className="info-item">
                                <div className="info-number">1</div>

                                <div>
                                    <strong>Drag a list</strong>
                                    <span>
                                        Move any list up or down using
                                        its drag handle.
                                    </span>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-number">2</div>

                                <div>
                                    <strong>Review the order</strong>
                                    <span>
                                        Check the numbered positions
                                        before saving.
                                    </span>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-number">3</div>

                                <div>
                                    <strong>Save changes</strong>
                                    <span>
                                        Keep your preferred order in
                                        the database.
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
