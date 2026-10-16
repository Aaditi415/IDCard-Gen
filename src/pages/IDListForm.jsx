
import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";



const TEMPLATES_KEY = "idCardTemplates";
// const MASTER_LISTS_KEY = "idCardStoredLists";
// const LEGACY_MASTER_LIST_KEY = "idCardFinalList";
const LISTS_KEY = "idCardLists";
// const CURRENT_LIST_KEY = "idCardList";

const LIST_NAME_MIN_LENGTH = 3;
const LIST_NAME_MAX_LENGTH = 50;
const TAB_NAME_MIN_LENGTH = 2;
const TAB_NAME_MAX_LENGTH = 30;

/* =========================================================
   SAFE STORAGE HELPERS
========================================================= */

function readStorage(key, fallback = []) {
    try {
        const value = localStorage.getItem(key);

        if (!value) return fallback;

        return JSON.parse(value);
    } catch (error) {
        console.error(`Unable to read ${key}:`, error);
        return fallback;
    }
}

function getRecordId(record) {
    if (!record) return "";

    const id = record.id ?? record._id;

    return id == null ? "" : String(id);
}

function getTemplateId(template) {
    if (!template) return "";

    return String(
        template.id ??
        template._id ??
        ""
    );
}

function getMasterListName(masterList) {
    return (
        masterList?.listName ||
        masterList?.name ||
        masterList?.title ||
        "Unnamed Master List"
    );
}

function createSlug(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}


const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";


/* =========================================================
   COMPONENT
========================================================= */

