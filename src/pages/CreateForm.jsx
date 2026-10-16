import { useState } from "react";


import Sidebar from "../components/Sidebar";

import Topbar from "../components/Topbar";

import { ArrowLeft, ArrowRight } from "lucide-react";


const DEFAULT_FORM_NAME = "Student ID Card Form";

const FORM_NAME_MAX_LENGTH = 80;


const FIELD_TYPES = [

    { type: "text", icon: "Aa", title: "Text", description: "Name, address, etc." },

    { type: "number", icon: "#", title: "Number", description: "Roll number, age, etc." },

    { type: "email", icon: "@", title: "Email", description: "Email address" },

    { type: "phone", icon: "☎", title: "Phone", description: "Phone number" },

    { type: "date", icon: "◷", title: "Date", description: "Date of birth, etc." },

    { type: "media", icon: "▧", title: "Media / Photo", description: "Student photo" },

    { type: "textarea", icon: "☰", title: "Textarea", description: "Long text" },

    { type: "select", icon: "▾", title: "Select", description: "Choose an option" }

];


const FIELD_DEFAULTS = {

    text: {

        label: "Text",

        name: "text",

        placeholder: "Enter text",

        required: false,

        minLength: "",

        maxLength: ""

    },

    number: {

        label: "Number",

        name: "number",

        placeholder: "Enter number",

        required: false,

        min: "",

        max: ""

    },

    email: {

        label: "Email",

        name: "email",

        placeholder: "Enter email",

        required: false

    },

    phone: {

        label: "Phone",

        name: "phone",

        placeholder: "Enter phone number",

        required: false

    },

    date: {

        label: "Date",

        name: "date",

        placeholder: "",

        required: false

    },

    media: {

        label: "Photo",

        name: "photo",

        placeholder: "",

        required: false,

        maxFileSize: 2,

        allowedTypes: ["jpg", "jpeg", "png", "webp"]

    },

    textarea: {

        label: "Description",

        name: "description",

        placeholder: "Enter text",

        required: false,

        minLength: "",

        maxLength: ""

    },

    select: {

        label: "Select",

        name: "select",

        placeholder: "Choose an option",

        required: false,

        options: ["Option 1", "Option 2"]

    }

};


