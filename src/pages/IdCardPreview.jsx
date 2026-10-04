import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

/* =========================================================
   STORAGE KEYS
========================================================= */

const DESIGN_STORAGE_KEY = "idCardDesign";
const FORM_STORAGE_KEY = "idCardForm";
const DEMO_STORAGE_KEY = "idCardDemoData";

/* =========================================================
   DEFAULT DESIGN
========================================================= */

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


/* =========================================================
   FIELD NORMALIZATION
========================================================= */

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


/* =========================================================
   FIELD TYPE HELPERS
========================================================= */

function isMediaField(field) {

    return [
        "media",
        "image",
        "photo",
        "file"
    ].includes(field.type);

}


function isDateField(field) {

    return [
        "date",
        "dob",
        "birthdate"
    ].includes(field.type);

}


function isTextareaField(field) {

    return [
        "textarea",
        "longtext",
        "address"
    ].includes(field.type);

}


/* =========================================================
   CARD DIMENSIONS
========================================================= */

function getCardDimensions(design) {

    if (
        design.orientation ===
        "landscape"
    ) {

        if (
            design.cardSize ===
            "compact"
        ) {

            return {
                width: 360,
                height: 230
            };

        }

        return {
            width: 440,
            height: 280
        };

    }


    if (
        design.cardSize ===
        "compact"
    ) {

        return {
            width: 230,
            height: 360
        };

    }


    return {
        width: 280,
        height: 440
    };

}


/* =========================================================
   PREVIEW COMPONENT
========================================================= */

