import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function DataMenuSettings() {

    const [storedLists, setStoredLists] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [toast, setToast] = useState("");

    /* =====================================================
       LOAD DATA
    ===================================================== */

    useEffect(() => {
        loadLists();
    }, []);

    /* =====================================================
       LOAD LISTS
    ===================================================== */

    const loadLists = () => {

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

            /* Apply saved order */

            savedOrder.forEach((id) => {

                const list = stored.find(
                    (item) => item.id === id
                );

                if (list) {
                    orderedLists.push(list);
                }

            });

            /* Add new lists */

            stored.forEach((list) => {

                const exists =
                    orderedLists.some(
                        (item) =>
                            item.id === list.id
                    );

                if (!exists) {
                    orderedLists.push(list);
                }

            });

            setStoredLists(orderedLists);

        } catch (error) {

            console.error(
                "Failed to load menu:",
                error
            );

            setStoredLists([]);

        }

    };

    const getInitials = (name) => {
    const words = name.trim().split(/\s+/);

    if (!words.length || !words[0]) {
        return "A";
    }

    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }

    return (
            words[0].charAt(0) +
            words[1].charAt(0)
        ).toUpperCase();
    };

    /* =====================================================
       DRAG START
    ===================================================== */

    const handleDragStart = (index) => {

        setDraggedIndex(index);

    };


    /* =====================================================
       DRAG OVER
    ===================================================== */

    const handleDragOver = (
        event,
        targetIndex
    ) => {

        event.preventDefault();

        if (
            draggedIndex === null ||
            draggedIndex === targetIndex
        ) {
            return;
        }

        const updatedLists = [
            ...storedLists
        ];

        const draggedItem =
            updatedLists[draggedIndex];

        updatedLists.splice(
            draggedIndex,
            1
        );

        updatedLists.splice(
            targetIndex,
            0,
            draggedItem
        );

        setStoredLists(updatedLists);

        setDraggedIndex(targetIndex);

        setHasChanges(true);

    };


    /* =====================================================
       DRAG END
    ===================================================== */

    const handleDragEnd = () => {

        setDraggedIndex(null);

    };


    /* =====================================================
       SAVE ORDER
    ===================================================== */

    const saveOrder = () => {

        const order =
            storedLists.map(
                (list) => list.id
            );

        localStorage.setItem(
            "idCardMenuOrder",
            JSON.stringify(order)
        );

        setHasChanges(false);

        setToast(
            "Data menu order saved successfully."
        );

        setTimeout(() => {
            setToast("");
        }, 2500);

    };


    /* =====================================================
       RESET ORDER
    ===================================================== */

    const resetOrder = () => {

        const alphabetical = [
            ...storedLists
        ].sort((a, b) =>
            (a.tabName || "Untitled")
                .localeCompare(
                    b.tabName || "Untitled"
                )
        );

        setStoredLists(alphabetical);

        setHasChanges(true);

    };


    return (
        <div className="app">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <Sidebar activePage="settings" />


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="main">

                <Topbar />


                <section className="content">

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="page-header">

                        <div>

                            <div className="breadcrumb">

                                <span>
                                    Settings
                                </span>

                                <span>
                                    /
                                </span>

                                <span>
                                    Data Menu
                                </span>

                            </div>

                            <h1>
                                Data Menu
                            </h1>

                            <p>
                                Manage the order of your
                                stored data from the
                                sidebar.
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        MENU SETTINGS
                    ================================================= */}

                    <div className="data-menu-settings">

                        <div className="settings-card">

                            <div className="settings-card-header">

                                <div>

                                    <h2>
                                        Stored Data
                                    </h2>

                                    <p>
                                        Drag and drop items
                                        to change their
                                        order in the Data
                                        menu.
                                    </p>

                                </div>

                            </div>


                            {/* =================================================
                                MENU ITEMS
                            ================================================= */}

                            <div className="drag-menu">

                                {!storedLists.length ? (

                                    <div className="empty-menu">

                                        <div>
                                            No stored data
                                        </div>

                                        <span>
                                            Create or import
                                            data first.
                                        </span>

                                    </div>

                                ) : (

                                    storedLists.map(
                                        (list, index) => (

                                            <div
                                                key={list.id}
                                                className={`drag-menu-item ${
                                                    draggedIndex ===
                                                    index
                                                        ? "dragging"
                                                        : ""
                                                }`}
                                                draggable
                                                onDragStart={() =>
                                                    handleDragStart(
                                                        index
                                                    )
                                                }
                                                onDragOver={(event) =>
                                                    handleDragOver(
                                                        event,
                                                        index
                                                    )
                                                }
                                                onDragEnd={
                                                    handleDragEnd
                                                }
                                            >

                                                {/* DRAG HANDLE */}

                                                <div className="drag-handle">
                                                    ⋮⋮
                                                </div>


                                                {/* LETTER */}

                                                <div className="menu-letter">
                                                    {getInitials(list.tabName || "Untitled")}
                                                </div>


                                                {/* INFO */}

                                                <div className="menu-info">

                                                    <div className="menu-name">
                                                        {
                                                            list.tabName ||
                                                            "Untitled"
                                                        }
                                                    </div>

                                                    <div className="menu-meta">
                                                        Stored data
                                                    </div>

                                                </div>


                                                {/* POSITION */}

                                                <div className="menu-position">
                                                    {index + 1}
                                                </div>

                                            </div>

                                        )
                                    )

                                )}

                            </div>


                            {/* =================================================
                                ACTIONS
                            ================================================= */}

                            <div className="settings-actions">

                                <button
                                    className="reset-order-btn"
                                    onClick={resetOrder}
                                    disabled={
                                        !storedLists.length
                                    }
                                >
                                    Sort A–Z
                                </button>

                                <button
                                    className="save-order-btn"
                                    onClick={saveOrder}
                                    disabled={
                                        !hasChanges
                                    }
                                >
                                    Save Order
                                </button>

                            </div>

                        </div>

                    </div>

                </section>

            </main>


            {/* =================================================
                TOAST
            ================================================= */}

            {toast && (

                <div className="settings-toast">
                    {toast}
                </div>

            )}

        </div>
    );
}

export default DataMenuSettings;