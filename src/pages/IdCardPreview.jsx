
import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { ArrowLeft, ArrowRight } from "lucide-react";
import '../styles/design.css'

const DESIGN_STORAGE_KEY = "idCardDesign";
const FORM_STORAGE_KEY = "idCardForm";
const DEMO_STORAGE_KEY = "idCardDemoData";
const TEMPLATES_STORAGE_KEY = "idCardTemplates";

const DEFAULT_DESIGN = {
    template: "modern",
    primaryColor: "#2563eb",
    orientation: "portrait",
    background: "white",
    cardSize: "standard",
    zoom: 1,
    sides: 1,
    previewSide: "front",
    photo: {
        visible: true,
        position: "left",
        width: 74,
        height: 91,
    },
    logo: {
        data: null,
        name: "",
        x: 16,
        y: 13,
        width: 43,
        height: 43,
        visible: true,
    },
    backgroundImage: {
        data: null,
        name: "",
        opacity: 1,
        visible: true,
    },
    organization: {
        text: "ORGANIZATION",
        x: 70,
        y: 16,
        visible: true,
    },
    fields: {},
    fieldLayout: {},
    frontFieldLayout: {},
    backFieldLayout: {},
    fieldSides: {},
};

function readStorage(key, fallback = null) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.error(`Unable to read ${key}:`, error);
        return fallback;
    }
}

function normalizeField(field, index) {
    const id =
        field?.id ??
        field?.key ??
        field?.name ??
        `field_${index + 1}`;

    const label =
        field?.label ??
        field?.title ??
        field?.name ??
        `Field ${index + 1}`;

    return {
        ...field,
        id: String(id),
        label: String(label),
        name: String(field?.name ?? field?.key ?? id),
        type: String(field?.type ?? field?.fieldType ?? "text").toLowerCase(),
        required: Boolean(field?.required),
        defaultValue: field?.defaultValue ?? "",
        placeholder: field?.placeholder ?? "",
        options: Array.isArray(field?.options) ? field.options : [],
    };
}

function mergeDesign(savedDesign) {
    if (!savedDesign || typeof savedDesign !== "object") {
        return DEFAULT_DESIGN;
    }

    return {
        ...DEFAULT_DESIGN,
        ...savedDesign,
        photo: {
            ...DEFAULT_DESIGN.photo,
            ...(savedDesign.photo || {}),
        },
        logo: {
            ...DEFAULT_DESIGN.logo,
            ...(savedDesign.logo || {}),
        },
        backgroundImage: {
            ...DEFAULT_DESIGN.backgroundImage,
            ...(savedDesign.backgroundImage || {}),
        },
        organization: {
            ...DEFAULT_DESIGN.organization,
            ...(savedDesign.organization || {}),
        },
        fields: {
            ...(savedDesign.fields || {}),
        },
        fieldLayout: {
            ...(savedDesign.fieldLayout || {}),
        },
        frontFieldLayout: {
            ...(savedDesign.frontFieldLayout || {}),
        },
        backFieldLayout: {
            ...(savedDesign.backFieldLayout || {}),
        },
        fieldSides: {
            ...(savedDesign.fieldSides || {}),
        },
    };
}

function isMediaField(field) {
    return ["media", "image", "photo", "file"].includes(field.type);
}

function isDateField(field) {
    return ["date", "dob", "birthdate"].includes(field.type);
}

function getCardDimensions(design) {
    const landscape = design.orientation === "landscape";
    const compact = design.cardSize === "compact";

    if (landscape) {
        return compact
            ? { width: 360, height: 230 }
            : { width: 440, height: 280 };
    }

    return compact
        ? { width: 230, height: 360 }
        : { width: 280, height: 440 };
}

