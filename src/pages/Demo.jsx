
import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { ArrowRight } from "lucide-react";

const API_BASE_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const DESIGN_STORAGE_KEY = "idCardDesign";
const FORM_STORAGE_KEY = "idCardForm";
const FORM_ID_STORAGE_KEY = "idCardFormId";
const DEMO_STORAGE_KEY = "idCardDemoData";
const TOKEN_STORAGE_KEY = "idFoundryToken";

const DEFAULT_DESIGN = {
    template: "modern",
    primaryColor: "#2563eb",
    orientation: "portrait",
    background: "white",
    cardSize: "standard",
    zoom: 1,
    sides: 1,
    previewSide: "front",
    photo: { visible: true, position: "left", width: 74, height: 91 },
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
   SAFE STORAGE
========================================================= */

function readStorage(key, fallback = null) {
    try {
        const value = localStorage.getItem(key);
        return value == null ? fallback : JSON.parse(value);
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
   FIELD NORMALIZATION
========================================================= */

function normalizeField(field, index) {
    const id = String(
        field?.id ||
        field?._id ||
        field?.key ||
        field?.name ||
        `field_${index + 1}`
    );

    const label = String(
        field?.label ||
        field?.title ||
        field?.name ||
        `Field ${index + 1}`
    );

    let type = String(
        field?.type || field?.fieldType || "text"
    ).toLowerCase().trim();

    if (["image", "photo", "file"].includes(type)) {
        type = "media";
    }

    if (["longtext", "address"].includes(type)) {
        type = "textarea";
    }

    if (type === "dropdown") {
        type = "select";
    }

    const numericOption = (value) => {
        if (
            value === "" ||
            value == null ||
            !Number.isFinite(Number(value))
        ) {
            return null;
        }

        return Number(value);
    };

    const allowedTypes = Array.isArray(field?.allowedTypes)
        ? field.allowedTypes.map((item) =>
              String(item).toLowerCase().replace(/^\./, "")
          )
        : ["jpg", "jpeg", "png", "webp"];

    return {
        id,
        label,
        name: String(field?.name || field?.key || id),
        type,
        required: Boolean(field?.required),
        minLength: numericOption(field?.minLength),
        maxLength: numericOption(field?.maxLength),
        min: numericOption(field?.min),
        max: numericOption(field?.max),
        maxFileSize:
            numericOption(field?.maxFileSize) > 0
                ? numericOption(field?.maxFileSize)
                : 2,
        allowedTypes:
            allowedTypes.length > 0
                ? allowedTypes
                : ["jpg", "jpeg", "png", "webp"],
        defaultValue: field?.defaultValue ?? "",
        placeholder: field?.placeholder || "",
        hint: field?.hint || field?.description || "",
        options: Array.isArray(field?.options)
            ? field.options
            : [],
    };
}

/* =========================================================
   FIELD HELPERS
========================================================= */

function isMediaField(field) {
    return ["media", "image", "photo", "file"].includes(
        String(field?.type || "").toLowerCase()
    );
}

function isDateField(field) {
    const normalize = (value) =>
        String(value || "")
            .toLowerCase()
            .replace(/[\s_-]+/g, "");

    return [
        "date",
        "dob",
        "birthdate",
        "dateofbirth",
    ].includes(normalize(field?.type)) ||
        [
            "dob",
            "birthdate",
            "dateofbirth",
            "dateofbirth",
        ].includes(normalize(field?.name)) ||
        [
            "dob",
            "birthdate",
            "dateofbirth",
        ].includes(normalize(field?.label));
}

function isTextareaField(field) {
    return ["textarea", "longtext", "address"].includes(
        String(field?.type || "").toLowerCase()
    );
}

function isSelectField(field) {
    return ["select", "dropdown"].includes(
        String(field?.type || "").toLowerCase()
    );
}

function getAllowedImageTypes(field) {
    return (field.allowedTypes || []).map((item) =>
        String(item).toLowerCase().replace(/^\./, "")
    );
}

function getImageExtension(fileName = "") {
    const extension = fileName.split(".").pop().toLowerCase();
    return extension === "jpeg" ? "jpg" : extension;
}

function getOptionValue(option) {
    if (option && typeof option === "object") {
        return String(
            option.value ?? option.label ?? option.name ?? ""
        );
    }

    return String(option ?? "");
}

function getOptionLabel(option) {
    if (option && typeof option === "object") {
        return String(
            option.label ?? option.value ?? option.name ?? ""
        );
    }

    return String(option ?? "");
}

/* =========================================================
   DATE VALIDATION
========================================================= */

function isValidCalendarDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
        return false;
    }

    const [year, month, day] = String(value)
        .split("-")
        .map(Number);

    if (year < 1 || month < 1 || month > 12 || day < 1) {
        return false;
    }

    const daysInMonth = new Date(
        Date.UTC(year, month, 0)
    ).getUTCDate();

    return day <= daysInMonth;
}

function formatDate(value) {
    if (!isValidCalendarDate(value)) {
        return "—";
    }

    const [year, month, day] = String(value)
        .split("-")
        .map(Number);

    // Construct UTC explicitly to avoid timezone shifting the date.
    return new Date(Date.UTC(year, month - 1, day))
        .toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
        });
}

