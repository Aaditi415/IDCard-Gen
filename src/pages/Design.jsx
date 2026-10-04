import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";


const DESIGN_STORAGE_KEY = "idCardDesign";
const FORM_STORAGE_KEY = "idCardForm";


/* =====================================================
   DEFAULT DESIGN
===================================================== */

const DEFAULT_DESIGN = {
    template: "modern",

    primaryColor: "#2563eb",

    orientation: "portrait",

    background: "white",

    cardSize: "standard",

    zoom: 1,

    /* =================================================
       CARD SIDES
    ================================================= */

    sides: 1,

    previewSide: "front",

    /* =================================================
       PHOTO
    ================================================= */

    photo: {
        visible: true,
        position: "left",
        width: 74,
        height: 91,
    },

    /* =================================================
       LOGO
    ================================================= */

    logo: {
        data: null,
        name: "",
        x: 16,
        y: 13,
        width: 43,
        height: 43,
        visible: true,
    },

    /* =================================================
       BACKGROUND IMAGE
    ================================================= */

    backgroundImage: {
        data: null,
        name: "",
        opacity: 1,
        visible: true,
    },

    /* =================================================
       ORGANIZATION
    ================================================= */

    organization: {
        text: "ORGANIZATION",
        x: 70,
        y: 16,
        visible: true,
    },

    /* =================================================
       OLD FIELD LAYOUT
       Kept for backward compatibility.
    ================================================= */

    fields: {},

    fieldLayout: {},

    /* =================================================
       FRONT / BACK FIELD LAYOUT
    ================================================= */

    frontFieldLayout: {},

    backFieldLayout: {},

    /* =================================================
       FIELD SIDE
    ================================================= */

    fieldSides: {},
};


/* =====================================================
   NORMALIZE FIELD
===================================================== */

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

        defaultValue: field?.defaultValue || "",

        placeholder: field?.placeholder || "",
    };
}


/* =====================================================
   MEDIA FIELD
===================================================== */

function isMediaField(field) {
    return [
        "media",
        "image",
        "photo",
        "file",
    ].includes(field.type);
}


/* =====================================================
   DESIGN
===================================================== */

