import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

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
        height: 91
    },

    logo: {
        data: null,
        name: "",
        x: 16,
        y: 13,
        width: 43,
        height: 43,
        visible: true
    },

    backgroundImage: {
        data: null,
        name: "",
        opacity: 1,
        visible: true
    },

    organization: {
        text: "ORGANIZATION",
        x: 70,
        y: 16,
        visible: true
    },

    fields: {},
    fieldLayout: {},
    frontFieldLayout: {},
    backFieldLayout: {},
    fieldSides: {}
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
        options: Array.isArray(field?.options)
            ? field.options
            : []
    };
}


/* =========================
   MEDIA FIELD
========================= */

function isMediaField(field) {

    return [
        "media",
        "image",
        "photo",
        "file"
    ].includes(field.type);

}


/* =========================
   DATE FIELD
========================= */

function isDateField(field) {

    return [
        "date",
        "dob",
        "birthdate"
    ].includes(field.type);

}


/* =========================
   TEXTAREA FIELD
========================= */

function isTextareaField(field) {

    return [
        "textarea",
        "longtext",
        "address"
    ].includes(field.type);

}


/* =========================
   DEMO VALUE
========================= */

function getDefaultDemoValue(field, index) {

    if (isMediaField(field)) {
        return "";
    }

    if (field.defaultValue) {
        return field.defaultValue;
    }

    const label =
        field.label.toLowerCase();

    if (label.includes("name")) {
        return "Rahul Sharma";
    }

    if (label.includes("roll")) {
        return "102";
    }

    if (label.includes("department")) {
        return "Computer Science";
    }

    if (
        label.includes("class") ||
        label.includes("course")
    ) {
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

    if (
        field.type === "phone" ||
        field.type === "tel"
    ) {
        return "9876543210";
    }

    if (field.type === "number") {
        return String(index + 1);
    }

    if (isDateField(field)) {
        return "2003-05-12";
    }

    return `Sample ${field.label}`;
}


/* =========================
   DEMO
========================= */

function Demo() {

    const [formFields, setFormFields] =
        useState([]);

    const [design, setDesign] =
        useState(DEFAULT_DESIGN);

    const [demoData, setDemoData] =
        useState({});

    const [activeSide, setActiveSide] =
        useState("front");

    const [toast, setToast] =
        useState("");

    const [toastVisible, setToastVisible] =
        useState(false);


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

        /* =========================
           LOAD FORM
        ========================== */

        try {

            const savedForm =
                JSON.parse(
                    localStorage.getItem(
                        FORM_STORAGE_KEY
                    )
                );

            let fields = [];

            if (Array.isArray(savedForm)) {

                fields = savedForm;

            } else if (
                Array.isArray(
                    savedForm?.fields
                )
            ) {

                fields = savedForm.fields;

            }

            const normalizedFields =
                fields.map(
                    (field, index) =>
                        normalizeField(
                            field,
                            index
                        )
                );

            setFormFields(
                normalizedFields
            );


            /* =========================
               LOAD PREVIOUS DEMO DATA
            ========================== */

            let savedDemo = {};

            try {

                const storedDemo =
                    JSON.parse(
                        localStorage.getItem(
                            DEMO_STORAGE_KEY
                        )
                    );

                if (
                    storedDemo &&
                    typeof storedDemo ===
                        "object"
                ) {
                    savedDemo =
                        storedDemo;
                }

            } catch (error) {

                console.error(
                    "Failed to load demo data:",
                    error
                );

            }


            /* =========================
               CREATE DATA
            ========================== */

            const initialData = {};

            normalizedFields.forEach(
                (field, index) => {

                    initialData[field.id] =
                        savedDemo[field.id] ??
                        getDefaultDemoValue(
                            field,
                            index
                        );

                }
            );

            setDemoData(
                initialData
            );

        } catch (error) {

            console.error(
                "Failed to load form:",
                error
            );

        }


        /* =========================
           LOAD DESIGN
        ========================== */

        try {

            const savedDesign =
                JSON.parse(
                    localStorage.getItem(
                        DESIGN_STORAGE_KEY
                    )
                );

            if (savedDesign) {

                const mergedDesign = {

                    ...DEFAULT_DESIGN,

                    ...savedDesign,

                    logo: {
                        ...DEFAULT_DESIGN.logo,
                        ...(savedDesign.logo || {})
                    },

                    backgroundImage: {
                        ...DEFAULT_DESIGN.backgroundImage,
                        ...(savedDesign.backgroundImage || {})
                    },

                    organization: {
                        ...DEFAULT_DESIGN.organization,
                        ...(savedDesign.organization || {})
                    },

                    photo: {
                        ...DEFAULT_DESIGN.photo,
                        ...(savedDesign.photo || {})
                    },

                    frontFieldLayout: {
                        ...(savedDesign.frontFieldLayout || {})
                    },

                    backFieldLayout: {
                        ...(savedDesign.backFieldLayout || {})
                    },

                    fieldLayout: {
                        ...(savedDesign.fieldLayout || {})
                    },

                    fieldSides: {
                        ...(savedDesign.fieldSides || {})
                    }

                };

                setDesign(
                    mergedDesign
                );

                setActiveSide(
                    mergedDesign.sides === 2
                        ? mergedDesign.previewSide ===
                          "back"
                            ? "back"
                            : "front"
                        : "front"
                );

            }

        } catch (error) {

            console.error(
                "Failed to load design:",
                error
            );

        }

    }, []);


    /* =========================
       SAVE DEMO DATA
    ========================== */

    useEffect(() => {

        if (
            Object.keys(demoData).length
        ) {

            localStorage.setItem(
                DEMO_STORAGE_KEY,
                JSON.stringify(
                    demoData
                )
            );

        }

    }, [demoData]);


    /* =========================
       CARD DIMENSIONS
    ========================== */

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
                            : 280

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
                        : 440

            };

        }, [
            design.orientation,
            design.cardSize
        ]);


    /* =========================
       TEMPLATE
    ========================== */

    const templateClass =
        design.template || "modern";


    /* =========================
       ACTIVE LAYOUT
    ========================== */

    const activeFieldLayout =
        activeSide === "back"
            ? design.backFieldLayout || {}
            : design.frontFieldLayout ||
              design.fieldLayout ||
              {};


    /* =========================
       VISIBLE FIELDS
    ========================== */

    const visibleFields =
        formFields.filter(
            (field) => {

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

            }
        );


    /* =========================
       PHOTO FIELD
    ========================== */

    const photoField =
        visibleFields.find(
            (field) =>
                isMediaField(field)
        );


    /* =========================
       INFORMATION FIELDS
    ========================== */

    const informationFields =
        visibleFields.filter(
            (field) =>
                !isMediaField(field)
        );


    /* =========================
       STUDENT NAME FIELD
    ========================== */

    const studentNameField =
        informationFields.find(
            (field) =>
                field.label
                    .toLowerCase()
                    .includes("name") ||
                field.name
                    .toLowerCase()
                    .includes("name")
        );


    /* =========================
       UPDATE FIELD
    ========================== */

    const updateDemoField = (
        fieldId,
        value
    ) => {

        setDemoData(
            (previous) => ({
                ...previous,
                [fieldId]: value
            })
        );

    };


    /* =========================
       RESET
    ========================== */

    const handleReset = () => {

        const resetData = {};

        formFields.forEach(
            (field, index) => {

                resetData[field.id] =
                    getDefaultDemoValue(
                        field,
                        index
                    );

            }
        );

        setDemoData(
            resetData
        );

        showToast(
            "Demo data reset."
        );

    };


    /* =========================
       PHOTO UPLOAD
    ========================== */

    const handlePhotoUpload = (
        event,
        fieldId
    ) => {

        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            showToast(
                "Please select an image file."
            );

            return;
        }

        if (
            file.size >
            4 * 1024 * 1024
        ) {

            showToast(
                "Photo must be smaller than 4MB."
            );

            return;
        }

        const reader =
            new FileReader();

        reader.onload = () => {

            updateDemoField(
                fieldId,
                reader.result
            );

            showToast(
                "Photo uploaded."
            );

        };

        reader.readAsDataURL(
            file
        );

    };


    /* =========================
       REMOVE PHOTO
    ========================== */

    const removePhoto = (
        fieldId
    ) => {

        updateDemoField(
            fieldId,
            ""
        );

        showToast(
            "Photo removed."
        );

    };


    /* =========================
       GET VALUE
    ========================== */

    const getFieldValue = (
        field
    ) => {

        return (
            demoData[field.id] ||
            ""
        );

    };


    /* =========================
       DISPLAY VALUE
    ========================== */

    const getDisplayValue = (
        field
    ) => {

        const value =
            getFieldValue(field);

        if (!value) {
            return "—";
        }

        if (
            isDateField(field)
        ) {

            const date =
                new Date(value);

            if (
                !Number.isNaN(
                    date.getTime()
                )
            ) {

                return date.toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );

            }

        }

        return value;

    };


    /* =========================
       INPUT
    ========================== */

    const renderFieldInput = (
        field
    ) => {

        const value =
            getFieldValue(field);


        /* =========================
           PHOTO
        ========================== */

        if (
            isMediaField(field)
        ) {

            if (value) {

                return (

                    <div className="demo-photo-preview">

                        <img
                            src={value}
                            alt="Student"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                removePhoto(
                                    field.id
                                )
                            }
                        >
                            Remove
                        </button>

                    </div>

                );

            }

            return (

                <label className="demo-upload">

                    <span className="upload-icon">
                        +
                    </span>

                    <span>
                        Upload Photo
                    </span>

                    <small>
                        JPG, PNG · Max 4MB
                    </small>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                            handlePhotoUpload(
                                event,
                                field.id
                            )
                        }
                    />

                </label>

            );

        }


        /* =========================
           TEXTAREA
        ========================== */

        if (
            isTextareaField(field)
        ) {

            return (

                <textarea
                    className="input demo-textarea"
                    value={value}
                    placeholder={
                        field.placeholder ||
                        `Enter ${field.label}`
                    }
                    rows={3}
                    onChange={(event) =>
                        updateDemoField(
                            field.id,
                            event.target.value
                        )
                    }
                />

            );

        }


        /* =========================
           SELECT
        ========================== */

        if (
            field.type === "select" ||
            field.type === "dropdown"
        ) {

            return (

                <select
                    className="input"
                    value={value}
                    onChange={(event) =>
                        updateDemoField(
                            field.id,
                            event.target.value
                        )
                    }
                >

                    <option value="">
                        Select {field.label}
                    </option>

                    {field.options.map(
                        (option, index) => {

                            const optionValue =
                                typeof option ===
                                "object"
                                    ? option.value ||
                                      option.label ||
                                      option.name
                                    : option;

                            const optionLabel =
                                typeof option ===
                                "object"
                                    ? option.label ||
                                      option.value ||
                                      option.name
                                    : option;

                            return (

                                <option
                                    key={index}
                                    value={
                                        optionValue
                                    }
                                >
                                    {
                                        optionLabel
                                    }
                                </option>

                            );

                        }
                    )}

                </select>

            );

        }


        /* =========================
           DATE
        ========================== */

        if (
            isDateField(field)
        ) {

            return (

                <input
                    type="date"
                    className="input"
                    value={value}
                    onChange={(event) =>
                        updateDemoField(
                            field.id,
                            event.target.value
                        )
                    }
                />

            );

        }


        /* =========================
           DEFAULT INPUT
        ========================== */

        return (

            <input
                type={
                    field.type ===
                    "number"
                        ? "number"
                        : field.type ===
                          "email"
                        ? "email"
                        : field.type ===
                          "phone" ||
                          field.type ===
                          "tel"
                        ? "tel"
                        : "text"
                }
                className="input"
                value={value}
                placeholder={
                    field.placeholder ||
                    `Enter ${field.label}`
                }
                onChange={(event) =>
                    updateDemoField(
                        field.id,
                        event.target.value
                    )
                }
            />

        );

    };


    /* =========================
       NAVIGATION
    ========================== */

    const goDesign = () => {

        window.location.href =
            "/design";

    };


    const goPreview = () => {

        localStorage.setItem(
            DESIGN_STORAGE_KEY,
            JSON.stringify(
                design
            )
        );

        localStorage.setItem(
            DEMO_STORAGE_KEY,
            JSON.stringify(
                demoData
            )
        );

        showToast(
            "Demo data saved."
        );

        setTimeout(() => {

            window.location.href =
                "/idcardpreview";

        }, 350);

    };


    return (

        <div className="app">

            {/* =========================
                 SIDEBAR
            ========================== */}

            <Sidebar activePage="demo" />


            {/* =========================
                 MAIN
            ========================== */}

            <main className="main">

                <Topbar />


                {/* =========================
                     CONTENT
                ========================== */}

                <section className="content">


                    {/* =========================
                         BREADCRUMB
                    ========================== */}

                    <div className="breadcrumb">

                        <button
                            onClick={goDesign}
                        >
                            Create ID Card
                        </button>

                        <span>
                            ›
                        </span>

                        <span>
                            Demo
                        </span>

                    </div>


                    {/* =========================
                         HEADER
                    ========================== */}

                    <h1 className="page-title">
                        Demo ID Card
                    </h1>

                    <p className="page-subtitle">
                        Enter sample information and see how your designed ID card will look with real data.
                    </p>


                    {/* =========================
                         STEPS
                    ========================== */}

                    <div className="steps">

                        <div className="step completed">

                            <div className="step-number">
                                ✓
                            </div>

                            <div className="step-label">
                                Create Form
                            </div>

                        </div>


                        <div className="step-line"></div>


                        <div className="step completed">

                            <div className="step-number">
                                ✓
                            </div>

                            <div className="step-label">
                                Design
                            </div>

                        </div>


                        <div className="step-line"></div>


                        <div className="step active">

                            <div className="step-number">
                                3
                            </div>

                            <div className="step-label">
                                Demo
                            </div>

                        </div>


                        <div className="step-line"></div>


                        <div className="step">

                            <div className="step-number">
                                4
                            </div>

                            <div className="step-label">
                                Preview
                            </div>

                        </div>

                    </div>


                    {/* =========================
                         MAIN LAYOUT
                    ========================== */}

                    <div className="layout demo-layout">


                        {/* =========================
                             DATA FORM
                        ========================== */}

                        <div>

                            <div
                                className="form-card demo-form-card"
                            >

                                <div className="form-card-header">

                                    <div className="demo-card-title-row">

                                        <div>

                                            <h2>
                                                Student Information
                                            </h2>

                                            <p>
                                                Enter sample student data to test your ID card.
                                            </p>

                                        </div>

                                        <button
                                            type="button"
                                            className="reset-demo"
                                            onClick={
                                                handleReset
                                            }
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
                                                Go back to Step 1 and create fields first.
                                            </span>

                                        </div>

                                    ) : (

                                        formFields.map(
                                            (field) => (

                                                <div
                                                    className="field"
                                                    key={
                                                        field.id
                                                    }
                                                >

                                                    <div className="field-label">

                                                        <label>
                                                            {
                                                                field.label
                                                            }

                                                            {field.required && (

                                                                <span className="required">
                                                                    *
                                                                </span>

                                                            )}

                                                        </label>

                                                        <span className="field-hint">
                                                            {
                                                                field.type
                                                            }
                                                        </span>

                                                    </div>


                                                    <div className="input-wrap">

                                                        {renderFieldInput(
                                                            field
                                                        )}

                                                    </div>

                                                </div>

                                            )
                                        )

                                    )}

                                </div>


                                <div className="form-footer">

                                    <div className="footer-note">
                                        This information is only used to test the card design.
                                    </div>

                                    <div className="actions">

                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={
                                                handleReset
                                            }
                                        >
                                            Reset
                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* =========================
                             CARD PREVIEW
                        ========================== */}

                        <aside className="demo-preview-card">

                            <div className="demo-preview-header">

                                <div>

                                    <h3>
                                        Live Preview
                                    </h3>

                                    <span>
                                        Your card updates automatically.
                                    </span>

                                </div>


                                {design.sides === 2 && (

                                    <div className="side-switch">

                                        <button
                                            type="button"
                                            className={
                                                activeSide ===
                                                "front"
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={() =>
                                                setActiveSide(
                                                    "front"
                                                )
                                            }
                                        >
                                            Front
                                        </button>

                                        <button
                                            type="button"
                                            className={
                                                activeSide ===
                                                "back"
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={() =>
                                                setActiveSide(
                                                    "back"
                                                )
                                            }
                                        >
                                            Back
                                        </button>

                                    </div>

                                )}

                            </div>


                            {/* =========================
                                 CARD
                            ========================== */}

                            <div className="demo-card-area">

                                <div className="demo-card-scale">

                                    <div
                                        className={[
                                            "id-card-premium",
                                            design.orientation,
                                            design.cardSize ===
                                            "compact"
                                                ? "compact"
                                                : "",
                                            design.background ===
                                            "soft"
                                                ? "background-soft"
                                                : "",
                                            design.background ===
                                            "light"
                                                ? "background-light"
                                                : "",
                                            templateClass,
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                        style={{
                                            width:
                                                `${cardDimensions.width}px`,

                                            height:
                                                `${cardDimensions.height}px`,

                                            "--card-primary":
                                                design.primaryColor ||
                                                "#2563eb",
                                        }}
                                    >

                                        {/* =========================
                                             BACKGROUND IMAGE
                                        ========================== */}

                                        {design.backgroundImage?.data &&
                                            design.backgroundImage.visible !==
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
                                                                .opacity ??
                                                            1,
                                                    }}
                                                />

                                            )}


                                        {/* =========================
                                             HEADER
                                        ========================== */}

                                        <div className="premium-card-header">

                                            {/* LOGO */}

                                            {design.logo?.visible !==
                                                false &&
                                                (design.logo?.data ? (

                                                    <img
                                                        src={
                                                            design.logo
                                                                .data
                                                        }
                                                        alt="Organization"
                                                        className="premium-card-logo"
                                                    />

                                                ) : (

                                                    <div className="premium-card-logo-placeholder">
                                                        LOGO
                                                    </div>

                                                ))}


                                            {/* ORGANIZATION */}

                                            {design.organization?.visible !==
                                                false && (

                                                <div className="premium-card-heading">

                                                    <div className="premium-org-name">
                                                        {
                                                            design
                                                                .organization
                                                                ?.text ||
                                                            "ORGANIZATION"
                                                        }
                                                    </div>

                                                    <div className="premium-org-subtitle">
                                                        STUDENT IDENTITY CARD
                                                    </div>

                                                </div>

                                            )}


                                            {/* HEADER ACCENT */}

                                            <div className="premium-header-accent" />

                                        </div>


                                        {/* =========================
                                             FRONT
                                        ========================== */}

                                        {activeSide ===
                                            "front" && (

                                            <div className="premium-card-front">

                                                {/* IDENTITY */}

                                                <div
                                                    className={[
                                                        "premium-identity-area",
                                                        `photo-position-${
                                                            design.photo
                                                                ?.position ||
                                                            "left"
                                                        }`,
                                                    ].join(" ")}
                                                >

                                                    {/* PHOTO */}

                                                    {photoField &&
                                                        design.photo
                                                            ?.visible !==
                                                            false && (

                                                            <div
                                                                className="premium-photo"
                                                                style={{
                                                                    width:
                                                                        `${design.photo?.width || 74}px`,

                                                                    height:
                                                                        `${design.photo?.height || 91}px`,
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
                                                                    width:
                                                                        `${design.photo?.width || 74}px`,

                                                                    height:
                                                                        `${design.photo?.height || 91}px`,
                                                                }}
                                                                    />

                                                                ) : (

                                                                    <span>
                                                                        PHOTO
                                                                    </span>

                                                                )}

                                                            </div>

                                                        )}


                                                    {/* STUDENT NAME */}

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


                                                {/* INFORMATION */}

                                                <div className="premium-information-area">

                                                    <div className="premium-section-title">
                                                        STUDENT INFORMATION
                                                    </div>


                                                    <div className="premium-information-grid">

                                                        {informationFields.map(
                                                            (
                                                                field,
                                                                index
                                                            ) => {

                                                                const layout =
                                                                    activeFieldLayout[
                                                                        field
                                                                            .id
                                                                    ] || {
                                                                        row:
                                                                            index +
                                                                            1,

                                                                        column: 1,

                                                                        width: 1
                                                                    };


                                                                const isStudentName =
                                                                    studentNameField?.id ===
                                                                    field.id;


                                                                if (
                                                                    isStudentName
                                                                ) {
                                                                    return null;
                                                                }


                                                                return (

                                                                    <div
                                                                        key={
                                                                            field.id
                                                                        }
                                                                        className="premium-info-item"
                                                                        style={{
                                                                            gridColumn:
                                                                                layout.width ===
                                                                                2
                                                                                    ? "1 / -1"
                                                                                    : layout.column,

                                                                            gridRow:
                                                                                layout.row
                                                                        }}
                                                                    >

                                                                        <span className="premium-info-label">
                                                                            {
                                                                                field.label
                                                                            }
                                                                        </span>

                                                                        <strong className="premium-info-value">
                                                                            {
                                                                                getDisplayValue(
                                                                                    field
                                                                                )
                                                                            }
                                                                        </strong>

                                                                    </div>

                                                                );

                                                            }
                                                        )}

                                                    </div>

                                                </div>


                                                {/* FRONT FOOTER */}

                                                <div className="premium-card-footer">

                                                    <span>
                                                        ID CARD
                                                    </span>

                                                    <div className="premium-footer-line" />

                                                </div>

                                            </div>

                                        )}


                                        {/* =========================
                                             BACK
                                        ========================== */}

                                        {activeSide ===
                                            "back" &&
                                            design.sides ===
                                                2 && (

                                                <div className="premium-card-back">

                                                    {/* TITLE */}

                                                    <div className="premium-back-title">

                                                        <span>
                                                            CARD INFORMATION
                                                        </span>

                                                        <small>
                                                            {
                                                                design
                                                                    .organization
                                                                    ?.text ||
                                                                "ORGANIZATION"
                                                            }
                                                        </small>

                                                    </div>


                                                    {/* INFORMATION */}

                                                    <div className="premium-back-information">

                                                        {informationFields.map(
                                                            (
                                                                field,
                                                                index
                                                            ) => {

                                                                const layout =
                                                                    activeFieldLayout[
                                                                        field
                                                                            .id
                                                                    ] || {
                                                                        row:
                                                                            index +
                                                                            1,

                                                                        column: 1,

                                                                        width: 1
                                                                    };


                                                                return (

                                                                    <div
                                                                        key={
                                                                            field.id
                                                                        }
                                                                        className="premium-info-item"
                                                                        style={{
                                                                            gridColumn:
                                                                                layout.width ===
                                                                                2
                                                                                    ? "1 / -1"
                                                                                    : layout.column,

                                                                            gridRow:
                                                                                layout.row
                                                                        }}
                                                                    >

                                                                        <span className="premium-info-label">
                                                                            {
                                                                                field.label
                                                                            }
                                                                        </span>

                                                                        <strong className="premium-info-value">
                                                                            {
                                                                                getDisplayValue(
                                                                                    field
                                                                                )
                                                                            }
                                                                        </strong>

                                                                    </div>

                                                                );

                                                            }
                                                        )}

                                                    </div>


                                                    {/* NOTE */}

                                                    <div className="premium-back-note">

                                                        This card is issued by{" "}

                                                        <strong>
                                                            {
                                                                design
                                                                    .organization
                                                                    ?.text ||
                                                                "the organization"
                                                            }
                                                        </strong>.

                                                        <br />

                                                        Please carry this card with you.

                                                    </div>


                                                    {/* SECURITY */}

                                                    <div className="premium-security-area">

                                                        <div className="premium-barcode">

                                                            {Array.from({
                                                                length: 28
                                                            }).map(
                                                                (
                                                                    _,
                                                                    index
                                                                ) => (

                                                                    <span
                                                                        key={
                                                                            index
                                                                        }
                                                                        style={{
                                                                            height:
                                                                                index %
                                                                                    4 ===
                                                                                0
                                                                                    ? "18px"
                                                                                    : "12px"
                                                                        }}
                                                                    />

                                                                )
                                                            )}

                                                        </div>

                                                    </div>


                                                    {/* BACK FOOTER */}

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


                            {/* =========================
                                 INFO
                            ========================== */}

                            <div className="demo-preview-info">

                                <div>

                                    <span>
                                        Template
                                    </span>

                                    <strong>
                                        {
                                            design.template
                                                .charAt(0)
                                                .toUpperCase() +
                                            design.template.slice(
                                                1
                                            )
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Orientation
                                    </span>

                                    <strong>
                                        {
                                            design.orientation
                                                .charAt(0)
                                                .toUpperCase() +
                                            design.orientation.slice(
                                                1
                                            )
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Fields
                                    </span>

                                    <strong>
                                        {
                                            visibleFields.length
                                        }
                                    </strong>

                                </div>

                            </div>

                        </aside>

                    </div>


                    {/* =========================
                         FOOTER
                    ========================== */}

                    <div className="form-footer demo-page-footer">

                        <div className="footer-note">
                            Your demo data is saved automatically.
                        </div>

                        <div className="actions">

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={
                                    goDesign
                                }
                            >
                                Back
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={
                                    goPreview
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


            {/* =========================
                 TOAST
            ========================== */}

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

export default Demo;