import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const DESIGN_STORAGE_KEY = "idCardDesign";
const FORM_STORAGE_KEY = "idCardForm";

const DEFAULT_DESIGN = {
    template: "modern",
    primaryColor: "#2563eb",
    orientation: "portrait",
    background: "white",
    cardSize: "standard",
    zoom: 1,

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

    /*
    =====================================================
    FIELD LAYOUT

    row = row number
    column = column number
    width = number of columns occupied
    =====================================================
    */

    fieldLayout: {},
};

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

    const type =
        field?.type ||
        field?.fieldType ||
        "text";

    const name =
        field?.name ||
        field?.key ||
        id;

    return {
        id: String(id),
        label: String(label),
        name: String(name),
        type: String(type).toLowerCase(),
        required: Boolean(field?.required),
    };
}

function isMediaField(field) {
    return [
        "media",
        "image",
        "photo",
        "file",
    ].includes(field.type);
}

function Design() {
    const [formFields, setFormFields] = useState([]);

    const [design, setDesign] =
        useState(DEFAULT_DESIGN);

    const [selectedElement, setSelectedElement] =
        useState(null);

    const [logoError, setLogoError] =
        useState("");

    const [backgroundError, setBackgroundError] =
        useState("");

    const [toast, setToast] =
        useState("");

    /*
    =====================================================
    LOAD FORM + DESIGN
    =====================================================
    */

    useEffect(() => {

        /*
        LOAD FORM
        */

        try {

            const savedForm =
                JSON.parse(
                    localStorage.getItem(
                        FORM_STORAGE_KEY
                    )
                );

            if (Array.isArray(savedForm)) {

                setFormFields(
                    savedForm.map(
                        (field, index) =>
                            normalizeField(
                                field,
                                index
                            )
                    )
                );

            } else if (
                Array.isArray(
                    savedForm?.fields
                )
            ) {

                setFormFields(
                    savedForm.fields.map(
                        (field, index) =>
                            normalizeField(
                                field,
                                index
                            )
                    )
                );
            }

        } catch (error) {

            console.error(
                "Failed to load form:",
                error
            );
        }


        /*
        LOAD DESIGN
        */

        try {

            const savedDesign =
                JSON.parse(
                    localStorage.getItem(
                        DESIGN_STORAGE_KEY
                    )
                );

            if (savedDesign) {

                setDesign((prev) => ({
                    ...prev,

                    ...savedDesign,

                    logo: {
                        ...prev.logo,
                        ...(savedDesign.logo || {}),
                    },

                    backgroundImage: {
                        ...prev.backgroundImage,
                        ...(savedDesign.backgroundImage || {}),
                    },

                    organization: {
                        ...prev.organization,
                        ...(savedDesign.organization || {}),
                    },

                    fields: {
                        ...(savedDesign.fields || {}),
                    },

                    fieldLayout: {
                        ...(savedDesign.fieldLayout || {}),
                    },
                }));
            }

        } catch (error) {

            console.error(
                "Failed to load design:",
                error
            );
        }

    }, []);


    /*
    =====================================================
    CREATE DEFAULT FIELD LAYOUT
    =====================================================
    */

    useEffect(() => {

        if (!formFields.length) return;

        setDesign((prev) => {

            const updatedLayout = {
                ...(prev.fieldLayout || {}),
            };

            let changed = false;

            formFields.forEach(
                (field, index) => {

                    /*
                    Only create layout once.
                    Never overwrite user's layout.
                    */

                    if (!updatedLayout[field.id]) {

                        updatedLayout[field.id] = {
                            row: index + 1,
                            column: 1,
                            width: 1,
                        };

                        changed = true;
                    }
                }
            );

            if (!changed) {
                return prev;
            }

            return {
                ...prev,
                fieldLayout:
                    updatedLayout,
            };
        });

    }, [formFields]);


    /*
    =====================================================
    SAVE DESIGN
    =====================================================
    */

    useEffect(() => {

        localStorage.setItem(
            DESIGN_STORAGE_KEY,
            JSON.stringify(design)
        );

    }, [design]);


    /*
    =====================================================
    TOAST
    =====================================================
    */

    const showToast = (message) => {

        setToast(message);

        setTimeout(() => {
            setToast("");
        }, 1800);
    };


    /*
    =====================================================
    UPDATE DESIGN
    =====================================================
    */

    const updateDesign = (changes) => {

        setDesign((prev) => ({
            ...prev,
            ...changes,
        }));
    };


    /*
    =====================================================
    UPDATE FIELD LAYOUT
    =====================================================
    */

    const updateFieldLayout = (
        fieldId,
        changes
    ) => {

        setDesign((prev) => ({

            ...prev,

            fieldLayout: {

                ...(prev.fieldLayout || {}),

                [fieldId]: {

                    ...(prev.fieldLayout?.[fieldId] || {
                        row: 1,
                        column: 1,
                        width: 1,
                    }),

                    ...changes,
                },
            },

        }));
    };


    /*
    =====================================================
    UPDATE FIELD POSITION IN LIST
    =====================================================
    */

    const moveField = (
        fieldId,
        direction
    ) => {

        const currentIndex =
            formFields.findIndex(
                (field) =>
                    field.id === fieldId
            );

        if (currentIndex === -1)
            return;

        const newIndex =
            direction === "up"
                ? currentIndex - 1
                : currentIndex + 1;

        if (
            newIndex < 0 ||
            newIndex >= formFields.length
        ) {
            return;
        }

        const updatedFields =
            [...formFields];

        const temp =
            updatedFields[currentIndex];

        updatedFields[currentIndex] =
            updatedFields[newIndex];

        updatedFields[newIndex] =
            temp;

        setFormFields(
            updatedFields
        );

        /*
        Rebuild row positions
        */

        setDesign((prev) => {

            const updatedLayout = {
                ...(prev.fieldLayout || {}),
            };

            updatedFields.forEach(
                (field, index) => {

                    updatedLayout[field.id] = {

                        ...(updatedLayout[field.id] || {}),

                        row: index + 1,
                    };
                }
            );

            return {
                ...prev,
                fieldLayout:
                    updatedLayout,
            };
        });

        showToast(
            direction === "up"
                ? "Field moved up"
                : "Field moved down"
        );
    };


    /*
    =====================================================
    CARD DIMENSIONS
    =====================================================
    */

    const cardDimensions =
        useMemo(() => {

            if (
                design.orientation ===
                "landscape"
            ) {

                return {
                    width:
                        design.cardSize ===
                        "compact"
                            ? 360
                            : 440,

                    height:
                        design.cardSize ===
                        "compact"
                            ? 230
                            : 280,
                };
            }

            return {
                width:
                    design.cardSize ===
                    "compact"
                        ? 230
                        : 280,

                height:
                    design.cardSize ===
                    "compact"
                        ? 360
                        : 440,
            };

        }, [
            design.orientation,
            design.cardSize,
        ]);


    /*
    =====================================================
    TEMPLATE
    =====================================================
    */

    const templateClass =
        `id-card-template-${design.template}`;


    /*
    =====================================================
    FIELD VALUE
    =====================================================
    */

    const getFieldValue = (
        field
    ) => {

        return (
            field.defaultValue ||
            field.placeholder ||
            field.label
        );
    };


    /*
    =====================================================
    LOGO UPLOAD
    =====================================================
    */

    const handleLogoUpload = (
        event
    ) => {

        const file =
            event.target.files?.[0];

        if (!file) return;

        setLogoError("");

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            setLogoError(
                "Please select an image file."
            );

            return;
        }

        if (
            file.size >
            2 * 1024 * 1024
        ) {

            setLogoError(
                "Logo must be smaller than 2MB."
            );

            return;
        }

        const reader =
            new FileReader();

        reader.onload = () => {

            setDesign((prev) => ({

                ...prev,

                logo: {

                    ...prev.logo,

                    data:
                        reader.result,

                    name:
                        file.name,

                    visible: true,
                },

            }));

            showToast(
                "Organization logo updated"
            );
        };

        reader.readAsDataURL(file);
    };


    /*
    =====================================================
    BACKGROUND UPLOAD
    =====================================================
    */

    const handleBackgroundUpload = (
        event
    ) => {

        const file =
            event.target.files?.[0];

        if (!file) return;

        setBackgroundError("");

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            setBackgroundError(
                "Please select an image file."
            );

            return;
        }

        if (
            file.size >
            4 * 1024 * 1024
        ) {

            setBackgroundError(
                "Background image must be smaller than 4MB."
            );

            return;
        }

        const reader =
            new FileReader();

        reader.onload = () => {

            setDesign((prev) => ({

                ...prev,

                backgroundImage: {

                    ...prev.backgroundImage,

                    data:
                        reader.result,

                    name:
                        file.name,

                    visible: true,
                },

            }));

            showToast(
                "Background image updated"
            );
        };

        reader.readAsDataURL(file);
    };


    /*
    =====================================================
    REMOVE LOGO
    =====================================================
    */

    const removeLogo = () => {

        setDesign((prev) => ({

            ...prev,

            logo: {

                ...prev.logo,

                data: null,

                name: "",
            },

        }));

        showToast(
            "Logo removed"
        );
    };


    /*
    =====================================================
    REMOVE BACKGROUND
    =====================================================
    */

    const removeBackground = () => {

        setDesign((prev) => ({

            ...prev,

            backgroundImage: {

                ...prev.backgroundImage,

                data: null,

                name: "",
            },

        }));

        showToast(
            "Background removed"
        );
    };


    /*
    =====================================================
    NAVIGATION
    =====================================================
    */

    const handleBack = () => {

        window.location.href =
            "/create-form";
    };


    const handleNext = () => {

        localStorage.setItem(
            DESIGN_STORAGE_KEY,
            JSON.stringify(design)
        );

        showToast(
            "Design saved"
        );

        setTimeout(() => {

            window.location.href =
                "/id-card-demo";

        }, 350);
    };


    /*
    =====================================================
    RENDER
    =====================================================
    */

    return (
        <>
            <Sidebar
                activePage="design"
            />

            <main className="main">

                <Topbar />

                <div className="content">

                    {/* BREADCRUMB */}

                    <div className="breadcrumb">

                        <span>
                            Dashboard
                        </span>

                        <span>/</span>

                        <span>
                            Create ID Card
                        </span>

                        <span>/</span>

                        <strong>
                            Design
                        </strong>

                    </div>


                    {/* HEADER */}

                    <div className="page-header">

                        <div>

                            <h1 className="page-title">
                                Design ID Card
                            </h1>

                            <p className="page-subtitle">
                                Customize your ID card
                                and arrange your fields
                                exactly how you want.
                            </p>

                        </div>

                    </div>


                    {/* STEPS */}

                    <div className="steps">

                        <div className="step completed">

                            <div className="step-number">
                                ✓
                            </div>

                            <div className="step-label">
                                Create Form
                            </div>

                        </div>

                        <div className="step-line completed" />

                        <div className="step active">

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


                    {/* WORKSPACE */}

                    <div className="design-workspace">


                        {/* =================================================
                            LEFT SETTINGS
                        ================================================= */}

                        <aside className="settings-panel">


                            {/* TEMPLATE */}

                            <section className="setting-section">

                                <div className="setting-title">
                                    Template
                                </div>

                                <div className="template-grid">

                                    {[
                                        "modern",
                                        "classic",
                                        "minimal",
                                    ].map(
                                        (
                                            template
                                        ) => (

                                            <button
                                                key={
                                                    template
                                                }
                                                type="button"
                                                className={
                                                    design.template ===
                                                    template
                                                        ? "template-option active"
                                                        : "template-option"
                                                }
                                                onClick={() =>
                                                    updateDesign(
                                                        {
                                                            template,
                                                        }
                                                    )
                                                }
                                            >

                                                <span
                                                    className={`template-mini ${template}`}
                                                />

                                                <span>
                                                    {template
                                                        .charAt(
                                                            0
                                                        )
                                                        .toUpperCase() +
                                                        template.slice(
                                                            1
                                                        )}
                                                </span>

                                            </button>
                                        )
                                    )}

                                </div>

                            </section>


                            {/* COLOR */}

                            <section className="setting-section">

                                <div className="setting-title">
                                    Primary Color
                                </div>

                                <div className="color-row">

                                    <input
                                        type="color"
                                        value={
                                            design.primaryColor
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateDesign(
                                                {
                                                    primaryColor:
                                                        event
                                                            .target
                                                            .value,
                                                }
                                            )
                                        }
                                    />

                                    <input
                                        type="text"
                                        value={
                                            design.primaryColor
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateDesign(
                                                {
                                                    primaryColor:
                                                        event
                                                            .target
                                                            .value,
                                                }
                                            )
                                        }
                                    />

                                </div>

                            </section>


                            {/* CARD SETTINGS */}

                            <section className="setting-section">

                                <div className="setting-title">
                                    Card Settings
                                </div>

                                <div className="control-row">

                                    <label>
                                        Orientation
                                    </label>

                                    <select
                                        value={
                                            design.orientation
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateDesign(
                                                {
                                                    orientation:
                                                        event
                                                            .target
                                                            .value,
                                                }
                                            )
                                        }
                                    >

                                        <option value="portrait">
                                            Portrait
                                        </option>

                                        <option value="landscape">
                                            Landscape
                                        </option>

                                    </select>

                                </div>


                                <div className="control-row">

                                    <label>
                                        Background
                                    </label>

                                    <select
                                        value={
                                            design.background
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateDesign(
                                                {
                                                    background:
                                                        event
                                                            .target
                                                            .value,
                                                }
                                            )
                                        }
                                    >

                                        <option value="white">
                                            White
                                        </option>

                                        <option value="soft">
                                            Soft
                                        </option>

                                        <option value="light">
                                            Light
                                        </option>

                                    </select>

                                </div>


                                <div className="control-row">

                                    <label>
                                        Card Size
                                    </label>

                                    <select
                                        value={
                                            design.cardSize
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateDesign(
                                                {
                                                    cardSize:
                                                        event
                                                            .target
                                                            .value,
                                                }
                                            )
                                        }
                                    >

                                        <option value="standard">
                                            Standard
                                        </option>

                                        <option value="compact">
                                            Compact
                                        </option>

                                    </select>

                                </div>

                            </section>


                            {/* BACKGROUND IMAGE */}

                            <section className="setting-section">

                                <div className="setting-title">
                                    Background Image
                                </div>

                                <label className="logo-upload">

                                    {design
                                        .backgroundImage
                                        ?.data ? (

                                        <img
                                            src={
                                                design
                                                    .backgroundImage
                                                    .data
                                            }
                                            alt="Background"
                                        />

                                    ) : (

                                        <span>
                                            + Upload Background
                                        </span>

                                    )}

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            handleBackgroundUpload
                                        }
                                    />

                                </label>

                                <div className="logo-help">
                                    JPG, PNG or SVG · Max 4MB
                                </div>

                                {backgroundError && (
                                    <div className="error">
                                        {
                                            backgroundError
                                        }
                                    </div>
                                )}

                                {design
                                    .backgroundImage
                                    ?.data && (

                                    <button
                                        type="button"
                                        className="remove-logo-btn"
                                        onClick={
                                            removeBackground
                                        }
                                    >
                                        Remove Background
                                    </button>

                                )}

                            </section>


                            {/* LOGO */}

                            <section className="setting-section">

                                <div className="setting-title">
                                    Organization Logo
                                </div>

                                <label className="logo-upload">

                                    {design.logo?.data ? (

                                        <img
                                            src={
                                                design
                                                    .logo
                                                    .data
                                            }
                                            alt="Organization logo"
                                        />

                                    ) : (

                                        <span>
                                            + Upload Logo
                                        </span>

                                    )}

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            handleLogoUpload
                                        }
                                    />

                                </label>

                                <div className="logo-help">
                                    PNG, JPG or SVG · Max 2MB
                                </div>

                                {logoError && (
                                    <div className="error">
                                        {logoError}
                                    </div>
                                )}

                                {design.logo?.data && (

                                    <button
                                        type="button"
                                        className="remove-logo-btn"
                                        onClick={
                                            removeLogo
                                        }
                                    >
                                        Remove Logo
                                    </button>

                                )}

                            </section>


                            {/* =================================================
                                DESIGN ELEMENTS
                            ================================================= */}

                            <section className="setting-section">

                                <div className="setting-title">
                                    Design Elements
                                </div>

                                <p className="setting-description">
                                    Select an element to edit
                                    its content or position.
                                </p>


                                {/* ORGANIZATION */}

                                <div
                                    className={
                                        selectedElement ===
                                        "organization"
                                            ? "design-field-item selected"
                                            : "design-field-item"
                                    }
                                    onClick={() =>
                                        setSelectedElement(
                                            "organization"
                                        )
                                    }
                                >

                                    <span className="design-field-info">

                                        <strong>
                                            Organization Name
                                        </strong>

                                        <small>
                                            Text
                                        </small>

                                    </span>

                                </div>


                                {/* LOGO */}

                                {design.logo?.data && (

                                    <div
                                        className={
                                            selectedElement ===
                                            "logo"
                                                ? "design-field-item selected"
                                                : "design-field-item"
                                        }
                                        onClick={() =>
                                            setSelectedElement(
                                                "logo"
                                            )
                                        }
                                    >

                                        <span className="design-field-info">

                                            <strong>
                                                Organization Logo
                                            </strong>

                                            <small>
                                                Image
                                            </small>

                                        </span>

                                    </div>

                                )}

                            </section>


                            {/* =================================================
                                FIELD LAYOUT
                            ================================================= */}

                            <section className="setting-section">

                                <div className="setting-title">
                                    Form Fields
                                </div>

                                <p className="setting-description">
                                    Arrange your fields using
                                    rows and columns.
                                </p>


                                <div className="field-layout-list">

                                    {formFields.length ===
                                    0 ? (

                                        <div className="empty-fields">
                                            No form fields found.
                                            <br />
                                            Create fields in
                                            Step 1.
                                        </div>

                                    ) : (

                                        formFields.map(
                                            (
                                                field,
                                                index
                                            ) => {

                                                const layout =
                                                    design
                                                        .fieldLayout?.[
                                                        field.id
                                                    ] || {
                                                        row:
                                                            index +
                                                            1,
                                                        column: 1,
                                                        width: 1,
                                                    };

                                                return (

                                                    <div
                                                        key={
                                                            field.id
                                                        }
                                                        className="field-layout-item"
                                                    >

                                                        <div className="field-layout-header">

                                                            <div>

                                                                <strong>
                                                                    {
                                                                        field.label
                                                                    }
                                                                </strong>

                                                                <small>
                                                                    {
                                                                        field.type
                                                                    }
                                                                </small>

                                                            </div>


                                                            <div className="field-layout-arrows">

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        moveField(
                                                                            field.id,
                                                                            "up"
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        index ===
                                                                        0
                                                                    }
                                                                >
                                                                    ↑
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        moveField(
                                                                            field.id,
                                                                            "down"
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        index ===
                                                                        formFields.length -
                                                                            1
                                                                    }
                                                                >
                                                                    ↓
                                                                </button>

                                                            </div>

                                                        </div>


                                                        <div className="field-layout-controls">


                                                            {/* ROW */}

                                                            <label>

                                                                <span>
                                                                    Row
                                                                </span>

                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={
                                                                        layout.row
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        updateFieldLayout(
                                                                            field.id,
                                                                            {
                                                                                row:
                                                                                    Math.max(
                                                                                        1,
                                                                                        Number(
                                                                                            event
                                                                                                .target
                                                                                                .value
                                                                                        ) ||
                                                                                            1
                                                                                    ),
                                                                            }
                                                                        )
                                                                    }
                                                                />

                                                            </label>


                                                            {/* COLUMN */}

                                                            <label>

                                                                <span>
                                                                    Column
                                                                </span>

                                                                <select
                                                                    value={
                                                                        layout.column
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        updateFieldLayout(
                                                                            field.id,
                                                                            {
                                                                                column:
                                                                                    Number(
                                                                                        event
                                                                                            .target
                                                                                            .value
                                                                                    ),
                                                                            }
                                                                        )
                                                                    }
                                                                >

                                                                    <option value="1">
                                                                        1
                                                                    </option>

                                                                    <option value="2">
                                                                        2
                                                                    </option>

                                                                </select>

                                                            </label>


                                                            {/* WIDTH */}

                                                            <label>

                                                                <span>
                                                                    Width
                                                                </span>

                                                                <select
                                                                    value={
                                                                        layout.width
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        updateFieldLayout(
                                                                            field.id,
                                                                            {
                                                                                width:
                                                                                    Number(
                                                                                        event
                                                                                            .target
                                                                                            .value
                                                                                    ),
                                                                            }
                                                                        )
                                                                    }
                                                                >

                                                                    <option value="1">
                                                                        Half
                                                                    </option>

                                                                    <option value="2">
                                                                        Full
                                                                    </option>

                                                                </select>

                                                            </label>

                                                        </div>

                                                    </div>
                                                );
                                            }
                                        )

                                    )}

                                </div>

                            </section>

                        </aside>


                        {/* =================================================
                            PREVIEW
                        ================================================= */}

                        <section className="preview-panel">


                            <div className="preview-panel-header">

                                <div>

                                    <strong>
                                        ID Card Preview
                                    </strong>

                                    <span>
                                        Preview your field
                                        layout in real time.
                                    </span>

                                </div>


                                <div className="zoom-controls">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateDesign(
                                                {
                                                    zoom:
                                                        Math.max(
                                                            0.6,
                                                            Number(
                                                                (
                                                                    design.zoom -
                                                                    0.1
                                                                ).toFixed(
                                                                    1
                                                                )
                                                            )
                                                        )
                                                }
                                            )
                                        }
                                    >
                                        −
                                    </button>

                                    <span>
                                        {Math.round(
                                            design.zoom *
                                                100
                                        )}
                                        %
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateDesign(
                                                {
                                                    zoom:
                                                        Math.min(
                                                            1.5,
                                                            Number(
                                                                (
                                                                    design.zoom +
                                                                    0.1
                                                                ).toFixed(
                                                                    1
                                                                )
                                                            )
                                                        )
                                                }
                                            )
                                        }
                                    >
                                        +
                                    </button>

                                </div>

                            </div>


                            {/* CANVAS */}

                            <div className="canvas">

                                <div
                                    className="id-card-canvas-wrapper"
                                    style={{
                                        transform:
                                            `scale(${design.zoom})`,
                                    }}
                                >

                                    <div
                                        className={`id-card ${templateClass}`}
                                        style={{
                                            width:
                                                `${cardDimensions.width}px`,

                                            height:
                                                `${cardDimensions.height}px`,

                                            background:
                                                design.background ===
                                                "soft"
                                                    ? "#f8fafc"
                                                    : design.background ===
                                                        "light"
                                                    ? "#f1f5f9"
                                                    : "#ffffff",
                                        }}
                                    >


                                        {/* BACKGROUND IMAGE */}

                                        {design
                                            .backgroundImage
                                            ?.data &&
                                            design
                                                .backgroundImage
                                                .visible !==
                                                false && (

                                                <img
                                                    src={
                                                        design
                                                            .backgroundImage
                                                            .data
                                                    }
                                                    alt=""
                                                    className="id-card-background-image"
                                                    style={{
                                                        opacity:
                                                            design
                                                                .backgroundImage
                                                                .opacity,
                                                    }}
                                                />

                                            )}


                                        {/* COLOR BAR */}

                                        <div
                                            className="id-card-color-bar"
                                            style={{
                                                background:
                                                    design.primaryColor,
                                            }}
                                        />


                                        {/* LOGO */}

                                        {design.logo
                                            ?.data &&
                                            design.logo
                                                .visible !==
                                                false && (

                                                <img
                                                    src={
                                                        design
                                                            .logo
                                                            .data
                                                    }
                                                    alt="Organization"
                                                    className={
                                                        selectedElement ===
                                                        "logo"
                                                            ? "id-card-logo selected"
                                                            : "id-card-logo"
                                                    }
                                                    onClick={() =>
                                                        setSelectedElement(
                                                            "logo"
                                                        )
                                                    }
                                                    style={{
                                                        left:
                                                            `${design.logo.x}px`,

                                                        top:
                                                            `${design.logo.y}px`,

                                                        width:
                                                            `${design.logo.width}px`,

                                                        height:
                                                            `${design.logo.height}px`,
                                                    }}
                                                />

                                            )}


                                        {/* ORGANIZATION */}

                                        {design.organization
                                            .visible !==
                                            false && (

                                            <div
                                                className={
                                                    selectedElement ===
                                                    "organization"
                                                        ? "id-card-organization selected"
                                                        : "id-card-organization"
                                                }
                                                onClick={() =>
                                                    setSelectedElement(
                                                        "organization"
                                                    )
                                                }
                                                style={{
                                                    left:
                                                        `${design.organization.x}px`,

                                                    top:
                                                        `${design.organization.y}px`,

                                                    color:
                                                        design.template ===
                                                        "minimal"
                                                            ? "#111827"
                                                            : "#ffffff",
                                                }}
                                            >

                                                {
                                                    design
                                                        .organization
                                                        .text
                                                }

                                            </div>

                                        )}


                                        {/* =================================================
                                            FORM FIELD GRID
                                        ================================================= */}

                                        <div className="id-card-fields-grid">

                                            {formFields.map(
                                                (
                                                    field,
                                                    index
                                                ) => {

                                                    const layout =
                                                        design
                                                            .fieldLayout?.[
                                                            field.id
                                                        ] || {
                                                            row:
                                                                index +
                                                                1,
                                                            column: 1,
                                                            width: 1,
                                                        };

                                                    return (

                                                        <div
                                                            key={
                                                                field.id
                                                            }
                                                            className="id-card-grid-field"
                                                            style={{
                                                                gridColumn:
                                                                    layout.width ===
                                                                    2
                                                                        ? "1 / -1"
                                                                        : layout.column,

                                                                gridRow:
                                                                    layout.row,
                                                            }}
                                                        >

                                                            {isMediaField(
                                                                field
                                                            ) ? (

                                                                <div className="id-card-photo">

                                                                    <span>
                                                                        PHOTO
                                                                    </span>

                                                                </div>

                                                            ) : (

                                                                <div className="id-card-normal-field">

                                                                    <span className="id-card-field-label">
                                                                        {
                                                                            field.label
                                                                        }
                                                                    </span>

                                                                    <strong>
                                                                        {getFieldValue(
                                                                            field
                                                                        )}
                                                                    </strong>

                                                                </div>

                                                            )}

                                                        </div>

                                                    );
                                                }
                                            )}

                                        </div>


                                        {/* FOOTER */}

                                        <div className="id-card-footer">
                                            ID CARD
                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* =================================================
                                SELECTED DESIGN ELEMENT
                            ================================================= */}

                            {selectedElement ===
                                "organization" && (

                                <section className="preview-position-editor">

                                    <div className="preview-position-header">

                                        <div>

                                            <strong>
                                                Organization Name
                                            </strong>

                                            <span>
                                                Set the exact position
                                                of this element.
                                            </span>

                                        </div>

                                    </div>


                                    <div className="preview-position-controls">

                                        <div className="preview-position-field">

                                            <label>
                                                X Position
                                            </label>

                                            <div className="position-input">

                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        design
                                                            .organization
                                                            .x
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setDesign(
                                                            (prev) => ({
                                                                ...prev,

                                                                organization:
                                                                    {
                                                                        ...prev.organization,

                                                                        x:
                                                                            Math.max(
                                                                                0,
                                                                                Number(
                                                                                    event
                                                                                        .target
                                                                                        .value
                                                                                ) ||
                                                                                    0
                                                                            ),
                                                                    },
                                                            })
                                                        )
                                                    }
                                                />

                                                <span>
                                                    px
                                                </span>

                                            </div>

                                        </div>


                                        <div className="preview-position-field">

                                            <label>
                                                Y Position
                                            </label>

                                            <div className="position-input">

                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        design
                                                            .organization
                                                            .y
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setDesign(
                                                            (prev) => ({
                                                                ...prev,

                                                                organization:
                                                                    {
                                                                        ...prev.organization,

                                                                        y:
                                                                            Math.max(
                                                                                0,
                                                                                Number(
                                                                                    event
                                                                                        .target
                                                                                        .value
                                                                                ) ||
                                                                                    0
                                                                            ),
                                                                    },
                                                            })
                                                        )
                                                    }
                                                />

                                                <span>
                                                    px
                                                </span>

                                            </div>

                                        </div>


                                        <div className="preview-position-text">

                                            <label>
                                                Organization Text
                                            </label>

                                            <input
                                                className="input"
                                                type="text"
                                                value={
                                                    design
                                                        .organization
                                                        .text
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setDesign(
                                                        (prev) => ({
                                                            ...prev,

                                                            organization:
                                                                {
                                                                    ...prev.organization,

                                                                    text:
                                                                        event
                                                                            .target
                                                                            .value,
                                                                },
                                                        })
                                                    )
                                                }
                                            />

                                        </div>

                                    </div>

                                </section>

                            )}


                            {/* LOGO POSITION */}

                            {selectedElement ===
                                "logo" && (

                                <section className="preview-position-editor">

                                    <div className="preview-position-header">

                                        <div>

                                            <strong>
                                                Organization Logo
                                            </strong>

                                            <span>
                                                Set the exact position
                                                of the logo.
                                            </span>

                                        </div>

                                    </div>


                                    <div className="preview-position-controls">

                                        <div className="preview-position-field">

                                            <label>
                                                X Position
                                            </label>

                                            <div className="position-input">

                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        design.logo.x
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setDesign(
                                                            (prev) => ({
                                                                ...prev,

                                                                logo: {
                                                                    ...prev.logo,

                                                                    x:
                                                                        Math.max(
                                                                            0,
                                                                            Number(
                                                                                event
                                                                                    .target
                                                                                    .value
                                                                            ) ||
                                                                                0
                                                                        ),
                                                                },
                                                            })
                                                        )
                                                    }
                                                />

                                                <span>
                                                    px
                                                </span>

                                            </div>

                                        </div>


                                        <div className="preview-position-field">

                                            <label>
                                                Y Position
                                            </label>

                                            <div className="position-input">

                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        design.logo.y
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setDesign(
                                                            (prev) => ({
                                                                ...prev,

                                                                logo: {
                                                                    ...prev.logo,

                                                                    y:
                                                                        Math.max(
                                                                            0,
                                                                            Number(
                                                                                event
                                                                                    .target
                                                                                    .value
                                                                            ) ||
                                                                                0
                                                                        ),
                                                                },
                                                            })
                                                        )
                                                    }
                                                />

                                                <span>
                                                    px
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </section>

                            )}


                            <div className="design-hint">

                                <strong>
                                    Tip:
                                </strong>{" "}

                                Arrange form fields using
                                rows and columns from the
                                left panel.

                            </div>

                        </section>

                    </div>


                    {/* FOOTER */}

                    <div className="form-footer">

                        <div className="footer-note">
                            Your design is automatically
                            saved.
                        </div>

                        <div className="actions">

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={
                                    handleBack
                                }
                            >
                                Back
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={
                                    handleNext
                                }
                            >
                                Continue to Demo →
                            </button>

                        </div>

                    </div>

                </div>

            </main>


            {toast && (
                <div className="toast">
                    {toast}
                </div>
            )}

        </>
    );
}

export default Design;