function Design() {

    const [formFields, setFormFields] = useState([]);

    const [design, setDesign] = useState(
        DEFAULT_DESIGN
    );

    const [selectedElement, setSelectedElement] =
        useState(null);

    const [logoError, setLogoError] =
        useState("");

    const [backgroundError, setBackgroundError] =
        useState("");

    const [toast, setToast] =
        useState("");


    /* =================================================
       LOAD FORM + DESIGN
    ================================================= */

    useEffect(() => {

        /* =============================================
           LOAD FORM
        ============================================= */

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
                Array.isArray(savedForm?.fields)
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


        /* =============================================
           LOAD DESIGN
        ============================================= */

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

                    photo: {
                        ...prev.photo,
                        ...(savedDesign.photo || {}),
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
                }));
            }

        } catch (error) {

            console.error(
                "Failed to load design:",
                error
            );
        }

    }, []);


    /* =================================================
       CREATE DEFAULT FIELD LAYOUT
    ================================================= */

    useEffect(() => {

        if (!formFields.length) {
            return;
        }

        setDesign((prev) => {

            const oldLayout = {
                ...(prev.fieldLayout || {}),
            };

            const frontLayout = {
                ...(prev.frontFieldLayout || {}),
            };

            const backLayout = {
                ...(prev.backFieldLayout || {}),
            };

            const fieldSides = {
                ...(prev.fieldSides || {}),
            };

            let changed = false;


            formFields.forEach(
                (field, index) => {

                    /* =================================
                       BACKWARD COMPATIBILITY
                    ================================= */

                    if (
                        !frontLayout[field.id] &&
                        oldLayout[field.id]
                    ) {

                        frontLayout[field.id] = {
                            ...oldLayout[field.id],
                        };

                        changed = true;
                    }


                    /* =================================
                       DEFAULT FRONT LAYOUT
                    ================================= */

                    if (!frontLayout[field.id]) {

                        frontLayout[field.id] = {
                            row: index + 1,
                            column: 1,
                            width: 1,
                        };

                        changed = true;
                    }


                    /* =================================
                       DEFAULT BACK LAYOUT
                    ================================= */

                    if (!backLayout[field.id]) {

                        backLayout[field.id] = {
                            row: index + 1,
                            column: 1,
                            width: 1,
                        };

                        changed = true;
                    }


                    /* =================================
                       DEFAULT SIDE
                    ================================= */

                    if (!fieldSides[field.id]) {

                        fieldSides[field.id] =
                            "front";

                        changed = true;
                    }

                }
            );


            if (!changed) {
                return prev;
            }


            return {
                ...prev,

                fieldLayout: frontLayout,

                frontFieldLayout:
                    frontLayout,

                backFieldLayout:
                    backLayout,

                fieldSides,
            };

        });

    }, [formFields]);


    /* =================================================
       SAVE DESIGN
    ================================================= */

    useEffect(() => {

        localStorage.setItem(
            DESIGN_STORAGE_KEY,
            JSON.stringify(design)
        );

    }, [design]);


    /* =================================================
       TOAST
    ================================================= */

    const showToast = (message) => {

        setToast(message);

        setTimeout(() => {
            setToast("");
        }, 1800);

    };


    /* =================================================
       UPDATE DESIGN
    ================================================= */

    const updateDesign = (changes) => {

        setDesign((prev) => ({
            ...prev,
            ...changes,
        }));

    };


    /* =================================================
       UPDATE FIELD LAYOUT
    ================================================= */

    const updateFieldLayout = (
        fieldId,
        changes,
        side = "front"
    ) => {

        setDesign((prev) => {

            const layoutKey =
                side === "back"
                    ? "backFieldLayout"
                    : "frontFieldLayout";

            const currentLayout =
                prev[layoutKey] || {};

            const updatedLayout = {
                ...currentLayout,

                [fieldId]: {
                    ...(currentLayout[fieldId] || {
                        row: 1,
                        column: 1,
                        width: 1,
                    }),

                    ...changes,
                },
            };


            return {
                ...prev,

                [layoutKey]:
                    updatedLayout,

                /* Keep old fieldLayout
                   synced with front */

                ...(side === "front"
                    ? {
                        fieldLayout:
                            updatedLayout,
                    }
                    : {}),
            };

        });

    };


    /* =================================================
       UPDATE FIELD SIDE
    ================================================= */

    const updateFieldSide = (
        fieldId,
        side
    ) => {

        setDesign((prev) => ({
            ...prev,

            fieldSides: {
                ...(prev.fieldSides || {}),

                [fieldId]: side,
            },
        }));

        showToast(
            side === "front"
                ? "Field moved to front"
                : "Field moved to back"
        );

    };


    /* =================================================
       MOVE FIELD
    ================================================= */

    const moveField = (
        fieldId,
        direction
    ) => {

        const currentIndex =
            formFields.findIndex(
                (field) =>
                    field.id === fieldId
            );

        if (currentIndex === -1) {
            return;
        }


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


        /* =============================================
           REBUILD ROW POSITIONS
        ============================================= */

        setDesign((prev) => {

            const frontLayout = {
                ...(prev.frontFieldLayout || {}),
            };

            const backLayout = {
                ...(prev.backFieldLayout || {}),
            };


            updatedFields.forEach(
                (field, index) => {

                    if (
                        frontLayout[field.id]
                    ) {

                        frontLayout[field.id] = {
                            ...frontLayout[field.id],

                            row: index + 1,
                        };
                    }


                    if (
                        backLayout[field.id]
                    ) {

                        backLayout[field.id] = {
                            ...backLayout[field.id],

                            row: index + 1,
                        };
                    }

                }
            );


            return {
                ...prev,

                fieldLayout:
                    frontLayout,

                frontFieldLayout:
                    frontLayout,

                backFieldLayout:
                    backLayout,
            };

        });


        showToast(
            direction === "up"
                ? "Field moved up"
                : "Field moved down"
        );

    };


    /* =================================================
       CARD DIMENSIONS
    ================================================= */

    const cardDimensions = useMemo(() => {

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


    /* =================================================
       TEMPLATE
    ================================================= */

    const templateClass = design.template || "modern";


    /* =================================================
       FIELD VALUE
    ================================================= */

    const getFieldValue = (
        field
    ) => {

        if (!field) {
            return "";
        }

        return (
            field.defaultValue ||
            field.placeholder ||
            field.label
        );

    };


    /* =================================================
       LOGO UPLOAD
    ================================================= */

    const handleLogoUpload = (
        event
    ) => {

        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }


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


    /* =================================================
       BACKGROUND UPLOAD
    ================================================= */

    const handleBackgroundUpload = (
        event
    ) => {

        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }


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


    /* =================================================
       REMOVE LOGO
    ================================================= */

    const removeLogo = () => {

        setDesign((prev) => ({
            ...prev,

            logo: {
                ...prev.logo,

                data: null,

                name: "",
            },
        }));

        setSelectedElement(null);

        showToast(
            "Logo removed"
        );

    };


    /* =================================================
       REMOVE BACKGROUND
    ================================================= */

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


    /* =================================================
       CHANGE PREVIEW SIDE
    ================================================= */

    const changePreviewSide = (
        side
    ) => {

        updateDesign({
            previewSide: side,
        });

        setSelectedElement(null);

    };


    /* =================================================
       NAVIGATION
    ================================================= */

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
                "/demo";

        }, 350);

    };


    /* =================================================
       ACTIVE SIDE
    ================================================= */

    const activeSide =
        design.sides === 2
            ? design.previewSide === "back"
                ? "back"
                : "front"
            : "front";


    /* =================================================
       ACTIVE FIELD LAYOUT
    ================================================= */

    const activeFieldLayout =
        activeSide === "back"
            ? design.backFieldLayout || {}
            : design.frontFieldLayout ||
              design.fieldLayout ||
              {};


    /* =================================================
       ACTIVE FIELDS
    ================================================= */

    const visibleFields =
        formFields.filter((field) => {

            if (
                design.sides === 1
            ) {

                return true;
            }


            return (
                (
                    design.fieldSides?.[
                        field.id
                    ] ||
                    "front"
                ) === activeSide
            );

        });


    /* =================================================
       PHOTO FIELD

       IMPORTANT:
       Photo is now completely separated
       from the normal field grid.
    ================================================= */

    const photoField =
        visibleFields.find(
            (field) =>
                isMediaField(field)
        );


    /* =================================================
       NORMAL INFORMATION FIELDS
    ================================================= */

    const informationFields =
        visibleFields.filter(
            (field) =>
                !isMediaField(field)
        );


    /* =================================================
       RENDER
    ================================================= */

    return (
        <>
            <Sidebar
                activePage="design"
            />

            <main className="main">

                <Topbar />


                <div className="content">

                    {/* =================================
                        BREADCRUMB
                    ================================= */}

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


                    {/* =================================
                        HEADER
                    ================================= */}

                    <div className="page-header">

                        <div>

                            <h1 className="page-title">
                                Design ID Card
                            </h1>

                            <p className="page-subtitle">
                                Customize your ID card and
                                arrange your fields exactly
                                how you want.
                            </p>

                        </div>

                    </div>


                    {/* =================================
                        STEPS
                    ================================= */}

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


                    {/* =================================
                        WORKSPACE
                    ================================= */}

                    <div className="design-workspace">


                        {/* =================================
                            LEFT SETTINGS
                        ================================= */}

                        <aside className="settings-panel">


                            {/* =================================
                                TEMPLATE
                            ================================= */}

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
                                        (template) => (

                                            <button
                                                key={template}
                                                type="button"
                                                className={
                                                    design.template ===
                                                    template
                                                        ? "template-option active"
                                                        : "template-option"
                                                }
                                                onClick={() =>
                                                    updateDesign({
                                                        template,
                                                    })
                                                }
                                            >

                                                <span
                                                    className={`template-mini ${template}`}
                                                />

                                                <span>
                                                    {template
                                                        .charAt(0)
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


                            {/* =================================
                                PRIMARY COLOR
                            ================================= */}

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
                                        onChange={(event) =>
                                            updateDesign({
                                                primaryColor:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    />


                                    <input
                                        type="text"
                                        value={
                                            design.primaryColor
                                        }
                                        onChange={(event) =>
                                            updateDesign({
                                                primaryColor:
                                                    event.target
                                                        .value,
                                            })
                                        }
                                    />

                                </div>

                            </section>


                            {/* =================================
                                CARD SETTINGS
                            ================================= */}

                            <section className="setting-section">

                                <div className="setting-title">
                                    Card Settings
                                </div>


                                {/* SIDES */}

                                <div className="control-row">

                                    <label>
                                        Card Sides
                                    </label>

                                    <select
                                        value={
                                            design.sides
                                        }
                                        onChange={(event) => {

                                            const sides =
                                                Number(
                                                    event.target
                                                        .value
                                                );

                                            updateDesign({
                                                sides,
                                                previewSide:
                                                    "front",
                                            });

                                            setSelectedElement(
                                                null
                                            );

                                        }}
                                    >

                                        <option value={1}>
                                            Front Only
                                        </option>

                                        <option value={2}>
                                            Front + Back
                                        </option>

                                    </select>

                                </div>


                                {/* ORIENTATION */}

                                <div className="control-row">

                                    <label>
                                        Orientation
                                    </label>

                                    <select
                                        value={
                                            design.orientation
                                        }
                                        onChange={(event) =>
                                            updateDesign({
                                                orientation:
                                                    event.target
                                                        .value,
                                            })
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


                                {/* BACKGROUND */}

                                <div className="control-row">

                                    <label>
                                        Background
                                    </label>

                                    <select
                                        value={
                                            design.background
                                        }
                                        onChange={(event) =>
                                            updateDesign({
                                                background:
                                                    event.target
                                                        .value,
                                            })
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


                                {/* CARD SIZE */}

                                <div className="control-row">

                                    <label>
                                        Card Size
                                    </label>

                                    <select
                                        value={
                                            design.cardSize
                                        }
                                        onChange={(event) =>
                                            updateDesign({
                                                cardSize:
                                                    event.target
                                                        .value,
                                            })
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


                                {/* PHOTO POSITION */}

                                <div className="control-row">

                                    <label>
                                        Photo Position
                                    </label>

                                    <select
                                        value={design.photo?.position || "left"}
                                        onChange={(event) =>
                                        setDesign((prev) => ({
                                            ...prev,
                                            photo: {
                                            ...prev.photo,
                                            position: event.target.value,
                                            },
                                        }))
                                        }
                                    >
                                        <option value="left">Left</option>
                                        <option value="center">Center</option>
                                        <option value="right">Right</option>
                                    </select>

                                </div>

                            </section>


                            {/* =================================
                                BACKGROUND IMAGE
                            ================================= */}

                            <section className="setting-section">

                                <div className="setting-title">
                                    Background Image
                                </div>


                                <label className="logo-upload">

                                    {design.backgroundImage?.data ? (

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
                                        {backgroundError}
                                    </div>
                                )}


                                {design.backgroundImage?.data && (
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


                            {/* =================================
                                ORGANIZATION LOGO
                            ================================= */}

                            <section className="setting-section">

                                <div className="setting-title">
                                    Organization Logo
                                </div>


                                <label className="logo-upload">

                                    {design.logo?.data ? (

                                        <img
                                            src={
                                                design.logo.data
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


                            {/* =================================
                                DESIGN ELEMENTS
                            ================================= */}

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


                            {/* =================================
                                FORM FIELDS
                            ================================= */}

                            <section className="setting-section">

                                <div className="setting-title">
                                    Form Fields
                                </div>


                                <p className="setting-description">
                                    Arrange your fields and
                                    choose which card side
                                    they appear on.
                                </p>


                                <div className="field-layout-list">

                                    {formFields.length === 0 ? (

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

                                                const fieldSide =
                                                    design
                                                        .fieldSides?.[
                                                        field.id
                                                    ] ||
                                                    "front";


                                                const layout =
                                                    (
                                                        fieldSide ===
                                                        "back"
                                                            ? design
                                                                  .backFieldLayout
                                                            : design
                                                                  .frontFieldLayout
                                                    )?.[
                                                        field.id
                                                    ] ||
                                                    design
                                                        .fieldLayout?.[
                                                        field.id
                                                    ] ||
                                                    {
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

                                                        {/* HEADER */}

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


                                                        {/* SIDE */}

                                                        {design.sides ===
                                                            2 && (

                                                            <div
                                                                className="control-row"
                                                                style={{
                                                                    marginBottom:
                                                                        "9px",
                                                                }}
                                                            >

                                                                <label>
                                                                    Side
                                                                </label>

                                                                <select
                                                                    value={
                                                                        fieldSide
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        updateFieldSide(
                                                                            field.id,
                                                                            event
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                >

                                                                    <option value="front">
                                                                        Front
                                                                    </option>

                                                                    <option value="back">
                                                                        Back
                                                                    </option>

                                                                </select>

                                                            </div>

                                                        )}


                                                        {/* LAYOUT CONTROLS */}

                                                        <div className="field-layout-controls">

                                                            {/* ROW */}

                                                            <label>

                                                                <span>
                                                                    Row
                                                                </span>

                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    max="20"
                                                                    value={
                                                                        layout.row
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        updateFieldLayout(
                                                                            field.id,
                                                                            {
                                                                                row: Math.max(
                                                                                    1,
                                                                                    Number(
                                                                                        event
                                                                                            .target
                                                                                            .value
                                                                                    ) ||
                                                                                        1
                                                                                ),
                                                                            },
                                                                            fieldSide
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
                                                                            },
                                                                            fieldSide
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
                                                                            },
                                                                            fieldSide
                                                                        )
                                                                    }
                                                                >

                                                                    <option value="1">
                                                                        Full
                                                                    </option>
                                                                    
                                                                    <option value="2">
                                                                        Half
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


                        {/* =================================
                            PREVIEW PANEL
                        ================================= */}

                        <section className="preview-panel">


                            {/* =================================
                                PREVIEW HEADER
                            ================================= */}

                            <div className="preview-panel-header">

                                <div>

                                    <strong>
                                        ID Card Preview
                                    </strong>

                                    <span>
                                        Preview your field
                                        layout in realtime.
                                    </span>

                                </div>


                                <div
                                    style={{
                                        display:
                                            "flex",

                                        alignItems:
                                            "center",

                                        gap:
                                            "10px",
                                    }}
                                >

                                    {/* FRONT / BACK */}

                                    {design.sides ===
                                        2 && (

                                        <div
                                            style={{
                                                display:
                                                    "flex",

                                                gap:
                                                    "4px",

                                                border:
                                                    "1px solid var(--border)",

                                                borderRadius:
                                                    "7px",

                                                padding:
                                                    "3px",

                                                background:
                                                    "#fff",
                                            }}
                                        >

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    changePreviewSide(
                                                        "front"
                                                    )
                                                }
                                                style={{
                                                    height:
                                                        "26px",

                                                    padding:
                                                        "0 9px",

                                                    border:
                                                        "0",

                                                    borderRadius:
                                                        "5px",

                                                    cursor:
                                                        "pointer",

                                                    fontFamily:
                                                        "inherit",

                                                    fontSize:
                                                        "10px",

                                                    fontWeight:
                                                        "600",

                                                    background:
                                                        activeSide ===
                                                        "front"
                                                            ? "var(--primary)"
                                                            : "transparent",

                                                    color:
                                                        activeSide ===
                                                        "front"
                                                            ? "#fff"
                                                            : "#4b5563",
                                                }}
                                            >
                                                Front
                                            </button>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    changePreviewSide(
                                                        "back"
                                                    )
                                                }
                                                style={{
                                                    height:
                                                        "26px",

                                                    padding:
                                                        "0 9px",

                                                    border:
                                                        "0",

                                                    borderRadius:
                                                        "5px",

                                                    cursor:
                                                        "pointer",

                                                    fontFamily:
                                                        "inherit",

                                                    fontSize:
                                                        "10px",

                                                    fontWeight:
                                                        "600",

                                                    background:
                                                        activeSide ===
                                                        "back"
                                                            ? "var(--primary)"
                                                            : "transparent",

                                                    color:
                                                        activeSide ===
                                                        "back"
                                                            ? "#fff"
                                                            : "#4b5563",
                                                }}
                                            >
                                                Back
                                            </button>

                                        </div>

                                    )}


                                    {/* ZOOM */}

                                    <div className="zoom-controls">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateDesign({
                                                    zoom: Math.max(
                                                        0.6,
                                                        Number(
                                                            (
                                                                design.zoom -
                                                                0.1
                                                            ).toFixed(
                                                                1
                                                            )
                                                        )
                                                    ),
                                                })
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
                                                updateDesign({
                                                    zoom: Math.min(
                                                        1.5,
                                                        Number(
                                                            (
                                                                design.zoom +
                                                                0.1
                                                            ).toFixed(
                                                                1
                                                            )
                                                        )
                                                    ),
                                                })
                                            }
                                        >
                                            +
                                        </button>

                                    </div>

                                </div>

                            </div>


                            {/* =================================
                                CANVAS
                            ================================= */}

                            <div className="canvas">

                                <div
                                    className="id-card-canvas-wrapper"
                                    style={{
                                        transform:
                                            `scale(${design.zoom})`,
                                    }}
                                >

                                    {/* =================================
                                        PREMIUM CARD
                                    ================================= */}

                                    <div
                                        className={[
                                            "id-card-premium",
                                            design.orientation,
                                            design.cardSize === "compact" ? "compact" : "",
                                            design.background === "soft" ? "background-soft" : "",
                                            design.background === "light" ? "background-light" : "",
                                            templateClass,
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                        style={{
                                            width: `${cardDimensions.width}px`,
                                            height: `${cardDimensions.height}px`,
                                            "--card-primary": design.primaryColor || "#2563eb",
                                        }}
                                    >

                                        {/* =================================
                                            BACKGROUND IMAGE
                                        ================================= */}

                                        {design.backgroundImage?.data &&
                                            design.backgroundImage
                                                .visible !==
                                                false && (

                                                <img
                                                    src={
                                                        design
                                                            .backgroundImage
                                                            .data
                                                    }
                                                    alt=""
                                                    className="premium-background-image"
                                                    style={{
                                                        opacity:
                                                            design
                                                                .backgroundImage
                                                                .opacity,
                                                    }}
                                                />

                                            )}


                                        {/* =================================
                                            PREMIUM CARD HEADER
                                        ================================= */}

                                        <div className="premium-card-header">

                                            {/* LOGO */}

                                            {design.logo?.visible &&
                                            design.logo?.data ? (

                                                <img
                                                    src={
                                                        design
                                                            .logo
                                                            .data
                                                    }
                                                    alt="Organization Logo"
                                                    className="premium-card-logo"
                                                    style={{
                                                        width:
                                                            `${design.logo.width || 43}px`,

                                                        height:
                                                            `${design.logo.height || 43}px`,
                                                    }}
                                                />

                                            ) : (

                                                <div className="premium-card-logo-placeholder">
                                                    LOGO
                                                </div>

                                            )}


                                            {/* ORGANIZATION */}

                                            {design.organization
                                                ?.visible && (

                                                <div className="premium-card-organization">

                                                    <span className="premium-org-name">

                                                        {
                                                            design
                                                                .organization
                                                                ?.text ||
                                                            "ORGANIZATION"
                                                        }

                                                    </span>


                                                    <span className="premium-org-subtitle">

                                                        STUDENT IDENTITY CARD

                                                    </span>

                                                </div>

                                            )}


                                            {/* HEADER ACCENT */}

                                            <div className="premium-header-accent" />

                                        </div>


                                        {/* =================================
                                            FRONT
                                        ================================= */}

                                        {activeSide ===
                                            "front" && (

                                            <div className="premium-card-front">


                                                {/* =================================
                                                    IDENTITY AREA
                                                ================================= */}

                                                <div
                                                    className={`
                                                        premium-identity-area
                                                        photo-position-${design.photo?.position || "left"}
                                                    `}
                                                >

                                                    {/* PHOTO */}

                                                    {design.photo?.visible &&
                                                        photoField && (

                                                        <div className="premium-photo-wrapper">

                                                            <div
                                                                className="premium-photo"
                                                                style={{
                                                                    width:
                                                                        `${design.photo.width || 74}px`,

                                                                    height:
                                                                        `${design.photo.height || 91}px`,
                                                                }}
                                                            >

                                                                <span>
                                                                    PHOTO
                                                                </span>

                                                            </div>

                                                        </div>

                                                    )}


                                                    {/* IDENTITY */}

                                                    <div className="premium-identity-content">

                                                        <div className="premium-student-name">

                                                            {getFieldValue(
                                                                informationFields.find(
                                                                    (
                                                                        field
                                                                    ) =>
                                                                        field.label
                                                                            ?.toLowerCase()
                                                                            .includes(
                                                                                "name"
                                                                            ) ||
                                                                        field.name
                                                                            ?.toLowerCase()
                                                                            .includes(
                                                                                "name"
                                                                            )
                                                                )
                                                            ) ||
                                                                "STUDENT NAME"}

                                                        </div>


                                                        <div className="premium-student-role">

                                                            STUDENT

                                                        </div>

                                                    </div>

                                                </div>


                                                {/* =================================
                                                    INFORMATION AREA
                                                ================================= */}

                                                <div className="premium-information-area">

                                                    <div className="premium-section-title">

                                                        STUDENT INFORMATION

                                                    </div>


                                                    <div className="premium-information-grid">

                                                        {informationFields.map(
                                                            (
                                                                field
                                                            ) => {

                                                                const layout =
                                                                    activeFieldLayout?.[
                                                                        field
                                                                            .id
                                                                    ] ||
                                                                    {
                                                                        row: 1,

                                                                        column: 1,

                                                                        width: 1,
                                                                    };


                                                                const value =
                                                                    getFieldValue(
                                                                        field
                                                                    );


                                                                return (

                                                                    <div
                                                                        key={
                                                                            field.id
                                                                        }
                                                                        className={`
                                                                            premium-info-item
                                                                            ${
                                                                                layout.width ===
                                                                                2
                                                                                    ? "premium-info-full"
                                                                                    : ""
                                                                            }
                                                                        `}
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

                                                                        <span className="premium-info-label">

                                                                            {
                                                                                field.label
                                                                            }

                                                                        </span>


                                                                        <strong className="premium-info-value">

                                                                            {
                                                                                value ||
                                                                                "—"
                                                                            }

                                                                        </strong>

                                                                    </div>

                                                                );

                                                            }
                                                        )}

                                                    </div>

                                                </div>


                                                {/* =================================
                                                    FRONT FOOTER
                                                ================================= */}

                                                <div className="premium-card-footer">

                                                    <span>
                                                        VALID STUDENT IDENTIFICATION
                                                    </span>


                                                    <span className="premium-footer-line" />


                                                    <span>
                                                        ID CARD
                                                    </span>

                                                </div>

                                            </div>

                                        )}


                                        {/* =================================
                                            BACK
                                        ================================= */}

                                        {activeSide ===
                                            "back" && (

                                            <div className="premium-card-back">


                                                {/* BACK TITLE */}

                                                <div className="premium-back-title">

                                                    <span>
                                                        IDENTIFICATION CARD
                                                    </span>

                                                    <small>
                                                        CARD INFORMATION
                                                    </small>

                                                </div>


                                                {/* BACK INFORMATION */}

                                                {informationFields.length >
                                                    0 ? (

                                                    <div className="premium-back-information">

                                                        {informationFields.map(
                                                            (
                                                                field
                                                            ) => (

                                                                <div
                                                                    key={
                                                                        field.id
                                                                    }
                                                                    className="premium-back-item"
                                                                >

                                                                    <span>
                                                                        {
                                                                            field.label
                                                                        }
                                                                    </span>


                                                                    <strong>
                                                                        {
                                                                            getFieldValue(
                                                                                field
                                                                            ) ||
                                                                            "—"
                                                                        }
                                                                    </strong>

                                                                </div>

                                                            )
                                                        )}

                                                    </div>

                                                ) : (

                                                    <div className="premium-empty-back">

                                                        No fields assigned
                                                        to the back side.

                                                    </div>

                                                )}


                                                {/* BACK NOTE */}

                                                <div className="premium-back-note">

                                                    <strong>
                                                        IMPORTANT
                                                    </strong>


                                                    <p>
                                                        This card is
                                                        issued by the
                                                        organization and
                                                        must be carried
                                                        by the student
                                                        while on campus.
                                                    </p>

                                                </div>


                                                {/* SECURITY AREA */}

                                                <div className="premium-security-area">

                                                    <div className="premium-barcode">

                                                        <span />
                                                        <span />
                                                        <span />
                                                        <span />
                                                        <span />
                                                        <span />
                                                        <span />
                                                        <span />
                                                        <span />
                                                        <span />
                                                        <span />
                                                        <span />

                                                    </div>


                                                    <div className="premium-card-number">

                                                        ID • STUDENT

                                                    </div>

                                                </div>


                                                {/* BACK FOOTER */}

                                                <div className="premium-card-footer">

                                                    <span>
                                                        {
                                                            design
                                                                .organization
                                                                ?.text ||
                                                            "ORGANIZATION"
                                                        }
                                                    </span>


                                                    <span>
                                                        STUDENT SERVICES
                                                    </span>

                                                </div>

                                            </div>

                                        )}

                                    </div>

                                </div>

                            </div>


                            {/* =================================
                                ORGANIZATION EDITOR
                            ================================= */}

                            {selectedElement ===
                                "organization" && (

                                <section className="preview-position-editor">

                                    <div className="preview-position-header">

                                        <div>

                                            <strong>
                                                Organization Name
                                            </strong>

                                            <span>
                                                Edit the organization
                                                name used on the card.
                                            </span>

                                        </div>

                                    </div>


                                    <div className="preview-position-controls">

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


                            {/* =================================
                                LOGO EDITOR
                            ================================= */}

                            {selectedElement ===
                                "logo" && (

                                <section className="preview-position-editor">

                                    <div className="preview-position-header">

                                        <div>

                                            <strong>
                                                Organization Logo
                                            </strong>

                                            <span>
                                                Logo size is controlled
                                                by the card design.
                                            </span>

                                        </div>

                                    </div>

                                </section>

                            )}


                            {/* =================================
                                HINT
                            ================================= */}

                            <div className="design-hint">

                                <strong>
                                    Tip:
                                </strong>

                                {" "}

                                {design.sides === 2
                                    ? "Use the Front / Back selector to preview each side and assign fields using the Side option."
                                    : "Arrange form fields using rows and columns from the left panel."}

                            </div>

                        </section>

                    </div>


                    {/* =================================
                        FOOTER
                    ================================= */}

                    <div className="form-footer">

                        <div className="footer-note">
                            Your design is automatically saved.
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


            {/* =================================
                TOAST
            ================================= */}

            {toast && (
                <div className="toast">
                    {toast}
                </div>
            )}

        </>
    );
}


export default Design;