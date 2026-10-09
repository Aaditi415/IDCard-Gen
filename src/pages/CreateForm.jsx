import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function CreateForm() {
    const [fields, setFields] = useState([]);

    const [selectedFieldId, setSelectedFieldId] =
        useState(null);

    const [draggedField, setDraggedField] =
        useState(null);

    const [dragOverIndex, setDragOverIndex] =
        useState(null);

    const [formName, setFormName] =
        useState("Student ID Card Form");

    const [formNameError, setFormNameError] =
        useState(false);

    const [toast, setToast] = useState("");
    const [toastVisible, setToastVisible] =
        useState(false);

    const fieldTypes = [
        {
            type: "text",
            icon: "Aa",
            title: "Text",
            description: "Name, address, etc."
        },
        {
            type: "number",
            icon: "#",
            title: "Number",
            description: "Roll number, age, etc."
        },
        {
            type: "email",
            icon: "@",
            title: "Email",
            description: "Email address"
        },
        {
            type: "phone",
            icon: "☎",
            title: "Phone",
            description: "Phone number"
        },
        {
            type: "date",
            icon: "◷",
            title: "Date",
            description: "Date of birth, etc."
        },
        {
            type: "media",
            icon: "▧",
            title: "Media / Photo",
            description: "Student photo"
        },
        {
            type: "textarea",
            icon: "☰",
            title: "Textarea",
            description: "Long text"
        },
        {
            type: "select",
            icon: "▾",
            title: "Select",
            description: "Choose an option"
        }
    ];

    /* =====================================================
       TOAST
    ===================================================== */

    const showToast = (message) => {
        setToast(message);
        setToastVisible(true);

        setTimeout(() => {
            setToastVisible(false);
        }, 2500);
    };

    /* =====================================================
       HELPERS
    ===================================================== */

    const createFieldId = () => {
        return (
            "field_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 8)
        );
    };

    const getDefaultField = (type) => {
        const definitions = {
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
                allowedTypes: [
                    "jpg",
                    "jpeg",
                    "png",
                    "webp"
                ]
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
                options: [
                    "Option 1",
                    "Option 2"
                ]
            }
        };

        return {
            id: createFieldId(),
            type,
            ...definitions[type]
        };
    };

    /* =====================================================
       ADD FIELD
    ===================================================== */

    const addField = (type) => {
        const newField = getDefaultField(type);

        setFields((currentFields) => [
            ...currentFields,
            newField
        ]);

        setSelectedFieldId(newField.id);

        showToast(`${newField.label} field added.`);
    };

    /* =====================================================
       UPDATE FIELD
    ===================================================== */

    const updateField = (id, property, value) => {
        setFields((currentFields) =>
            currentFields.map((field) =>
                field.id === id
                    ? {
                          ...field,
                          [property]: value
                      }
                    : field
            )
        );
    };

    /* =====================================================
       DELETE FIELD
    ===================================================== */

    const deleteField = (id) => {
        setFields((currentFields) =>
            currentFields.filter(
                (field) => field.id !== id
            )
        );

        if (selectedFieldId === id) {
            setSelectedFieldId(null);
        }
    };

    /* =====================================================
       DRAG START
    ===================================================== */

    const handleDragStart = (index) => {
        setDraggedField(index);
    };

    /* =====================================================
       DRAG OVER
    ===================================================== */

    const handleDragOver = (
        event,
        index
    ) => {
        event.preventDefault();

        setDragOverIndex(index);
    };

    /* =====================================================
       DROP
    ===================================================== */

    const handleDrop = (
        event,
        dropIndex
    ) => {
        event.preventDefault();

        if (
            draggedField === null ||
            draggedField === dropIndex
        ) {
            setDraggedField(null);
            setDragOverIndex(null);
            return;
        }

        setFields((currentFields) => {
            const updated = [
                ...currentFields
            ];

            const [movedField] =
                updated.splice(
                    draggedField,
                    1
                );

            updated.splice(
                dropIndex,
                0,
                movedField
            );

            return updated;
        });

        setDraggedField(null);
        setDragOverIndex(null);
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {
        if (!formName.trim()) {
            setFormNameError(true);

            showToast(
                "Please enter a form name."
            );

            return false;
        }

        setFormNameError(false);

        if (!fields.length) {
            showToast(
                "Please add at least one field."
            );

            return false;
        }

        const invalidField =
            fields.find(
                (field) =>
                    !field.label.trim() ||
                    !field.name.trim()
            );

        if (invalidField) {
            setSelectedFieldId(
                invalidField.id
            );

            showToast(
                "Please complete all field settings."
            );

            return false;
        }

        return true;
    };

    /* =====================================================
       SAVE FORM
    ===================================================== */

    /* =====================================================
   SAVE FORM
===================================================== */

const handleContinue = () => {
    // First run your existing validation
    if (!validateForm()) {
        return;
    }

    const trimmedName = formName.trim();

    try {
        // Get all saved templates
        const existingTemplates =
            JSON.parse(
                localStorage.getItem("idCardTemplates")
            ) || [];

        // Find an existing template with the same name
        // Matching is case-insensitive and ignores extra spaces
        const existingTemplate =
            existingTemplates.find(
                (template) =>
                    template.name?.trim().toLowerCase() ===
                    trimmedName.toLowerCase()
            );

        /*
         * If the form name already exists:
         *      reuse its existing formId
         *
         * If the form name is new:
         *      create a new formId
         */
        const formId =
            existingTemplate?.formId ||
            "form_" + Date.now();

        const formData = {
            id: formId,

            name: trimmedName,

            fields: fields.map((field) => ({
                ...field
            }))
        };

        // Save current form
        localStorage.setItem(
            "idCardForm",
            JSON.stringify(formData)
        );

        // Save current form ID
        localStorage.setItem(
            "idCardFormId",
            formId
        );

        // Go to Design step
        window.location.href = "/design";

    } catch (error) {
        console.error(
            "Unable to save form:",
            error
        );

        showToast(
            "Unable to save form. Please try again."
        );
    }
};
    /* =====================================================
       CANCEL
    ===================================================== */

    const handleCancel = () => {
        const confirmed =
            window.confirm(
                "Are you sure you want to cancel? Your form changes will be lost."
            );

        if (!confirmed) {
            return;
        }

        window.location.href = "/";
    };

    /* =====================================================
       LOAD EXISTING FORM
    ===================================================== */

    // useEffect(() => {
    //     try {
    //         const savedForm =
    //             JSON.parse(
    //                 localStorage.getItem(
    //                     "idCardForm"
    //                 )
    //             );

    //         if (
    //             savedForm &&
    //             Array.isArray(
    //                 savedForm.fields
    //             )
    //         ) {
    //             setFormName(
    //                 savedForm.name ||
    //                     "Student ID Card Form"
    //             );

    //             setFields(
    //                 savedForm.fields
    //             );
    //         }
    //     } catch (error) {
    //         console.error(
    //             "Unable to load saved form:",
    //             error
    //         );
    //     }
    // }, []);

    /* =====================================================
       NAVIGATION
    ===================================================== */

    const goBack = () => {
        window.location.href =
            "/card";
    };

    /* =====================================================
       SELECTED FIELD
    ===================================================== */

    const selectedField =
        fields.find(
            (field) =>
                field.id ===
                selectedFieldId
        ) || null;

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="app">

            <Sidebar
                activePage="create-id-card"
            />

            <main className="main">

                <Topbar />

                <section className="content">

                    {/* BREADCRUMB */}

                    <div className="breadcrumb">

                        <button
                            onClick={goBack}
                        >
                            ID Cards
                        </button>

                        <span>›</span>

                        <span>
                            Create Form
                        </span>

                    </div>


                    {/* TITLE */}

                    <h1 className="page-title">
                        Create Form
                    </h1>

                    <p className="page-subtitle">
                        Build the form used to
                        collect information for
                        your ID card.
                    </p>


                    {/* STEPS */}

                    <div className="steps">

                        <div className="step active">

                            <div className="step-number">
                                1
                            </div>

                            <div className="step-label">
                                Create Form
                            </div>

                        </div>

                        <div className="step-line" />

                        <div className="step">

                            <div className="step-number">
                                2
                            </div>

                            <div className="step-label">
                                Design
                            </div>

                        </div>

                        <div className="step-line" />

                        <div className="step">

                            <div className="step-number">
                                3
                            </div>

                            <div className="step-label">
                                Demo
                            </div>

                        </div>

                        <div className="step-line" />

                        <div className="step">

                            <div className="step-number">
                                4
                            </div>

                            <div className="step-label">
                                Preview
                            </div>

                        </div>

                    </div>


                    {/* FORM NAME */}

                    <div className="form-card create-form-name-card">

                        <div className="form-card-header">

                            <h2>
                                Form Information
                            </h2>

                            <p>
                                Give your data
                                collection form a
                                name.
                            </p>

                        </div>

                        <div className="form-body">

                            <div className="field">

                                <div className="field-label">

                                    <label>
                                        Form Name
                                        <span className="required">
                                            *
                                        </span>
                                    </label>

                                    <span className="field-hint">
                                        Internal name
                                    </span>

                                </div>

                                <div className="input-wrap">

                                    <input
                                        type="text"
                                        className={`input ${
                                            formNameError
                                                ? "invalid"
                                                : ""
                                        }`}
                                        value={
                                            formName
                                        }
                                        maxLength={
                                            80
                                        }
                                        placeholder="e.g. Student ID Card Form"
                                        onChange={(
                                            event
                                        ) => {
                                            setFormName(
                                                event
                                                    .target
                                                    .value
                                            );

                                            setFormNameError(
                                                false
                                            );
                                        }}
                                    />

                                </div>

                                <div
                                    className={`error ${
                                        formNameError
                                            ? "show"
                                            : ""
                                    }`}
                                >
                                    Please enter a
                                    form name.
                                </div>

                            </div>

                        </div>

                    </div>


                    {/* BUILDER */}

                    <div className="create-form-builder">

                        {/* AVAILABLE FIELDS */}

                        <section className="form-card field-library">

                            <div className="form-card-header">

                                <h2>
                                    Available Fields
                                </h2>

                                <p>
                                    Drag a field into
                                    your form or click
                                    to add it.
                                </p>

                            </div>

                            <div className="field-library-body">

                                {fieldTypes.map(
                                    (item) => (

                                        <button
                                            type="button"
                                            className="field-library-item"
                                            key={
                                                item.type
                                            }
                                            draggable
                                            onDragStart={() =>
                                                setDraggedField(
                                                    item.type
                                                )
                                            }
                                            onClick={() =>
                                                addField(
                                                    item.type
                                                )
                                            }
                                        >

                                            <div className="field-library-icon">
                                                {
                                                    item.icon
                                                }
                                            </div>

                                            <div className="field-library-content">

                                                <strong>
                                                    {
                                                        item.title
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        item.description
                                                    }
                                                </span>

                                            </div>

                                            <span className="field-library-add">
                                                +
                                            </span>

                                        </button>

                                    )
                                )}

                            </div>

                        </section>


                        {/* FORM FIELDS */}

                        <section
                            className="form-card created-form-card"
                            onDragOver={(event) =>
                                event.preventDefault()
                            }
                            onDrop={(event) => {
                                event.preventDefault();

                                if (
                                    typeof draggedField ===
                                    "string"
                                ) {
                                    addField(
                                        draggedField
                                    );

                                    setDraggedField(
                                        null
                                    );
                                }
                            }}
                        >

                            <div className="form-card-header">

                                <div>

                                    <h2>
                                        Your Form
                                    </h2>

                                    <p>
                                        Arrange and
                                        configure your
                                        fields.
                                    </p>

                                </div>

                                <span className="field-count">
                                    {fields.length}{" "}
                                    {fields.length ===
                                    1
                                        ? "field"
                                        : "fields"}
                                </span>

                            </div>


                            <div className="created-form-body">

                                {fields.length ===
                                0 ? (

                                    <div className="form-drop-zone">

                                        <div className="form-drop-icon">
                                            ＋
                                        </div>

                                        <strong>
                                            Drop fields
                                            here
                                        </strong>

                                        <span>
                                            Drag a field
                                            from the
                                            left panel
                                            or click a
                                            field to add
                                            it.
                                        </span>

                                    </div>

                                ) : (

                                    fields.map(
                                        (
                                            field,
                                            index
                                        ) => (

                                            <div
                                                key={
                                                    field.id
                                                }
                                                className={`created-field ${
                                                    selectedFieldId ===
                                                    field.id
                                                        ? "selected"
                                                        : ""
                                                } ${
                                                    dragOverIndex ===
                                                    index
                                                        ? "drag-over"
                                                        : ""
                                                }`}
                                                draggable
                                                onDragStart={() =>
                                                    handleDragStart(
                                                        index
                                                    )
                                                }
                                                onDragOver={(
                                                    event
                                                ) =>
                                                    handleDragOver(
                                                        event,
                                                        index
                                                    )
                                                }
                                                onDrop={(
                                                    event
                                                ) =>
                                                    handleDrop(
                                                        event,
                                                        index
                                                    )
                                                }
                                                onClick={() =>
                                                    setSelectedFieldId(
                                                        field.id
                                                    )
                                                }
                                            >

                                                <div className="created-field-drag">
                                                    ⋮⋮
                                                </div>

                                                <div className="created-field-type">
                                                    {
                                                        field.type
                                                    }
                                                </div>

                                                <div className="created-field-info">

                                                    <strong>
                                                        {
                                                            field.label
                                                        }
                                                    </strong>

                                                    <span>
                                                        {field.name}
                                                    </span>

                                                </div>

                                                {field.required && (
                                                    <span className="field-required-badge">
                                                        Required
                                                    </span>
                                                )}

                                                <button
                                                    type="button"
                                                    className="created-field-delete"
                                                    onClick={(
                                                        event
                                                    ) => {
                                                        event.stopPropagation();

                                                        deleteField(
                                                            field.id
                                                        );
                                                    }}
                                                >
                                                    ×
                                                </button>

                                            </div>

                                        )
                                    )

                                )}

                            </div>

                        </section>


                        {/* FIELD SETTINGS */}

                        <section className="form-card field-settings-card">

                            <div className="form-card-header">

                                <h2>
                                    Field Settings
                                </h2>

                                <p>
                                    Configure the
                                    selected field.
                                </p>

                            </div>


                            {!selectedField ? (

                                <div className="no-field-selected">

                                    <div>
                                        ⚙
                                    </div>

                                    <span>
                                        Select a field
                                        from your form
                                        to configure
                                        it.
                                    </span>

                                </div>

                            ) : (

                                <div className="field-settings-body">

                                    {/* LABEL */}

                                    <div className="field">

                                        <div className="field-label">

                                            <label>
                                                Field Label
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                        </div>

                                        <input
                                            type="text"
                                            className="input"
                                            value={
                                                selectedField.label
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateField(
                                                    selectedField.id,
                                                    "label",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />

                                    </div>


                                    {/* NAME */}

                                    <div className="field">

                                        <div className="field-label">

                                            <label>
                                                Field Name
                                                <span className="required">
                                                    *
                                                </span>
                                            </label>

                                            <span className="field-hint">
                                                Unique key
                                            </span>

                                        </div>

                                        <input
                                            type="text"
                                            className="input"
                                            value={
                                                selectedField.name
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateField(
                                                    selectedField.id,
                                                    "name",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />

                                    </div>


                                    {/* PLACEHOLDER */}

                                    {[
                                        "text",
                                        "number",
                                        "email",
                                        "phone",
                                        "textarea",
                                        "select"
                                    ].includes(
                                        selectedField.type
                                    ) && (

                                        <div className="field">

                                            <div className="field-label">

                                                <label>
                                                    Placeholder
                                                </label>

                                            </div>

                                            <input
                                                type="text"
                                                className="input"
                                                value={
                                                    selectedField.placeholder ||
                                                    ""
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    updateField(
                                                        selectedField.id,
                                                        "placeholder",
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                            />

                                        </div>

                                    )}


                                    {/* REQUIRED */}

                                    <label className="field-checkbox">

                                        <input
                                            type="checkbox"
                                            checked={
                                                !!selectedField.required
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateField(
                                                    selectedField.id,
                                                    "required",
                                                    event
                                                        .target
                                                        .checked
                                                )
                                            }
                                        />

                                        <span>
                                            Required
                                        </span>

                                    </label>


                                    {/* TEXT VALIDATION */}

                                    {[
                                        "text",
                                        "textarea"
                                    ].includes(
                                        selectedField.type
                                    ) && (

                                        <div className="settings-two-column">

                                            <div className="field">

                                                <div className="field-label">
                                                    <label>
                                                        Min Length
                                                    </label>
                                                </div>

                                                <input
                                                    type="number"
                                                    className="input"
                                                    min="0"
                                                    value={
                                                        selectedField.minLength ??
                                                        ""
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateField(
                                                            selectedField.id,
                                                            "minLength",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                />

                                            </div>

                                            <div className="field">

                                                <div className="field-label">
                                                    <label>
                                                        Max Length
                                                    </label>
                                                </div>

                                                <input
                                                    type="number"
                                                    className="input"
                                                    min="1"
                                                    value={
                                                        selectedField.maxLength ??
                                                        ""
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateField(
                                                            selectedField.id,
                                                            "maxLength",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                />

                                            </div>

                                        </div>

                                    )}


                                    {/* NUMBER VALIDATION */}

                                    {selectedField.type ===
                                        "number" && (

                                        <div className="settings-two-column">

                                            <div className="field">

                                                <div className="field-label">
                                                    <label>
                                                        Minimum
                                                    </label>
                                                </div>

                                                <input
                                                    type="number"
                                                    className="input"
                                                    value={
                                                        selectedField.min ??
                                                        ""
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateField(
                                                            selectedField.id,
                                                            "min",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                />

                                            </div>

                                            <div className="field">

                                                <div className="field-label">
                                                    <label>
                                                        Maximum
                                                    </label>
                                                </div>

                                                <input
                                                    type="number"
                                                    className="input"
                                                    value={
                                                        selectedField.max ??
                                                        ""
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateField(
                                                            selectedField.id,
                                                            "max",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                />

                                            </div>

                                        </div>

                                    )}


                                    {/* MEDIA */}

                                    {selectedField.type ===
                                        "media" && (

                                        <>

                                            <div className="field">

                                                <div className="field-label">

                                                    <label>
                                                        Maximum File
                                                        Size
                                                    </label>

                                                    <span className="field-hint">
                                                        MB
                                                    </span>

                                                </div>

                                                <input
                                                    type="number"
                                                    className="input"
                                                    min="1"
                                                    max="10"
                                                    value={
                                                        selectedField.maxFileSize ??
                                                        2
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateField(
                                                            selectedField.id,
                                                            "maxFileSize",
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                />

                                            </div>

                                            <div className="field">

                                                <div className="field-label">

                                                    <label>
                                                        Allowed
                                                        File Types
                                                    </label>

                                                </div>

                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={
                                                        (
                                                            selectedField.allowedTypes ||
                                                            []
                                                        ).join(
                                                            ", "
                                                        )
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateField(
                                                            selectedField.id,
                                                            "allowedTypes",
                                                            event.target.value
                                                                .split(
                                                                    ","
                                                                )
                                                                .map(
                                                                    (
                                                                        type
                                                                    ) =>
                                                                        type
                                                                            .trim()
                                                                            .toLowerCase()
                                                                )
                                                                .filter(
                                                                    Boolean
                                                                )
                                                        )
                                                    }
                                                />

                                            </div>

                                        </>

                                    )}


                                    {/* SELECT OPTIONS */}

                                    {selectedField.type ===
                                        "select" && (

                                        <div className="field">

                                            <div className="field-label">

                                                <label>
                                                    Options
                                                </label>

                                                <span className="field-hint">
                                                    One per
                                                    line
                                                </span>

                                            </div>

                                            <textarea
                                                className="input settings-textarea"
                                                rows="5"
                                                value={(
                                                    selectedField.options ||
                                                    []
                                                ).join(
                                                    "\n"
                                                )}
                                                onChange={(
                                                    event
                                                ) =>
                                                    updateField(
                                                        selectedField.id,
                                                        "options",
                                                        event.target.value
                                                            .split(
                                                                "\n"
                                                            )
                                                            .map(
                                                                (
                                                                    option
                                                                ) =>
                                                                    option.trim()
                                                            )
                                                            .filter(
                                                                Boolean
                                                            )
                                                    )
                                                }
                                            />

                                        </div>

                                    )}

                                </div>

                            )}

                        </section>

                    </div>


                    {/* FOOTER */}

                    <div className="form-card create-form-footer">

                        <div className="footer-note">
                            {fields.length
                                ? `${fields.length} field${
                                      fields.length ===
                                      1
                                          ? ""
                                          : "s"
                                  } added to your form.`
                                : "Add the fields you need for your ID card."}
                        </div>

                        <div className="actions">

                            <button
                                type="button"
                                className="ui-btn ui-btn--secondary"
                                onClick={
                                    handleCancel
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="ui-btn ui-btn--primary"
                                onClick={
                                    handleContinue
                                }
                            >
                                Continue
                                <span
                                    style={{
                                        marginLeft:
                                            "5px"
                                    }}
                                >
                                    →
                                </span>
                            </button>

                        </div>

                    </div>

                </section>

            </main>


            {/* TOAST */}

            <div
                className={`toast ${
                    toastVisible
                        ? "show"
                        : ""
                }`}
            >
                {toast}
            </div>

        </div>
    );
}

export default CreateForm;