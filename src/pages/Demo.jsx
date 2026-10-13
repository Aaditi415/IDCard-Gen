
import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { ArrowRight } from "lucide-react";

const DESIGN_STORAGE_KEY = "idCardDesign";
const FORM_STORAGE_KEY = "idCardForm";
const DEMO_STORAGE_KEY = "idCardDemoData";

/* =========================
   DEFAULT DESIGN
========================= */

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

/* =========================
   NORMALIZE FIELD
========================= */

function normalizeField(field, index) {
    const id =
        field?.id ||
        field?.key ||
        field?.name ||
        `field_${index + 1}`;

    const label =
        field?.label ||
        field?.title ||
        field?.name ||
        `Field ${index + 1}`;

    const type = String(
        field?.type || field?.fieldType || "text"
    ).toLowerCase();

    const configuredMinLength = field?.minLength;
    const configuredMaxLength = field?.maxLength;
    const configuredMin = field?.min;
    const configuredMax = field?.max;
    const configuredFileSize = field?.maxFileSize;

    return {
        id: String(id),
        label: String(label),
        name: String(field?.name || field?.key || id),
        type,

        required: Boolean(field?.required),

        minLength:
            configuredMinLength !== "" &&
            configuredMinLength != null &&
            Number.isFinite(Number(configuredMinLength))
                ? Number(configuredMinLength)
                : null,

        maxLength:
            configuredMaxLength !== "" &&
            configuredMaxLength != null &&
            Number.isFinite(Number(configuredMaxLength))
                ? Number(configuredMaxLength)
                : null,

        min:
            configuredMin !== "" &&
            configuredMin != null &&
            Number.isFinite(Number(configuredMin))
                ? Number(configuredMin)
                : null,

        max:
            configuredMax !== "" &&
            configuredMax != null &&
            Number.isFinite(Number(configuredMax))
                ? Number(configuredMax)
                : null,

        maxFileSize:
            configuredFileSize !== "" &&
            configuredFileSize != null &&
            Number.isFinite(Number(configuredFileSize)) &&
            Number(configuredFileSize) > 0
                ? Number(configuredFileSize)
                : 2,

        allowedTypes: Array.isArray(field?.allowedTypes)
            ? field.allowedTypes
            : ["jpg", "jpeg", "png", "webp"],

        defaultValue: field?.defaultValue ?? "",
        placeholder: field?.placeholder || "",
        hint: field?.hint || field?.description || "",

        options: Array.isArray(field?.options)
            ? field.options
            : [],
    };
}

/* =========================
   FIELD HELPERS
========================= */

function isMediaField(field) {
    return ["media", "image", "photo", "file"].includes(
        field.type
    );
}


function isDateField(field) {
    const type = String(field?.type || "")
        .toLowerCase()
        .replace(/[\s_-]+/g, "");

    return ["date", "dob", "birthdate", "dateofbirth"].includes(type);
}


function isTextareaField(field) {
    return ["textarea", "longtext", "address"].includes(
        field.type
    );
}

function getAllowedImageTypes(field) {
    return field.allowedTypes.map((item) =>
        String(item).toLowerCase().replace(/^\./, "")
    );
}

function getImageExtension(fileName) {
    const extension = fileName.split(".").pop().toLowerCase();
    return extension === "jpeg" ? "jpg" : extension;
}

/* =========================
   INPUT HINTS
========================= */

