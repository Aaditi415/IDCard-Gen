import { useEffect, useRef, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function ImportData() {
    /* =====================================================
       CURRENT LIST
    ===================================================== */

    const [savedList, setSavedList] = useState(null);

    /* =====================================================
       FILE / UI STATE
    ===================================================== */

    const [selectedFile, setSelectedFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const [previewRows, setPreviewRows] = useState([]);
    const [headers, setHeaders] = useState([]);

    const [showPreview, setShowPreview] = useState(false);
    const [showSummary, setShowSummary] = useState(false);

    const [recordCount, setRecordCount] = useState(0);

    const [totalRecords, setTotalRecords] = useState(0);
    const [validRecords, setValidRecords] = useState(0);
    const [invalidRecords, setInvalidRecords] = useState(0);

    const [isReady, setIsReady] = useState(false);

    const [toast, setToast] = useState("");
    const toastTimer = useRef(null);

    const fileInputRef = useRef(null);

    /* =====================================================
       LOAD CURRENT LIST
    ===================================================== */

    useEffect(() => {
        const stored = localStorage.getItem("idCardList");

        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setSavedList(parsed);
            } catch (error) {
                console.error("Unable to read saved list:", error);
            }
        }
    }, []);

    /* =====================================================
       TOAST
    ===================================================== */

    const showToast = (message) => {
        setToast(message);

        clearTimeout(toastTimer.current);

        toastTimer.current = setTimeout(() => {
            setToast("");
        }, 2500);
    };

    /* =====================================================
       FILE SIZE
    ===================================================== */

    const formatFileSize = (bytes) => {
        if (bytes === 0) {
            return "0 Bytes";
        }

        const units = [
            "Bytes",
            "KB",
            "MB",
            "GB"
        ];

        const index = Math.floor(
            Math.log(bytes) / Math.log(1024)
        );

        return (
            parseFloat(
                (
                    bytes /
                    Math.pow(1024, index)
                ).toFixed(2)
            ) +
            " " +
            units[index]
        );
    };

    /* =====================================================
       CHOOSE FILE
    ===================================================== */

    const handleChooseFile = (event) => {
        event.stopPropagation();

        fileInputRef.current?.click();
    };

    const handleDropZoneClick = (event) => {
        if (
            event.target.closest(".choose-btn")
        ) {
            return;
        }

        fileInputRef.current?.click();
    };

    /* =====================================================
       FILE SELECTED
    ===================================================== */

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        if (file) {
            handleFile(file);
        }
    };

    /* =====================================================
       DRAG & DROP
    ===================================================== */

    const handleDragOver = (event) => {
        event.preventDefault();

        event.currentTarget.classList.add("dragover");
    };

    const handleDragLeave = (event) => {
        event.preventDefault();

        event.currentTarget.classList.remove("dragover");
    };

    const handleDrop = (event) => {
        event.preventDefault();

        event.currentTarget.classList.remove("dragover");

        const file = event.dataTransfer.files?.[0];

        if (file) {
            handleFile(file);
        }
    };

    /* =====================================================
       HANDLE FILE
    ===================================================== */

    const handleFile = (file) => {
        const extension = file.name
            .split(".")
            .pop()
            .toLowerCase();

        const allowed = [
            "csv",
            "xlsx",
            "xls"
        ];

        if (!allowed.includes(extension)) {
            showToast(
                "Please upload a CSV or Excel file."
            );

            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            showToast(
                "File size must be less than 10 MB."
            );

            return;
        }

        setSelectedFile(file);

        setIsProcessing(true);
        setProgress(0);

        setShowPreview(false);
        setShowSummary(false);
        setIsReady(false);

        simulateUpload(
            file,
            extension
        );
    };

    /* =====================================================
       SIMULATE PROCESSING
    ===================================================== */

    const simulateUpload = (
        file,
        extension
    ) => {
        let currentProgress = 0;

        const interval = setInterval(() => {
            currentProgress +=
                Math.floor(
                    Math.random() * 18
                ) + 8;

            if (currentProgress >= 100) {
                currentProgress = 100;

                clearInterval(interval);

                setProgress(100);

                setTimeout(() => {
                    setIsProcessing(false);

                    if (extension === "csv") {
                        parseCSV(file);
                    } else {
                        showExcelPreview(file);
                    }
                }, 350);
            } else {
                setProgress(currentProgress);
            }
        }, 180);
    };

    /* =====================================================
       CSV PARSER
    ===================================================== */

    const parseCSV = (file) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const text = event.target.result;

            const rows = parseCSVText(text);

            if (!rows.length) {
                showToast(
                    "The CSV file appears to be empty."
                );

                return;
            }

            renderTable(rows);
        };

        reader.readAsText(file);
    };

    /* =====================================================
       BASIC CSV PARSER
    ===================================================== */

    const parseCSVText = (text) => {
        const rows = [];

        let row = [];
        let value = "";
        let insideQuotes = false;

        for (
            let i = 0;
            i < text.length;
            i++
        ) {
            const char = text[i];
            const next = text[i + 1];

            if (
                char === '"' &&
                insideQuotes &&
                next === '"'
            ) {
                value += '"';
                i++;
            }

            else if (char === '"') {
                insideQuotes = !insideQuotes;
            }

            else if (
                char === "," &&
                !insideQuotes
            ) {
                row.push(value.trim());
                value = "";
            }

            else if (
                (
                    char === "\n" ||
                    char === "\r"
                ) &&
                !insideQuotes
            ) {
                if (
                    char === "\r" &&
                    next === "\n"
                ) {
                    i++;
                }

                row.push(value.trim());

                if (
                    row.some(
                        (cell) => cell !== ""
                    )
                ) {
                    rows.push(row);
                }

                row = [];
                value = "";
            }

            else {
                value += char;
            }
        }

        if (
            value.length ||
            row.length
        ) {
            row.push(value.trim());

            if (
                row.some(
                    (cell) => cell !== ""
                )
            ) {
                rows.push(row);
            }
        }

        return rows;
    };

    /* =====================================================
       RENDER TABLE
    ===================================================== */

    const renderTable = (rows) => {
        const headerRow = rows[0];
        const data = rows.slice(1);

        /* =====================================================
           SAVE IMPORTED DATA FOR REVIEW
        ===================================================== */

        const importedData = {
            headers: headerRow,
            rows: data
        };

        localStorage.setItem(
            "idCardImportedData",
            JSON.stringify(importedData)
        );

        setHeaders(headerRow);
        setPreviewRows(data);

        setRecordCount(data.length);

        setShowPreview(true);
        setShowSummary(true);

        setTotalRecords(data.length);
        setValidRecords(data.length);
        setInvalidRecords(0);

        setIsReady(true);

        showToast(
            "Data loaded successfully."
        );
    };

    /* =====================================================
       EXCEL PREVIEW
    ===================================================== */

    const showExcelPreview = (file) => {
        setHeaders([
            "File",
            "Type",
            "Size",
            "Status"
        ]);

        setPreviewRows([
            [
                file.name,
                "Excel",
                formatFileSize(file.size),
                "File Ready"
            ]
        ]);

        setRecordCount("Excel file");

        setShowPreview(true);
        setShowSummary(true);

        setTotalRecords("—");
        setValidRecords("Ready");
        setInvalidRecords("—");

        setIsReady(true);

        showToast(
            "Excel file is ready for import."
        );
    };

    /* =====================================================
       REMOVE FILE
    ===================================================== */

    const removeFile = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        setSelectedFile(null);

        setIsProcessing(false);
        setProgress(0);

        setHeaders([]);
        setPreviewRows([]);

        setShowPreview(false);
        setShowSummary(false);

        setIsReady(false);

        setRecordCount(0);

        setTotalRecords(0);
        setValidRecords(0);
        setInvalidRecords(0);

        showToast(
            "File removed."
        );
    };

    /* =====================================================
       SAMPLE CSV
    ===================================================== */

    const downloadSample = () => {
        const csv = `
Name,ID Number,Class,Roll Number,Photo,Department
Aarav Sharma,STU-2026-001,10th A,1,aarav.jpg,Science
Anaya Patil,STU-2026-002,10th A,2,anaya.jpg,Commerce
Rohan Deshmukh,STU-2026-003,10th A,3,rohan.jpg,Science
`;

        const blob = new Blob(
            [csv.trim()],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;
        link.download =
            "id-card-sample.csv";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        showToast(
            "Sample CSV downloaded."
        );
    };

    /* =====================================================
       IMPORT DATA
    ===================================================== */

    const importData = () => {
        if (!isReady) {
            showToast(
                "Please upload a file first."
            );

            return;
        }

        window.location.href =
            "/review";
    };

    /* =====================================================
       NAVIGATION
    ===================================================== */


    const goBack = () => {
        window.location.href =
            "/listform";
    };


    return (
        <div className="app">

            {/* =====================================================
                 SIDEBAR
            ===================================================== */}

            <Sidebar activePage="importdata" />


            {/* =====================================================
                 MAIN
            ===================================================== */}

            <main className="main">

                <Topbar />


                <section className="content">


                    {/* BREADCRUMB */}

                    <div className="breadcrumb">

                        <button
                            id="importdataBtn"
                        >
                            Import Data
                        </button>

                        <span>
                            ›
                        </span>

                        <span>
                            Import Data
                        </span>

                    </div>


                    {/* HEADER */}

                    <h1 className="page-title">
                        Import Data
                    </h1>


                    <p className="page-subtitle">
                        Upload the student records for this list.
                        You can import a CSV or Excel file.
                    </p>


                    {/* STEPS */}

                    <div className="steps">

                        <div className="step completed">

                            <div className="step-number">
                                ✓
                            </div>

                            <div className="step-label">
                                Create List
                            </div>

                        </div>


                        <div className="step-line completed"></div>


                        <div className="step active">

                            <div className="step-number">
                                2
                            </div>

                            <div className="step-label">
                                Import Data
                            </div>

                        </div>


                        <div className="step-line"></div>


                        <div className="step">

                            <div className="step-number">
                                3
                            </div>

                            <div className="step-label">
                                Review
                            </div>

                        </div>

                    </div>


                    {/* CURRENT LIST */}

                    <div className="list-info">

                        <div className="list-info-left">

                            <div className="list-info-label">
                                Importing into
                            </div>

                            <div
                                className="list-name"
                                id="listName"
                            >
                                {savedList?.listName || ""}
                            </div>

                        </div>


                        <div className="list-info-right">

                            <span
                                className="tab-badge"
                                id="tabName"
                            >
                                {savedList?.tabName || ""}
                            </span>

                        </div>

                    </div>


                    {/* PAGE GRID */}

                    <div className="page-grid">


                        {/* =================================================
                             LEFT COLUMN
                        ================================================= */}

                        <div>


                            {/* UPLOAD CARD */}

                            <div className="card">

                                <div className="card-header">

                                    <h3>
                                        Upload Data File
                                    </h3>

                                    <p>
                                        Upload a CSV or Excel file containing your ID card data.
                                    </p>

                                </div>


                                <div className="upload-section">


                                    {/* DROP ZONE */}

                                    <div
                                        className="drop-zone"
                                        id="dropZone"
                                        onClick={
                                            handleDropZoneClick
                                        }
                                        onDragEnter={
                                            handleDragOver
                                        }
                                        onDragOver={
                                            handleDragOver
                                        }
                                        onDragLeave={
                                            handleDragLeave
                                        }
                                        onDrop={
                                            handleDrop
                                        }
                                    >

                                        <div className="upload-icon">
                                            ↑
                                        </div>

                                        <h3>
                                            Drag & drop your file here
                                        </h3>

                                        <p>
                                            or choose a file from your computer
                                        </p>


                                        <button
                                            type="button"
                                            className="choose-btn"
                                            id="chooseBtn"
                                            onClick={
                                                handleChooseFile
                                            }
                                        >
                                            Choose File
                                        </button>


                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            id="fileInput"
                                            accept=".csv,.xlsx,.xls"
                                            onChange={
                                                handleFileChange
                                            }
                                            style={{
                                                display: "none"
                                            }}
                                        />


                                        <div className="file-types">

                                            <span className="file-type">
                                                CSV
                                            </span>

                                            <span className="file-type">
                                                XLSX
                                            </span>

                                            <span className="file-type">
                                                XLS
                                            </span>

                                            <span className="file-type">
                                                Max 10 MB
                                            </span>

                                        </div>

                                    </div>


                                    {/* UPLOADED FILE */}

                                    <div
                                        className="uploaded-file"
                                        id="uploadedFile"
                                        style={{
                                            display:
                                                selectedFile
                                                    ? "flex"
                                                    : "none"
                                        }}
                                    >

                                        <div className="file-icon">
                                            ✓
                                        </div>


                                        <div className="file-info">

                                            <div
                                                className="file-name"
                                                id="fileName"
                                            >
                                                {
                                                    selectedFile?.name ||
                                                    ""
                                                }
                                            </div>

                                            <div
                                                className="file-size"
                                                id="fileSize"
                                            >
                                                {
                                                    selectedFile
                                                        ? formatFileSize(
                                                            selectedFile.size
                                                        )
                                                        : ""
                                                }
                                            </div>

                                        </div>


                                        <button
                                            className="remove-file"
                                            onClick={
                                                removeFile
                                            }
                                        >
                                            ×
                                        </button>

                                    </div>


                                    {/* PROGRESS */}

                                    <div
                                        className="progress-wrap"
                                        id="progressWrap"
                                        style={{
                                            display:
                                                isProcessing
                                                    ? "block"
                                                    : "none"
                                        }}
                                    >

                                        <div className="progress-top">

                                            <span>
                                                Processing file...
                                            </span>

                                            <span id="progressText">
                                                {progress}%
                                            </span>

                                        </div>


                                        <div className="progress-bar">

                                            <div
                                                className="progress-fill"
                                                id="progressFill"
                                                style={{
                                                    width:
                                                        `${progress}%`
                                                }}
                                            ></div>

                                        </div>

                                    </div>


                                    {/* SAMPLE */}

                                    <div className="sample-box">

                                        <div className="sample-text">

                                            <strong>
                                                Don't have a file ready?
                                            </strong>

                                            <span>
                                                Download our sample CSV and fill in your data.
                                            </span>

                                        </div>


                                        <button
                                            className="sample-btn"
                                            onClick={
                                                downloadSample
                                            }
                                        >
                                            ↓ Download Sample
                                        </button>

                                    </div>

                                </div>

                            </div>


                            {/* DATA PREVIEW */}

                            <div
                                className="preview-card"
                                id="previewCard"
                                style={{
                                    display:
                                        showPreview
                                            ? "block"
                                            : "none"
                                }}
                            >

                                <div className="preview-header">

                                    <h3>
                                        Data Preview
                                    </h3>

                                    <span
                                        className="record-count"
                                        id="recordCount"
                                    >
                                        {
                                            typeof recordCount ===
                                            "number"
                                                ? `${recordCount} ${
                                                    recordCount === 1
                                                        ? "record"
                                                        : "records"
                                                }`
                                                : recordCount
                                        }
                                    </span>

                                </div>


                                <div className="table-scroll">

                                    <table>

                                        <thead>

                                            <tr>

                                                {headers.map(
                                                    (header, index) => (
                                                        <th
                                                            key={index}
                                                        >
                                                            {
                                                                header ||
                                                                "Column"
                                                            }
                                                        </th>
                                                    )
                                                )}

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {previewRows.map(
                                                (row, rowIndex) => {

                                                    const isExcel =
                                                        headers.length === 4 &&
                                                        headers[0] ===
                                                            "File";

                                                    return (
                                                        <tr
                                                            key={
                                                                rowIndex
                                                            }
                                                        >

                                                            {row.map(
                                                                (
                                                                    value,
                                                                    index
                                                                ) => (
                                                                    <td
                                                                        key={
                                                                            index
                                                                        }
                                                                        className={
                                                                            index === 0
                                                                                ? "student-cell"
                                                                                : ""
                                                                        }
                                                                    >
                                                                        {
                                                                            value ||
                                                                            (
                                                                                isExcel &&
                                                                                index === 3
                                                                                    ? ""
                                                                                    : "—"
                                                                            )
                                                                        }
                                                                    </td>
                                                                )
                                                            )}

                                                            {!isExcel && (
                                                                <td>

                                                                    <span className="valid">

                                                                        <span className="valid-dot"></span>

                                                                        Valid

                                                                    </span>

                                                                </td>
                                                            )}

                                                        </tr>
                                                    );
                                                }
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            </div>


                            {/* SUMMARY */}

                            <div
                                className="summary"
                                id="summary"
                                style={{
                                    display:
                                        showSummary
                                            ? "block"
                                            : "none"
                                }}
                            >

                                <h3>
                                    Import Summary
                                </h3>


                                <div className="summary-grid">

                                    <div className="summary-box">

                                        <span>
                                            Total Records
                                        </span>

                                        <strong id="totalRecords">
                                            {totalRecords}
                                        </strong>

                                    </div>


                                    <div className="summary-box">

                                        <span>
                                            Valid Records
                                        </span>

                                        <strong
                                            id="validRecords"
                                            style={{
                                                color: "#16a34a"
                                            }}
                                        >
                                            {validRecords}
                                        </strong>

                                    </div>


                                    <div className="summary-box">

                                        <span>
                                            Issues
                                        </span>

                                        <strong
                                            id="invalidRecords"
                                            style={{
                                                color: "#dc2626"
                                            }}
                                        >
                                            {invalidRecords}
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {/* BOTTOM ACTIONS */}

                            <div className="bottom-actions">

                                <button
                                    className="back-btn"
                                    id="backBtn"
                                    onClick={goBack}
                                >
                                    ← Back
                                </button>


                                <button
                                    className={`import-btn ${
                                        isReady
                                            ? "ready"
                                            : ""
                                    }`}
                                    id="importBtn"
                                    onClick={
                                        importData
                                    }
                                >
                                    Import Data
                                </button>

                            </div>

                        </div>


                        {/* =================================================
                             RIGHT COLUMN
                        ================================================= */}

                        <div className="side-column">


                            {/* HOW IT WORKS */}

                            <div className="side-card">

                                <h3>
                                    How Import Works
                                </h3>


                                <div className="step-item">

                                    <div className="step-circle">
                                        1
                                    </div>

                                    <div className="step-info">

                                        <strong>
                                            Upload your file
                                        </strong>

                                        <span>
                                            Upload CSV or Excel data containing your records.
                                        </span>

                                    </div>

                                </div>


                                <div className="step-item">

                                    <div className="step-circle">
                                        2
                                    </div>

                                    <div className="step-info">

                                        <strong>
                                            Review data
                                        </strong>

                                        <span>
                                            Check your records before importing them.
                                        </span>

                                    </div>

                                </div>


                                <div className="step-item">

                                    <div className="step-circle">
                                        3
                                    </div>

                                    <div className="step-info">

                                        <strong>
                                            Import records
                                        </strong>

                                        <span>
                                            Your records become available for ID generation.
                                        </span>

                                    </div>

                                </div>


                                <div className="step-item">

                                    <div className="step-circle">
                                        4
                                    </div>

                                    <div className="step-info">

                                        <strong>
                                            Generate cards
                                        </strong>

                                        <span>
                                            Select a template and generate multiple ID cards.
                                        </span>

                                    </div>

                                </div>

                            </div>


                            {/* REQUIRED COLUMNS */}

                            <div className="side-card">

                                <h3>
                                    Recommended Columns
                                </h3>


                                <div className="required-list">

                                    <span className="required-tag">
                                        Name
                                    </span>

                                    <span className="required-tag">
                                        ID Number
                                    </span>

                                    <span className="required-tag">
                                        Class
                                    </span>

                                    <span className="required-tag">
                                        Roll Number
                                    </span>

                                    <span className="required-tag">
                                        Photo
                                    </span>

                                    <span className="required-tag">
                                        Department
                                    </span>

                                </div>

                            </div>


                            {/* FILE REQUIREMENTS */}

                            <div className="side-card">

                                <h3>
                                    File Requirements
                                </h3>


                                <div className="detail-list">

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            padding: "8px 0",
                                            borderBottom:
                                                "1px solid #f0f1f4",
                                            fontSize: "12px"
                                        }}
                                    >

                                        <span
                                            style={{
                                                color: "#777b88"
                                            }}
                                        >
                                            File type
                                        </span>

                                        <strong>
                                            CSV / Excel
                                        </strong>

                                    </div>


                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            padding: "8px 0",
                                            borderBottom:
                                                "1px solid #f0f1f4",
                                            fontSize: "12px"
                                        }}
                                    >

                                        <span
                                            style={{
                                                color: "#777b88"
                                            }}
                                        >
                                            Maximum size
                                        </span>

                                        <strong>
                                            10 MB
                                        </strong>

                                    </div>


                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            padding: "8px 0",
                                            fontSize: "12px"
                                        }}
                                    >

                                        <span
                                            style={{
                                                color: "#777b88"
                                            }}
                                        >
                                            Header row
                                        </span>

                                        <strong>
                                            Required
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

            </main>


            {/* TOAST */}

            <div
                className={`toast ${
                    toast
                        ? "show"
                        : ""
                }`}
                id="toast"
            >
                {toast}
            </div>

        </div>
    );
}

export default ImportData;