function titleCase(value) {
    const text = String(value || "");
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function IdCardPreview() {
    const [formFields, setFormFields] = useState([]);
    const [savedForm, setSavedForm] = useState(null);
    const [design, setDesign] = useState(DEFAULT_DESIGN);
    const [demoData, setDemoData] = useState({});
    const [activeSide, setActiveSide] = useState("front");
    const [zoom, setZoom] = useState(1);
    const [toast, setToast] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [areaWidth, setAreaWidth] = useState(0);

    const cardAreaRef = useRef(null);
    const toastTimerRef = useRef(null);

    useEffect(() => {
        const form = readStorage(FORM_STORAGE_KEY);
        const savedDesign = readStorage(DESIGN_STORAGE_KEY);
        const savedDemo = readStorage(DEMO_STORAGE_KEY, {});

        const fields = Array.isArray(form)
            ? form
            : Array.isArray(form?.fields)
                ? form.fields
                : [];

        setSavedForm(Array.isArray(form) ? null : form);
        setFormFields(fields.map(normalizeField));
        setDesign(mergeDesign(savedDesign));
        setDemoData(
            savedDemo && typeof savedDemo === "object" && !Array.isArray(savedDemo)
                ? savedDemo
                : {}
        );

        const merged = mergeDesign(savedDesign);
        setActiveSide(
            Number(merged.sides) === 2 && merged.previewSide === "back"
                ? "back"
                : "front"
        );

        const savedZoom = Number(merged.zoom);
        if (Number.isFinite(savedZoom)) {
            setZoom(Math.min(1.8, Math.max(0.5, savedZoom)));
        }
    }, []);

    useEffect(() => {
        const element = cardAreaRef.current;
        if (!element) return undefined;

        const updateWidth = () => {
            setAreaWidth(element.clientWidth);
        };

        updateWidth();

        if (typeof ResizeObserver !== "undefined") {
            const observer = new ResizeObserver(updateWidth);
            observer.observe(element);
            return () => observer.disconnect();
        }

        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) {
                window.clearTimeout(toastTimerRef.current);
            }
        };
    }, []);

    const cardDimensions = useMemo(
        () => getCardDimensions(design),
        [design.orientation, design.cardSize]
    );

    // Automatically fit the card into its container on small screens.
    const fitScale = useMemo(() => {
        if (!areaWidth) return zoom;

        const availableWidth = Math.max(160, areaWidth - 38);
        const responsiveScale = availableWidth / cardDimensions.width;

        return Math.min(zoom, responsiveScale);
    }, [areaWidth, cardDimensions.width, zoom]);

    const templateClass = String(design.template || "modern")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "");

    const activeFieldLayout =
        activeSide === "back"
            ? design.backFieldLayout || {}
            : design.frontFieldLayout || design.fieldLayout || {};

    const visibleFields = formFields.filter((field) => {
        if (Number(design.sides) === 1) return true;
        return (design.fieldSides?.[field.id] || "front") === activeSide;
    });

    const photoField = visibleFields.find(isMediaField);

    const informationFields = visibleFields.filter(
        (field) => !isMediaField(field)
    );

    const studentNameField = informationFields.find(
        (field) =>
            field.label.toLowerCase().includes("name") ||
            field.name.toLowerCase().includes("name")
    );

    function getFieldValue(field) {
        return demoData?.[field.id] ?? "";
    }

    function getDisplayValue(field) {
        const value = getFieldValue(field);

        if (value === null || value === undefined || value === "") {
            return "";
        }

        if (isDateField(field)) {
            const date = new Date(value);

            if (!Number.isNaN(date.getTime())) {
                return date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                });
            }
        }

        if (Array.isArray(value)) {
            return value.join(", ");
        }

        if (typeof value === "object") {
            return String(value.name || value.label || "");
        }

        return String(value);
    }

    function getFieldLayout(field, index) {
        return (
            activeFieldLayout[field.id] || {
                row: index + 1,
                column: 1,
                width: 1,
            }
        );
    }

    function showToast(message) {
        setToast(message);

        if (toastTimerRef.current) {
            window.clearTimeout(toastTimerRef.current);
        }

        toastTimerRef.current = window.setTimeout(() => {
            setToast("");
        }, 2600);
    }

    function changeZoom(amount) {
        setZoom((current) =>
            Math.min(1.8, Math.max(0.5, Number((current + amount).toFixed(1))))
        );
    }

    function goDemo() {
        window.location.href = "/demo";
    }

    function handleGenerate() {
        setIsSaving(true);

        try {
            const form = readStorage(FORM_STORAGE_KEY);
            const savedDesign = readStorage(DESIGN_STORAGE_KEY);
            const savedDemoData = readStorage(DEMO_STORAGE_KEY, {});
            const existingTemplates = readStorage(TEMPLATES_STORAGE_KEY, []);

            if (!form || Array.isArray(form) || typeof form !== "object") {
                showToast("Form not found. Please complete Step 1.");
                return;
            }

            if (!Array.isArray(form.fields)) {
                showToast("The saved form has no fields. Please check Step 1.");
                return;
            }

            if (!savedDesign || typeof savedDesign !== "object") {
                showToast("Design not found. Please complete the Design step.");
                return;
            }

            if (!Array.isArray(existingTemplates)) {
                showToast("Saved templates could not be read. Please try again.");
                return;
            }

            const now = new Date().toISOString();
            const formId = form.id || `form_${form.name || "untitled"}`;

            const existingIndex = existingTemplates.findIndex(
                (item) => item?.formId === formId
            );

            const previous =
                existingIndex >= 0 ? existingTemplates[existingIndex] : null;

            const template = {
                id: previous?.id || `template_${Date.now()}`,
                name: form.name || "Untitled ID Card",
                formId,
                form: {
                    ...form,
                    fields: form.fields.map((field) => ({ ...field })),
                },
                design: mergeDesign(savedDesign),
                demoData:
                    savedDemoData &&
                    typeof savedDemoData === "object" &&
                    !Array.isArray(savedDemoData)
                        ? { ...savedDemoData }
                        : {},
                createdAt: previous?.createdAt || now,
                updatedAt: now,
            };

            const nextTemplates = [...existingTemplates];

            if (existingIndex >= 0) {
                nextTemplates[existingIndex] = template;
            } else {
                nextTemplates.push(template);
            }

            localStorage.setItem(
                TEMPLATES_STORAGE_KEY,
                JSON.stringify(nextTemplates)
            );

            showToast(
                previous
                    ? "Template updated successfully."
                    : "Template saved successfully."
            );

            window.setTimeout(() => {
                window.location.href = "/templates";
            }, 900);
        } catch (error) {
            console.error("Unable to save ID card template:", error);
            showToast("Unable to save template. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="app">
            <Sidebar activePage="preview" />

            <main className="main">
                <Topbar />

                <section className="content preview-page">
                    <div className="breadcrumb">
                        <span>Create ID Card</span>
                        <span aria-hidden="true">›</span>
                        <span>Preview</span>
                    </div>

                    <header className="page-header preview-page-header">
                        <div>
                            <h1 className="page-title">Preview ID Card</h1>
                            <p className="page-subtitle">
                                Review your card before saving it as a template.
                            </p>
                        </div>
                    </header>

                    <nav className="steps" aria-label="ID card creation steps">
                        <div className="step completed">
                            <span className="step-number">✓</span>
                            <span>Create Form</span>
                        </div>
                        <div className="step-line" />
                        <div className="step completed">
                            <span className="step-number">✓</span>
                            <span>Design</span>
                        </div>
                        <div className="step-line" />
                        <div className="step completed">
                            <span className="step-number">✓</span>
                            <span>Demo</span>
                        </div>
                        <div className="step-line" />
                        <div className="step active" aria-current="step">
                            <span className="step-number">4</span>
                            <span>Preview</span>
                        </div>
                    </nav>

                    <div className="preview-layout">
                        <section className="form-card preview-main-card">
                            <header className="form-card-header preview-card-header">
                                <div className="preview-heading-copy">
                                    <h2>Final Preview</h2>
                                    <p>
                                        See how your design looks with the demo data.
                                    </p>
                                </div>

                                <div className="preview-controls">
                                    {Number(design.sides) === 2 && (
                                        <div
                                            className="side-switch"
                                            role="group"
                                            aria-label="Card side"
                                        >
                                            <button
                                                type="button"
                                                className={activeSide === "front" ? "active" : ""}
                                                aria-pressed={activeSide === "front"}
                                                onClick={() => setActiveSide("front")}
                                            >
                                                Front
                                            </button>
                                            <button
                                                type="button"
                                                className={activeSide === "back" ? "active" : ""}
                                                aria-pressed={activeSide === "back"}
                                                onClick={() => setActiveSide("back")}
                                            >
                                                Back
                                            </button>
                                        </div>
                                    )}

                                    <div className="zoom-controls" aria-label="Zoom controls">
                                        <button
                                            type="button"
                                            onClick={() => changeZoom(-0.1)}
                                            disabled={zoom <= 0.5}
                                            aria-label="Zoom out"
                                            title="Zoom out"
                                        >
                                            −
                                        </button>
                                        <span>{Math.round(zoom * 100)}%</span>
                                        <button
                                            type="button"
                                            onClick={() => changeZoom(0.1)}
                                            disabled={zoom >= 1.8}
                                            aria-label="Zoom in"
                                            title="Zoom in"
                                        >
                                            +
                                        </button>
                                        <button
                                            type="button"
                                            className="zoom-reset"
                                            onClick={() => setZoom(1)}
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </header>

                            <div className="preview-card-area" ref={cardAreaRef}>
                                <div
                                    className="preview-card-scale"
                                    style={{
                                        width: cardDimensions.width * fitScale,
                                        height: cardDimensions.height * fitScale,
                                    }}
                                >
                                    <div
                                        className={[
                                            "id-card-premium",
                                            `template-${templateClass}`,
                                            design.orientation,
                                            design.cardSize === "compact" ? "compact" : "",
                                        ].filter(Boolean).join(" ")}
                                        style={{
                                            width: `${cardDimensions.width}px`,
                                            height: `${cardDimensions.height}px`,
                                            transform: `scale(${fitScale})`,
                                            transformOrigin: "top left",
                                            "--card-primary": design.primaryColor || "#2563eb",
                                        }}
                                    >
                                        {design.backgroundImage?.data &&
                                            design.backgroundImage.visible !== false && (
                                                <img
                                                    src={design.backgroundImage.data}
                                                    alt=""
                                                    className="premium-background-image"
                                                />
                                            )}

                                        <header className="premium-card-header">
                                            {design.logo?.visible !== false &&
                                                (design.logo?.data ? (
                                                    <img
                                                        src={design.logo.data}
                                                        alt="Organization logo"
                                                        className="premium-card-logo"
                                                    />
                                                ) : (
                                                    <div className="premium-card-logo-placeholder">
                                                        LOGO
                                                    </div>
                                                ))}

                                            {design.organization?.visible !== false && (
                                                <div className="premium-card-heading">
                                                    <div className="premium-org-name">
                                                        {design.organization?.text || "ORGANIZATION"}
                                                    </div>
                                                    <div className="premium-org-subtitle">
                                                        STUDENT IDENTITY CARD
                                                    </div>
                                                </div>
                                            )}

                                            <div className="premium-header-accent" />
                                        </header>

                                        {activeSide === "front" && (
                                            <div className="premium-card-front">
                                                <div
                                                    className={[
                                                        "premium-identity-area",
                                                        `photo-position-${design.photo?.position || "left"}`,
                                                    ].join(" ")}
                                                >
                                                    {photoField && design.photo?.visible !== false && (
                                                        <div
                                                            className="premium-photo"
                                                            style={{
                                                                width: `${design.photo?.width || 74}px`,
                                                                height: `${design.photo?.height || 91}px`,
                                                            }}
                                                        >
                                                            {getFieldValue(photoField) ? (
                                                                <img
                                                                    src={getFieldValue(photoField)}
                                                                    alt={photoField.label}
                                                                />
                                                            ) : (
                                                                <span>PHOTO</span>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="premium-identity-text">
                                                        <div className="premium-student-name">
                                                            {studentNameField
                                                                ? getDisplayValue(studentNameField) || "Student Name"
                                                                : "Student Name"}
                                                        </div>
                                                        <div className="premium-student-role">
                                                            STUDENT
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="premium-information-area">
                                                    <div className="premium-section-title">
                                                        STUDENT INFORMATION
                                                    </div>

                                                    <div className="premium-information-grid">
                                                        {informationFields.map((field, index) => {
                                                            if (studentNameField?.id === field.id) {
                                                                return null;
                                                            }

                                                            const layout = getFieldLayout(field, index);
                                                            const otherFieldsInRow =
                                                                informationFields.filter((other, otherIndex) => {
                                                                    if (studentNameField?.id === other.id) {
                                                                        return false;
                                                                    }

                                                                    return getFieldLayout(other, otherIndex).row ===
                                                                        layout.row;
                                                                }).length;

                                                            const fullWidth =
                                                                Number(layout.width) === 2 ||
                                                                otherFieldsInRow === 1;

                                                            return (
                                                                <div
                                                                    key={field.id}
                                                                    className="premium-info-item"
                                                                    style={{
                                                                        gridColumn: fullWidth
                                                                            ? "1 / -1"
                                                                            : layout.column || 1,
                                                                        gridRow: layout.row || index + 1,
                                                                    }}
                                                                >
                                                                    <span className="premium-info-label">
                                                                        {field.label}
                                                                    </span>
                                                                    <strong className="premium-info-value">
                                                                        {getDisplayValue(field) || "—"}
                                                                    </strong>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <footer className="premium-card-footer">
                                                    <span>ID CARD</span>
                                                    <div className="premium-footer-line" />
                                                </footer>
                                            </div>
                                        )}

                                        {activeSide === "back" &&
                                            Number(design.sides) === 2 && (
                                                <div className="premium-card-back">
                                                    <div className="premium-back-title">
                                                        <span>CARD INFORMATION</span>
                                                        <small>
                                                            {design.organization?.text || "ORGANIZATION"}
                                                        </small>
                                                    </div>

                                                    <div className="premium-back-information">
                                                        {informationFields.map((field, index) => {
                                                            const layout = getFieldLayout(field, index);

                                                            return (
                                                                <div
                                                                    key={field.id}
                                                                    className="premium-info-item"
                                                                    style={{
                                                                        gridColumn:
                                                                            Number(layout.width) === 2
                                                                                ? "1 / -1"
                                                                                : layout.column || 1,
                                                                        gridRow: layout.row || index + 1,
                                                                    }}
                                                                >
                                                                    <span className="premium-info-label">
                                                                        {field.label}
                                                                    </span>
                                                                    <strong className="premium-info-value">
                                                                        {getDisplayValue(field) || "—"}
                                                                    </strong>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    <p className="premium-back-note">
                                                        This card is issued by{" "}
                                                        <strong>
                                                            {design.organization?.text || "the organization"}
                                                        </strong>
                                                        . Please carry this card with you.
                                                    </p>

                                                    <div className="premium-security-area">
                                                        <div className="premium-barcode" aria-hidden="true">
                                                            {Array.from({ length: 28 }, (_, index) => (
                                                                <span
                                                                    key={index}
                                                                    style={{
                                                                        height: index % 4 === 0 ? "18px" : "12px",
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <footer className="premium-card-footer">
                                                        <span>CARD INFORMATION</span>
                                                        <div className="premium-footer-line" />
                                                    </footer>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>

                            <div className="preview-info">
                                <div>
                                    <span>Template</span>
                                    <strong>{titleCase(design.template)}</strong>
                                </div>
                                <div>
                                    <span>Orientation</span>
                                    <strong>{titleCase(design.orientation)}</strong>
                                </div>
                                <div>
                                    <span>Card Size</span>
                                    <strong>{titleCase(design.cardSize)}</strong>
                                </div>
                                <div>
                                    <span>Fields</span>
                                    <strong>{formFields.length}</strong>
                                </div>
                                {Number(design.sides) === 2 && (
                                    <div>
                                        <span>Current Side</span>
                                        <strong>{titleCase(activeSide)}</strong>
                                    </div>
                                )}
                            </div>
                        </section>

                        <aside className="form-card preview-data-card">
                            <header className="form-card-header preview-data-header">
                                <div>
                                    <h2>Demo Data</h2>
                                    <p>Values currently used in the preview.</p>
                                </div>
                                <span className="preview-field-count">
                                    {formFields.length} fields
                                </span>
                            </header>

                            <div className="preview-data-body">
                                {formFields.length === 0 ? (
                                    <div className="preview-empty">
                                        <strong>No form fields found</strong>
                                        <p>Return to Create Form and add fields first.</p>
                                    </div>
                                ) : (
                                    formFields.map((field) => {
                                        const value = getFieldValue(field);

                                        return (
                                            <div className="preview-data-row" key={field.id}>
                                                <div className="preview-data-label">
                                                    <span>{field.label}</span>
                                                    <small>ID: {field.id}</small>
                                                </div>
                                                <strong>
                                                    {isMediaField(field)
                                                        ? value
                                                            ? "Photo uploaded"
                                                            : "No photo"
                                                        : getDisplayValue(field) || "—"}
                                                </strong>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="preview-ready">
                                <span className="ready-icon" aria-hidden="true">✓</span>
                                <div>
                                    <strong>Preview ready</strong>
                                    <p>
                                        Your form, design, and demo data are loaded.
                                        Check the card before saving the template.
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </div>

                    <div className="bottom-actions">
                        <button
                            type="button"
                            className="ui-btn ui-btn--secondary"
                            onClick={goDemo}
                        >
                            <ArrowLeft size={10}/> Back
                        </button>

                        <button
                            type="button"
                            className="primary-btn"
                            onClick={handleGenerate}
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving..." : "Save Template"}

                            <ArrowRight size={10}/>
                        </button>
                    </div>

                </section>
            </main>

            {toast && (
                <div className="toast" role="status" aria-live="polite">
                    {toast}
                </div>
            )}
        </div>
    );
}

export default IdCardPreview;