function IDListForm() {
    const [listName, setListName] = useState("");
    const [tabName, setTabName] = useState("");

    const [selectedTemplateId, setSelectedTemplateId] =
        useState("");

    const [selectedMasterListId, setSelectedMasterListId] =
        useState("");

    const [templates, setTemplates] = useState([]);
    const [masterLists, setMasterLists] = useState([]);

    const [listNameError, setListNameError] = useState("");
    const [tabNameError, setTabNameError] = useState("");
    const [templateError, setTemplateError] = useState("");
    const [masterListError, setMasterListError] = useState("");

    const [showSuccess, setShowSuccess] = useState(false);
    const [createdList, setCreatedList] = useState(null);

    const [toast, setToast] = useState("");
    const [toastVisible, setToastVisible] = useState(false);

    const [isSaving, setIsSaving] = useState(false);

    /* =====================================================
       TOAST
    ===================================================== */

    const showToast = (message) => {
        setToast(message);
        setToastVisible(true);
    };

    useEffect(() => {
        if (!toastVisible) return undefined;

        const timer = window.setTimeout(() => {
            setToastVisible(false);
        }, 2500);

        return () => window.clearTimeout(timer);
    }, [toastVisible, toast]);

    /* =====================================================
       LOAD TEMPLATES AND MASTER LISTS
    ===================================================== */

    useEffect(() => {
        let cancelled = false;

        const loadData = async () => {
            // Templates remain on the current source for now.
            const savedTemplates = readStorage(TEMPLATES_KEY, []);

            if (!cancelled) {
                setTemplates(
                    Array.isArray(savedTemplates)
                        ? savedTemplates.filter(
                            (item) =>
                                item &&
                                getTemplateId(item) &&
                                (item.name || item.title)
                        )
                        : []
                );
            }

            try {
                const token = localStorage.getItem("idFoundryToken");

                if (!token) {
                    throw new Error("Please log in again.");
                }

                const response = await fetch(
                    `${API_BASE_URL}/api/master-lists`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message || "Unable to load master lists."
                    );
                }

                if (!cancelled) {
                    setMasterLists(
                        Array.isArray(data.lists) ? data.lists : []
                    );
                }
            } catch (error) {
                console.error("Unable to load form data:", error);

                if (!cancelled) {
                    setMasterLists([]);
                    showToast(error.message || "Unable to load master lists.");
                }
            }
        };

        loadData();

        return () => {
            cancelled = true;
        };
    }, []);

    /* =====================================================
       SELECTED RECORDS
    ===================================================== */

    const selectedTemplate = templates.find(
        (template) =>
            getTemplateId(template) === selectedTemplateId
    );

    const selectedMasterList = masterLists.find(
        (masterList) =>
            getRecordId(masterList) === selectedMasterListId
    );

    const getTemplateName = () => {
        return (
            selectedTemplate?.name ||
            selectedTemplate?.title ||
            "Select template"
        );
    };

    const getSelectedMasterListName = () => {
        return selectedMasterList
            ? getMasterListName(selectedMasterList)
            : "Select master list";
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    
    const validateForm = () => {
        let valid = true;

        const cleanListName = listName.trim();
        const cleanTabName = tabName.trim();

        setListNameError("");
        setTabNameError("");
        setTemplateError("");
        setMasterListError("");

        // List name validation
        if (!cleanListName) {
            setListNameError("Please enter a list name.");
            valid = false;
        } else if (cleanListName.length < LIST_NAME_MIN_LENGTH) {
            setListNameError(
                `List name must contain at least ${LIST_NAME_MIN_LENGTH} characters.`
            );
            valid = false;
        } else if (cleanListName.length > LIST_NAME_MAX_LENGTH) {
            setListNameError(
                `List name cannot exceed ${LIST_NAME_MAX_LENGTH} characters.`
            );
            valid = false;
        }

        // Tab name validation
        if (!cleanTabName) {
            setTabNameError("Please enter a tab name.");
            valid = false;
        } else if (cleanTabName.length < TAB_NAME_MIN_LENGTH) {
            setTabNameError(
                `Tab name must contain at least ${TAB_NAME_MIN_LENGTH} characters.`
            );
            valid = false;
        } else if (cleanTabName.length > TAB_NAME_MAX_LENGTH) {
            setTabNameError(
                `Tab name cannot exceed ${TAB_NAME_MAX_LENGTH} characters.`
            );
            valid = false;
        }

        // Public student-link slug validation
        const slug = createSlug(cleanTabName);

        if (cleanTabName && !slug) {
            setTabNameError(
                "Please use letters or numbers in the tab name."
            );
            valid = false;
        }

        // Template validation
        if (
            !selectedTemplateId ||
            !templates.some(
                (template) =>
                    getTemplateId(template) === selectedTemplateId
            )
        ) {
            setTemplateError(
                "Please select a valid ID card template."
            );
            valid = false;
        }

        // Master-list validation
        if (
            !selectedMasterListId ||
            !masterLists.some(
                (masterList) =>
                    getRecordId(masterList) === selectedMasterListId
            )
        ) {
            setMasterListError(
                "Please select a valid master list."
            );
            valid = false;
        }

        return valid;
    };


    /* =====================================================
       CREATE STUDENT FORM / LINK
    ===================================================== */

    const handleContinue = async () => {
    if (isSaving) return;

    if (!validateForm()) {
        showToast("Please correct the highlighted fields.");
        return;
    }

    const template = templates.find(
        (item) => getTemplateId(item) === selectedTemplateId
    );

    const masterList = masterLists.find(
        (item) => getRecordId(item) === selectedMasterListId
    );

    if (!template || !masterList) {
        showToast(
            "The selected template or master list is unavailable."
        );
        return;
    }

    const cleanListName = listName.trim();
    const cleanTabName = tabName.trim();
    const slug = createSlug(cleanTabName);

    if (!slug) {
        setTabNameError("Please enter a valid tab name.");
        return;
    }

    setIsSaving(true);

    try {
        const token = localStorage.getItem("idFoundryToken");

        if (!token) {
            throw new Error("Please log in again.");
        }

        const response = await fetch(
            `${API_BASE_URL}/api/student-form-configs`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    listName: cleanListName,
                    tabName: cleanTabName,
                    slug,
                    templateId: getTemplateId(template),
                    templateName:
                        template.name ||
                        template.title ||
                        "Untitled Template",
                    templateSnapshot: template,
                    masterListId: getRecordId(masterList),
                }),
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success || !data.config) {
            if (response.status === 409) {
                setTabNameError(
                    "This student link already exists. Choose another tab name."
                );
            }

            throw new Error(
                data.message || "Unable to create the student form."
            );
        }

        const savedConfig = data.config;

        // Use the server-generated MongoDB configuration ID.
        const listData = {
            id: savedConfig._id,
            listName: savedConfig.listName,
            tabName: savedConfig.tabName,
            slug: savedConfig.slug,
            studentLink: `/studentform/${savedConfig.slug}`,
            templateId: savedConfig.templateId,
            templateName: savedConfig.templateName,
            templateFormId: String(
                template.formId ||
                template.form?._id ||
                template.form?.id ||
                ""
            ),
            masterListId: String(savedConfig.masterListId),
            masterListName: savedConfig.masterListName,
            verification: savedConfig.verification,
            createdAt: savedConfig.createdAt,
            updatedAt: savedConfig.updatedAt,
        };

        setCreatedList(listData);
        setShowSuccess(true);
        showToast("Student form configuration saved successfully.");
    } catch (error) {
        console.error("Unable to create student form:", error);
        showToast(error.message || "Unable to save the student form.");
    } finally {
        setIsSaving(false);
    }
};

    /* =====================================================
       CANCEL / RESET
    ===================================================== */

    const handleCancel = () => {
        const hasData =
            listName.trim() ||
            tabName.trim() ||
            selectedTemplateId ||
            selectedMasterListId;

        if (
            hasData &&
            !window.confirm(
                "Are you sure you want to cancel? Your entered information will be lost."
            )
        ) {
            return;
        }

        setListName("");
        setTabName("");
        setSelectedTemplateId("");
        setSelectedMasterListId("");

        setListNameError("");
        setTabNameError("");
        setTemplateError("");
        setMasterListError("");

        setShowSuccess(false);
        setCreatedList(null);
    };

    /* =====================================================
       INPUT HANDLING
    ===================================================== */

    const handleKeyDown = (event) => {
        if (
            event.key === "Enter" &&
            event.target.tagName !== "TEXTAREA"
        ) {
            event.preventDefault();
            handleContinue();
        }
    };

    const getInitials = (name) => {
        const words = String(name || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (words.length === 0) return "A";

        if (words.length === 1) {
            return words[0].charAt(0).toUpperCase();
        }

        return (
            words[0].charAt(0) +
            words[1].charAt(0)
        ).toUpperCase();
    };

    /* =====================================================
       NAVIGATION
    ===================================================== */

    const goImportData = () => {
        window.location.href = "/importdata";
    };

    const goBack = () => {
        window.location.href = "/idlistform";
    };

    const fullStudentLink = createdList
        ? `${window.location.origin}${createdList.studentLink}`
        : "";

    const copyStudentLink = async () => {
        if (!fullStudentLink) {
            showToast("No student link is available to copy.");
            return;
        }

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(
                    fullStudentLink
                );
            } else {
                // Fallback for browsers without Clipboard API access.
                const textArea = document.createElement("textarea");
                textArea.value = fullStudentLink;
                textArea.style.position = "fixed";
                textArea.style.opacity = "0";

                document.body.appendChild(textArea);
                textArea.select();

                const copied = document.execCommand("copy");
                document.body.removeChild(textArea);

                if (!copied) {
                    throw new Error("Clipboard copy failed.");
                }
            }

            showToast("Student link copied.");
        } catch (error) {
            console.error(
                "Unable to copy student link:",
                error
            );

            showToast(
                "Unable to copy automatically. Select and copy the link."
            );
        }
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="app">
            <Sidebar activePage="IDlistform" />

            <main className="main">
                <Topbar />

                <section className="content">
                    <div className="breadcrumb">
                        <button
                            type="button"
                            onClick={goBack}
                        >
                            Import Data
                        </button>
                        <span>›</span>
                        <span>Create New List</span>
                    </div>

                    <h1 className="page-title">
                        Create Student Form
                    </h1>

                    <p className="page-subtitle">
                        Create a shareable student registration form,
                        choose the master list for verification, and
                        select the ID card design.
                    </p>

                    <div className="steps">
                        <div
                            className={`step ${
                                showSuccess ? "completed" : "active"
                            }`}
                        >
                            <div className="step-number">
                                {showSuccess ? "✓" : "1"}
                            </div>
                            <div className="step-label">
                                Create List
                            </div>
                        </div>

                        <div
                            className={`step-line ${
                                showSuccess ? "completed" : ""
                            }`}
                        />

                        <div
                            className={`step ${
                                showSuccess ? "active" : ""
                            }`}
                        >
                            <div className="step-number">2</div>
                            <div className="step-label">
                                Copy Link
                            </div>
                        </div>
                    </div>

                    <div className="layout">
                        <div>
                            {!showSuccess && (
                                <div
                                    className="form-card"
                                    id="formCard"
                                >
                                    <div className="form-card-header">
                                        <h2>List Information</h2>
                                        <p>
                                            Set up this student list
                                            before importing student records.
                                        </p>
                                    </div>

                                    <div className="form-body">
                                        {/* LIST NAME */}

                                        <div className="field">
                                            <div className="field-label">
                                                <label htmlFor="listName">
                                                    List Name
                                                    <span className="required">
                                                        *
                                                    </span>
                                                </label>
                                            </div>

                                            <div className="input-wrap">
                                                <input
                                                    type="text"
                                                    id="listName"
                                                    className={`input ${
                                                        listNameError
                                                            ? "invalid"
                                                            : ""
                                                    }`}
                                                    placeholder="e.g. 1st Standard - A Students"
                                                    minLength={
                                                        LIST_NAME_MIN_LENGTH
                                                    }
                                                    maxLength={
                                                        LIST_NAME_MAX_LENGTH
                                                    }
                                                    value={listName}
                                                    onChange={(event) => {
                                                        setListName(
                                                            event.target.value
                                                        );
                                                        setListNameError("");
                                                    }}
                                                    onKeyDown={handleKeyDown}
                                                    aria-invalid={
                                                        Boolean(listNameError)
                                                    }
                                                />
                                            </div>

                                            <p className="field-hint">
                                                Give the complete group a
                                                recognizable name. For example,
                                                use an academic year or a class
                                                name so you can find it later.
                                            </p>

                                            <div
                                                className={`error ${
                                                    listNameError ? "show" : ""
                                                }`}
                                            >
                                                {listNameError}
                                            </div>
                                        </div>

                                        {/* TAB NAME */}

                                        <div className="field">
                                            <div className="field-label">
                                                <label htmlFor="tabName">
                                                    Tab Name
                                                    <span className="required">
                                                        *
                                                    </span>
                                                </label>
                                            </div>

                                            <div className="input-wrap">
                                                <input
                                                    type="text"
                                                    id="tabName"
                                                    className={`input ${
                                                        tabNameError
                                                            ? "invalid"
                                                            : ""
                                                    }`}
                                                    placeholder="e.g. 1st A"
                                                    minLength={
                                                        TAB_NAME_MIN_LENGTH
                                                    }
                                                    maxLength={
                                                        TAB_NAME_MAX_LENGTH
                                                    }
                                                    value={tabName}
                                                    onChange={(event) => {
                                                        setTabName(
                                                            event.target.value
                                                        );
                                                        setTabNameError("");
                                                    }}
                                                    onKeyDown={handleKeyDown}
                                                    aria-invalid={
                                                        Boolean(tabNameError)
                                                    }
                                                />
                                            </div>

                                            <p className="field-hint">
                                                This is the short label used
                                                to identify this group in your
                                                student data view. Keep it brief,
                                                such as "10th A" or "5th B".
                                            </p>

                                            <div
                                                className={`error ${
                                                    tabNameError ? "show" : ""
                                                }`}
                                            >
                                                {tabNameError}
                                            </div>
                                        </div>

                                        {/* ID CARD TEMPLATE */}

                                        <div className="field">
                                            <div className="field-label">
                                                <label htmlFor="template">
                                                    ID Card Template
                                                    <span className="required">
                                                        *
                                                    </span>
                                                </label>

                                                <span className="field-hint">
                                                    Card design
                                                </span>
                                            </div>

                                            <div className="input-wrap">
                                                <select
                                                    id="template"
                                                    className={`input ${
                                                        templateError
                                                            ? "invalid"
                                                            : ""
                                                    }`}
                                                    value={selectedTemplateId}
                                                    onChange={(event) => {
                                                        setSelectedTemplateId(
                                                            event.target.value
                                                        );
                                                        setTemplateError("");
                                                    }}
                                                    aria-invalid={
                                                        Boolean(templateError)
                                                    }
                                                >
                                                    <option value="">
                                                        Select ID card template
                                                    </option>

                                                    {templates.map(
                                                        (template) => (
                                                            <option
                                                                key={getTemplateId(
                                                                    template
                                                                )}
                                                                value={getTemplateId(
                                                                    template
                                                                )}
                                                            >
                                                                {template.name ||
                                                                    template.title ||
                                                                    "Untitled Template"}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>

                                            <p className="field-hint">
                                                Select the saved ID card design
                                                you want to associate with this
                                                student group.
                                            </p>

                                            <div
                                                className={`error ${
                                                    templateError ? "show" : ""
                                                }`}
                                            >
                                                {templateError}
                                                {!templateError &&
                                                    templates.length === 0 &&
                                                    "No saved templates found. Save a template before creating a student form."}
                                            </div>
                                        </div>

                                        {/* MASTER LIST */}

                                        <div className="field">
                                            <div className="field-label">
                                                <label htmlFor="masterList">
                                                    Master List
                                                    <span className="required">
                                                        *
                                                    </span>
                                                </label>

                                                <span className="field-hint">
                                                    Verification source
                                                </span>
                                            </div>

                                            <div className="input-wrap">
                                                <select
                                                    id="masterList"
                                                    className={`input ${
                                                        masterListError
                                                            ? "invalid"
                                                            : ""
                                                    }`}
                                                    value={selectedMasterListId}
                                                    onChange={(event) => {
                                                        setSelectedMasterListId(
                                                            event.target.value
                                                        );
                                                        setMasterListError("");
                                                    }}
                                                    aria-invalid={
                                                        Boolean(masterListError)
                                                    }
                                                >
                                                    <option value="">
                                                        Select master list
                                                    </option>

                                                    {masterLists.map(
                                                        (masterList) => (
                                                            <option
                                                                key={getRecordId(
                                                                    masterList
                                                                )}
                                                                value={getRecordId(
                                                                    masterList
                                                                )}
                                                            >
                                                                {getMasterListName(
                                                                    masterList
                                                                )}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>

                                            <p className="field-hint">
                                                Select the master student list
                                                used to verify submitted details.
                                                Student information can then be
                                                checked against this list.
                                            </p>

                                            <div
                                                className={`error ${
                                                    masterListError
                                                        ? "show"
                                                        : ""
                                                }`}
                                            >
                                                {masterListError}
                                                {!masterListError &&
                                                    masterLists.length === 0 &&
                                                    "No master lists found. Import or create a master list first."}
                                            </div>
                                        </div>

                                        {/* PREVIEW */}

                                        <div className="preview-box">
                                            <div className="preview-label">
                                                List Preview
                                            </div>

                                            <div className="tab-preview">
                                                <div className="tab-icon">
                                                    {getInitials(tabName)}
                                                </div>

                                                <div>
                                                    <strong>
                                                        {tabName.trim() ||
                                                            "Your tab name"}
                                                    </strong>

                                                    <span
                                                        style={{
                                                            display: "block",
                                                            fontSize: "12px",
                                                            marginTop: "3px",
                                                        }}
                                                    >
                                                        {listName.trim() ||
                                                            "Your list name"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    marginTop: "12px",
                                                    fontSize: "13px",
                                                }}
                                            >
                                                <strong>Template:</strong>{" "}
                                                {getTemplateName()}
                                                <br />
                                                <strong>Master List:</strong>{" "}
                                                {getSelectedMasterListName()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bottom-actions">
                                        <button
                                            type="button"
                                            className="ui-btn ui-btn--secondary"
                                            onClick={handleCancel}
                                            disabled={isSaving}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="button"
                                            className="ui-btn ui-btn--primary"
                                            onClick={handleContinue}
                                            disabled={isSaving}
                                        >
                                            {isSaving
                                                ? "Creating..."
                                                : "Continue"}
                                            <span
                                                style={{
                                                    marginLeft: "5px",
                                                }}
                                            >
                                                →
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* SUCCESS STATE */}

                            {showSuccess && createdList && (
                                <div className="success-state show">
                                    <div className="success-icon">✓</div>

                                    <h2>Class Link Created</h2>

                                    <p>
                                        Share this link with students of
                                        <strong>
                                            {" "}
                                            {createdList.tabName}
                                        </strong>.
                                    </p>

                                    <div className="generated-link-box">
                                        <span>
                                            Student Registration Link:
                                            &nbsp;
                                        </span>

                                        <strong
                                            style={{
                                                overflowWrap: "anywhere",
                                            }}
                                        >
                                            {fullStudentLink}
                                        </strong>
                                        <br />
                                    </div>

                                    <div className="success-actions">
                                        <button
                                            type="button"
                                            className="ui-btn ui-btn--primary"
                                            style={{
                                                marginTop: "10px",
                                            }}
                                            onClick={copyStudentLink}
                                        >
                                            Copy Link
                                        </button>

                                    </div>
                                </div>
                            )}
                        </div>

                        {/* INFORMATION SIDEBAR */}

                        <aside className="info-card">
                            <div className="info-card-heading">
                                <div className="info-heading-icon">
                                    i
                                </div>

                                <div>
                                    <h3>How this works</h3>
                                    <p>
                                        Set up a student submission flow
                                        in a few steps.
                                    </p>
                                </div>
                            </div>

                            <div className="info-divider" />

                            <div className="info-item">
                                <div className="info-number">1</div>
                                <div>
                                    <strong>
                                        Identify submissions
                                    </strong>
                                    <span>
                                        The list name and tab name organize
                                        submissions from your student form.
                                    </span>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-number">2</div>
                                <div>
                                    <strong>
                                        Verify student details
                                    </strong>
                                    <span>
                                        Choose the master list used to check
                                        submitted student information.
                                    </span>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-number">3</div>
                                <div>
                                    <strong>
                                        Choose the ID card design
                                    </strong>
                                    <span>
                                        Associate a saved template with this
                                        student group for card generation.
                                    </span>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-number">4</div>
                                <div>
                                    <strong>Share the link</strong>
                                    <span>
                                        Students can open the generated URL
                                        once the public student form route
                                        is configured to load and save
                                        this group's information.
                                    </span>
                                </div>
                            </div>

                            <div className="info-tip">
                                <strong>Tip</strong>
                                <p>
                                    Select the correct master list before
                                    sharing the link. Student verification
                                    depends on the master data configured
                                    for this form.
                                </p>
                            </div>
                        </aside>
                    </div>
                </section>
            </main>

            {/* TOAST */}

            <div
                className={`toast ${
                    toastVisible ? "show" : ""
                }`}
                id="toast"
                role="status"
                aria-live="polite"
            >
                {toast}
            </div>
        </div>
    );
}

export default IDListForm;