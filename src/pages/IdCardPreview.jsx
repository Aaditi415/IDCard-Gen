
import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { ArrowLeft, ArrowRight } from "lucide-react";
import "../styles/design.css";

/* =========================================================
   STORAGE KEYS
========================================================= */

const API_BASE_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const DESIGN_STORAGE_KEY = "idCardDesign";
const FORM_STORAGE_KEY = "idCardForm";
const FORM_ID_STORAGE_KEY = "idCardFormId";
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

/* =========================================================
   STORAGE HELPERS
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

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Unable to save ${key}:`, error);
        return false;
    }
}

/* =========================================================
   FIELD HELPERS
========================================================= */

function normalizeField(field, index) {
    const source =
        field && typeof field === "object" ? field : {};

    const id =
        source.id ??
        source._id ??
        source.key ??
        source.name ??
        `field_${index + 1}`;

    const label =
        source.label ??
        source.title ??
        source.name ??
        `Field ${index + 1}`;

    return {
        ...source,
        id: String(id),
        label: String(label),
        name: String(source.name ?? source.key ?? id),
        type: String(
            source.type ?? source.fieldType ?? "text"
        ).toLowerCase(),
        required: Boolean(source.required),
        defaultValue: source.defaultValue ?? "",
        placeholder: source.placeholder ?? "",
        options: Array.isArray(source.options)
            ? source.options
            : [],
    };
}

function normalizeValueKey(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "");
}

function getValueForField(data, field) {
    if (!data || typeof data !== "object") {
        return "";
    }

    const possibleKeys = [
        field.id,
        field.name,
        field.key,
        field.label,
    ].filter(Boolean);

    for (const key of possibleKeys) {
        if (
            Object.prototype.hasOwnProperty.call(data, key) &&
            data[key] !== undefined &&
            data[key] !== null
        ) {
            return data[key];
        }
    }

    const normalizedDataKey = Object.keys(data).find(
        (key) =>
            normalizeValueKey(key) ===
            normalizeValueKey(field.name) ||
            normalizeValueKey(key) ===
            normalizeValueKey(field.label)
    );

    return normalizedDataKey
        ? data[normalizedDataKey] ?? ""
        : "";
}

function isMediaField(field) {
    return [
        "media",
        "image",
        "photo",
        "file",
    ].includes(field.type);
}

function isDateField(field) {
    const type = normalizeValueKey(field.type);

    return [
        "date",
        "dob",
        "birthdate",
        "dateofbirth",
    ].includes(type);
}

/* =========================================================
   DESIGN HELPERS
========================================================= */

