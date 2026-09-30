import { useEffect, useState } from "react";

function SingleRecordReview() {
    const [list, setList] = useState(null);

    const [record, setRecord] = useState(null);

    const [error, setError] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const params =
            new URLSearchParams(
                window.location.search
            );

        const listId =
            params.get("listId");

        if (!listId) {
            window.location.href =
                "/add-single-record";

            return;
        }

        try {
            const storedLists =
                JSON.parse(
                    localStorage.getItem(
                        "idCardStoredLists"
                    )
                ) || [];

            const foundList =
                storedLists.find(
                    (item) =>
                        item.id === listId
                );

            const storedRecord =
                JSON.parse(
                    sessionStorage.getItem(
                        "singleRecordData"
                    )
                );

            if (
                !foundList ||
                !storedRecord
            ) {
                window.location.href =
                    "/single-record?listId=" +
                    encodeURIComponent(
                        listId
                    );

                return;
            }

            setList(foundList);

            setRecord(
                storedRecord.values
            );

        } catch (error) {
            console.error(
                "Failed to load review data:",
                error
            );
        }
    };

    const handleBack = () => {
        if (!list) {
            return;
        }

        window.location.href =
            "/single-record?listId=" +
            encodeURIComponent(
                list.id
            );
    };

    const handleSubmit = () => {
        if (!list || !record) {
            return;
        }

        setError("");

        try {
            const storedLists =
                JSON.parse(
                    localStorage.getItem(
                        "idCardStoredLists"
                    )
                ) || [];

            const updatedLists =
                storedLists.map(
                    (item) => {

                        if (
                            item.id !==
                            list.id
                        ) {
                            return item;
                        }

                        const updatedStudents = [
                            ...(item.students ||
                                []),
                            record
                        ];

                        return {
                            ...item,

                            students:
                                updatedStudents,

                            totalRecords:
                                updatedStudents.length,

                            validRecords:
                                updatedStudents.length,

                            removedRecords:
                                Number(
                                    item.removedRecords ||
                                    0
                                )
                        };
                    }
                );

            localStorage.setItem(
                "idCardStoredLists",
                JSON.stringify(
                    updatedLists
                )
            );

            sessionStorage.removeItem(
                "singleRecordData"
            );

            window.location.href =
                "/stored-data?id=" +
                encodeURIComponent(
                    list.id
                );

        } catch (error) {
            console.error(
                "Failed to save record:",
                error
            );

            setError(
                "Something went wrong while saving the record."
            );
        }
    };

    if (
        !list ||
        !record
    ) {
        return null;
    }

    return (
        <div className="app">

            {/* SIDEBAR */}
            <aside className="sidebar">

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

                <div className="nav-title">
                    Workspace
                </div>

                <nav className="nav">

                    <button
                        className="nav-item"
                        onClick={() =>
                            window.location.href =
                                "/dashboard"
                        }
                    >
                        <span className="nav-icon">
                            ⌂
                        </span>

                        Dashboard
                    </button>

                    <button
                        className="nav-item"
                        onClick={() =>
                            window.location.href =
                                "/listform"
                        }
                    >
                        <span className="nav-icon">
                            ↓
                        </span>

                        Import Data
                    </button>

                    <button
                        className="nav-item active"
                    >
                        <span className="nav-icon">
                            ＋
                        </span>

                        Add Single Record
                    </button>

                    <button
                        className="nav-item"
                        onClick={() =>
                            window.location.href =
                                "/card"
                        }
                    >
                        <span className="nav-icon">
                            ＋
                        </span>

                        Create ID Card
                    </button>

                </nav>

            </aside>


            <main className="main">

                <div className="topbar">
                    <div className="profile">

                        <div className="profile-avatar">
                            AG
                        </div>

                        <div className="profile-name">
                            Aaditi
                        </div>

                    </div>
                </div>


                <div className="single-record-page">

                    <div className="breadcrumb">

                        Add Single Record

                        <span>›</span>

                        {list.tabName ||
                            list.listName}

                        <span>›</span>

                        Review

                    </div>


                    <div className="page-header">

                        <div>

                            <h1>
                                Review Record
                            </h1>

                            <p>
                                Review the information
                                before saving it.
                            </p>

                        </div>

                    </div>


                    <div className="single-record-card">

                        <div className="step-indicator">

                            <div className="step completed">

                                <span>
                                    ✓
                                </span>

                                <div>
                                    <strong>
                                        Select List
                                    </strong>

                                    <small>
                                        Completed
                                    </small>
                                </div>

                            </div>


                            <div className="step-line active" />


                            <div className="step completed">

                                <span>
                                    ✓
                                </span>

                                <div>
                                    <strong>
                                        Enter Record
                                    </strong>

                                    <small>
                                        Completed
                                    </small>
                                </div>

                            </div>


                            <div className="step-line active" />


                            <div className="step active">

                                <span>
                                    3
                                </span>

                                <div>
                                    <strong>
                                        Review
                                    </strong>

                                    <small>
                                        Check and submit
                                    </small>
                                </div>

                            </div>

                        </div>


                        <div className="single-record-content">

                            <div className="section-title">

                                <h2>
                                    Review Information
                                </h2>

                                <p>
                                    Make sure everything
                                    is correct before
                                    submitting.
                                </p>

                            </div>


                            <div className="review-list-info">

                                <span>
                                    List
                                </span>

                                <strong>
                                    {list.tabName ||
                                        list.listName}
                                </strong>

                            </div>


                            <div className="review-record">

                                {list.headers.map(
                                    (
                                        header,
                                        index
                                    ) => (

                                        <div
                                            className="review-row"
                                            key={
                                                index
                                            }
                                        >

                                            <div className="review-label">
                                                {header}
                                            </div>

                                            <div className="review-value">
                                                {
                                                    record[
                                                        index
                                                    ]
                                                }
                                            </div>

                                        </div>

                                    )
                                )}

                            </div>


                            {error && (
                                <div className="form-error">
                                    {error}
                                </div>
                            )}


                            <div className="form-actions">

                                <button
                                    className="secondary-btn"
                                    onClick={
                                        handleBack
                                    }
                                >
                                    ← Back
                                </button>

                                <button
                                    className="primary-btn"
                                    onClick={
                                        handleSubmit
                                    }
                                >
                                    Submit Record ✓
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default SingleRecordReview;