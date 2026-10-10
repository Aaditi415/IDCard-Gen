
import { useEffect, useState } from "react";
import { ArrowRight, Copy, ExternalLink } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function IDListForm() {
    const [listName, setListName] = useState("");
    const [tabName, setTabName] = useState("");
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [selectedMasterListId, setSelectedMasterListId] = useState("");

    const [templates, setTemplates] = useState([]);
    const [masterLists, setMasterLists] = useState([]);

    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [createdList, setCreatedList] = useState(null);

    const [toast, setToast] = useState("");
    const [toastVisible, setToastVisible] = useState(false);

    useEffect(() => {
        try {
            const savedTemplates = JSON.parse(
                localStorage.getItem("idCardTemplates") || "[]"
            );

            setTemplates(
                Array.isArray(savedTemplates) ? savedTemplates : []
            );

            const savedLists = JSON.parse(
                localStorage.getItem("idCardStoredLists") || "[]"
            );

            if (Array.isArray(savedLists) && savedLists.length) {
                setMasterLists(savedLists);
            } else {
                const oldList = JSON.parse(
                    localStorage.getItem("idCardFinalList") || "null"
                );

                if (oldList) {
                    const converted = {
                        ...oldList,
                        id: oldList.id || `master_${Date.now()}`
                    };

                    const convertedLists = [converted];

                    localStorage.setItem(
                        "idCardStoredLists",
                        JSON.stringify(convertedLists)
                    );

                    setMasterLists(convertedLists);
                } else {
                    setMasterLists([]);
                }
            }
        } catch (error) {
            console.error("Unable to load saved data:", error);
            setTemplates([]);
            setMasterLists([]);
        }
    }, []);

    const showToast = (message) => {
        setToast(message);
        setToastVisible(true);

        window.setTimeout(() => {
            setToastVisible(false);
        }, 2500);
    };

    const selectedMasterList = masterLists.find(
        (item) => item.id === selectedMasterListId
    );

    const selectedTemplate = templates.find(
        (item) => item.id === selectedTemplateId
    );

    const createSlug = (value) =>
        value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

    const getInitials = (value) => {
        const words = value.trim().split(/\s+/);

        if (!words[0]) return "S";

        return words.length > 1
            ? `${words[0][0]}${words[1][0]}`.toUpperCase()
            : words[0].slice(0, 2).toUpperCase();
    };

    const validateForm = () => {
        const nextErrors = {};
        const cleanListName = listName.trim();
        const cleanTabName = tabName.trim();
        const slug = createSlug(cleanTabName);

        if (!cleanListName) {
            nextErrors.listName = "Please enter a list name.";
        } else if (cleanListName.length < 3) {
            nextErrors.listName = "List name must contain at least 3 characters.";
        } else if (cleanListName.length > 50) {
            nextErrors.listName = "List name cannot exceed 50 characters.";
        }

        if (!cleanTabName) {
            nextErrors.tabName = "Please enter a tab name.";
        } else if (cleanTabName.length < 2) {
            nextErrors.tabName = "Tab name must contain at least 2 characters.";
        } else if (cleanTabName.length > 30) {
            nextErrors.tabName = "Tab name cannot exceed 30 characters.";
        } else if (!slug) {
            nextErrors.tabName = "Use letters or numbers in the tab name.";
        }

        const existingLists = JSON.parse(
            localStorage.getItem("idCardLists") || "[]"
        );

        if (Array.isArray(existingLists)) {
            if (
                cleanListName &&
                existingLists.some(
                    (item) =>
                        item.listName?.trim().toLowerCase() ===
                        cleanListName.toLowerCase()
                )
            ) {
                nextErrors.listName = "This list name already exists.";
            }

            if (
                slug &&
                existingLists.some((item) => item.slug === slug)
            ) {
                nextErrors.tabName = "A student link already exists for this tab.";
            }
        }

        if (!selectedTemplateId) {
            nextErrors.template = "Please select an ID card template.";
        } else if (!selectedTemplate) {
            nextErrors.template = "The selected template could not be found.";
        }

        if (!selectedMasterListId) {
            nextErrors.masterList = "Please select a master list.";
        } else if (!selectedMasterList) {
            nextErrors.masterList = "The selected master list could not be found.";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleContinue = () => {
        if (!validateForm()) {
            showToast("Please correct the highlighted fields.");
            return;
        }

        const slug = createSlug(tabName);
        const now = new Date().toISOString();

        const listData = {
            id: `list_${Date.now()}`,
            listName: listName.trim(),
            tabName: tabName.trim(),
            slug,
            studentLink: `/studentform/${slug}`,

            templateId: selectedTemplateId,
            templateName: selectedTemplate?.name || "",

            masterListId: selectedMasterListId,
            masterListName:
                selectedMasterList?.listName ||
                selectedMasterList?.name ||
                "",

            // Configuration for the public student form.
            studentFormConfig: {
                listName: listName.trim(),
                tabName: tabName.trim(),
                masterListId: selectedMasterListId,
                templateId: selectedTemplateId,
                fields: (selectedMasterList?.headers || []).map(
                    (header) => ({
                        name: header,
                        label: header,
                        hint: `Enter ${String(header).toLowerCase()}.`,
                        required: true,
                        validation: "auto",
                        errorMessage: `Please enter a valid ${String(
                            header
                        ).toLowerCase()}.`
                    })
                )
            },

            verification: {
                status: "pending",
                masterListId: selectedMasterListId
            },

            createdAt: now,
            updatedAt: now
        };

        const existingLists = JSON.parse(
            localStorage.getItem("idCardLists") || "[]"
        );

        const updatedLists = [
            ...(Array.isArray(existingLists) ? existingLists : []),
            listData
        ];

        localStorage.setItem("idCardLists", JSON.stringify(updatedLists));
        localStorage.setItem("idCardList", JSON.stringify(listData));

        setCreatedList(listData);
        setShowSuccess(true);
        showToast("Student form link created successfully.");
    };

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
        setErrors({});
        setShowSuccess(false);
        setCreatedList(null);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && event.target.tagName !== "TEXTAREA") {
            event.preventDefault();
            handleContinue();
        }
    };

    const copyStudentLink = async () => {
        if (!createdList) return;

        const fullLink =
            `${window.location.origin}${createdList.studentLink}`;

        try {
            await navigator.clipboard.writeText(fullLink);
            showToast("Student form link copied.");
        } catch {
            showToast("Unable to copy the link. Please copy it manually.");
        }
    };

    const goBack = () => {
        window.location.href = "/idlistform";
    };

    const goStudentForm = () => {
        if (createdList) {
            window.location.href = createdList.studentLink;
        }
    };

    const getErrorClass = (field) =>
        `input ${errors[field] ? "invalid" : ""}`;

    return (
        <div className="app">
            <Sidebar activePage="IDlistform" />

            <main className="main">
                <Topbar />

                <section className="content student-form-page">
                    <div className="breadcrumb">
                        <button type="button" onClick={goBack}>
                            Student Forms
                        </button>
                        <span>›</span>
                        <span>Create Student Form</span>
                    </div>

                    <h1 className="page-title">
                        Create Student Form
                    </h1>

                    <p className="page-subtitle">
                        Create a shareable student registration form, choose
                        the master list for verification, and select the ID
                        card design.
                    </p>

                    <div className="steps">
                        <div className={`step ${showSuccess ? "completed" : "active"}`}>
                            <div className="step-number">
                                {showSuccess ? "✓" : "1"}
                            </div>
                            <div className="step-label">Form Details</div>
                        </div>

                        <div className={`step-line ${showSuccess ? "completed" : ""}`} />

                        <div className={`step ${showSuccess ? "active" : ""}`}>
                            <div className="step-number">2</div>
                            <div className="step-label">Share Link</div>
                        </div>
                    </div>

                    <div className="layout student-form-layout">
                        <div>
                            {!showSuccess && (
                                <div className="form-card">
                                    <div className="form-card-header">
                                        <h2>Student Form Details</h2>
                                        <p>
                                            Configure where submissions are
                                            saved and how student information
                                            will be verified.
                                        </p>
                                    </div>

                                    <div className="form-body">
                                        <div className="student-form-section">
                                            <h3>1. Form identification</h3>
                                            <p>
                                                These names help identify the
                                                incoming student submissions.
                                            </p>
                                        </div>

                                        <div className="field">
                                            <label className="field-label" htmlFor="listName">
                                                List Name <span className="required">*</span>
                                            </label>

                                            <input
                                                id="listName"
                                                type="text"
                                                className={getErrorClass("listName")}
                                                placeholder="e.g. 2026–27 Student Records"
                                                minLength={3}
                                                maxLength={50}
                                                value={listName}
                                                aria-invalid={Boolean(errors.listName)}
                                                onChange={(event) => {
                                                    setListName(event.target.value);
                                                    setErrors((old) => ({ ...old, listName: "" }));
                                                }}
                                                onKeyDown={handleKeyDown}
                                            />

                                            <p className="field-hint">
                                                Use a recognizable name for the group
                                                whose student submissions you will manage.
                                            </p>

                                            {errors.listName && (
                                                <p className="field-error" role="alert">
                                                    {errors.listName}
                                                </p>
                                            )}
                                        </div>

                                        <div className="field">
                                            <label className="field-label" htmlFor="tabName">
                                                Tab Name <span className="required">*</span>
                                            </label>

                                            <input
                                                id="tabName"
                                                type="text"
                                                className={getErrorClass("tabName")}
                                                placeholder="e.g. 10th A"
                                                minLength={2}
                                                maxLength={30}
                                                value={tabName}
                                                aria-invalid={Boolean(errors.tabName)}
                                                onChange={(event) => {
                                                    setTabName(event.target.value);
                                                    setErrors((old) => ({ ...old, tabName: "" }));
                                                }}
                                                onKeyDown={handleKeyDown}
                                            />

                                            <p className="field-hint">
                                                This becomes the short label for the
                                                submission group and is used to create
                                                the student form URL.
                                            </p>

                                            {errors.tabName && (
                                                <p className="field-error" role="alert">
                                                    {errors.tabName}
                                                </p>
                                            )}
                                        </div>

                                        <div className="student-form-section">
                                            <h3>2. Verification and card design</h3>
                                            <p>
                                                Choose the master data source and
                                                saved ID card template.
                                            </p>
                                        </div>

                                        <div className="field">
                                            <label className="field-label" htmlFor="masterList">
                                                Master List <span className="required">*</span>
                                            </label>

                                            <select
                                                id="masterList"
                                                className={getErrorClass("masterList")}
                                                value={selectedMasterListId}
                                                aria-invalid={Boolean(errors.masterList)}
                                                onChange={(event) => {
                                                    setSelectedMasterListId(event.target.value);
                                                    setErrors((old) => ({ ...old, masterList: "" }));
                                                }}
                                            >
                                                <option value="">Select master list</option>
                                                {masterLists.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.listName || item.name || "Unnamed Master List"}
                                                    </option>
                                                ))}
                                            </select>

                                            <p className="field-hint">
                                                Submitted student details will be checked
                                                against the selected master list.
                                            </p>

                                            {errors.masterList && (
                                                <p className="field-error" role="alert">
                                                    {errors.masterList}
                                                </p>
                                            )}

                                            {masterLists.length === 0 && (
                                                <p className="field-hint">
                                                    No master lists found. Create or import
                                                    a master list before setting up the form.
                                                </p>
                                            )}
                                        </div>

                                        <div className="field">
                                            <label className="field-label" htmlFor="template">
                                                ID Card Template <span className="required">*</span>
                                            </label>

                                            <select
                                                id="template"
                                                className={getErrorClass("template")}
                                                value={selectedTemplateId}
                                                aria-invalid={Boolean(errors.template)}
                                                onChange={(event) => {
                                                    setSelectedTemplateId(event.target.value);
                                                    setErrors((old) => ({ ...old, template: "" }));
                                                }}
                                            >
                                                <option value="">Select ID card template</option>
                                                {templates.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.name || "Unnamed Template"}
                                                    </option>
                                                ))}
                                            </select>

                                            <p className="field-hint">
                                                This saved design is associated with the
                                                student form for subsequent ID card creation.
                                            </p>

                                            {errors.template && (
                                                <p className="field-error" role="alert">
                                                    {errors.template}
                                                </p>
                                            )}

                                            {templates.length === 0 && (
                                                <p className="field-hint">
                                                    No saved templates found. Save an ID card
                                                    design before creating the student form.
                                                </p>
                                            )}
                                        </div>

                                        <div className="preview-box">
                                            <div className="preview-label">
                                                Form Preview
                                            </div>

                                            <div className="tab-preview">
                                                <div className="tab-icon">
                                                    {getInitials(tabName)}
                                                </div>

                                                <div className="student-form-preview-text">
                                                    <strong>
                                                        {tabName.trim() || "Your tab name"}
                                                    </strong>
                                                    <span>
                                                        {listName.trim() || "Your list name"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="student-form-summary">
                                                <div>
                                                    <span>Master List</span>
                                                    <strong>
                                                        {selectedMasterList?.listName ||
                                                            selectedMasterList?.name ||
                                                            "Not selected"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>ID Card Template</span>
                                                    <strong>
                                                        {selectedTemplate?.name || "Not selected"}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bottom-actions">
                                        <button
                                            type="button"
                                            className="ui-btn ui-btn--secondary"
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="button"
                                            className="ui-btn ui-btn--primary"
                                            onClick={handleContinue}
                                        >
                                            Create Student Form
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {showSuccess && createdList && (
                                <div className="success-state show">
                                    <div className="success-icon">✓</div>

                                    <h2>Student Form Created</h2>

                                    <p>
                                        Share this registration link with students
                                        in <strong>{createdList.tabName}</strong>.
                                    </p>

                                    <div className="generated-link-box">
                                        <span>Student Registration Link</span>
                                        <strong>
                                            {window.location.origin}
                                            {createdList.studentLink}
                                        </strong>
                                    </div>

                                    <div className="student-form-success-details">
                                        <div>
                                            <span>Submission List</span>
                                            <strong>{createdList.listName}</strong>
                                        </div>
                                        <div>
                                            <span>Tab</span>
                                            <strong>{createdList.tabName}</strong>
                                        </div>
                                        <div>
                                            <span>Verification Source</span>
                                            <strong>{createdList.masterListName}</strong>
                                        </div>
                                        <div>
                                            <span>ID Card Template</span>
                                            <strong>{createdList.templateName}</strong>
                                        </div>
                                    </div>

                                    <div className="success-actions">
                                        <button
                                            type="button"
                                            className="ui-btn ui-btn--primary"
                                            onClick={copyStudentLink}
                                        >
                                            <Copy size={16} />
                                            Copy Link
                                        </button>

                                        <button
                                            type="button"
                                            className="ui-btn ui-btn--secondary"
                                            onClick={goStudentForm}
                                        >
                                            <ExternalLink size={16} />
                                            Open Form
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <aside className="info-card">
                            <div className="info-card-heading">
                                <div className="info-heading-icon">i</div>
                                <div>
                                    <h3>How this works</h3>
                                    <p>
                                        Set up a student submission flow in a few steps.
                                    </p>
                                </div>
                            </div>

                            <div className="info-divider" />

                            <div className="info-item">
                                <div className="info-number">1</div>
                                <div>
                                    <strong>Identify submissions</strong>
                                    <span>
                                        The list name and tab name organize the
                                        submissions from your student form.
                                    </span>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-number">2</div>
                                <div>
                                    <strong>Verify student details</strong>
                                    <span>
                                        Select the master list that will be used
                                        to check the submitted student information.
                                    </span>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-number">3</div>
                                <div>
                                    <strong>Choose the ID card design</strong>
                                    <span>
                                        Associate a saved template with this student
                                        form for the later card-generation workflow.
                                    </span>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-number">4</div>
                                <div>
                                    <strong>Share the link</strong>
                                    <span>
                                        Students can open the generated URL to submit
                                        their information. The public form route must
                                        load and save this configuration.
                                    </span>
                                </div>
                            </div>

                            <div className="info-tip">
                                <strong>Tip</strong>
                                <p>
                                    Select the correct master list before sharing
                                    the link. Student verification depends on the
                                    master data configured for this form.
                                </p>
                            </div>
                        </aside>
                    </div>
                </section>
            </main>

            <div className={`toast ${toastVisible ? "show" : ""}`} role="status">
                {toast}
            </div>
        </div>
    );
}

export default IDListForm;