/* =========================================================
   INPUT HINTS
========================================================= */

function getFieldHint(field) {
    if (field.hint?.trim()) {
        return field.hint.trim();
    }

    const type = String(field.type).toLowerCase();
    const label = field.label.toLowerCase();

    if (isMediaField(field)) {
        return `Allowed formats: ${field.allowedTypes
            .join(", ")
            .toUpperCase()}. Maximum size: ${field.maxFileSize} MB.`;
    }

    if (isDateField(field)) {
        return "Choose a date from the date picker.";
    }

    if (type === "email" || label.includes("email")) {
        return "Enter a valid email address, such as name@example.com.";
    }

    if (
        ["phone", "tel"].includes(type) ||
        /phone|mobile|contact number|telephone/.test(label)
    ) {
        return "Enter a phone number containing 7–15 digits.";
    }

    if (type === "number") {
        const limits = [];

        if (field.min != null) {
            limits.push(`Minimum ${field.min} digits`);
        }

        if (field.max != null) {
            limits.push(`Maximum ${field.max} digits`);
        }

        return limits.length
            ? `${limits.join(" · ")}.`
            : "Enter digits only.";
    }

    if (
        ["text", "textarea", "longtext", "address"].includes(type)
    ) {
        const limits = [];

        if (field.minLength != null) {
            limits.push(`Minimum ${field.minLength} characters`);
        }

        if (field.maxLength != null) {
            limits.push(`Maximum ${field.maxLength} characters`);
        }

        if (limits.length) {
            return `${limits.join(" · ")}.`;
        }
    }

    if (isSelectField(field)) {
        return `Choose the appropriate ${label} from the list.`;
    }

    if (label.includes("name")) {
        return "Enter the full name as it should appear on the ID card.";
    }

    if (label.includes("roll")) {
        return "Enter the correct roll number.";
    }

    if (label.includes("address")) {
        return "Enter the complete address.";
    }

    if (label.includes("department")) {
        return "Enter the department or team name.";
    }

    if (label.includes("class") || label.includes("course")) {
        return "Enter the correct class or course.";
    }

    if (
        label.includes("organization") ||
        label.includes("school") ||
        label.includes("college") ||
        label.includes("company")
    ) {
        return "Enter the organization's name.";
    }

    return `Enter ${field.label.toLowerCase()}${
        field.required ? "." : " if applicable."
    }`;
}

/* =========================================================
   DEFAULT DEMO VALUES
========================================================= */

function getDefaultDemoValue(field, index) {
    if (isMediaField(field)) {
        return "";
    }

    if (field.defaultValue !== "" && field.defaultValue != null) {
        return String(field.defaultValue);
    }

    if (field.type === "number") {
        const sample = String(index + 1);
        const minDigits =
            field.min != null ? Math.max(1, field.min) : 1;
        const maxDigits =
            field.max != null ? Math.max(1, field.max) : null;

        let length = Math.max(sample.length, minDigits);

        if (maxDigits != null) {
            length = Math.min(length, maxDigits);
        }

        return sample.padStart(length, "0").slice(0, length);
    }

    const label = field.label.toLowerCase();

    if (label.includes("name")) return "Rahul Sharma";
    if (label.includes("roll")) return "102";
    if (label.includes("department")) return "Computer Science";

    if (label.includes("class") || label.includes("course")) {
        return "B.Sc. Computer Science";
    }

    if (
        label.includes("school") ||
        label.includes("college") ||
        label.includes("organization") ||
        label.includes("company")
    ) {
        return "ABC College";
    }

    if (field.type === "email") {
        return "student@example.com";
    }

    if (
        ["phone", "tel"].includes(field.type) ||
        /phone|mobile|contact number|telephone/.test(label)
    ) {
        return "9876543210";
    }

    if (isDateField(field)) {
        return "2003-05-12";
    }

    if (isSelectField(field)) {
        return field.options.length
            ? getOptionValue(field.options[0])
            : "";
    }

    let sample = `Sample ${field.label}`;

    if (field.maxLength != null && sample.length > field.maxLength) {
        sample = sample.slice(0, field.maxLength);
    }

    return sample;
}

/* =========================================================
   VALIDATION
========================================================= */