function IdCardPreview() {

    const [formFields, setFormFields] =
        useState([]);

    const [design, setDesign] =
        useState(DEFAULT_DESIGN);

    const [demoData, setDemoData] =
        useState({});

    const [activeSide, setActiveSide] =
        useState("front");

    const [zoom, setZoom] =
        useState(1);

    const [toast, setToast] =
        useState("");


    /* =====================================================
       LOAD DATA
    ===================================================== */

    useEffect(() => {

        try {

            const savedForm =
                JSON.parse(
                    localStorage.getItem(
                        FORM_STORAGE_KEY
                    )
                );

            const savedDesign =
                JSON.parse(
                    localStorage.getItem(
                        DESIGN_STORAGE_KEY
                    )
                );

            const savedDemo =
                JSON.parse(
                    localStorage.getItem(
                        DEMO_STORAGE_KEY
                    )
                );


            /* =============================================
               FORM FIELDS
            ============================================= */

            if (
                Array.isArray(
                    savedForm
                )
            ) {

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
                savedForm &&
                Array.isArray(
                    savedForm.fields
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


            /* =============================================
               DESIGN
            ============================================= */

            if (
                savedDesign &&
                typeof savedDesign ===
                    "object"
            ) {

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


                if (
                    mergedDesign.sides ===
                    2
                ) {

                    setActiveSide(
                        mergedDesign.previewSide ===
                            "back"
                            ? "back"
                            : "front"
                    );

                }

            }


            /* =============================================
               DEMO DATA
            ============================================= */

            if (
                savedDemo &&
                typeof savedDemo ===
                    "object"
            ) {

                setDemoData(
                    savedDemo
                );

            }

        } catch (error) {

            console.error(
                "Failed to load ID card preview data:",
                error
            );

        }

    }, []);


    /* =====================================================
       CARD DIMENSIONS
    ===================================================== */

    const cardDimensions =
        useMemo(
            () =>
                getCardDimensions(
                    design
                ),
            [design]
        );


    /* =====================================================
       TEMPLATE
    ===================================================== */

    const templateClass =
        design.template ||
        "modern";


    /* =====================================================
       ACTIVE FIELD LAYOUT
    ===================================================== */

    const activeFieldLayout =
        useMemo(() => {

            if (
                activeSide ===
                "back"
            ) {

                return (
                    design.backFieldLayout ||
                    {}
                );

            }

            return (
                design.frontFieldLayout ||
                design.fieldLayout ||
                {}
            );

        }, [
            activeSide,
            design.backFieldLayout,
            design.frontFieldLayout,
            design.fieldLayout
        ]);


    /* =====================================================
       CHECK FIELD SIDE
    ===================================================== */

    function isFieldVisibleOnSide(
        field
    ) {

        if (
            design.sides ===
            1
        ) {

            return true;

        }

        return (
            (
                design.fieldSides?.[
                    field.id
                ] ||
                "front"
            ) ===
            activeSide
        );

    }


    /* =====================================================
       GET FIELD VALUE
    ===================================================== */

    function getFieldValue(
        field
    ) {

        return (
            demoData[
                field.id
            ] || ""
        );

    }


    /* =====================================================
       DISPLAY FIELD VALUE
    ===================================================== */

    function getDisplayValue(
        field
    ) {

        const value =
            getFieldValue(
                field
            );


        if (!value) {

            return "";

        }


        if (
            isDateField(
                field
            )
        ) {

            try {

                const date =
                    new Date(
                        value
                    );

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

            } catch (
                error
            ) {

                return value;

            }

        }


        if (
            Array.isArray(
                value
            )
        ) {

            return value.join(
                ", "
            );

        }


        return String(
            value
        );

    }


    /* =====================================================
       GET FIELD LAYOUT
    ===================================================== */

    function getFieldLayout(
        field,
        index
    ) {

        return (
            activeFieldLayout[
                field.id
            ] || {

                row:
                    index + 1,

                column:
                    1,

                width:
                    1

            }
        );

    }


    /* =====================================================
       VISIBLE FIELDS
    ===================================================== */

    const visibleFields =
        formFields.filter(
            (field) =>
                isFieldVisibleOnSide(
                    field
                )
        );


    /* =====================================================
       PHOTO FIELD
    ===================================================== */

    const photoField =
        visibleFields.find(
            (field) =>
                isMediaField(
                    field
                )
        );


    /* =====================================================
       INFORMATION FIELDS
    ===================================================== */

    const informationFields =
        visibleFields.filter(
            (field) =>
                !isMediaField(
                    field
                )
        );


    /* =====================================================
       STUDENT NAME FIELD
    ===================================================== */

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


    /* =====================================================
       ZOOM CONTROLS
    ===================================================== */

    function increaseZoom() {

        setZoom(
            (current) =>
                Math.min(
                    Number(
                        (
                            current +
                            0.1
                        ).toFixed(
                            1
                        )
                    ),
                    1.8
                )
        );

    }


    function decreaseZoom() {

        setZoom(
            (current) =>
                Math.max(
                    Number(
                        (
                            current -
                            0.1
                        ).toFixed(
                            1
                        )
                    ),
                    0.5
                )
        );

    }


    function resetZoom() {

        setZoom(1);

    }


    /* =====================================================
       NAVIGATION
    ===================================================== */

    function goDemo() {

        window.location.href =
            "/demo";

    }


    /* =====================================================
       GENERATE ACTION
    ===================================================== */

    function handleGenerate() {

        setToast(
            "ID card is ready for generation."
        );

        setTimeout(
            () => {
                setToast("");
            },
            2500
        );

    }


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="app">

            <Sidebar
                activePage="preview"
            />


            <main className="main">

                <Topbar />


                <section className="content">


                    {/* =====================================
                        BREADCRUMB
                    ===================================== */}

                    <div className="breadcrumb">

                        Create ID Card

                        <span>
                            ›
                        </span>

                        Preview

                    </div>


                    {/* =====================================
                        PAGE HEADER
                    ===================================== */}

                    <div className="page-header">

                        <div>

                            <h1 className="page-title">
                                Preview ID Card
                            </h1>

                            <p className="page-subtitle">
                                Review your final demo card before
                                generating the ID card.
                            </p>

                        </div>

                    </div>


                    {/* =====================================
                        STEP INDICATOR
                    ===================================== */}

                    <div className="steps">

                        <div className="step completed">

                            <span className="step-number">
                                ✓
                            </span>

                            <span>
                                Create Form
                            </span>

                        </div>


                        <div className="step-line" />


                        <div className="step completed">

                            <span className="step-number">
                                ✓
                            </span>

                            <span>
                                Design
                            </span>

                        </div>


                        <div className="step-line" />


                        <div className="step completed">

                            <span className="step-number">
                                ✓
                            </span>

                            <span>
                                Demo
                            </span>

                        </div>


                        <div className="step-line" />


                        <div className="step active">

                            <span className="step-number">
                                4
                            </span>

                            <span>
                                Preview
                            </span>

                        </div>

                    </div>


                    {/* =====================================
                        PREVIEW LAYOUT
                    ===================================== */}

                    <div className="preview-layout">


                        {/* =================================
                            LEFT - FINAL CARD
                        ================================= */}

                        <div className="form-card preview-main-card">


                            <div className="form-card-header">

                                <div>

                                    <h2>
                                        Final Preview
                                    </h2>

                                    <p>
                                        This is how your ID card
                                        will look with the demo data.
                                    </p>

                                </div>


                                <div className="preview-controls">


                                    {/* SIDE SWITCH */}

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


                                    {/* ZOOM */}

                                    <div className="zoom-controls">

                                        <button
                                            type="button"
                                            onClick={
                                                decreaseZoom
                                            }
                                            title="Zoom out"
                                        >
                                            −
                                        </button>

                                        <span>
                                            {
                                                Math.round(
                                                    zoom *
                                                    100
                                                )
                                            }
                                            %
                                        </span>

                                        <button
                                            type="button"
                                            onClick={
                                                increaseZoom
                                            }
                                            title="Zoom in"
                                        >
                                            +
                                        </button>

                                    </div>


                                    <div className="zoom-controls">

                                        <button
                                            type="button"
                                            onClick={
                                                resetZoom
                                            }
                                            title="Reset zoom"
                                            style={{
                                                fontSize:
                                                    "11px",
                                                margin:
                                                    "0px 14px"
                                            }}
                                        >
                                            Reset
                                        </button>

                                    </div>

                                </div>

                            </div>


                            {/* =================================
                                CARD AREA
                            ================================= */}

                            <div className="preview-card-area">

                                <div
                                    className="preview-card-scale"
                                    style={{
                                        width:
                                            cardDimensions.width *
                                            zoom,

                                        height:
                                            cardDimensions.height *
                                            zoom
                                    }}
                                >


                                    {/* =================================
                                        PREMIUM CARD
                                    ================================= */}

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
                                            templateClass
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                        style={{
                                            width:
                                                `${cardDimensions.width}px`,

                                            height:
                                                `${cardDimensions.height}px`,

                                            transform:
                                                `scale(${zoom})`,

                                            transformOrigin:
                                                "top left",

                                            "--card-primary":
                                                design.primaryColor ||
                                                "#2563eb"
                                        }}
                                    >


                                        {/* =================================
                                            BACKGROUND IMAGE
                                        ================================= */}

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
                                                            1
                                                    }}
                                                />

                                            )}


                                        {/* =================================
                                            HEADER
                                        ================================= */}

                                        <div className="premium-card-header">


                                            {/* LOGO */}

                                            {design.logo?.visible !==
                                                false &&
                                                (
                                                    design.logo?.data
                                                        ? (

                                                            <img
                                                                src={
                                                                    design
                                                                        .logo
                                                                        .data
                                                                }
                                                                alt="Organization"
                                                                className="premium-card-logo"
                                                            />

                                                        )
                                                        : (

                                                            <div className="premium-card-logo-placeholder">
                                                                LOGO
                                                            </div>

                                                        )
                                                )}


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


                                            {/* ACCENT */}

                                            <div className="premium-header-accent" />

                                        </div>


                                        {/* =================================
                                            FRONT
                                        ================================= */}

                                        {activeSide ===
                                            "front" && (

                                            <div className="premium-card-front">


                                                {/* IDENTITY AREA */}

                                                <div
                                                    className={[
                                                        "premium-identity-area",
                                                        `photo-position-${
                                                            design
                                                                .photo
                                                                ?.position ||
                                                            "left"
                                                        }`
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
                                                                        `${design.photo?.height || 91}px`
                                                                }}
                                                            >

                                                                {getFieldValue(
                                                                    photoField
                                                                ) ? (

                                                                    <img
                                                                        src={
                                                                            getFieldValue(
                                                                                photoField
                                                                            )
                                                                        }
                                                                        alt={
                                                                            photoField.label
                                                                        }
                                                                        style={{
                                                                            width:
                                                                                `${design.photo?.width || 74}px`,

                                                                            height:
                                                                                `${design.photo?.height || 91}px`
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

                                                            {
                                                                studentNameField
                                                                    ? getDisplayValue(
                                                                          studentNameField
                                                                      )
                                                                    : "Student Name"
                                                            }

                                                        </div>


                                                        <div className="premium-student-role">
                                                            STUDENT
                                                        </div>

                                                    </div>

                                                </div>


                                                {/* =================================
                                                    INFORMATION
                                                ================================= */}

                                                <div className="premium-information-area">

                                                    <div className="premium-section-title">
                                                        STUDENT INFORMATION
                                                    </div>


                                                    <div className="premium-information-grid">

                                                        {informationFields.map((field, index) => {

                                                            const layout =
                                                                activeFieldLayout[field.id] || {
                                                                    row: index + 1,
                                                                    column: 1,
                                                                    width: 1
                                                                };

                                                            const isStudentName =
                                                                studentNameField?.id === field.id;

                                                            if (isStudentName) {
                                                                return null;
                                                            }

                                                            // Count how many fields exist in this row
                                                            const fieldsInSameRow = informationFields.filter(
                                                                (rowField) => {

                                                                    if (studentNameField?.id === rowField.id) {
                                                                        return false;
                                                                    }

                                                                    const rowLayout =
                                                                        activeFieldLayout[rowField.id] || {
                                                                            row:
                                                                                informationFields.indexOf(rowField) +
                                                                                1,
                                                                            column: 1,
                                                                            width: 1
                                                                        };

                                                                    return rowLayout.row === layout.row;
                                                                }
                                                            ).length;

                                                            // Only one field in this row = full width
                                                            const isSingleFieldRow = fieldsInSameRow === 1;

                                                            return (
                                                                <div
                                                                    key={field.id}
                                                                    className="premium-info-item"
                                                                    style={{
                                                                        gridColumn:
                                                                            layout.width === 2 || isSingleFieldRow
                                                                                ? "1 / -1"
                                                                                : layout.column,

                                                                        gridRow: layout.row
                                                                    }}
                                                                >
                                                                    <span className="premium-info-label">
                                                                        {field.label}
                                                                    </span>

                                                                    <strong className="premium-info-value">
                                                                        {getDisplayValue(field)}
                                                                    </strong>
                                                                </div>
                                                            );

                                                        })}

                                                    </div>

                                                </div>


                                                {/* =================================
                                                    FRONT FOOTER
                                                ================================= */}

                                                <div className="premium-card-footer">

                                                    <span>
                                                        ID CARD
                                                    </span>

                                                    <div className="premium-footer-line" />

                                                </div>

                                            </div>

                                        )}


                                        {/* =================================
                                            BACK
                                        ================================= */}

                                        {activeSide ===
                                            "back" &&
                                            design.sides ===
                                                2 && (

                                                <div className="premium-card-back">


                                                    {/* BACK TITLE */}

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


                                                    {/* BACK INFORMATION */}

                                                    <div className="premium-back-information">

                                                        {informationFields.map(
                                                            (
                                                                field,
                                                                index
                                                            ) => {

                                                                const layout =
                                                                    getFieldLayout(
                                                                        field,
                                                                        index
                                                                    );


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
                                                                                ) ||
                                                                                "—"
                                                                            }

                                                                        </strong>

                                                                    </div>

                                                                );

                                                            }
                                                        )}

                                                    </div>


                                                    {/* BACK NOTE */}

                                                    <div className="premium-back-note">

                                                        This card is issued by{" "}

                                                        <strong>
                                                            {
                                                                design
                                                                    .organization
                                                                    ?.text ||
                                                                "the organization"
                                                            }
                                                        </strong>
                                                        .

                                                        <br />

                                                        Please carry this card with you.

                                                    </div>


                                                    {/* SECURITY */}

                                                    <div className="premium-security-area">

                                                        <div className="premium-barcode">

                                                            {Array.from({
                                                                length:
                                                                    28
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


                            {/* =================================
                                CARD INFORMATION
                            ================================= */}

                            <div className="preview-info">

                                <div>

                                    <span>
                                        Template
                                    </span>

                                    <strong>
                                        {
                                            design.template
                                                .charAt(
                                                    0
                                                )
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
                                                .charAt(
                                                    0
                                                )
                                                .toUpperCase() +
                                            design.orientation.slice(
                                                1
                                            )
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Card Size
                                    </span>

                                    <strong>
                                        {
                                            design.cardSize
                                                .charAt(
                                                    0
                                                )
                                                .toUpperCase() +
                                            design.cardSize.slice(
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
                                            formFields.length
                                        }
                                    </strong>

                                </div>


                                {design.sides ===
                                    2 && (

                                    <div>

                                        <span>
                                            Current Side
                                        </span>

                                        <strong>
                                            {
                                                activeSide
                                                    .charAt(
                                                        0
                                                    )
                                                    .toUpperCase() +
                                                activeSide.slice(
                                                    1
                                                )
                                            }
                                        </strong>

                                    </div>

                                )}

                            </div>

                        </div>


                        {/* =================================
                            RIGHT - DEMO DATA
                        ================================= */}

                        <div className="form-card preview-data-card">

                            <div className="form-card-header">

                                <div>

                                    <h2>
                                        Demo Data
                                    </h2>

                                    <p>
                                        Data used in this preview.
                                    </p>

                                </div>

                            </div>


                            <div className="preview-data-body">

                                {formFields.length ===
                                0 ? (

                                    <div className="preview-empty">
                                        No form fields found.
                                    </div>

                                ) : (

                                    formFields.map(
                                        (
                                            field
                                        ) => {

                                            const value =
                                                getFieldValue(
                                                    field
                                                );

                                            return (

                                                <div
                                                    className="preview-data-row"
                                                    key={
                                                        field.id
                                                    }
                                                >

                                                    <div>

                                                        <span>
                                                            {
                                                                field.label
                                                            }
                                                        </span>

                                                        <small>
                                                            ID:{" "}
                                                            {
                                                                field.id
                                                            }
                                                        </small>

                                                    </div>


                                                    <strong>

                                                        {
                                                            isMediaField(
                                                                field
                                                            )
                                                                ? value
                                                                    ? "Photo uploaded"
                                                                    : "No photo"
                                                                : getDisplayValue(
                                                                      field
                                                                  ) ||
                                                                  "—"
                                                        }

                                                    </strong>

                                                </div>

                                            );

                                        }
                                    )

                                )}

                            </div>


                            <div className="preview-ready">

                                <span className="ready-icon">
                                    ✓
                                </span>


                                <div>

                                    <strong>
                                        Ready for generation
                                    </strong>

                                    <p>
                                        Your form, design and demo
                                        data are connected.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =====================================
                        FOOTER ACTIONS
                    ===================================== */}

                    <div className="preview-actions">

                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={
                                goDemo
                            }
                        >
                            ← Back to Demo
                        </button>


                        <button
                            type="button"
                            className="primary-btn"
                            onClick={
                                handleGenerate
                            }
                        >
                            Generate ID Card
                        </button>

                    </div>


                    {/* =====================================
                        PAGE FOOTER
                    ===================================== */}

                    <div className="demo-page-footer">

                        <span>
                            ID Card System
                        </span>

                        <span>
                            Final Preview
                        </span>

                    </div>

                </section>

            </main>


            {/* =============================================
                TOAST
            ============================================= */}

            {toast && (

                <div className="toast">
                    {toast}
                </div>

            )}

        </div>

    );

}

export default IdCardPreview;