function getFieldHint(field) {
    if (field.hint?.trim()) {
        return field.hint.trim();
    }

    const type = field.type.toLowerCase();
    const label = field.label.toLowerCase();

    if (isMediaField(field)) {
        return `Allowed formats: ${field.allowedTypes
            .join(", ")
            .toUpperCase()}. Maximum size: ${field.maxFileSize} MB.`;
    }

    if (isDateField(field)) {
        return "Select a valid date using the date picker.";
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
            ? limits.join(" · ") + "."
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

    if (type === "select" || type === "dropdown") {
        return `Choose the appropriate ${field.label.toLowerCase()} from the list.`;
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

/* =========================
   DEFAULT DEMO VALUE
========================= */

function getDefaultDemoValue(field, index) {
    if (isMediaField(field)) {
        return "";
    }

    if (field.defaultValue !== "" && field.defaultValue != null) {
        return String(field.defaultValue);
    }

    // Number min/max represent digit length, not numeric value.
    // Handle this before label-based defaults such as roll number.
    if (field.type === "number") {
        const sample = String(index + 1);

        const minDigits =
            field.min != null ? Math.max(1, field.min) : 1;

        const maxDigits =
            field.max != null ? Math.max(1, field.max) : null;

        let digitLength = Math.max(sample.length, minDigits);

        if (maxDigits != null) {
            digitLength = Math.min(digitLength, maxDigits);
        }

        digitLength = Math.max(1, digitLength);

        return sample.padStart(digitLength, "0").slice(0, digitLength);
    }

    const label = field.label.toLowerCase();

    if (label.includes("name")) {
        return "Rahul Sharma";
    }

    if (label.includes("roll")) {
        return "102";
    }

    if (label.includes("department")) {
        return "Computer Science";
    }

    if (label.includes("class") || label.includes("course")) {
        return "B.Sc. Computer Science";
    }

    if (
        label.includes("school") ||
        label.includes("college") ||
        label.includes("organization")
    ) {
        return "ABC College";
    }

    if (field.type === "email") {
        return "student@example.com";
    }

    if (["phone", "tel"].includes(field.type)) {
        return "9876543210";
    }

    if (isDateField(field)) {
        return "2003-05-12";
    }

    if (field.type === "select" || field.type === "dropdown") {
        const firstOption = field.options[0];

        if (firstOption != null) {
            return String(
                typeof firstOption === "object"
                    ? firstOption.value ??
                          firstOption.label ??
                          firstOption.name ??
                          ""
                    : firstOption
            );
        }

        return "";
    }

    let sample = `Sample ${field.label}`;

    if (field.maxLength != null && sample.length > field.maxLength) {
        sample = sample.slice(0, field.maxLength);
    }

    return sample;
}

/* =========================
   VALIDATION
========================= */

function validateField(field, rawValue) {
    const value =
        typeof rawValue === "string"
            ? rawValue.trim()
            : rawValue;

    const label = field.label || "This field";
    const type = field.type.toLowerCase();

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
        const length = value.length;

        if (field.minLength != null && length < field.minLength) {
            return `${label} must contain at least ${field.minLength} characters.`;
        }

        if (field.maxLength != null && length > field.maxLength) {
            return `${label} cannot exceed ${field.maxLength} characters.`;
        }
    }

    // Number fields are validated by digit count.
    if (type === "number") {
        const numberString = String(value).trim();

        if (!/^\d+$/.test(numberString)) {
            return "Enter digits only.";
        }

        const digitLength = numberString.length;

        if (field.min != null && digitLength < field.min) {
            return `${label} must contain at least ${field.min} digits.`;
        }

        if (field.max != null && digitLength > field.max) {
            return `${label} cannot exceed ${field.max} digits.`;
        }
    }

    if (
        type === "email" &&
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


    if (isDateField(field)) {
        const dateValue = String(value);

        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            return "Select a valid date.";
        }

        const [year, month, day] = dateValue.split("-").map(Number);

        const date = new Date(Date.UTC(year, month - 1, day));

        if (
            date.getUTCFullYear() !== year ||
            date.getUTCMonth() !== month - 1 ||
            date.getUTCDate() !== day
        ) {
            return "Select a valid date.";
        }
    }

    if (type === "select" || type === "dropdown") {
        const allowedOptions = field.options.map((option) =>
            String(
                typeof option === "object"
                    ? option.value ?? option.label ?? option.name ?? ""
                    : option
            )
        );

        if (!allowedOptions.includes(String(value))) {
            return `Select a valid ${label.toLowerCase()} option.`;
        }
    }

    if (isMediaField(field)) {
        if (
            typeof value !== "string" ||
            !value.startsWith("data:image/")
        ) {
            return `Please upload a valid image for ${label}.`;
        }

        const mime = value
            .match(/^data:image\/([^;,]+)/i)?.[1]
            ?.toLowerCase();

        const extensionByMime = {
            jpeg: "jpg",
            jpg: "jpg",
            png: "png",
            webp: "webp",
        };

        const extension = extensionByMime[mime];
        const allowed = getAllowedImageTypes(field);

        const typeAllowed =
            extension &&
            allowed.some(
                (item) =>
                    item === extension ||
                    (extension === "jpg" && item === "jpeg")
            );

        if (!typeAllowed) {
            return `Allowed image types: ${field.allowedTypes.join(", ")}.`;
        }

        const base64 = value.split(",")[1] || "";
        const estimatedBytes = Math.floor(base64.length * 3 / 4);
        const maxBytes = field.maxFileSize * 1024 * 1024;

        if (estimatedBytes > maxBytes) {
            return `Image must be ${field.maxFileSize} MB or smaller.`;
        }
    }

    return "";
}

/* =========================
   DEMO
========================= */

function Demo() {
    const [formFields, setFormFields] = useState([]);
    const [design, setDesign] = useState(DEFAULT_DESIGN);
    const [demoData, setDemoData] = useState({});
    const [activeSide, setActiveSide] = useState("front");
    const [toast, setToast] = useState("");
    const [toastVisible, setToastVisible] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [validationStarted, setValidationStarted] = useState(false);

    /* =========================
       TOAST
    ========================== */

    const showToast = (message) => {
        setToast(message);
        setToastVisible(true);

        setTimeout(() => {
            setToastVisible(false);
        }, 2500);
    };

    /* =========================
       LOAD FORM + DESIGN
    ========================== */

    useEffect(() => {
        try {
            const savedForm = JSON.parse(
                localStorage.getItem(FORM_STORAGE_KEY)
            );

            let fields = [];

            if (Array.isArray(savedForm)) {
                fields = savedForm;
            } else if (Array.isArray(savedForm?.fields)) {
                fields = savedForm.fields;
            }

            const normalizedFields = fields.map((field, index) =>
                normalizeField(field, index)
            );

            setFormFields(normalizedFields);

            let savedDemo = {};

            try {
                const storedDemo = JSON.parse(
                    localStorage.getItem(DEMO_STORAGE_KEY)
                );

                if (
                    storedDemo &&
                    typeof storedDemo === "object" &&
                    !Array.isArray(storedDemo)
                ) {
                    savedDemo = storedDemo;
                }
            } catch (error) {
                console.error("Failed to load demo data:", error);
            }

            const initialData = {};

            normalizedFields.forEach((field, index) => {
                initialData[field.id] =
                    savedDemo[field.id] ??
                    getDefaultDemoValue(field, index);
            });

            setDemoData(initialData);
        } catch (error) {
            console.error("Failed to load form:", error);
        }

        try {
            const savedDesign = JSON.parse(
                localStorage.getItem(DESIGN_STORAGE_KEY)
            );

            if (savedDesign) {
                const mergedDesign = {
                    ...DEFAULT_DESIGN,
                    ...savedDesign,

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

                    photo: {
                        ...DEFAULT_DESIGN.photo,
                        ...(savedDesign.photo || {}),
                    },

                    frontFieldLayout: {
                        ...(savedDesign.frontFieldLayout || {}),
                    },

                    backFieldLayout: {
                        ...(savedDesign.backFieldLayout || {}),
                    },

                    fieldLayout: {
                        ...(savedDesign.fieldLayout || {}),
                    },

                    fieldSides: {
                        ...(savedDesign.fieldSides || {}),
                    },
                };

                setDesign(mergedDesign);

                setActiveSide(
                    mergedDesign.sides === 2 &&
                    mergedDesign.previewSide === "back"
                        ? "back"
                        : "front"
                );
            }
        } catch (error) {
            console.error("Failed to load design:", error);
        }
    }, []);

    /* =========================
       SAVE DEMO DATA
    ========================== */

    useEffect(() => {
        if (Object.keys(demoData).length) {
            localStorage.setItem(
                DEMO_STORAGE_KEY,
                JSON.stringify(demoData)
            );
        }
    }, [demoData]);

    /* =========================
       CARD DIMENSIONS
    ========================== */

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
        if (design.sides === 1) return true;

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

    /* =========================
       UPDATE FIELD
    ========================== */

    const updateDemoField = (fieldId, value) => {
        setDemoData((previous) => ({
            ...previous,
            [fieldId]: value,
        }));

        if (!validationStarted) return;

        const field = formFields.find((item) => item.id === fieldId);

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

    /* =========================
       VALIDATE FORM
    ========================== */

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

    /* =========================
       RESET
    ========================== */

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

    /* =========================
       PHOTO UPLOAD
    ========================== */

    const handlePhotoUpload = (event, fieldId) => {
        const input = event.target;
        const file = input.files?.[0];

        if (!file) return;

        const field = formFields.find((item) => item.id === fieldId);

        if (!field) {
            input.value = "";
            return;
        }

        const extension = getImageExtension(file.name);
        const allowedTypes = getAllowedImageTypes(field);

        const typeAllowed =
            allowedTypes.includes(extension) ||
            (extension === "jpg" && allowedTypes.includes("jpeg"));

        if (!typeAllowed) {
            setValidationErrors((previous) => ({
                ...previous,
                [fieldId]: `Allowed image types: ${field.allowedTypes.join(", ")}.`,
            }));

            input.value = "";
            return;
        }

        if (!file.type.startsWith("image/")) {
            setValidationErrors((previous) => ({
                ...previous,
                [fieldId]: "Please select a valid image file.",
            }));

            input.value = "";
            return;
        }

        const maxBytes = field.maxFileSize * 1024 * 1024;

        if (file.size > maxBytes) {
            setValidationErrors((previous) => ({
                ...previous,
                [fieldId]: `Photo must be ${field.maxFileSize} MB or smaller.`,
            }));

            input.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            updateDemoField(fieldId, reader.result);
            showToast("Photo uploaded.");
            input.value = "";
        };

        reader.onerror = () => {
            setValidationErrors((previous) => ({
                ...previous,
                [fieldId]: "Unable to read this image. Please try another file.",
            }));

            input.value = "";
        };

        reader.readAsDataURL(file);
    };

    /* =========================
       REMOVE PHOTO
    ========================== */

    const removePhoto = (fieldId) => {
        updateDemoField(fieldId, "");
        showToast("Photo removed.");
    };

    /* =========================
       GET VALUE
    ========================== */

    const getFieldValue = (field) => {
        return demoData[field.id] ?? "";
    };

    /* =========================
       DISPLAY VALUE
    ========================== */

    
    const getDisplayValue = (field) => {
        const value = getFieldValue(field);

        if (!value) return "—";

        if (isDateField(field)) {
            const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(
                String(value)
            );

            if (match) {
                const [, year, month, day] = match;

                const date = new Date(
                    Date.UTC(
                        Number(year),
                        Number(month) - 1,
                        Number(day)
                    )
                );

                if (
                    date.getUTCFullYear() === Number(year) &&
                    date.getUTCMonth() === Number(month) - 1 &&
                    date.getUTCDate() === Number(day)
                ) {
                    return date.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        timeZone: "UTC",
                    });
                }
            }

            return "—";
        }

        return value;
    };


    /* =========================
       INPUT
    ========================== */

    const renderFieldInput = (field) => {
        const value = getFieldValue(field);
        const error = validationErrors[field.id];

        /* PHOTO */

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
                .map((extension) => {
                    if (["jpg", "jpeg"].includes(extension)) {
                        return "image/jpeg";
                    }

                    return `image/${extension}`;
                })
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
                        type="file"
                        accept={acceptTypes}
                        onChange={(event) =>
                            handlePhotoUpload(event, field.id)
                        }
                    />
                </label>
            );
        }

        /* TEXTAREA */

        if (isTextareaField(field)) {
            return (
                <textarea
                    className="input demo-textarea"
                    value={value}
                    placeholder={field.placeholder || `Enter ${field.label}`}
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

        /* SELECT */

        if (field.type === "select" || field.type === "dropdown") {
            return (
                <select
                    className="input"
                    value={value}
                    aria-invalid={Boolean(error)}
                    aria-describedby={`hint-${field.id} error-${field.id}`}
                    onChange={(event) =>
                        updateDemoField(field.id, event.target.value)
                    }
                >
                    <option value="">Select {field.label}</option>

                    {field.options.map((option, index) => {
                        const optionValue =
                            typeof option === "object"
                                ? option.value ?? option.label ?? option.name ?? ""
                                : option;

                        const optionLabel =
                            typeof option === "object"
                                ? option.label ?? option.value ?? option.name ?? ""
                                : option;

                        return (
                            <option key={index} value={optionValue}>
                                {optionLabel}
                            </option>
                        );
                    })}
                </select>
            );
        }

        /* DATE */

        if (isDateField(field)) {
            return (
                <input
                    type="date"
                    className="input"
                    value={value}
                    aria-invalid={Boolean(error)}
                    aria-describedby={`hint-${field.id} error-${field.id}`}
                    onChange={(event) =>
                        updateDemoField(field.id, event.target.value)
                    }
                />
            );
        }

        /* NUMBER — MIN/MAX MEAN DIGIT LENGTH */

        if (field.type === "number") {
            return (
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="input"
                    value={value}
                    placeholder={field.placeholder || `Enter ${field.label}`}
                    maxLength={field.max ?? undefined}
                    aria-invalid={Boolean(error)}
                    aria-describedby={`hint-${field.id} error-${field.id}`}
                    onChange={(event) => {
                        const digits = event.target.value.replace(/\D/g, "");
                        updateDemoField(field.id, digits);
                    }}
                />
            );
        }

        /* DEFAULT INPUT */

        const inputType =
            field.type === "email"
                ? "email"
                : ["phone", "tel"].includes(field.type)
                  ? "tel"
                  : "text";

        return (
            <input
                type={inputType}
                className="input"
                value={value}
                placeholder={field.placeholder || `Enter ${field.label}`}
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

    /* =========================
       NAVIGATION
    ========================== */

    const goDesign = () => {
        window.location.href = "/design";
    };

    const goPreview = () => {
        setValidationStarted(true);

        if (!validateDemoData()) {
            showToast("Please check the highlighted fields.");
            return;
        }

        localStorage.setItem(
            DESIGN_STORAGE_KEY,
            JSON.stringify(design)
        );

        localStorage.setItem(
            DEMO_STORAGE_KEY,
            JSON.stringify(demoData)
        );

        showToast("Demo data saved.");

        setTimeout(() => {
            window.location.href = "/idcardpreview";
        }, 350);
    };

    /* =========================
       RENDER
    ========================== */

    return (
        <div className="app">
            <Sidebar activePage="demo" />

            <main className="main">
                <Topbar />

                <section className="content">
                    <div className="breadcrumb">
                        <button onClick={goDesign}>Create ID Card</button>
                        <span>›</span>
                        <span>Demo</span>
                    </div>

                    <h1 className="page-title">Demo ID Card</h1>

                    <p className="page-subtitle">
                        Enter sample information and see how your designed
                        ID card will look with real data.
                    </p>

                    {/* STEPS */}

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

                    {/* MAIN LAYOUT */}

                    <div className="layout demo-layout">
                        {/* DATA FORM */}

                        <div>
                            <div className="form-card demo-form-card">
                                <div className="form-card-header">
                                    <div className="demo-card-title-row">
                                        <div>
                                            <h2>Student Information</h2>
                                            <p>
                                                Enter sample student data to
                                                test your ID card.
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
                                            <strong>No form fields found.</strong>
                                            <span>
                                                Go back to Step 1 and create
                                                fields first.
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
                                                    <label htmlFor={`demo-${field.id}`}>
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
                                        This information is only used to test
                                        the card design.
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

                        {/* CARD PREVIEW */}

                        <aside className="demo-preview-card">
                            <div className="demo-preview-header">
                                <div>
                                    <h3>Live Preview</h3>
                                    <span>
                                        Your card updates automatically.
                                    </span>
                                </div>

                                {design.sides === 2 && (
                                    <div className="side-switch">
                                        <button
                                            type="button"
                                            className={
                                                activeSide === "front"
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={() => setActiveSide("front")}
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
                                            onClick={() => setActiveSide("back")}
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
                                            design.orientation,
                                            design.cardSize === "compact" ? "compact" : "",
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                        style={{
                                            width: `${cardDimensions.width}px`,
                                            height: `${cardDimensions.height}px`,
                                            "--card-primary":
                                                design.primaryColor || "#2563eb",
                                        }}
                                    >
                                        {/* BACKGROUND IMAGE */}

                                        {design.backgroundImage?.data &&
                                            design.backgroundImage.visible !==
                                                false && (
                                                <img
                                                    src={design.backgroundImage.data}
                                                    alt=""
                                                    className="premium-background-image"
                                                    style={{
                                                        opacity:
                                                            design.backgroundImage
                                                                .opacity ?? 1,
                                                    }}
                                                />
                                            )}

                                        {/* HEADER */}

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

                                        {/* FRONT */}

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
                                                                        design.photo
                                                                            ?.width || 74
                                                                    }px`,
                                                                    height: `${
                                                                        design.photo
                                                                            ?.height || 91
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
                                                                                design.photo
                                                                                    ?.width ||
                                                                                74
                                                                            }px`,
                                                                            height: `${
                                                                                design.photo
                                                                                    ?.height ||
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
                                                                const layout =
                                                                    activeFieldLayout[
                                                                        field.id
                                                                    ] || {
                                                                        row: index + 1,
                                                                        column: 1,
                                                                        width: 1,
                                                                    };

                                                                if (
                                                                    studentNameField?.id ===
                                                                    field.id
                                                                ) {
                                                                    return null;
                                                                }

                                                                const fieldsInSameRow =
                                                                    informationFields.filter(
                                                                        (rowField) => {
                                                                            if (
                                                                                studentNameField?.id ===
                                                                                rowField.id
                                                                            ) {
                                                                                return false;
                                                                            }

                                                                            const rowLayout =
                                                                                activeFieldLayout[
                                                                                    rowField.id
                                                                                ] || {
                                                                                    row:
                                                                                        informationFields.indexOf(
                                                                                            rowField
                                                                                        ) + 1,
                                                                                    column: 1,
                                                                                    width: 1,
                                                                                };

                                                                            return (
                                                                                rowLayout.row ===
                                                                                layout.row
                                                                            );
                                                                        }
                                                                    ).length;

                                                                const isSingleFieldRow =
                                                                    fieldsInSameRow === 1;

                                                                return (
                                                                    <div
                                                                        key={field.id}
                                                                        className="premium-info-item"
                                                                        style={{
                                                                            gridColumn:
                                                                                layout.width ===
                                                                                    2 ||
                                                                                isSingleFieldRow
                                                                                    ? "1 / -1"
                                                                                    : layout.column,
                                                                            gridRow: layout.row,
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

                                        {/* BACK */}

                                        {activeSide === "back" &&
                                            design.sides === 2 && (
                                                <div className="premium-card-back">
                                                    <div className="premium-back-title">
                                                        <span>CARD INFORMATION</span>

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
                                                                                layout.width ===
                                                                                2
                                                                                    ? "1 / -1"
                                                                                    : layout.column,
                                                                            gridRow: layout.row,
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
                                                        <span>CARD INFORMATION</span>
                                                        <div className="premium-footer-line" />
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>

                            {/* PREVIEW DETAILS */}

                            <div className="demo-preview-info">
                                <div>
                                    <span>Template</span>
                                    <strong>
                                        {(design.template || "modern")
                                            .charAt(0)
                                            .toUpperCase() +
                                            (design.template || "modern").slice(1)}
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

                    {/* FOOTER */}

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
                        >
                            Continue
                            <ArrowRight size={10} />
                        </button>
                    </div>
                </section>
            </main>

            {/* TOAST */}

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