function validateField(field, rawValue) {
    const value =
        typeof rawValue === "string"
            ? rawValue.trim()
            : rawValue;

    const label = field.label || "This field";
    const type = String(field.type).toLowerCase();

    const isEmpty =
        value === "" ||
        value === null ||
        value === undefined;

    if (field.required && isEmpty) {
        return isMediaField(field)
            ? `${label} is required. Please upload an image.`
            : `${label} is required.`;
    }

    if (isEmpty) return "";

    if (
        ["text", "textarea", "longtext", "address"].includes(type)
    ) {
        const length = String(value).length;

        if (field.minLength != null && length < field.minLength) {
            return `${label} must contain at least ${field.minLength} characters.`;
        }

        if (field.maxLength != null && length > field.maxLength) {
            return `${label} cannot exceed ${field.maxLength} characters.`;
        }
    }

    if (type === "number") {
        const numberString = String(value);

        if (!/^\d+$/.test(numberString)) {
            return "Enter digits only.";
        }

        if (
            field.min != null &&
            numberString.length < field.min
        ) {
            return `${label} must contain at least ${field.min} digits.`;
        }

        if (
            field.max != null &&
            numberString.length > field.max
        ) {
            return `${label} cannot exceed ${field.max} digits.`;
        }
    }

    if (
        (type === "email" ||
            label.toLowerCase().includes("email")) &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))
    ) {
        return "Enter a valid email address.";
    }

    if (
        ["phone", "tel"].includes(type) ||
        /phone|mobile|contact number|telephone/.test(
            label.toLowerCase()
        )
    ) {
        const phone = String(value);
        const digits = phone.replace(/\D/g, "");

        if (
            !/^[+\d\s().-]+$/.test(phone) ||
            digits.length < 7 ||
            digits.length > 15
        ) {
            return "Enter a valid phone number containing 7–15 digits.";
        }
    }

    if (isDateField(field) && !isValidCalendarDate(value)) {
        return "Select a valid date.";
    }

    if (isSelectField(field)) {
        const options = field.options.map(getOptionValue);

        if (!options.includes(String(value))) {
            return `Select a valid ${label.toLowerCase()} option.`;
        }
    }

    if (isMediaField(field)) {
        if (
            typeof value !== "string" ||
            !/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(value)
        ) {
            return `Please upload a valid image for ${label}.`;
        }

        const mime = value.match(/^data:image\/([^;,]+)/i)?.[1]
            ?.toLowerCase();

        const extension =
            mime === "jpeg" ? "jpg" : mime;

        const allowed = getAllowedImageTypes(field);
        const allowedType =
            allowed.includes(extension) ||
            (extension === "jpg" && allowed.includes("jpeg"));

        if (!allowedType) {
            return `Allowed image types: ${field.allowedTypes.join(", ")}.`;
        }

        const base64 = value.split(",")[1] || "";
        const estimatedBytes = Math.floor(base64.length * 3 / 4);

        if (
            estimatedBytes >
            field.maxFileSize * 1024 * 1024
        ) {
            return `Image must be ${field.maxFileSize} MB or smaller.`;
        }
    }

    return "";
}

/* =========================================================
   DESIGN MERGING
========================================================= */

function mergeDesign(savedDesign) {
    if (!savedDesign || typeof savedDesign !== "object") {
        return { ...DEFAULT_DESIGN };
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
        fields: { ...(savedDesign.fields || {}) },
        fieldLayout: { ...(savedDesign.fieldLayout || {}) },
        frontFieldLayout: {
            ...(savedDesign.frontFieldLayout || {}),
        },
        backFieldLayout: {
            ...(savedDesign.backFieldLayout || {}),
        },
        fieldSides: { ...(savedDesign.fieldSides || {}) },
    };
}

/* =========================================================
   DEMO PAGE
========================================================= */