const createFieldId = () =>

    `field_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;


const getDefaultField = (type) => ({

    id: createFieldId(),

    type,

    ...FIELD_DEFAULTS[type],

    ...(FIELD_DEFAULTS[type].options

        ? { options: [...FIELD_DEFAULTS[type].options] }

        : {}),

    ...(FIELD_DEFAULTS[type].allowedTypes

        ? { allowedTypes: [...FIELD_DEFAULTS[type].allowedTypes] }

        : {})

});

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";


function CreateForm() {

    const [fields, setFields] = useState([]);

    const [selectedFieldId, setSelectedFieldId] = useState(null);


    // Keep library dragging separate from field reordering.

    const [draggedFieldType, setDraggedFieldType] = useState(null);

    const [draggedFieldIndex, setDraggedFieldIndex] = useState(null);

    const [dragOverIndex, setDragOverIndex] = useState(null);


    const [formName, setFormName] = useState(DEFAULT_FORM_NAME);

    const [formNameError, setFormNameError] = useState("");

    const [fieldErrors, setFieldErrors] = useState({});


    const [toast, setToast] = useState("");

    const [toastVisible, setToastVisible] = useState(false);


    const [isSaving, setIsSaving] = useState(false);


    // This screen starts a NEW form each time it is opened.
    // Existing forms are preserved in the idCardForms array when saving.

    const showToast = (message) => {

        setToast(message);

        setToastVisible(true);


        window.setTimeout(() => {

            setToastVisible(false);

        }, 2500);

    };


    const updateField = (id, property, value) => {

        setFields((current) =>

            current.map((field) =>

                field.id === id ? { ...field, [property]: value } : field

            )

        );


        setFieldErrors((current) => {

            if (!current[id]) return current;


            const next = { ...current };

            delete next[id];

            return next;

        });

    };


    const addField = (type) => {

        if (!FIELD_DEFAULTS[type]) return;


        const newField = getDefaultField(type);


        setFields((current) => [...current, newField]);

        setSelectedFieldId(newField.id);

        setFieldErrors((current) => ({

            ...current,

            [newField.id]: {}

        }));


        showToast(`${newField.label} field added.`);

    };


    const deleteField = (id) => {

        setFields((current) => current.filter((field) => field.id !== id));


        setFieldErrors((current) => {

            const next = { ...current };

            delete next[id];

            return next;

        });


        if (selectedFieldId === id) {

            setSelectedFieldId(null);

        }


        showToast("Field removed.");

    };


    const handleFieldDragStart = (index, event) => {

        setDraggedFieldIndex(index);

        setDraggedFieldType(null);


        if (event.dataTransfer) {

            event.dataTransfer.effectAllowed = "move";

            event.dataTransfer.setData("text/plain", String(index));

        }

    };


    const handleLibraryDragStart = (type, event) => {

        setDraggedFieldType(type);

        setDraggedFieldIndex(null);


        if (event.dataTransfer) {

            event.dataTransfer.effectAllowed = "copy";

            event.dataTransfer.setData("text/plain", type);

        }

    };


    const handleDropOnField = (event, dropIndex) => {

        event.preventDefault();

        event.stopPropagation();


        if (draggedFieldIndex === null) {

            setDragOverIndex(null);

            return;

        }


        const sourceIndex = draggedFieldIndex;


        setFields((current) => {

            if (

                sourceIndex < 0 ||

                sourceIndex >= current.length ||

                dropIndex < 0 ||

                dropIndex >= current.length ||

                sourceIndex === dropIndex

            ) {

                return current;

            }


            const next = [...current];

            const [moved] = next.splice(sourceIndex, 1);

            next.splice(dropIndex, 0, moved);


            return next;

        });


        setDraggedFieldIndex(null);

        setDraggedFieldType(null);

        setDragOverIndex(null);

    };


    const handleDropOnForm = (event) => {

        event.preventDefault();


        if (draggedFieldType && FIELD_DEFAULTS[draggedFieldType]) {

            addField(draggedFieldType);

        }


        setDraggedFieldType(null);

        setDraggedFieldIndex(null);

        setDragOverIndex(null);

    };


    const clearDragState = () => {

        setDraggedFieldType(null);

        setDraggedFieldIndex(null);

        setDragOverIndex(null);

    };


    // Validate the form name.

    const validateFormName = () => {

        const trimmed = formName.trim();


        if (!trimmed) {

            return "Please enter a form name.";

        }


        if (trimmed.length > FORM_NAME_MAX_LENGTH) {

            return `Form name cannot exceed ${FORM_NAME_MAX_LENGTH} characters.`;

        }


        if (/[\u0000-\u001F\u007F]/.test(trimmed)) {

            return "Form name contains invalid characters.";

        }


        return "";

    };


    // Validate all fields and return errors grouped by field ID.

    const validateFields = () => {

        const errors = {};

        const usedNames = new Map();


        fields.forEach((field) => {

            const fieldError = {};

            const label = String(field.label ?? "").trim();

            const name = String(field.name ?? "").trim();


            if (!label) {

                fieldError.label = "Field label is required.";

            } else if (label.length > 100) {

                fieldError.label = "Label cannot exceed 100 characters.";

            }


            if (!name) {

                fieldError.name = "Field name is required.";

            } else if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(name)) {

                fieldError.name =

                    "Use letters, numbers, underscores or hyphens. Start with a letter.";

            } else {

                const normalized = name.toLowerCase();


                if (usedNames.has(normalized)) {

                    fieldError.name =

                        `This name duplicates "${usedNames.get(normalized)}".`;

                } else {

                    usedNames.set(normalized, name);

                }

            }


            if (

                ["text", "textarea"].includes(field.type)

            ) {

                const min = field.minLength === "" ? null : Number(field.minLength);

                const max = field.maxLength === "" ? null : Number(field.maxLength);


                if (min !== null && (!Number.isInteger(min) || min < 0)) {

                    fieldError.minLength = "Minimum length must be 0 or greater.";

                }


                if (max !== null && (!Number.isInteger(max) || max < 1)) {

                    fieldError.maxLength = "Maximum length must be at least 1.";

                }


                if (

                    min !== null &&

                    max !== null &&

                    Number.isFinite(min) &&

                    Number.isFinite(max) &&

                    min > max

                ) {

                    fieldError.maxLength =

                        "Maximum length must be greater than or equal to minimum length.";

                }

            }


            if (field.type === "number") {

                const min = field.min === "" ? null : Number(field.min);

                const max = field.max === "" ? null : Number(field.max);


                if (min !== null && !Number.isFinite(min)) {

                    fieldError.min = "Enter a valid minimum.";

                }


                if (max !== null && !Number.isFinite(max)) {

                    fieldError.max = "Enter a valid maximum.";

                }


                if (

                    min !== null &&

                    max !== null &&

                    Number.isFinite(min) &&

                    Number.isFinite(max) &&

                    min > max

                ) {

                    fieldError.max = "Maximum must be greater than or equal to minimum.";

                }

            }


            if (field.type === "media") {

                const size = Number(field.maxFileSize);

                const allowed = Array.isArray(field.allowedTypes)

                    ? field.allowedTypes

                    : [];


                if (!Number.isFinite(size) || size < 1 || size > 10) {

                    fieldError.maxFileSize = "File size must be between 1 and 10 MB.";

                }


                const supportedTypes = ["jpg", "jpeg", "png", "webp"];


                if (

                    allowed.length === 0 ||

                    allowed.some((type) => !supportedTypes.includes(type))

                ) {

                    fieldError.allowedTypes =

                        "Use supported types: jpg, jpeg, png, webp.";

                }

            }


            if (field.type === "select") {

                const options = Array.isArray(field.options)

                    ? field.options.map((option) => String(option).trim()).filter(Boolean)

                    : [];


                if (options.length === 0) {

                    fieldError.options = "Add at least one non-empty option.";

                } else if (

                    new Set(options.map((option) => option.toLowerCase())).size !==

                    options.length

                ) {

                    fieldError.options = "Select options must be unique.";

                }

            }


            if (Object.keys(fieldError).length) {

                errors[field.id] = fieldError;

            }

        });


        return errors;

    };


    const validateForm = () => {

        const nameError = validateFormName();

        const errors = validateFields();


        setFormNameError(nameError);

        setFieldErrors(errors);


        if (nameError) {

            showToast(nameError);

            return false;

        }


        if (fields.length === 0) {

            showToast("Please add at least one field.");

            return false;

        }


        if (Object.keys(errors).length > 0) {

            const firstInvalidId = fields.find(

                (field) => errors[field.id]

            )?.id;


            if (firstInvalidId) {

                setSelectedFieldId(firstInvalidId);

            }


            showToast("Please fix the highlighted field settings.");

            return false;

        }


        return true;

    };


    
const handleContinue = async () => {
    if (isSaving) return;

    if (!validateForm()) return;

    setIsSaving(true);

    try {
        const token = localStorage.getItem("idFoundryToken");

        if (!token) {
            showToast("Your session has expired. Please log in again.");
            setIsSaving(false);
            return;
        }

        const trimmedName = formName.trim();

        const fieldsToSave = fields.map((field) => ({
            ...field,
            label: field.label.trim(),
            name: field.name.trim(),
        }));

        // Save the form to the backend first.
        const response = await fetch(
            `${API_BASE_URL}/api/id-card-forms`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: trimmedName,
                    fields: fieldsToSave,
                }),
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success || !result.form?._id) {
            throw new Error(
                result.message || "Unable to save the form."
            );
        }

        // MongoDB is now the source of truth.
        const formData = {
            id: result.form._id,
            name: result.form.name,
            fields: result.form.fields,
        };

        /*
         * Temporary compatibility for Step 2.
         * Your current Design page still reads these keys.
         * We'll remove this dependency when Design is migrated.
         */
        const parseStoredJson = (key, fallback) => {
            try {
                const value = JSON.parse(
                    localStorage.getItem(key) || "null"
                );

                return value ?? fallback;
            } catch {
                return fallback;
            }
        };

        const storedForms = parseStoredJson("idCardForms", []);

        if (!Array.isArray(storedForms)) {
            throw new Error(
                "The form was saved, but existing local form data has an invalid format. Your backend form is safe."
            );
        }

        let updatedForms = [...storedForms];

        // Preserve any legacy form already stored in the browser.
        const legacyForm = parseStoredJson("idCardForm", null);

        if (
            legacyForm &&
            typeof legacyForm.id === "string" &&
            Array.isArray(legacyForm.fields) &&
            !updatedForms.some((item) => item?.id === legacyForm.id)
        ) {
            updatedForms.push(legacyForm);
        }

        // Avoid duplicating this form in the local compatibility array.
        updatedForms = updatedForms.filter(
            (item) => item?.id !== formData.id
        );

        updatedForms.push(formData);

        localStorage.setItem(
            "idCardForms",
            JSON.stringify(updatedForms)
        );

        localStorage.setItem(
            "idCardForm",
            JSON.stringify(formData)
        );

        localStorage.setItem("idCardFormId", formData.id);
        localStorage.removeItem("idCardEditingFormId");

        showToast("Form saved successfully!");

        window.location.href = "/design";
    } catch (error) {
        console.error("Save ID card form error:", error);

        showToast(
            error.message || "Unable to save the form. Please try again."
        );

        setIsSaving(false);
    }
};


    const handleCancel = () => {

        const confirmed = window.confirm(

            "Are you sure you want to cancel? Your unsaved changes may be lost."

        );


        if (confirmed) {

            window.location.href = "/";

        }

    };


    const goBack = () => {

        window.location.href = "/card";

    };


    const selectedField =

        fields.find((field) => field.id === selectedFieldId) || null;


    const selectedErrors = selectedField

        ? fieldErrors[selectedField.id] || {}

        : {};


    const renderError = (message) =>

        message ? <span className="validation-error">{message}</span> : null;


    return (

        <div className="app">

            <Sidebar activePage="create-id-card" />


            <main className="main">

                <Topbar />


                <section className="content">

                    <div className="breadcrumb">

                        <button type="button" onClick={goBack}>

                            ID Cards

                        </button>

                        <span>›</span>

                        <span>Create Form</span>

                    </div>


                    <h1 className="page-title">Create Form</h1>


                    <p className="page-subtitle">

                        Build the form used to collect information for your ID card.

                    </p>


                    <div className="steps">


                        <div className="step active">


                            <span className="step-number">

                                1

                            </span>


                            <span className="step-label">

                                Create Form

                            </span>


                        </div>


                        <div className="step-line" />


                        <div className="step">


                            <span className="step-number">

                                2

                            </span>


                            <span className="step-label">

                                Design

                            </span>


                        </div>


                        <div className="step-line" />


                        <div className="step">


                            <span className="step-number">

                                3

                            </span>


                            <span className="step-label">

                                Demo

                            </span>


                        </div>


                        <div className="step-line" />


                        <div className="step">


                            <span className="step-number">

                                4

                            </span>


                            <span className="step-label">

                                Preview

                            </span>


                        </div>


                    </div>


                    <div className="form-card">

                        <div className="form-card-header">

                            <h2>Form Information</h2>

                            <p>Give your data collection form a name.</p>

                        </div>


                        <div className="form-body">

                            <div className="field">

                                <div className="field-label">

                                    <label htmlFor="form-name">

                                        Form Name <span className="required">*</span>

                                    </label>


                                </div>


                                <input

                                    id="form-name"

                                    type="text"

                                    className={`input ${formNameError ? "invalid" : ""}`}

                                    value={formName}

                                    maxLength={FORM_NAME_MAX_LENGTH}

                                    placeholder="e.g. Student ID Card Form"

                                    aria-invalid={Boolean(formNameError)}

                                    aria-describedby="form-name-error"

                                    onChange={(event) => {

                                        setFormName(event.target.value);

                                        setFormNameError("");

                                    }}

                                />


                                <div

                                    id="form-name-error"

                                    className={`error ${formNameError ? "show" : ""}`}

                                    role="alert"

                                >

                                    {formNameError}

                                </div>


                                <div className="input-character-count">

                                    {formName.length}/{FORM_NAME_MAX_LENGTH}

                                </div>

                            </div>

                        </div>

                    </div>


                    <div className="create-form-builder">

                        <section className="form-card field-library">

                            <div className="form-card-header">

                                <h2>Available Fields</h2>

                                <p>Drag a field into your form or click to add it.</p>

                            </div>


                            <div className="field-library-body">

                                {FIELD_TYPES.map((item) => (

                                    <button

                                        type="button"

                                        className="field-library-item"

                                        key={item.type}

                                        draggable

                                        onDragStart={(event) =>

                                            handleLibraryDragStart(item.type, event)

                                        }

                                        onDragEnd={clearDragState}

                                        onClick={() => addField(item.type)}

                                    >

                                        <div className="field-library-icon">

                                            {item.icon}

                                        </div>


                                        <div className="field-library-content">

                                            <strong>{item.title}</strong>

                                            <span>{item.description}</span>

                                        </div>


                                        <span className="field-library-add">+</span>

                                    </button>

                                ))}

                            </div>

                        </section>


                        <section

                            className="form-card created-form-card"

                            onDragOver={(event) => event.preventDefault()}

                            onDrop={handleDropOnForm}

                        >

                            <div className="form-card-header created-form-header">

                                <div>

                                    <h2>Your Form</h2>

                                    <p>Arrange and configure your fields.</p>

                                </div>


                                <span className="field-count">

                                    {fields.length} {fields.length === 1 ? "field" : "fields"}

                                </span>

                            </div>


                            <div className="created-form-body">

                                {fields.length === 0 ? (

                                    <div className="form-drop-zone">

                                        <div className="form-drop-icon">＋</div>

                                        <strong>Drop fields here</strong>

                                        <span>

                                            Drag a field from the left panel or click a

                                            field to add it.

                                        </span>

                                    </div>

                                ) : (

                                    fields.map((field, index) => (

                                        <div

                                            key={field.id}

                                            className={`created-field ${

                                                selectedFieldId === field.id ? "selected" : ""

                                            } ${

                                                dragOverIndex === index ? "drag-over" : ""

                                            }`}

                                            draggable

                                            onDragStart={(event) =>

                                                handleFieldDragStart(index, event)

                                            }

                                            onDragOver={(event) => {

                                                event.preventDefault();

                                                setDragOverIndex(index);

                                            }}

                                            onDrop={(event) =>

                                                handleDropOnField(event, index)

                                            }

                                            onDragEnd={clearDragState}

                                            onClick={() => setSelectedFieldId(field.id)}

                                        >

                                            <div className="created-field-drag">⋮⋮</div>


                                            <div className="created-field-type">

                                                {field.type}

                                            </div>


                                            <div className="created-field-info">

                                                <strong>{field.label || "Untitled field"}</strong>

                                                <span>{field.name || "No field key"}</span>

                                            </div>


                                            {field.required && (

                                                <span className="field-required-badge">

                                                    Required

                                                </span>

                                            )}


                                            <button

                                                type="button"

                                                className="created-field-delete"

                                                aria-label={`Delete ${field.label || "field"}`}

                                                onClick={(event) => {

                                                    event.stopPropagation();

                                                    deleteField(field.id);

                                                }}

                                            >

                                                ×

                                            </button>

                                        </div>

                                    ))

                                )}

                            </div>

                        </section>


                        <section className="form-card field-settings-card">

                            <div className="form-card-header">

                                <h2>Field Settings</h2>

                                <p>Configure the selected field.</p>

                            </div>


                            {!selectedField ? (

                                <div className="no-field-selected">

                                    <div>⚙</div>

                                    <span>Select a field from your form to configure it.</span>

                                </div>

                            ) : (

                                <div className="field-settings-body">

                                    <div className="field">

                                        <div className="field-label">

                                            <label htmlFor="selected-field-label">

                                                Field Label <span className="required">*</span>

                                            </label>

                                        </div>


                                        <input

                                            id="selected-field-label"

                                            type="text"

                                            className={`input ${selectedErrors.label ? "invalid" : ""}`}

                                            value={selectedField.label ?? ""}

                                            maxLength={100}

                                            aria-invalid={Boolean(selectedErrors.label)}

                                            onChange={(event) =>

                                                updateField(

                                                    selectedField.id,

                                                    "label",

                                                    event.target.value

                                                )

                                            }

                                        />

                                        {renderError(selectedErrors.label)}

                                    </div>


                                    <div className="field">

                                        <div className="field-label">

                                            <label htmlFor="selected-field-name">

                                                Field Name <span className="required">*</span>

                                            </label>

                                            <span className="field-hint">Unique key</span>

                                        </div>


                                        <input

                                            id="selected-field-name"

                                            type="text"

                                            className={`input ${selectedErrors.name ? "invalid" : ""}`}

                                            value={selectedField.name ?? ""}

                                            aria-invalid={Boolean(selectedErrors.name)}

                                            onChange={(event) =>

                                                updateField(

                                                    selectedField.id,

                                                    "name",

                                                    event.target.value

                                                )

                                            }

                                        />

                                        {renderError(selectedErrors.name)}

                                    </div>


                                    {["text", "number", "email", "phone", "textarea", "select"].includes(

                                        selectedField.type

                                    ) && (

                                        <div className="field">

                                            <div className="field-label">

                                                <label htmlFor="selected-field-placeholder">

                                                    Placeholder

                                                </label>

                                            </div>


                                            <input

                                                id="selected-field-placeholder"

                                                type="text"

                                                className="input"

                                                value={selectedField.placeholder ?? ""}

                                                maxLength={150}

                                                onChange={(event) =>

                                                    updateField(

                                                        selectedField.id,

                                                        "placeholder",

                                                        event.target.value

                                                    )

                                                }

                                            />

                                        </div>

                                    )}


                                    <label className="field-checkbox">

                                        <input

                                            type="checkbox"

                                            checked={Boolean(selectedField.required)}

                                            onChange={(event) =>

                                                updateField(

                                                    selectedField.id,

                                                    "required",

                                                    event.target.checked

                                                )

                                            }

                                        />

                                        <span>Required</span>

                                    </label>


                                    {["text", "textarea"].includes(selectedField.type) && (

                                        <div className="settings-two-column">

                                            <div className="field">

                                                <div className="field-label">

                                                    <label htmlFor="field-min-length">

                                                        Min Length

                                                    </label>

                                                </div>

                                                <input

                                                    id="field-min-length"

                                                    type="number"

                                                    min="0"

                                                    className={`input ${selectedErrors.minLength ? "invalid" : ""}`}

                                                    value={selectedField.minLength ?? ""}

                                                    onChange={(event) =>

                                                        updateField(

                                                            selectedField.id,

                                                            "minLength",

                                                            event.target.value

                                                        )

                                                    }

                                                />

                                                {renderError(selectedErrors.minLength)}

                                            </div>


                                            <div className="field">

                                                <div className="field-label">

                                                    <label htmlFor="field-max-length">

                                                        Max Length

                                                    </label>

                                                </div>

                                                <input

                                                    id="field-max-length"

                                                    type="number"

                                                    min="1"

                                                    className={`input ${selectedErrors.maxLength ? "invalid" : ""}`}

                                                    value={selectedField.maxLength ?? ""}

                                                    onChange={(event) =>

                                                        updateField(

                                                            selectedField.id,

                                                            "maxLength",

                                                            event.target.value

                                                        )

                                                    }

                                                />

                                                {renderError(selectedErrors.maxLength)}

                                            </div>

                                        </div>

                                    )}


                                    {selectedField.type === "number" && (

                                        <div className="settings-two-column">

                                            <div className="field">

                                                <div className="field-label">

                                                    <label htmlFor="field-minimum">Minimum</label>

                                                </div>

                                                <input

                                                    id="field-minimum"

                                                    type="number"

                                                    className={`input ${selectedErrors.min ? "invalid" : ""}`}

                                                    value={selectedField.min ?? ""}

                                                    onChange={(event) =>

                                                        updateField(

                                                            selectedField.id,

                                                            "min",

                                                            event.target.value

                                                        )

                                                    }

                                                />

                                                {renderError(selectedErrors.min)}

                                            </div>


                                            <div className="field">

                                                <div className="field-label">

                                                    <label htmlFor="field-maximum">Maximum</label>

                                                </div>

                                                <input

                                                    id="field-maximum"

                                                    type="number"

                                                    className={`input ${selectedErrors.max ? "invalid" : ""}`}

                                                    value={selectedField.max ?? ""}

                                                    onChange={(event) =>

                                                        updateField(

                                                            selectedField.id,

                                                            "max",

                                                            event.target.value

                                                        )

                                                    }

                                                />

                                                {renderError(selectedErrors.max)}

                                            </div>

                                        </div>

                                    )}


                                    {selectedField.type === "media" && (

                                        <>

                                            <div className="field">

                                                <div className="field-label">

                                                    <label htmlFor="field-max-file-size">

                                                        Maximum File Size

                                                    </label>

                                                    <span className="field-hint">MB (1–10)</span>

                                                </div>

                                                <input

                                                    id="field-max-file-size"

                                                    type="number"

                                                    min="1"

                                                    max="10"

                                                    step="1"

                                                    className={`input ${selectedErrors.maxFileSize ? "invalid" : ""}`}

                                                    value={selectedField.maxFileSize ?? 2}

                                                    onChange={(event) =>

                                                        updateField(

                                                            selectedField.id,

                                                            "maxFileSize",

                                                            event.target.value

                                                        )

                                                    }

                                                />

                                                {renderError(selectedErrors.maxFileSize)}

                                            </div>


                                            <div className="field">

                                                <div className="field-label">

                                                    <label htmlFor="field-allowed-types">

                                                        Allowed File Types

                                                    </label>

                                                </div>

                                                <input

                                                    id="field-allowed-types"

                                                    type="text"

                                                    className={`input ${selectedErrors.allowedTypes ? "invalid" : ""}`}

                                                    value={(selectedField.allowedTypes || []).join(", ")}

                                                    placeholder="jpg, jpeg, png, webp"

                                                    onChange={(event) =>

                                                        updateField(

                                                            selectedField.id,

                                                            "allowedTypes",

                                                            event.target.value

                                                                .split(",")

                                                                .map((type) => type.trim().toLowerCase())

                                                                .filter(Boolean)

                                                        )

                                                    }

                                                />

                                                {renderError(selectedErrors.allowedTypes)}

                                            </div>

                                        </>

                                    )}


                                    {selectedField.type === "select" && (

                                        <div className="field">

                                            <div className="field-label">

                                                <label htmlFor="field-select-options">

                                                    Options

                                                </label>

                                                <span className="field-hint">One per line</span>

                                            </div>


                                            <textarea

                                                id="field-select-options"

                                                className={`input settings-textarea ${selectedErrors.options ? "invalid" : ""}`}

                                                rows="5"

                                                value={(selectedField.options || []).join("\n")}

                                                onChange={(event) =>

                                                    updateField(

                                                        selectedField.id,

                                                        "options",

                                                        event.target.value.split("\n")

                                                    )

                                                }

                                            />

                                            {renderError(selectedErrors.options)}

                                        </div>

                                    )}

                                </div>

                            )}

                        </section>

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

                            {isSaving ? "Saving..." : "Continue"}

                            {!isSaving && <span className="continue-arrow"><ArrowRight size={10}/></span>}

                        </button>

                    </div>


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


export default CreateForm;