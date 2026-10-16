
import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import IDCardRenderer from "../components/IDCardRenderer";
import { SquareDashedPlus, LayoutTemplate } from "lucide-react";

/* =========================================================
   STORAGE KEYS
========================================================= */

const TEMPLATES_STORAGE_KEY = "idCardTemplates";
const FORM_STORAGE_KEY = "idCardForm";
const FORM_ID_STORAGE_KEY = "idCardFormId";
const DESIGN_STORAGE_KEY = "idCardDesign";
const DEMO_DATA_STORAGE_KEY = "idCardDemoData";
const SELECTED_TEMPLATE_STORAGE_KEY = "selectedIdCardTemplate";

/* =========================================================
   HELPERS
========================================================= */

function readStorage(key, fallback = null) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.error(`Unable to read ${key}:`, error);
        return fallback;
    }
}

function getFormId(form) {
    const id = form?._id ?? form?.id;
    return id == null ? "" : String(id);
}

function getTemplateId(template) {
    return template?.id == null ? "" : String(template.id);
}

function formatLabel(value) {
    if (!value) return "—";

    return String(value)
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(date) {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getTemplateFields(template, fallbackForm) {
    if (Array.isArray(template?.form?.fields)) {
        return template.form.fields;
    }

    const templateFormId = String(template?.formId ?? "");
    const fallbackFormId = getFormId(fallbackForm);

    if (
        fallbackForm &&
        templateFormId &&
        templateFormId === fallbackFormId &&
        Array.isArray(fallbackForm.fields)
    ) {
        return fallbackForm.fields;
    }

    return [];
}

/* =========================================================
   TEMPLATE CARD
========================================================= */

function TemplateCard({
    template,
    form,
    onUse,
    onEdit,
    onDelete,
}) {
    const design = template?.design || {};
    const fields = getTemplateFields(template, form);

    const templateId = getTemplateId(template);

    return (
        <div className="template-card">
            {/* PREVIEW */}

            <div className="template-preview">
                <div className="template-preview-card">
                    {fields.length > 0 ? (
                        <IDCardRenderer
                            formFields={fields}
                            data={template?.demoData || {}}
                            design={design}
                            activeSide="front"
                        />
                    ) : (
                        <div className="template-preview-missing">
                            Form data unavailable
                        </div>
                    )}
                </div>
            </div>

            {/* DETAILS */}

            <div className="template-card-content">
                <div className="template-title-row">
                    <div>
                        <h3>
                            {template?.name || "Untitled Template"}
                        </h3>

                        <span className="template-updated">
                            Updated{" "}
                            {formatDate(
                                template?.updatedAt ||
                                template?.createdAt
                            )}
                        </span>
                    </div>

                    <button
                        type="button"
                        className="template-menu-btn"
                        title="Delete template"
                        aria-label={`Delete ${template?.name || "template"}`}
                        onClick={() => onDelete(templateId)}
                    >
                        ⋮
                    </button>
                </div>

                {/* META */}

                <div className="template-meta">
                    <span>
                        <b>Design</b>
                        {formatLabel(design.template)}
                    </span>

                    <span>
                        <b>Orientation</b>
                        {formatLabel(design.orientation)}
                    </span>

                    <span>
                        <b>Fields</b>
                        {fields.length}
                    </span>

                    <span>
                        <b>Sides</b>
                        {Number(design.sides) === 2
                            ? "Front + Back"
                            : "Front"}
                    </span>
                </div>

                {/* ACTIONS */}

                <div className="template-actions">
                    <button
                        type="button"
                        className="template-use-btn"
                        onClick={() => onUse(template)}
                    >
                        Use Template
                    </button>

                    <button
                        type="button"
                        className="template-edit-btn"
                        onClick={() => onEdit(template)}
                    >
                        Edit
                    </button>
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyTemplates({ onCreate }) {
    return (
        <div className="templates-empty">
            <div className="empty-icon">
                <SquareDashedPlus />
            </div>

            <h2>No templates yet</h2>

            <p>
                Create your first ID card template
                to start generating ID cards.
            </p>

            <button
                type="button"
                className="primary-btn"
                onClick={onCreate}
            >
                + Create Template
            </button>
        </div>
    );
}

/* =========================================================
   MAIN PAGE
========================================================= */

function Templates() {
    const [templates, setTemplates] = useState([]);
    const [form, setForm] = useState(null);
    const [toast, setToast] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    /* =====================================================
       TOAST
    ===================================================== */

    const showToast = useCallback((message) => {
        setToast(message);
    }, []);

    useEffect(() => {
        if (!toast) return undefined;

        const timeoutId = setTimeout(() => {
            setToast("");
        }, 2500);

        return () => clearTimeout(timeoutId);
    }, [toast]);

    /* =====================================================
       LOAD TEMPLATES AND CURRENT FORM
    ===================================================== */

    const loadTemplates = useCallback(() => {
        const savedTemplates = readStorage(
            TEMPLATES_STORAGE_KEY,
            []
        );

        const savedForm = readStorage(
            FORM_STORAGE_KEY,
            null
        );

        setForm(
            savedForm &&
            typeof savedForm === "object" &&
            !Array.isArray(savedForm)
                ? savedForm
                : null
        );

        if (!Array.isArray(savedTemplates)) {
            setTemplates([]);
            return;
        }

        /*
         * Normalize legacy records without IDs.
         * Preserve every record; do not merge templates
         * merely because they share a formId.
         */

        const usedIds = new Set();

        const normalizedTemplates = savedTemplates.map(
            (template, index) => {
                const item =
                    template && typeof template === "object"
                        ? template
                        : {};

                let id = getTemplateId(item);

                if (!id || usedIds.has(id)) {
                    const baseId =
                        item.formId ||
                        item.createdAt ||
                        item.name ||
                        "template";

                    id = `template_${baseId}_${index}`;
                }

                usedIds.add(id);

                return {
                    ...item,
                    id,
                    formId: String(
                        item.formId ??
                        getFormId(item.form) ??
                        ""
                    ),
                    name: item.name || "Untitled Template",
                    design: item.design || {},
                    demoData: item.demoData || {},
                };
            }
        );

        setTemplates(normalizedTemplates);

        /*
         * Persist normalized IDs so delete and edit actions
         * continue to target the correct saved record.
         */

        try {
            localStorage.setItem(
                TEMPLATES_STORAGE_KEY,
                JSON.stringify(normalizedTemplates)
            );
        } catch (error) {
            console.error(
                "Unable to normalize saved templates:",
                error
            );
        }
    }, []);

    useEffect(() => {
        loadTemplates();

        const handleStorageChange = (event) => {
            if (
                event.key === TEMPLATES_STORAGE_KEY ||
                event.key === FORM_STORAGE_KEY
            ) {
                loadTemplates();
            }
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener(
                "storage",
                handleStorageChange
            );
        };
    }, [loadTemplates]);

    /* =====================================================
       SUMMARY
    ===================================================== */

    const templateCount = useMemo(
        () => templates.length,
        [templates]
    );

    /* =====================================================
       CREATE
    ===================================================== */

    function handleCreate() {
        window.location.href = "/create-form";
    }

    /* =====================================================
       RESTORE SELECTED TEMPLATE
    ===================================================== */

    function restoreTemplate(template) {
        const selectedForm = template?.form;

        if (
            !selectedForm ||
            !Array.isArray(selectedForm.fields)
        ) {
            showToast(
                "This template does not contain its saved form fields."
            );
            return false;
        }

        const formId = String(
            selectedForm._id ||
            selectedForm.id ||
            template.formId ||
            ""
        );

        if (!formId) {
            showToast("Template form ID is missing.");
            return false;
        }

        try {
            localStorage.setItem(
                FORM_STORAGE_KEY,
                JSON.stringify(selectedForm)
            );

            localStorage.setItem(
                FORM_ID_STORAGE_KEY,
                formId
            );

            localStorage.setItem(
                DESIGN_STORAGE_KEY,
                JSON.stringify(template.design || {})
            );

            localStorage.setItem(
                DEMO_DATA_STORAGE_KEY,
                JSON.stringify(template.demoData || {})
            );

            localStorage.setItem(
                SELECTED_TEMPLATE_STORAGE_KEY,
                JSON.stringify(template)
            );

            return true;
        } catch (error) {
            console.error(
                "Unable to restore template:",
                error
            );

            showToast(
                "Unable to restore template data."
            );

            return false;
        }
    }

    /* =====================================================
       USE TEMPLATE
    ===================================================== */

    function handleUseTemplate(template) {
        if (restoreTemplate(template)) {
            window.location.href = "/demo";
        }
    }

    /* =====================================================
       EDIT TEMPLATE
    ===================================================== */

    function handleEditTemplate(template) {
        if (restoreTemplate(template)) {
            window.location.href = "/design";
        }
    }

    /* =====================================================
       DELETE TEMPLATE
    ===================================================== */

    function handleDeleteTemplate(templateId) {
        const target = templates.find(
            (item) => getTemplateId(item) === String(templateId)
        );

        if (!target) {
            showToast("Template not found.");
            return;
        }

        setDeleteTarget(target);
    }

    function confirmDeleteTemplate() {
        if (!deleteTarget || isDeleting) return;

        setIsDeleting(true);

        try {
            const targetId = getTemplateId(deleteTarget);

            const currentTemplates = readStorage(
                TEMPLATES_STORAGE_KEY,
                []
            );

            if (!Array.isArray(currentTemplates)) {
                throw new Error("Saved templates data is invalid.");
            }

            const updatedTemplates = currentTemplates.filter(
                (item) =>
                    getTemplateId(item) !== targetId
            );

            localStorage.setItem(
                TEMPLATES_STORAGE_KEY,
                JSON.stringify(updatedTemplates)
            );

            setTemplates(updatedTemplates);
            setDeleteTarget(null);
            showToast("Template deleted successfully.");
        } catch (error) {
            console.error(
                "Unable to delete template:",
                error
            );

            showToast("Unable to delete template.");
        } finally {
            setIsDeleting(false);
        }
    }

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="app">
            <Sidebar activePage="templates" />

            <main className="main">
                <Topbar />

                <section className="content">
                    {/* PAGE HEADER */}

                    <div className="page-header">
                        <div>
                            <h1 className="page-title">
                                Templates
                            </h1>

                            <p className="page-subtitle">
                                Manage your saved ID card
                                designs and templates.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="add-record-btn"
                            onClick={handleCreate}
                        >
                            + Create Template
                        </button>
                    </div>

                    {/* SUMMARY */}

                    <div className="templates-summary">
                        <div className="templates-summary-icon">
                            <LayoutTemplate />
                        </div>

                        <div>
                            <span>Saved Templates</span>
                            <strong>{templateCount}</strong>
                        </div>
                    </div>

                    {/* TEMPLATE GRID */}

                    {templates.length === 0 ? (
                        <EmptyTemplates onCreate={handleCreate} />
                    ) : (
                        <div className="templates-grid">
                            {templates.map((template) => {
                                const templateForm =
                                    template?.form &&
                                    Array.isArray(template.form.fields)
                                        ? template.form
                                        : (
                                            String(
                                                template?.formId || ""
                                            ) === getFormId(form)
                                                ? form
                                                : null
                                        );

                                return (
                                    <TemplateCard
                                        key={getTemplateId(template)}
                                        template={template}
                                        form={templateForm}
                                        onUse={handleUseTemplate}
                                        onEdit={handleEditTemplate}
                                        onDelete={handleDeleteTemplate}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {/* FOOTER */}

                    <div className="templates-page-footer">
                        <span>ID Card System</span>
                        <span>Templates</span>
                    </div>
                </section>

                {/* DELETE CONFIRMATION MODAL */}

                {deleteTarget && (
                    <div
                        className="delete-modal-overlay"
                        onMouseDown={(event) => {
                            if (
                                event.target === event.currentTarget &&
                                !isDeleting
                            ) {
                                setDeleteTarget(null);
                            }
                        }}
                    >
                        <div
                            className="delete-modal"
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby="delete-modal-title"
                            aria-describedby="delete-modal-description"
                        >
                            <div className="delete-modal-icon">
                                <svg
                                    width="26"
                                    height="26"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M3 6h18" />
                                    <path d="M8 6V4h8v2" />
                                    <path d="m19 6-1 14H6L5 6" />
                                    <path d="M10 11v5" />
                                    <path d="M14 11v5" />
                                </svg>
                            </div>

                            <h2 id="delete-modal-title">
                                Delete template?
                            </h2>

                            <p id="delete-modal-description">
                                Are you sure you want to delete{" "}
                                <strong>
                                    {deleteTarget.name ||
                                        "Untitled Template"}
                                </strong>
                                ? This action cannot be undone.
                            </p>

                            <div className="delete-modal-actions">
                                <button
                                    type="button"
                                    className="delete-modal-cancel"
                                    disabled={isDeleting}
                                    onClick={() =>
                                        setDeleteTarget(null)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="delete-modal-confirm"
                                    disabled={isDeleting}
                                    onClick={confirmDeleteTemplate}
                                >
                                    {isDeleting
                                        ? "Deleting..."
                                        : "Delete Template"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* TOAST */}

            {toast && (
                <div className="toast" role="status">
                    {toast}
                </div>
            )}
        </div>
    );
}

export default Templates;