function Demo() {
    const [formFields, setFormFields] = useState([]);
    const [design, setDesign] = useState(DEFAULT_DESIGN);
    const [demoData, setDemoData] = useState({});
    const [activeSide, setActiveSide] = useState("front");
    const [toast, setToast] = useState("");
    const [toastVisible, setToastVisible] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [validationStarted, setValidationStarted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [formSource, setFormSource] = useState("local");

    const toastTimer = useRef(null);
    const mounted = useRef(false);

    /* =====================================================
       TOAST
    ===================================================== */

    const showToast = (message) => {
        setToast(message);
        setToastVisible(true);

        if (toastTimer.current) {
            clearTimeout(toastTimer.current);
        }

        toastTimer.current = setTimeout(() => {
            setToastVisible(false);
        }, 2800);
    };

    useEffect(() => {
        mounted.current = true;

        return () => {
            mounted.current = false;

            if (toastTimer.current) {
                clearTimeout(toastTimer.current);
            }
        };
    }, []);

    /* =====================================================
       LOAD FORM FROM API, THEN LOCAL FALLBACK
    ===================================================== */

    useEffect(() => {
        let cancelled = false;

        async function loadDemo() {
            setLoading(true);
            setLoadError("");

            const savedFormId = localStorage.getItem(
                FORM_ID_STORAGE_KEY
            );

            const token = localStorage.getItem(TOKEN_STORAGE_KEY);

            let loadedFields = [];
            let loadedFromApi = false;

            try {
                // Prefer the persisted MongoDB form whenever its ID
                // and authentication token are available.
                if (savedFormId && token) {
                    const response = await fetch(
                        `${API_BASE_URL}/api/id-card-forms/${encodeURIComponent(savedFormId)}`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${token}`,
                                Accept: "application/json",
                            },
                        }
                    );

                    let result = {};

                    try {
                        result = await response.json();
                    } catch {
                        result = {};
                    }

                    if (!response.ok) {
                        throw new Error(
                            result.message ||
                                result.error ||
                                (response.status === 401
                                    ? "Your session has expired. Please sign in again."
                                    : response.status === 403
                                      ? "You do not have permission to access this form."
                                      : `Unable to load the form (${response.status}).`)
                        );
                    }

                    // Support both { form: {...} } and a direct form object.
                    const apiForm = result.form || result.data || result;

                    if (Array.isArray(apiForm)) {
                        loadedFields = apiForm;
                    } else if (Array.isArray(apiForm?.fields)) {
                        loadedFields = apiForm.fields;
                    } else {
                        throw new Error(
                            "The saved form was found, but it does not contain a valid fields array."
                        );
                    }

                    loadedFromApi = true;

                    // Maintain compatibility with existing steps.
                    writeStorage(FORM_STORAGE_KEY, apiForm);
                } else {
                    // Local fallback for older forms or an unauthenticated
                    // local development workflow.
                    const savedForm = readStorage(
                        FORM_STORAGE_KEY,
                        null
                    );

                    if (Array.isArray(savedForm)) {
                        loadedFields = savedForm;
                    } else if (Array.isArray(savedForm?.fields)) {
                        loadedFields = savedForm.fields;
                    }
                }

                if (cancelled) return;

                const normalizedFields = loadedFields.map(
                    normalizeField
                );

                // If no API ID exists, allow older local-only forms.
                if (!normalizedFields.length) {
                    setFormFields([]);
                    setDemoData({});
                    setFormSource(loadedFromApi ? "api" : "local");
                    setLoadError(
                        "No form fields were found. Return to Step 1 and save your form before continuing."
                    );
                    return;
                }

                setFormFields(normalizedFields);
                setFormSource(loadedFromApi ? "api" : "local");

                const savedDemo = readStorage(
                    DEMO_STORAGE_KEY,
                    {}
                );

                const initialData = {};

                normalizedFields.forEach((field, index) => {
                    // Preserve data for matching fields. A missing value
                    // gets a fresh default for the newly added field.
                    initialData[field.id] =
                        savedDemo &&
                        Object.prototype.hasOwnProperty.call(
                            savedDemo,
                            field.id
                        )
                            ? savedDemo[field.id]
                            : getDefaultDemoValue(field, index);
                });

                setDemoData(initialData);

                const savedDesign = readStorage(
                    DESIGN_STORAGE_KEY,
                    null
                );

                const mergedDesign = mergeDesign(savedDesign);

                setDesign(mergedDesign);
                setActiveSide(
                    Number(mergedDesign.sides) === 2 &&
                    mergedDesign.previewSide === "back"
                        ? "back"
                        : "front"
                );
            } catch (error) {
                if (cancelled) return;

                console.error("Failed to load Demo form:", error);

                // If an API request failed, do not silently switch to
                // stale local fields: that could preview the wrong form.
                if (savedFormId && token) {
                    setFormFields([]);
                    setDemoData({});
                    setLoadError(
                        error.message ||
                            "Unable to load the form. Please try again."
                    );
                } else {
                    const savedForm = readStorage(
                        FORM_STORAGE_KEY,
                        null
                    );

                    const fields = Array.isArray(savedForm)
                        ? savedForm
                        : Array.isArray(savedForm?.fields)
                          ? savedForm.fields
                          : [];

                    const normalizedFields = fields.map(
                        normalizeField
                    );

                    setFormFields(normalizedFields);
                    setFormSource("local");

                    const savedDemo = readStorage(
                        DEMO_STORAGE_KEY,
                        {}
                    );

                    const initialData = {};

                    normalizedFields.forEach((field, index) => {
                        initialData[field.id] =
                            savedDemo?.[field.id] ??
                            getDefaultDemoValue(field, index);
                    });

                    setDemoData(initialData);
                    setLoadError(
                        normalizedFields.length
                            ? ""
                            : "No form fields found. Go back to Step 1 and create a form first."
                    );

                    setDesign(
                        mergeDesign(
                            readStorage(DESIGN_STORAGE_KEY, null)
                        )
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadDemo();

        return () => {
            cancelled = true;
        };
    }, []);

    /* =====================================================
       SAVE DEMO DATA
    ===================================================== */

    useEffect(() => {
        if (!loading && formFields.length > 0) {
            writeStorage(DEMO_STORAGE_KEY, demoData);
        }
    }, [demoData, loading, formFields.length]);

    /* =====================================================
       CARD DIMENSIONS
    ===================================================== */

    const cardDimensions = useMemo(() => {
        if (design.orientation === "landscape") {
            return {
                width: design.cardSize === "compact" ? 360 : 440,
                height: design.cardSize === "compact" ? 230 : 280,
            };
        }

        return {
            width: design.cardSize === "compact" ? 230 : 280,
            height: design.cardSize === "compact" ? 360 : 440,
        };
    }, [design.orientation, design.cardSize]);

    const templateClass = design.template || "modern";

    const activeFieldLayout =
        activeSide === "back"
            ? design.backFieldLayout || {}
            : design.frontFieldLayout || design.fieldLayout || {};

    const visibleFields = formFields.filter((field) => {
        if (Number(design.sides) === 1) return true;

        return (
            (design.fieldSides?.[field.id] || "front") === activeSide
        );
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

    /* =====================================================
       UPDATE FIELD
    ===================================================== */

    const updateDemoField = (fieldId, value) => {
        setDemoData((previous) => ({
            ...previous,
            [fieldId]: value,
        }));

        if (!validationStarted) return;

        const field = formFields.find(
            (item) => item.id === fieldId
        );

        if (!field) return;

        const error = validateField(field, value);

        setValidationErrors((previous) => {
            const updated = { ...previous };

            if (error) {
                updated[fieldId] = error;
            } else {
                delete updated[fieldId];
            }

            return updated;
        });
    };

    /* =====================================================
       VALIDATE FORM
    ===================================================== */

    const validateDemoData = () => {
        const errors = {};

        formFields.forEach((field) => {
            const error = validateField(
                field,
                demoData[field.id] ?? ""
            );

            if (error) {
                errors[field.id] = error;
            }
        });

        setValidationErrors(errors);

        return Object.keys(errors).length === 0;
    };

    /* =====================================================
       RESET
    ===================================================== */

    const handleReset = () => {
        const resetData = {};

        formFields.forEach((field, index) => {
            resetData[field.id] = getDefaultDemoValue(field, index);
        });

        setValidationStarted(false);
        setValidationErrors({});
        setDemoData(resetData);

        showToast("Demo data reset.");
    };

    /* =====================================================
       PHOTO UPLOAD
    ===================================================== */

    const handlePhotoUpload = (event, fieldId) => {
        const input = event.target;
        const file = input.files?.[0];

        if (!file) return;

        const field = formFields.find(
            (item) => item.id === fieldId
        );

        if (!field) {
            input.value = "";
            return;
        }

        const extension = getImageExtension(file.name);
        const allowedTypes = getAllowedImageTypes(field);

        const extensionAllowed =
            allowedTypes.includes(extension) ||
            (extension === "jpg" && allowedTypes.includes("jpeg"));

        const mimeAllowed = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ].includes(file.type.toLowerCase());

        if (!extensionAllowed || !mimeAllowed) {
            setValidationErrors((previous) => ({
                ...previous,
                [fieldId]: `Allowed image types: ${field.allowedTypes.join(", ")}.`,
            }));

            input.value = "";
            return;
        }

        if (file.size > field.maxFileSize * 1024 * 1024) {
            setValidationErrors((previous) => ({
                ...previous,
                [fieldId]: `Photo must be ${field.maxFileSize} MB or smaller.`,
            }));

            input.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result !== "string") {
                setValidationErrors((previous) => ({
                    ...previous,
                    [fieldId]: "Unable to read this image.",
                }));
                input.value = "";
                return;
            }

            updateDemoField(fieldId, reader.result);

            setValidationErrors((previous) => {
                const updated = { ...previous };
                delete updated[fieldId];
                return updated;
            });

            showToast("Photo uploaded.");
            input.value = "";
        };

        reader.onerror = () => {
            setValidationErrors((previous) => ({
                ...previous,
                [fieldId]:
                    "Unable to read this image. Please try another file.",
            }));

            input.value = "";
        };

        reader.readAsDataURL(file);
    };

    const removePhoto = (fieldId) => {
        updateDemoField(fieldId, "");
        showToast("Photo removed.");
    };

    /* =====================================================
       FIELD VALUES
    ===================================================== */

    const getFieldValue = (field) => demoData[field.id] ?? "";

    const getDisplayValue = (field) => {
        const value = getFieldValue(field);

        if (value === "" || value == null) {
            return "—";
        }

        if (isDateField(field)) {
            return formatDate(value);
        }

        return String(value);
    };

    /* =====================================================
       INPUT RENDERING
    ===================================================== */

    const renderFieldInput = (field) => {
        const value = getFieldValue(field);
        const error = validationErrors[field.id];
        const inputId = `demo-${field.id}`;

        if (isMediaField(field)) {
            if (value) {
                return (
                    <div className="demo-photo-preview">
                        <img
                            src={value}
                            alt={field.label || "Uploaded photo"}
                        />

                        <button
                            type="button"
                            onClick={() => removePhoto(field.id)}
                        >
                            Remove
                        </button>
                    </div>
                );
            }

            const acceptTypes = getAllowedImageTypes(field)
                .map((extension) =>
                    ["jpg", "jpeg"].includes(extension)
                        ? "image/jpeg"
                        : `image/${extension}`
                )
                .join(",");

            return (
                <label className="demo-upload">
                    <span className="upload-icon">+</span>
                    <span>Upload Photo</span>

                    <small>
                        {field.allowedTypes.join(", ").toUpperCase()}
                        {" · "}
                        Max {field.maxFileSize} MB
                    </small>

                    <input
                        id={inputId}
                        type="file"
                        accept={acceptTypes}
                        onChange={(event) =>
                            handlePhotoUpload(event, field.id)
                        }
                    />
                </label>
            );
        }

        if (isTextareaField(field)) {
            return (
                <textarea
                    id={inputId}
                    className="input demo-textarea"
                    value={value}
                    placeholder={
                        field.placeholder || `Enter ${field.label}`
                    }
                    rows={3}
                    minLength={field.minLength ?? undefined}
                    maxLength={field.maxLength ?? undefined}
                    aria-invalid={Boolean(error)}
                    aria-describedby={`hint-${field.id} error-${field.id}`}
                    onChange={(event) =>
                        updateDemoField(field.id, event.target.value)
                    }
                />
            );
        }

        if (isSelectField(field)) {
            return (
                <select
                    id={inputId}
                    className="input"
                    value={value}
                    aria-invalid={Boolean(error)}
                    aria-describedby={`hint-${field.id} error-${field.id}`}
                    onChange={(event) =>
                        updateDemoField(field.id, event.target.value)
                    }
                >
                    <option value="">Select {field.label}</option>

                    {field.options.map((option, index) => (
                        <option
                            key={`${field.id}-option-${index}`}
                            value={getOptionValue(option)}
                        >
                            {getOptionLabel(option)}
                        </option>
                    ))}
                </select>
            );
        }

        if (isDateField(field)) {
            return (
                <input
                    id={inputId}
                    type="date"
                    className="input"
                    value={isValidCalendarDate(value) ? value : ""}
                    aria-invalid={Boolean(error)}
                    aria-describedby={`hint-${field.id} error-${field.id}`}
                    onChange={(event) =>
                        updateDemoField(field.id, event.target.value)
                    }
                />
            );
        }

        if (field.type === "number") {
            return (
                <input
                    id={inputId}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="input"
                    value={value}
                    placeholder={
                        field.placeholder || `Enter ${field.label}`
                    }
                    maxLength={field.max ?? undefined}
                    aria-invalid={Boolean(error)}
                    aria-describedby={`hint-${field.id} error-${field.id}`}
                    onChange={(event) => {
                        updateDemoField(
                            field.id,
                            event.target.value.replace(/\D/g, "")
                        );
                    }}
                />
            );
        }

        const inputType =
            field.type === "email" ||
            field.label.toLowerCase().includes("email")
                ? "email"
                : ["phone", "tel"].includes(field.type)
                  ? "tel"
                  : "text";

        return (
            <input
                id={inputId}
                type={inputType}
                className="input"
                value={value}
                placeholder={
                    field.placeholder || `Enter ${field.label}`
                }
                minLength={
                    inputType === "text"
                        ? field.minLength ?? undefined
                        : undefined
                }
                maxLength={
                    inputType === "text"
                        ? field.maxLength ?? undefined
                        : undefined
                }
                aria-invalid={Boolean(error)}
                aria-describedby={`hint-${field.id} error-${field.id}`}
                onChange={(event) =>
                    updateDemoField(field.id, event.target.value)
                }
            />
        );
    };

    /* =====================================================
       NAVIGATION
    ===================================================== */

    const goDesign = () => {
        window.location.href = "/design";
    };

    const goPreview = () => {
        setValidationStarted(true);

        if (loading) {
            showToast("Please wait while the form loads.");
            return;
        }

        if (!formFields.length) {
            showToast("Create and save your form in Step 1 first.");
            return;
        }

        if (!validateDemoData()) {
            showToast("Please check the highlighted fields.");
            return;
        }

        const designSaved = writeStorage(
            DESIGN_STORAGE_KEY,
            design
        );

        const demoSaved = writeStorage(
            DEMO_STORAGE_KEY,
            demoData
        );

        if (!designSaved || !demoSaved) {
            showToast(
                "Unable to save demo data. Check browser storage space."
            );
            return;
        }

        showToast("Demo data saved.");

        setTimeout(() => {
            window.location.href = "/idcardpreview";
        }, 350);
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="app">
            <Sidebar activePage="demo" />

            <main className="main">
                <Topbar />

                <section className="content">
                    <div className="breadcrumb">
                        <button type="button" onClick={goDesign}>
                            Create ID Card
                        </button>
                        <span>›</span>
                        <span>Demo</span>
                    </div>

                    <h1 className="page-title">Demo ID Card</h1>

                    <p className="page-subtitle">
                        Enter sample information and see how your designed
                        ID card will look with real data.
                    </p>

                    <div className="steps">
                        <div className="step completed">
                            <div className="step-number">✓</div>
                            <div className="step-label">Create Form</div>
                        </div>

                        <div className="step-line" />

                        <div className="step completed">
                            <div className="step-number">✓</div>
                            <div className="step-label">Design</div>
                        </div>

                        <div className="step-line" />

                        <div className="step active">
                            <div className="step-number">3</div>
                            <div className="step-label">Demo</div>
                        </div>

                        <div className="step-line" />

                        <div className="step">
                            <div className="step-number">4</div>
                            <div className="step-label">Preview</div>
                        </div>
                    </div>

                    {loading && (
                        <div className="empty-demo" role="status">
                            <strong>Loading your form...</strong>
                            <span>
                                Fetching your saved fields and design.
                            </span>
                        </div>
                    )}

                    {!loading && loadError && (
                        <div className="empty-demo" role="alert">
                            <strong>Unable to load the form.</strong>
                            <span>{loadError}</span>

                            <button
                                type="button"
                                className="ui-btn ui-btn--secondary"
                                onClick={goDesign}
                            >
                                Back to Design
                            </button>
                        </div>
                    )}

                    {!loading && !loadError && (
                        <>
                            <div className="layout demo-layout">
                                <div>
                                    <div className="form-card demo-form-card">
                                        <div className="form-card-header">
                                            <div className="demo-card-title-row">
                                                <div>
                                                    <h2>
                                                        Student Information
                                                    </h2>
                                                    <p>
                                                        Enter sample student data
                                                        to test your ID card.
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="reset-demo"
                                                    onClick={handleReset}
                                                >
                                                    Reset
                                                </button>
                                            </div>
                                        </div>

                                        <div className="form-body">
                                            {formFields.length === 0 ? (
                                                <div className="empty-demo">
                                                    <strong>
                                                        No form fields found.
                                                    </strong>
                                                    <span>
                                                        Go back to Step 1 and
                                                        create fields first.
                                                    </span>
                                                </div>
                                            ) : (
                                                formFields.map((field) => (
                                                    <div
                                                        className={`field ${
                                                            validationErrors[field.id]
                                                                ? "has-error"
                                                                : ""
                                                        }`}
                                                        key={field.id}
                                                    >
                                                        <div className="field-label">
                                                            <label
                                                                htmlFor={`demo-${field.id}`}
                                                            >
                                                                {field.label}
                                                                {field.required && (
                                                                    <span className="required">
                                                                        *
                                                                    </span>
                                                                )}
                                                            </label>

                                                            <span className="field-hint">
                                                                {field.type}
                                                            </span>
                                                        </div>

                                                        <div className="input-wrap">
                                                            {renderFieldInput(field)}
                                                        </div>

                                                        <p
                                                            className="field-hint"
                                                            id={`hint-${field.id}`}
                                                        >
                                                            {getFieldHint(field)}
                                                        </p>

                                                        {validationErrors[field.id] && (
                                                            <p
                                                                className="error"
                                                                id={`error-${field.id}`}
                                                                role="alert"
                                                            >
                                                                {validationErrors[field.id]}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <div className="form-footer">
                                            <div className="footer-note">
                                                This information is only used
                                                to test the card design.
                                            </div>

                                            <div
                                                className="actions"
                                                style={{
                                                    marginTop: 0,
                                                    paddingTop: 0,
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    className="ui-btn ui-btn--secondary"
                                                    onClick={handleReset}
                                                >
                                                    Reset
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <aside className="demo-preview-card">
                                    <div className="demo-preview-header">
                                        <div>
                                            <h3>Live Preview</h3>
                                            <span>
                                                Your card updates automatically.
                                            </span>
                                        </div>

                                        {Number(design.sides) === 2 && (
                                            <div className="side-switch">
                                                <button
                                                    type="button"
                                                    className={
                                                        activeSide === "front"
                                                            ? "active"
                                                            : ""
                                                    }
                                                    onClick={() =>
                                                        setActiveSide("front")
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
                                                    onClick={() =>
                                                        setActiveSide("back")
                                                    }
                                                >
                                                    Back
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="demo-card-area">
                                        <div style={{ transform: "scale(0.7)" }}>
                                            <div
                                                className={[
                                                    "id-card-premium",
                                                    `template-${templateClass}`,
                                                    design.orientation || "portrait",
                                                    design.cardSize === "compact"
                                                        ? "compact"
                                                        : "",
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ")}
                                                style={{
                                                    width: `${cardDimensions.width}px`,
                                                    height: `${cardDimensions.height}px`,
                                                    "--card-primary":
                                                        design.primaryColor ||
                                                        "#2563eb",
                                                }}
                                            >
                                                {design.backgroundImage?.data &&
                                                    design.backgroundImage.visible !==
                                                        false && (
                                                        <img
                                                            src={design.backgroundImage.data}
                                                            alt=""
                                                            className="premium-background-image"
                                                            style={{
                                                                opacity:
                                                                    design.backgroundImage.opacity ??
                                                                    1,
                                                            }}
                                                        />
                                                    )}

                                                <div className="premium-card-header">
                                                    {design.logo?.visible !== false &&
                                                        (design.logo?.data ? (
                                                            <img
                                                                src={design.logo.data}
                                                                alt="Organization"
                                                                className="premium-card-logo"
                                                            />
                                                        ) : (
                                                            <div className="premium-card-logo-placeholder">
                                                                LOGO
                                                            </div>
                                                        ))}

                                                    {design.organization?.visible !==
                                                        false && (
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
                                                </div>

                                                {activeSide === "front" && (
                                                    <div className="premium-card-front">
                                                        <div
                                                            className={[
                                                                "premium-identity-area",
                                                                `photo-position-${
                                                                    design.photo?.position ||
                                                                    "left"
                                                                }`,
                                                            ].join(" ")}
                                                        >
                                                            {photoField &&
                                                                design.photo?.visible !==
                                                                    false && (
                                                                    <div
                                                                        className="premium-photo"
                                                                        style={{
                                                                            width: `${
                                                                                design.photo?.width ||
                                                                                74
                                                                            }px`,
                                                                            height: `${
                                                                                design.photo?.height ||
                                                                                91
                                                                            }px`,
                                                                        }}
                                                                    >
                                                                        {getFieldValue(
                                                                            photoField
                                                                        ) ? (
                                                                            <img
                                                                                src={getFieldValue(
                                                                                    photoField
                                                                                )}
                                                                                alt="Student"
                                                                                style={{
                                                                                    width: `${
                                                                                        design.photo?.width ||
                                                                                        74
                                                                                    }px`,
                                                                                    height: `${
                                                                                        design.photo?.height ||
                                                                                        91
                                                                                    }px`,
                                                                                }}
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
                                                                          )
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
                                                                            activeFieldLayout[
                                                                                field.id
                                                                            ] || {
                                                                                row: index + 1,
                                                                                column: 1,
                                                                                width: 1,
                                                                            };

                                                                        const fieldsInSameRow =
                                                                            informationFields.filter(
                                                                                (rowField) => {
                                                                                    if (
                                                                                        studentNameField?.id ===
                                                                                        rowField.id
                                                                                    ) {
                                                                                        return false;
                                                                                    }

                                                                                    const rowIndex =
                                                                                        informationFields.indexOf(
                                                                                            rowField
                                                                                        );

                                                                                    const rowLayout =
                                                                                        activeFieldLayout[
                                                                                            rowField.id
                                                                                        ] || {
                                                                                            row: rowIndex + 1,
                                                                                            column: 1,
                                                                                            width: 1,
                                                                                        };

                                                                                    return (
                                                                                        rowLayout.row ===
                                                                                        layout.row
                                                                                    );
                                                                                }
                                                                            ).length;

                                                                        return (
                                                                            <div
                                                                                key={field.id}
                                                                                className="premium-info-item"
                                                                                style={{
                                                                                    gridColumn:
                                                                                        layout.width === 2 ||
                                                                                        fieldsInSameRow === 1
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
                                                                                    )}
                                                                                </strong>
                                                                            </div>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="premium-card-footer">
                                                            <span>ID CARD</span>
                                                            <div className="premium-footer-line" />
                                                        </div>
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
                                                                            activeFieldLayout[
                                                                                field.id
                                                                            ] || {
                                                                                row: index + 1,
                                                                                column: 1,
                                                                                width: 1,
                                                                            };

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
                                                                                    )}
                                                                                </strong>
                                                                            </div>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>

                                                            <div className="premium-back-note">
                                                                This card is issued by{" "}
                                                                <strong>
                                                                    {design.organization?.text ||
                                                                        "the organization"}
                                                                </strong>
                                                                .
                                                                <br />
                                                                Please carry this card
                                                                with you.
                                                            </div>

                                                            <div className="premium-security-area">
                                                                <div className="premium-barcode">
                                                                    {Array.from({
                                                                        length: 28,
                                                                    }).map((_, index) => (
                                                                        <span
                                                                            key={index}
                                                                            style={{
                                                                                height:
                                                                                    index % 4 ===
                                                                                    0
                                                                                        ? "18px"
                                                                                        : "12px",
                                                                            }}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="premium-card-footer">
                                                                <span>
                                                                    CARD INFORMATION
                                                                </span>
                                                                <div className="premium-footer-line" />
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="demo-preview-info">
                                        <div>
                                            <span>Template</span>
                                            <strong>
                                                {(design.template || "modern")
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    (design.template || "modern").slice(
                                                        1
                                                    )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Orientation</span>
                                            <strong>
                                                {(design.orientation || "portrait")
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    (design.orientation || "portrait").slice(
                                                        1
                                                    )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Fields</span>
                                            <strong>{visibleFields.length}</strong>
                                        </div>
                                    </div>
                                </aside>
                            </div>

                            <div className="bottom-actions">
                                <button
                                    type="button"
                                    className="ui-btn ui-btn--secondary"
                                    onClick={goDesign}
                                >
                                    Back
                                </button>

                                <button
                                    type="button"
                                    className="ui-btn ui-btn--primary"
                                    onClick={goPreview}
                                    disabled={loading || !formFields.length}
                                >
                                    Continue
                                    <ArrowRight size={10} />
                                </button>
                            </div>
                        </>
                    )}
                </section>
            </main>

            <div
                className={`toast ${toastVisible ? "show" : ""}`}
                role="status"
                aria-live="polite"
            >
                {toast}
            </div>
        </div>
    );
}

export default Demo;