function mergeDesign(savedDesign) {
    const source =
        savedDesign && typeof savedDesign === "object"
            ? savedDesign
            : {};

    return {
        ...DEFAULT_DESIGN,
        ...source,

        photo: {
            ...DEFAULT_DESIGN.photo,
            ...(source.photo || {}),
        },

        logo: {
            ...DEFAULT_DESIGN.logo,
            ...(source.logo || {}),
        },

        backgroundImage: {
            ...DEFAULT_DESIGN.backgroundImage,
            ...(source.backgroundImage || {}),
        },

        organization: {
            ...DEFAULT_DESIGN.organization,
            ...(source.organization || {}),
        },

        fields: {
            ...(source.fields || {}),
        },

        fieldLayout: {
            ...(source.fieldLayout || {}),
        },

        frontFieldLayout: {
            ...(source.frontFieldLayout || {}),
        },

        backFieldLayout: {
            ...(source.backFieldLayout || {}),
        },

        fieldSides: {
            ...(source.fieldSides || {}),
        },
    };
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

function formatDate(value) {
    if (typeof value !== "string" || !value.trim()) {
        return "";
    }

    /*
     * Parse YYYY-MM-DD as a local date.
     * Avoids shifting a date to the previous day
     * because of UTC timezone conversion.
     */
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    let date;

    if (match) {
        date = new Date(
            Number(match[1]),
            Number(match[2]) - 1,
            Number(match[3])
        );

        if (
            date.getFullYear() !== Number(match[1]) ||
            date.getMonth() !== Number(match[2]) - 1 ||
            date.getDate() !== Number(match[3])
        ) {
            return value;
        }
    } else {
        date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

/* =========================================================
   COMPONENT
========================================================= */

function IdCardPreview() {

    const [formFields, setFormFields] = useState([]);
    const [savedForm, setSavedForm] = useState(null);
    const [design, setDesign] = useState(() =>
        mergeDesign(DEFAULT_DESIGN)
    );
    const [demoData, setDemoData] = useState({});

    const [activeSide, setActiveSide] = useState("front");
    const [zoom, setZoom] = useState(1);
    const [toast, setToast] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [areaWidth, setAreaWidth] = useState(0);

    const cardAreaRef = useRef(null);
    const toastTimerRef = useRef(null);
    const redirectTimerRef = useRef(null);

    /* =====================================================
       LOAD FORM FROM MONGODB
    ===================================================== */

    useEffect(() => {
        let cancelled = false;

        async function loadPreview() {
            setIsLoading(true);
            setLoadError("");

            try {
                /*
                 * The query string takes priority.
                 * idCardFormId is only used to identify
                 * which MongoDB form should be fetched.
                 */
                const cachedForm = readStorage(
                    FORM_STORAGE_KEY,
                    {}
                );

                const formId =
                    localStorage.getItem(FORM_ID_STORAGE_KEY) ||
                    cachedForm?._id ||
                    cachedForm?.id ||
                    "";

                const token = localStorage.getItem(
                    "idFoundryToken"
                );

                if (!formId) {
                    throw new Error(
                        "Form ID not found. Please open your saved form and continue to Preview."
                    );
                }

                if (!token) {
                    throw new Error(
                        "Your session has expired. Please log in again."
                    );
                }

                const response = await fetch(
                    `${API_BASE_URL}/api/id-card-forms/${encodeURIComponent(formId)}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                const result = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(
                        result.message ||
                        result.error ||
                        `Unable to load form (${response.status}).`
                    );
                }

                const form = result.form;

                if (
                    !form ||
                    typeof form !== "object" ||
                    Array.isArray(form)
                ) {
                    throw new Error(
                        "The server returned an invalid form."
                    );
                }

                if (!Array.isArray(form.fields)) {
                    throw new Error(
                        "The saved MongoDB form has no valid fields."
                    );
                }

                if (cancelled) return;

                setSavedForm(form);
                setFormFields(form.fields.map(normalizeField));

                /*
                 * Keep only the MongoDB ID as the pointer.
                 * Do not use the cached form as the source
                 * of truth for the preview.
                 */
                if (form._id) {
                    localStorage.setItem(
                        FORM_ID_STORAGE_KEY,
                        String(form._id)
                    );
                }

                /*
                 * Design and demo data are still local because
                 * no corresponding backend endpoints were
                 * provided for this project.
                 */
                const savedDesign = readStorage(
                    DESIGN_STORAGE_KEY,
                    DEFAULT_DESIGN
                );

                const savedDemo = readStorage(
                    DEMO_STORAGE_KEY,
                    {}
                );

                const nextDesign = mergeDesign(savedDesign);

                setDesign(nextDesign);

                setDemoData(
                    savedDemo &&
                    typeof savedDemo === "object" &&
                    !Array.isArray(savedDemo)
                        ? savedDemo
                        : {}
                );

                setActiveSide(
                    Number(nextDesign.sides) === 2 &&
                    nextDesign.previewSide === "back"
                        ? "back"
                        : "front"
                );

                const savedZoom = Number(nextDesign.zoom);

                setZoom(
                    Number.isFinite(savedZoom)
                        ? Math.min(1.8, Math.max(0.5, savedZoom))
                        : 1
                );
            } catch (error) {
                if (!cancelled) {
                    console.error(
                        "Unable to load ID card preview:",
                        error
                    );

                    setLoadError(
                        error.message ||
                        "Unable to load the ID card preview."
                    );

                    setSavedForm(null);
                    setFormFields([]);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadPreview();

        return () => {
            cancelled = true;
        };
    }, []);

    /* =====================================================
       RESPONSIVE CARD AREA
    ===================================================== */

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

        return () => {
            window.removeEventListener("resize", updateWidth);
        };
    }, []);

    /* =====================================================
       CLEAN UP TIMERS
    ===================================================== */

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) {
                window.clearTimeout(toastTimerRef.current);
            }

            if (redirectTimerRef.current) {
                window.clearTimeout(redirectTimerRef.current);
            }
        };
    }, []);

    /* =====================================================
       CARD DIMENSIONS AND RESPONSIVE ZOOM
    ===================================================== */

    const cardDimensions = useMemo(
        () => getCardDimensions(design),
        [design.orientation, design.cardSize]
    );

    const fitScale = useMemo(() => {
        if (!areaWidth) return zoom;

        const availableWidth = Math.max(160, areaWidth - 38);
        const responsiveScale =
            availableWidth / cardDimensions.width;

        return Math.min(zoom, responsiveScale);
    }, [areaWidth, cardDimensions.width, zoom]);

    const templateClass = String(
        design.template || "modern"
    )
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "");

    /* =====================================================
       FIELD SIDE AND LAYOUT
    ===================================================== */

    const activeFieldLayout =
        activeSide === "back"
            ? design.backFieldLayout || {}
            : design.frontFieldLayout || design.fieldLayout || {};

    const visibleFields = formFields.filter((field) => {
        if (Number(design.sides) !== 2) {
            return true;
        }

        return (
            (design.fieldSides?.[field.id] || "front") ===
            activeSide
        );
    });

    const photoField = visibleFields.find(isMediaField);

    const informationFields = visibleFields.filter(
        (field) => !isMediaField(field)
    );

    const studentNameField = informationFields.find(
        (field) =>
            normalizeValueKey(field.label).includes("name") ||
            normalizeValueKey(field.name).includes("name")
    );

    function getFieldValue(field) {
        return getValueForField(demoData, field);
    }

    function getDisplayValue(field) {
        const value = getFieldValue(field);

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "";
        }

        if (isDateField(field)) {
            return formatDate(String(value));
        }

        if (Array.isArray(value)) {
            return value.join(", ");
        }

        if (typeof value === "object") {
            return String(
                value.name ??
                value.label ??
                value.value ??
                ""
            );
        }

        return String(value);
    }

    function getFieldLayout(field, index) {
        const layout = activeFieldLayout?.[field.id];

        return {
            row: Number(layout?.row) || index + 1,
            column: Number(layout?.column) || 1,
            width: Number(layout?.width) || 1,
        };
    }

    /* =====================================================
       UI HELPERS
    ===================================================== */

    function showToast(message) {
        setToast(message);

        if (toastTimerRef.current) {
            window.clearTimeout(toastTimerRef.current);
        }

        toastTimerRef.current = window.setTimeout(() => {
            setToast("");
            toastTimerRef.current = null;
        }, 2600);
    }

    function changeZoom(amount) {
        setZoom((current) =>
            Math.min(
                1.8,
                Math.max(
                    0.5,
                    Number((current + amount).toFixed(1))
                )
            )
        );
    }

    function goDemo() {
        window.location.href = "/demo";
    }

    function changeSide(side) {
        if (
            side !== "front" &&
            side !== "back"
        ) {
            return;
        }

        if (side === "back" && Number(design.sides) !== 2) {
            return;
        }

        setActiveSide(side);
    }

    /* =====================================================
       SAVE TEMPLATE
       Note: templates still use localStorage until a
       template-saving backend endpoint is implemented.
    ===================================================== */

    function handleGenerate() {
        if (isSaving) return;

        setIsSaving(true);

        try {
            if (!savedForm?._id && !savedForm?.id) {
                showToast(
                    "A valid saved form is required before saving the template."
                );
                return;
            }

            if (!Array.isArray(savedForm.fields)) {
                showToast(
                    "The saved form has no fields. Please check Step 1."
                );
                return;
            }

            const savedDesign = readStorage(
                DESIGN_STORAGE_KEY
            );

            if (
                !savedDesign ||
                typeof savedDesign !== "object" ||
                Array.isArray(savedDesign)
            ) {
                showToast(
                    "Design not found. Please complete the Design step."
                );
                return;
            }

            const existingTemplates = readStorage(
                TEMPLATES_STORAGE_KEY,
                []
            );

            if (!Array.isArray(existingTemplates)) {
                showToast(
                    "Saved templates could not be read. Please try again."
                );
                return;
            }

            /*
             * MongoDB's _id is the stable identity of the form.
             * Do not use the form name as a unique identifier.
             */
            const formId = String(
                savedForm._id || savedForm.id
            );

            const existingIndex = existingTemplates.findIndex(
                (item) =>
                    String(item?.formId ?? "") === formId
            );

            const previous =
                existingIndex >= 0
                    ? existingTemplates[existingIndex]
                    : null;

            const now = new Date().toISOString();

            const currentDemoData = readStorage(
                DEMO_STORAGE_KEY,
                {}
            );

            const template = {
                id:
                    previous?.id ||
                    `template_${Date.now()}`,

                name:
                    savedForm.name ||
                    savedForm.title ||
                    "Untitled ID Card",

                formId,

                form: {
                    ...savedForm,
                    fields: savedForm.fields.map((field) => ({
                        ...field,
                    })),
                },

                design: mergeDesign(savedDesign),

                demoData:
                    currentDemoData &&
                    typeof currentDemoData === "object" &&
                    !Array.isArray(currentDemoData)
                        ? { ...currentDemoData }
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

            const saved = writeStorage(
                TEMPLATES_STORAGE_KEY,
                nextTemplates
            );

            if (!saved) {
                showToast(
                    "Unable to save template. Check browser storage space."
                );
                return;
            }

            showToast(
                previous
                    ? "Template updated successfully."
                    : "Template saved successfully."
            );

            redirectTimerRef.current = window.setTimeout(() => {
                window.location.href = "/templates";
            }, 900);
        } catch (error) {
            console.error(
                "Unable to save ID card template:",
                error
            );

            showToast(
                "Unable to save template. Please try again."
            );
        } finally {
            setIsSaving(false);
        }
    }

    /* =====================================================
       RENDER
    ===================================================== */

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
                            <h1 className="page-title">
                                Preview ID Card
                            </h1>

                            <p className="page-subtitle">
                                Review your card before saving it as a template.
                            </p>
                        </div>
                    </header>

                    <nav
                        className="steps"
                        aria-label="ID card creation steps"
                    >
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

                        <div
                            className="step active"
                            aria-current="step"
                        >
                            <span className="step-number">4</span>
                            <span>Preview</span>
                        </div>
                    </nav>

                    {isLoading ? (
                        <div className="form-card preview-empty">
                            <strong>Loading ID card preview...</strong>
                            <p>
                                Fetching your saved form from the server.
                            </p>
                        </div>
                    ) : loadError ? (
                        <div
                            className="form-card preview-empty"
                            role="alert"
                        >
                            <strong>Unable to load preview</strong>
                            <p>{loadError}</p>

                            <button
                                type="button"
                                className="ui-btn ui-btn--secondary"
                                onClick={() => {
                                    window.location.href = "/create-form";
                                }}
                            >
                                Return to Create Form
                            </button>
                        </div>
                    ) : (
                        <>
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
                                                        className={
                                                            activeSide === "front"
                                                                ? "active"
                                                                : ""
                                                        }
                                                        aria-pressed={
                                                            activeSide === "front"
                                                        }
                                                        onClick={() =>
                                                            changeSide("front")
                                                        }
                                                    >
                                                        Front
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={
                                                            activeSide === "back"
                                                                ? "active"
                                                                : ""
                                                        }
                                                        aria-pressed={
                                                            activeSide === "back"
                                                        }
                                                        onClick={() =>
                                                            changeSide("back")
                                                        }
                                                    >
                                                        Back
                                                    </button>
                                                </div>
                                            )}

                                            <div
                                                className="zoom-controls"
                                                aria-label="Zoom controls"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        changeZoom(-0.1)
                                                    }
                                                    disabled={zoom <= 0.5}
                                                    aria-label="Zoom out"
                                                    title="Zoom out"
                                                >
                                                    −
                                                </button>

                                                <span>
                                                    {Math.round(zoom * 100)}%
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        changeZoom(0.1)
                                                    }
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

                                    <div
                                        className="preview-card-area"
                                        ref={cardAreaRef}
                                    >
                                        <div
                                            className="preview-card-scale"
                                            style={{
                                                width:
                                                    cardDimensions.width *
                                                    fitScale,
                                                height:
                                                    cardDimensions.height *
                                                    fitScale,
                                            }}
                                        >
                                            <div
                                                className={[
                                                    "id-card-premium",
                                                    `template-${templateClass}`,
                                                    design.orientation,
                                                    design.cardSize === "compact"
                                                        ? "compact"
                                                        : "",
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ")}
                                                style={{
                                                    width: `${cardDimensions.width}px`,
                                                    height: `${cardDimensions.height}px`,
                                                    transform: `scale(${fitScale})`,
                                                    transformOrigin: "top left",
                                                    "--card-primary":
                                                        design.primaryColor ||
                                                        "#2563eb",
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
                                                                {design.organization?.text ||
                                                                    "ORGANIZATION"}
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
                                                            {photoField &&
                                                                design.photo?.visible !== false && (
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
                                                                        ? getDisplayValue(
                                                                            studentNameField
                                                                        ) || "Student Name"
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
                                                                {informationFields.map(
                                                                    (field, index) => {
                                                                        if (
                                                                            studentNameField?.id ===
                                                                            field.id
                                                                        ) {
                                                                            return null;
                                                                        }

                                                                        const layout =
                                                                            getFieldLayout(
                                                                                field,
                                                                                index
                                                                            );

                                                                        const otherFieldsInRow =
                                                                            informationFields.filter(
                                                                                (
                                                                                    other,
                                                                                    otherIndex
                                                                                ) => {
                                                                                    if (
                                                                                        studentNameField?.id ===
                                                                                        other.id
                                                                                    ) {
                                                                                        return false;
                                                                                    }

                                                                                    return (
                                                                                        getFieldLayout(
                                                                                            other,
                                                                                            otherIndex
                                                                                        ).row ===
                                                                                        layout.row
                                                                                    );
                                                                                }
                                                                            ).length;

                                                                        const fullWidth =
                                                                            layout.width === 2 ||
                                                                            otherFieldsInRow === 1;

                                                                        return (
                                                                            <div
                                                                                key={field.id}
                                                                                className="premium-info-item"
                                                                                style={{
                                                                                    gridColumn:
                                                                                        fullWidth
                                                                                            ? "1 / -1"
                                                                                            : layout.column,
                                                                                    gridRow:
                                                                                        layout.row,
                                                                                }}
                                                                            >
                                                                                <span className="premium-info-label">
                                                                                    {field.label}
                                                                                </span>

                                                                                <strong className="premium-info-value">
                                                                                    {getDisplayValue(
                                                                                        field
                                                                                    ) || "—"}
                                                                                </strong>
                                                                            </div>
                                                                        );
                                                                    }
                                                                )}
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
                                                                <span>
                                                                    CARD INFORMATION
                                                                </span>

                                                                <small>
                                                                    {design.organization?.text ||
                                                                        "ORGANIZATION"}
                                                                </small>
                                                            </div>

                                                            <div className="premium-back-information">
                                                                {informationFields.map(
                                                                    (field, index) => {
                                                                        const layout =
                                                                            getFieldLayout(
                                                                                field,
                                                                                index
                                                                            );

                                                                        return (
                                                                            <div
                                                                                key={field.id}
                                                                                className="premium-info-item"
                                                                                style={{
                                                                                    gridColumn:
                                                                                        layout.width === 2
                                                                                            ? "1 / -1"
                                                                                            : layout.column,
                                                                                    gridRow:
                                                                                        layout.row,
                                                                                }}
                                                                            >
                                                                                <span className="premium-info-label">
                                                                                    {field.label}
                                                                                </span>

                                                                                <strong className="premium-info-value">
                                                                                    {getDisplayValue(
                                                                                        field
                                                                                    ) || "—"}
                                                                                </strong>
                                                                            </div>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>

                                                            <p className="premium-back-note">
                                                                This card is issued by{" "}
                                                                <strong>
                                                                    {design.organization?.text ||
                                                                        "the organization"}
                                                                </strong>
                                                                . Please carry this card with you.
                                                            </p>

                                                            <div className="premium-security-area">
                                                                <div
                                                                    className="premium-barcode"
                                                                    aria-hidden="true"
                                                                >
                                                                    {Array.from(
                                                                        { length: 28 },
                                                                        (_, index) => (
                                                                            <span
                                                                                key={index}
                                                                                style={{
                                                                                    height:
                                                                                        index % 4 === 0
                                                                                            ? "18px"
                                                                                            : "12px",
                                                                                }}
                                                                            />
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <footer className="premium-card-footer">
                                                                <span>
                                                                    CARD INFORMATION
                                                                </span>
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
                                            <strong>
                                                {titleCase(design.template)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Orientation</span>
                                            <strong>
                                                {titleCase(design.orientation)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Card Size</span>
                                            <strong>
                                                {titleCase(design.cardSize)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Fields</span>
                                            <strong>
                                                {formFields.length}
                                            </strong>
                                        </div>

                                        {Number(design.sides) === 2 && (
                                            <div>
                                                <span>Current Side</span>
                                                <strong>
                                                    {titleCase(activeSide)}
                                                </strong>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <aside className="form-card preview-data-card">
                                    <header className="form-card-header preview-data-header">
                                        <div>
                                            <h2>Demo Data</h2>
                                            <p>
                                                Values currently used in the preview.
                                            </p>
                                        </div>

                                        <span className="preview-field-count">
                                            {formFields.length} fields
                                        </span>
                                    </header>

                                    <div className="preview-data-body">
                                        {formFields.length === 0 ? (
                                            <div className="preview-empty">
                                                <strong>
                                                    No form fields found
                                                </strong>
                                                <p>
                                                    Return to Create Form and add fields first.
                                                </p>
                                            </div>
                                        ) : (
                                            formFields.map((field) => {
                                                const value =
                                                    getFieldValue(field);

                                                return (
                                                    <div
                                                        className="preview-data-row"
                                                        key={field.id}
                                                    >
                                                        <div className="preview-data-label">
                                                            <span>
                                                                {field.label}
                                                            </span>

                                                            <small>
                                                                ID: {field.id}
                                                            </small>
                                                        </div>

                                                        <strong>
                                                            {isMediaField(field)
                                                                ? value
                                                                    ? "Photo uploaded"
                                                                    : "No photo"
                                                                : getDisplayValue(
                                                                    field
                                                                ) || "—"}
                                                        </strong>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    <div className="preview-ready">
                                        <span
                                            className="ready-icon"
                                            aria-hidden="true"
                                        >
                                            ✓
                                        </span>

                                        <div>
                                            <strong>
                                                Preview ready
                                            </strong>

                                            <p>
                                                Your MongoDB form, design, and demo data
                                                have been loaded. Check the card before
                                                saving the template.
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
                                    <ArrowLeft size={10} />
                                    Back
                                </button>

                                <button
                                    type="button"
                                    className="primary-btn"
                                    onClick={handleGenerate}
                                    disabled={isSaving || isLoading}
                                >
                                    {isSaving
                                        ? "Saving..."
                                        : "Save Template"}

                                    <ArrowRight size={10} />
                                </button>
                            </div>
                        </>
                    )}
                </section>
            </main>

            {toast && (
                <div
                    className="toast"
                    role="status"
                    aria-live="polite"
                >
                    {toast}
                </div>
            )}
        </div>
    );
}

export default IdCardPreview;
