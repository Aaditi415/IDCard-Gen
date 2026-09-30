import React, { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import "../styles/dataentry.css";


/* =====================================================
   STORAGE
===================================================== */

const FORM_STORAGE_KEY = "idCardForm";
const DESIGN_STORAGE_KEY = "idCardDesign";
const DATA_STORAGE_KEY = "idCardData";


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

    fieldLayout: [],
};


/* =====================================================
   NORMALIZE FIELD
===================================================== */

function normalizeField(field, index) {

    return {
        id:
            field?.id ||
            field?.key ||
            field?.name ||
            `field_${index + 1}`,

        label:
            field?.label ||
            field?.title ||
            field?.name ||
            `Field ${index + 1}`,

        name:
            field?.name ||
            field?.key ||
            field?.id ||
            `field_${index + 1}`,

        type:
            field?.type ||
            field?.fieldType ||
            "text",

        required: Boolean(field?.required),

        placeholder:
            field?.placeholder || "",

        defaultValue:
            field?.defaultValue || "",

        options:
            Array.isArray(field?.options)
                ? field.options
                : [],
    };
}


/* =====================================================
   DATA ENTRY
===================================================== */

export default function DataEntry() {

    const [formFields, setFormFields] = useState([]);

    const [design, setDesign] =
        useState(DEFAULT_DESIGN);

    const [formData, setFormData] =
        useState({});

    const [photoPreview, setPhotoPreview] =
        useState({});


    /* =====================================================
       LOAD FORM + DESIGN + EXISTING DATA
    ===================================================== */

    useEffect(() => {

        try {

            const savedForm =
                JSON.parse(
                    localStorage.getItem(
                        FORM_STORAGE_KEY
                    )
                ) || [];

            const savedDesign =
                JSON.parse(
                    localStorage.getItem(
                        DESIGN_STORAGE_KEY
                    )
                ) || DEFAULT_DESIGN;

            const savedData =
                JSON.parse(
                    localStorage.getItem(
                        DATA_STORAGE_KEY
                    )
                ) || {};


            /* ---------------------------------------------
               NORMALIZE FORM FIELDS
            --------------------------------------------- */

            const normalizedFields =
                Array.isArray(savedForm)
                    ? savedForm.map(
                        normalizeField
                    )
                    : [];


            setFormFields(
                normalizedFields
            );


            /* ---------------------------------------------
               DESIGN
            --------------------------------------------- */

            setDesign({

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

                fields: {
                    ...(savedDesign.fields || {}),
                },

            });


            /* ---------------------------------------------
               INITIAL DATA
            --------------------------------------------- */

            const initialData = {};


            normalizedFields.forEach(
                (field) => {

                    initialData[field.id] =
                        savedData[field.id] ??
                        field.defaultValue ??
                        "";

                }
            );


            setFormData(
                initialData
            );


            /* ---------------------------------------------
               RESTORE IMAGE PREVIEWS
            --------------------------------------------- */

            const images = {};

            normalizedFields.forEach(
                (field) => {

                    if (
                        savedData[field.id] &&
                        isImageType(field.type)
                    ) {

                        images[field.id] =
                            savedData[field.id];

                    }

                }
            );


            setPhotoPreview(images);

        } catch (error) {

            console.error(
                "Failed to load ID card data:",
                error
            );

        }

    }, []);


    /* =====================================================
       SAVE DATA AUTOMATICALLY
    ===================================================== */

    useEffect(() => {

        localStorage.setItem(
            DATA_STORAGE_KEY,
            JSON.stringify(formData)
        );

    }, [formData]);


    /* =====================================================
       HANDLE INPUT
    ===================================================== */

    function handleChange(
        field,
        value
    ) {

        setFormData(
            (previous) => ({
                ...previous,
                [field.id]: value,
            })
        );

    }


    /* =====================================================
       IMAGE TYPE
    ===================================================== */

    function isImageType(type) {

        return [
            "image",
            "photo",
            "file",
            "media",
        ].includes(
            String(type).toLowerCase()
        );

    }


    /* =====================================================
       HANDLE IMAGE
    ===================================================== */

    function handleImageChange(
        field,
        event
    ) {

        const file =
            event.target.files?.[0];

        if (!file) return;


        const reader =
            new FileReader();


        reader.onload = () => {

            const result =
                reader.result;


            setFormData(
                (previous) => ({
                    ...previous,
                    [field.id]: result,
                })
            );


            setPhotoPreview(
                (previous) => ({
                    ...previous,
                    [field.id]: result,
                })
            );

        };


        reader.readAsDataURL(file);

    }


    /* =====================================================
       GET FIELD VALUE
    ===================================================== */

    function getFieldValue(field) {

        return (
            formData[field.id] ??
            field.defaultValue ??
            ""
        );

    }


    /* =====================================================
       CARD DIMENSIONS
    ===================================================== */

    const cardDimensions =
        useMemo(() => {

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
                        height: 230,
                    };

                }

                return {
                    width: 440,
                    height: 280,
                };

            }


            if (
                design.cardSize ===
                "compact"
            ) {

                return {
                    width: 230,
                    height: 360,
                };

            }


            return {
                width: 280,
                height: 440,
            };

        }, [
            design.orientation,
            design.cardSize,
        ]);


    /* =====================================================
       FIELD LAYOUT
    ===================================================== */

    const layoutRows =
        useMemo(() => {

            if (
                Array.isArray(
                    design.fieldLayout
                ) &&
                design.fieldLayout.length
            ) {

                return design.fieldLayout;

            }


            /*
             * Fallback for old design data.
             */

            return formFields.map(
                (field) => [field.id]
            );

        }, [
            design.fieldLayout,
            formFields,
        ]);


    /* =====================================================
       FIND FIELD
    ===================================================== */

    function findField(fieldId) {

        return formFields.find(
            (field) =>
                field.id === fieldId
        );

    }


    /* =====================================================
       RENDER FORM FIELD
    ===================================================== */

    function renderFormField(field) {

        if (!field) return null;


        const value =
            getFieldValue(field);


        const type =
            String(field.type)
                .toLowerCase();


        return (

            <div
                className="data-form-field"
                key={field.id}
            >

                <label>

                    {field.label}

                    {field.required && (
                        <span className="required">
                            *
                        </span>
                    )}

                </label>


                {/* =====================================
                   TEXTAREA
                ===================================== */}

                {type === "textarea" ? (

                    <textarea
                        value={value}
                        placeholder={
                            field.placeholder ||
                            `Enter ${field.label}`
                        }
                        onChange={(event) =>
                            handleChange(
                                field,
                                event.target.value
                            )
                        }
                    />

                ) : type === "select" ? (

                    /* =================================
                       SELECT
                    ================================= */

                    <select
                        value={value}
                        onChange={(event) =>
                            handleChange(
                                field,
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            Select {field.label}
                        </option>


                        {field.options.map(
                            (
                                option,
                                index
                            ) => {

                                const optionValue =
                                    typeof option ===
                                    "object"
                                        ? option.value
                                        : option;

                                const optionLabel =
                                    typeof option ===
                                    "object"
                                        ? option.label
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

                ) : isImageType(type) ? (

                    /* =================================
                       IMAGE
                    ================================= */

                    <div className="image-upload-box">

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                                handleImageChange(
                                    field,
                                    event
                                )
                            }
                        />


                        {photoPreview[field.id] && (

                            <img
                                src={
                                    photoPreview[
                                        field.id
                                    ]
                                }
                                alt={
                                    field.label
                                }
                                className="uploaded-preview"
                            />

                        )}

                    </div>

                ) : (

                    /* =================================
                       NORMAL INPUT
                    ================================= */

                    <input
                        type={
                            type === "number"
                                ? "number"
                                : type === "date"
                                    ? "date"
                                    : "text"
                        }
                        value={value}
                        placeholder={
                            field.placeholder ||
                            `Enter ${field.label}`
                        }
                        onChange={(event) =>
                            handleChange(
                                field,
                                event.target.value
                            )
                        }
                    />

                )}

            </div>

        );

    }


    /* =====================================================
       RENDER CARD FIELD
    ===================================================== */

    function renderCardField(field) {

        if (!field) return null;


        const value =
            getFieldValue(field);


        const fieldDesign =
            design.fields?.[
                field.id
            ] || {};


        const fontSize =
            fieldDesign.fontSize ||
            14;


        const fontWeight =
            fieldDesign.fontWeight ||
            500;


        /* =============================================
           PHOTO
        ============================================= */

        if (
            isImageType(field.type)
        ) {

            return (

                <div
                    className="preview-photo-field"
                    style={{
                        fontSize,
                        fontWeight,
                    }}
                >

                    {value ? (

                        <img
                            src={value}
                            alt={
                                field.label
                            }
                        />

                    ) : (

                        <div className="photo-placeholder">

                            <span>
                                PHOTO
                            </span>

                        </div>

                    )}

                </div>

            );

        }


        /* =============================================
           NORMAL FIELD
        ============================================= */

        return (

            <div
                className="preview-normal-field"
                style={{
                    fontSize,
                    fontWeight,
                }}
            >

                <span className="preview-field-label">

                    {field.label}:

                </span>


                <span className="preview-field-value">

                    {value || "—"}

                </span>

            </div>

        );

    }


    /* =====================================================
       BACK
    ===================================================== */

    function goBack() {

        window.location.href =
            "/design";

    }


    /* =====================================================
       NEXT
    ===================================================== */

    function goToPreview() {

        localStorage.setItem(
            DATA_STORAGE_KEY,
            JSON.stringify(formData)
        );


        window.location.href =
            "/id-card-demo";

    }


    /* =====================================================
       CREATE FORM
    ===================================================== */

    function goToCreateForm() {

        window.location.href =
            "/create-form";

    }


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="app-layout">


            {/* =========================================
               SIDEBAR
            ========================================= */}

            <Sidebar />


            <div className="main-content">


                {/* =====================================
                   TOPBAR
                ===================================== */}

                <Topbar />


                <main className="content">


                    {/* =================================
                       BREADCRUMB
                    ================================= */}

                    <div className="breadcrumb">

                        <span
                            onClick={
                                goToCreateForm
                            }
                        >
                            Create Form
                        </span>


                        <span>/</span>


                        <span
                            onClick={
                                goBack
                            }
                        >
                            Design
                        </span>


                        <span>/</span>


                        <strong>
                            Enter Data
                        </strong>

                    </div>


                    {/* =================================
                       HEADER
                    ================================= */}

                    <div className="page-header">

                        <div>

                            <h1>
                                Enter Data
                            </h1>


                            <p>
                                Fill in the information
                                to generate your ID card.
                            </p>

                        </div>

                    </div>


                    {/* =================================
                       WORKSPACE
                    ================================= */}

                    <div className="data-entry-workspace">


                        {/* =================================
                           LEFT
                        ================================= */}

                        <section
                            className="live-preview-panel"
                        >


                            <div className="panel-header">

                                <div>

                                    <h2>
                                        Live Preview
                                    </h2>

                                    <span>
                                        Updates as you type
                                    </span>

                                </div>

                            </div>


                            <div className="live-preview-scroll">


                                <div
                                    className="card-preview-wrapper"
                                    style={{
                                        width:
                                            cardDimensions.width,
                                        minHeight:
                                            cardDimensions.height,
                                    }}
                                >


                                    <div
                                        className={`id-card-preview template-${design.template}`}
                                        style={{
                                            width:
                                                cardDimensions.width,
                                            height:
                                                cardDimensions.height,
                                            background:
                                                design.background ===
                                                "white"
                                                    ? "#ffffff"
                                                    : design.background,
                                        }}
                                    >


                                        {/* =========================
                                           BACKGROUND
                                        ========================= */}

                                        {design.backgroundImage?.visible &&
                                            design.backgroundImage?.data && (

                                                <img
                                                    src={
                                                        design
                                                            .backgroundImage
                                                            .data
                                                    }
                                                    alt=""
                                                    className="card-background-image"
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
                                           COLOR BAR
                                        ========================= */}

                                        <div
                                            className="card-color-bar"
                                            style={{
                                                background:
                                                    design.primaryColor,
                                            }}
                                        />


                                        {/* =========================
                                           LOGO
                                        ========================= */}

                                        {design.logo?.visible &&
                                            design.logo?.data && (

                                                <img
                                                    src={
                                                        design
                                                            .logo
                                                            .data
                                                    }
                                                    alt="Logo"
                                                    className="card-logo"
                                                    style={{
                                                        left:
                                                            design
                                                                .logo
                                                                .x,
                                                        top:
                                                            design
                                                                .logo
                                                                .y,
                                                        width:
                                                            design
                                                                .logo
                                                                .width,
                                                        height:
                                                            design
                                                                .logo
                                                                .height,
                                                    }}
                                                />

                                            )}


                                        {/* =========================
                                           ORGANIZATION
                                        ========================= */}

                                        {design.organization?.visible && (

                                            <div
                                                className="card-organization"
                                                style={{
                                                    left:
                                                        design
                                                            .organization
                                                            .x,
                                                    top:
                                                        design
                                                            .organization
                                                            .y,
                                                    color:
                                                        design.primaryColor,
                                                }}
                                            >

                                                {
                                                    design
                                                        .organization
                                                        .text
                                                }

                                            </div>

                                        )}


                                        {/* =========================
                                           FIELDS
                                        ========================= */}

                                        <div className="card-fields-layout">

                                            {layoutRows.map(
                                                (
                                                    row,
                                                    rowIndex
                                                ) => {

                                                    const rowFields =
                                                        row
                                                            .map(
                                                                findField
                                                            )
                                                            .filter(
                                                                Boolean
                                                            );


                                                    if (
                                                        !rowFields.length
                                                    ) {
                                                        return null;
                                                    }


                                                    const isFull =
                                                        rowFields.length ===
                                                        1;


                                                    return (

                                                        <div
                                                            className={
                                                                isFull
                                                                    ? "card-field-row full-row"
                                                                    : "card-field-row"
                                                            }
                                                            key={
                                                                rowIndex
                                                            }
                                                        >


                                                            {rowFields.map(
                                                                (
                                                                    field
                                                                ) => {

                                                                    const fieldDesign =
                                                                        design
                                                                            .fields?.[
                                                                            field
                                                                                .id
                                                                        ] ||
                                                                        {};


                                                                    if (
                                                                        fieldDesign.visible ===
                                                                        false
                                                                    ) {
                                                                        return null;
                                                                    }


                                                                    return (

                                                                        <div
                                                                            className={
                                                                                fieldDesign.width ===
                                                                                "full"
                                                                                    ? "card-grid-field full"
                                                                                    : "card-grid-field half"
                                                                            }
                                                                            key={
                                                                                field.id
                                                                            }
                                                                        >

                                                                            {
                                                                                renderCardField(
                                                                                    field
                                                                                )
                                                                            }

                                                                        </div>

                                                                    );

                                                                }
                                                            )}

                                                        </div>

                                                    );

                                                }
                                            )}

                                        </div>


                                        {/* =========================
                                           FOOTER
                                        ========================= */}

                                        <div className="card-footer">

                                            ID CARD

                                        </div>


                                    </div>

                                </div>

                            </div>

                        </section>


                        {/* =================================
                           RIGHT FORM
                        ================================= */}

                        <section
                            className="data-form-panel"
                        >


                            <div className="panel-header">

                                <div>

                                    <h2>
                                        Student Information
                                    </h2>

                                    <span>
                                        Enter the details below
                                    </span>

                                </div>

                            </div>


                            <div className="data-form-scroll">


                                {!formFields.length ? (

                                    <div className="empty-form">

                                        <h3>
                                            No fields found
                                        </h3>


                                        <p>
                                            Go back to Create
                                            Form and add fields
                                            first.
                                        </p>


                                        <button
                                            onClick={
                                                goToCreateForm
                                            }
                                        >
                                            Go to Create Form
                                        </button>

                                    </div>

                                ) : (

                                    <div className="data-form">

                                        {formFields.map(
                                            (field) =>
                                                renderFormField(
                                                    field
                                                )
                                        )}

                                    </div>

                                )}

                            </div>


                            {/* =================================
                               FOOTER
                            ================================= */}

                            <div
                                className="data-form-footer"
                            >


                                <button
                                    className="secondary-btn"
                                    onClick={
                                        goBack
                                    }
                                >
                                    ← Back
                                </button>


                                <button
                                    className="primary-btn"
                                    onClick={
                                        goToPreview
                                    }
                                >
                                    Preview ID Card →
                                </button>


                            </div>


                        </section>


                    </div>


                </main>


            </div>


        </div>

    );

}