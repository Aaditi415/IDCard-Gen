import { useEffect, useMemo, useState } from "react";

/* =========================================================
   STORAGE KEYS
========================================================= */

const DESIGN_STORAGE_KEY = "idCardDesign";
const FORM_STORAGE_KEY = "idCardForm";
const SUBMISSIONS_STORAGE_KEY = "idCardSubmissions";


/* =========================================================
   DEFAULT DESIGN
========================================================= */

const DEFAULT_DESIGN = {
    template: "modern",
    primaryColor: "#2563eb",
    orientation: "portrait",
    background: "white",
    cardSize: "standard",

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

    return {
        id:
            String(
                field?.id ||
                field?.key ||
                field?.name ||
                `field_${index + 1}`
            ),

        type:
            String(
                field?.type ||
                field?.fieldType ||
                "text"
            ).toLowerCase(),

        label:
            String(
                field?.label ||
                field?.title ||
                field?.name ||
                `Field ${index + 1}`
            ),

        name:
            String(
                field?.name ||
                field?.key ||
                field?.id ||
                `field_${index + 1}`
            ),

        placeholder:
            field?.placeholder || "",

        required:
            Boolean(field?.required),

        minLength:
            field?.minLength !== undefined
                ? Number(field.minLength)
                : undefined,

        maxLength:
            field?.maxLength !== undefined
                ? Number(field.maxLength)
                : undefined,

        maxFileSize:
            field?.maxFileSize !== undefined
                ? Number(field.maxFileSize)
                : undefined,

        allowedTypes:
            Array.isArray(field?.allowedTypes)
                ? field.allowedTypes.map(type =>
                      String(type).toLowerCase()
                  )
                : [],

        options:
            Array.isArray(field?.options)
                ? field.options
                : []
    };
}


/* =========================================================
   HELPERS
========================================================= */

function isMediaField(field) {

    return [
        "media",
        "image",
        "photo",
        "file"
    ].includes(field.type);

}


function isTextareaField(field) {

    return [
        "textarea",
        "longtext",
        "address"
    ].includes(field.type);

}


function isDateField(field) {

    return [
        "date",
        "dob",
        "birthdate"
    ].includes(field.type);

}

function isSelectField(field) {
    return [
        "select",
        "dropdown"
    ].includes(field.type);
}

function isCheckboxField(field) {
    return [
        "checkbox",
        "check"
    ].includes(field.type);
}

function getCardDimensions(design) {

    if (design.orientation === "landscape") {

        if (design.cardSize === "compact") {

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


    if (design.cardSize === "compact") {

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
   INITIAL FORM VALUE
========================================================= */

function getInitialValue(field) {
    if (isCheckboxField(field)) {
        return field.options?.length ? [] : false;
    }

    return "";
}


/* =========================================================
   FILE TO DATA URL
========================================================= */

function readFileAsDataURL(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload =
                () => resolve(
                    reader.result
                );

            reader.onerror =
                () =>
                    reject(
                        new Error(
                            "Unable to read file."
                        )
                    );

            reader.readAsDataURL(file);

        }
    );

}


/* =========================================================
   MAIN COMPONENT
========================================================= */

function StudentForm() {

    const [formFields, setFormFields] =
        useState([]);

    const [formName, setFormName] =
        useState("Student ID Card Form");

    const [design, setDesign] =
        useState(DEFAULT_DESIGN);

    const [organization, setOrganization] =
        useState("ORGANIZATION");

    const [values, setValues] =
        useState({});

    const [errors, setErrors] =
        useState({});

    const [submitting, setSubmitting] =
        useState(false);

    const [submitted, setSubmitted] =
        useState(false);

    const [submission, setSubmission] =
        useState(null);

    const [toast, setToast] =
        useState("");

    const [previewSide, setPreviewSide] =
        useState("front");


    /* =====================================================
       LOAD FORM + DESIGN
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


            /* =============================================
               FORM
            ============================================= */

            if (
                savedForm &&
                Array.isArray(
                    savedForm.fields
                )
            ) {

                /*
                 * IMPORTANT:
                 *
                 * Keep the exact form field order.
                 *
                 * This order is used by the student input form.
                 * Card layout is handled separately below.
                 */

                const fields =
                    savedForm.fields.map(
                        (
                            field,
                            index
                        ) =>
                            normalizeField(
                                field,
                                index
                            )
                    );


                setFormFields(
                    fields
                );


                setFormName(
                    savedForm.name ||
                    "Student ID Card Form"
                );


                const initialValues = {};


                fields.forEach(
                    field => {

                        initialValues[
                            field.id
                        ] =
                            getInitialValue(
                                field
                            );

                    }
                );


                setValues(
                    initialValues
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

                    fieldLayout: {
                        ...(savedDesign.fieldLayout || {})
                    },

                    frontFieldLayout: {
                        ...(savedDesign.frontFieldLayout || {})
                    },

                    backFieldLayout: {
                        ...(savedDesign.backFieldLayout || {})
                    },

                    fieldSides: {
                        ...(savedDesign.fieldSides || {})
                    }

                };


                setDesign(
                    mergedDesign
                );


                setOrganization(
                    mergedDesign
                        .organization
                        ?.text ||
                    "ORGANIZATION"
                );


                setPreviewSide(
                    mergedDesign.sides === 2
                        ? (
                            mergedDesign.previewSide ||
                            "front"
                        )
                        : "front"
                );

            }

        } catch (error) {

            console.error(
                "Unable to load student form:",
                error
            );

        }

    }, []);


    /* =====================================================
       HANDLE NORMAL FIELD
    ===================================================== */

    function handleChange(
        field,
        value
    ) {

        setValues(
            current => ({
                ...current,
                [field.id]: value
            })
        );


        setErrors(
            current => {

                const next = {
                    ...current
                };

                delete next[
                    field.id
                ];

                return next;

            }
        );

    }


    /* =====================================================
       HANDLE FILE
    ===================================================== */

    async function handleFileChange(
        field,
        file
    ) {

        if (!file) {

            handleChange(
                field,
                ""
            );

            return;

        }


        const allowedTypes =
            field.allowedTypes || [];


        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        if (
            allowedTypes.length > 0 &&
            !allowedTypes.includes(
                extension
            )
        ) {

            setErrors(
                current => ({
                    ...current,
                    [field.id]:
                        `Only ${allowedTypes.join(
                            ", "
                        )} files are allowed.`
                })
            );

            return;

        }


        if (
            field.maxFileSize &&
            file.size >
                field.maxFileSize *
                    1024 *
                    1024
        ) {

            setErrors(
                current => ({
                    ...current,
                    [field.id]:
                        `File size must be less than ${field.maxFileSize} MB.`
                })
            );

            return;

        }


        try {

            const dataUrl =
                await readFileAsDataURL(
                    file
                );

            handleChange(
                field,
                dataUrl
            );

        } catch (error) {

            setErrors(
                current => ({
                    ...current,
                    [field.id]:
                        "Unable to upload this file."
                })
            );

        }

    }


    /* =====================================================
       VALIDATION
    ===================================================== */


    function validateForm() {

        const nextErrors = {};

        formFields.forEach(field => {

            const value = values[field.id];

            /* =============================================
            REQUIRED
            ============================================= */

            if (field.required) {

                const isEmpty =
                    isCheckboxField(field)
                        ? (
                            Array.isArray(value)
                                ? value.length === 0
                                : !value
                        )
                        : (
                            value === undefined ||
                            value === null ||
                            String(value).trim() === ""
                        );

                if (isEmpty) {

                    nextErrors[field.id] =
                        `${field.label} is required.`;

                    return;
                }
            }


            /* =============================================
            OPTIONAL EMPTY FIELD
            ============================================= */

            if (
                value === undefined ||
                value === null ||
                value === "" ||
                (
                    Array.isArray(value) &&
                    value.length === 0
                )
            ) {

                return;
            }


            /* =============================================
            TEXT LENGTH
            ============================================= */

            if (
                !isMediaField(field) &&
                !isCheckboxField(field) &&
                field.minLength !== undefined &&
                String(value).length <
                    field.minLength
            ) {

                nextErrors[field.id] =
                    `${field.label} must be at least ${field.minLength} characters.`;

                return;
            }


            if (
                !isMediaField(field) &&
                !isCheckboxField(field) &&
                field.maxLength !== undefined &&
                String(value).length >
                    field.maxLength
            ) {

                nextErrors[field.id] =
                    `${field.label} must not exceed ${field.maxLength} characters.`;

                return;
            }


            /* =============================================
            EMAIL
            ============================================= */

            if (field.type === "email") {

                const emailRegex =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (
                    !emailRegex.test(
                        String(value).trim()
                    )
                ) {

                    nextErrors[field.id] =
                        "Please enter a valid email address.";

                    return;
                }
            }


            /* =============================================
            PHONE
            ============================================= */

            if (field.type === "phone") {

                const phoneRegex =
                    /^[0-9+\-\s()]{7,20}$/;

                if (
                    !phoneRegex.test(
                        String(value).trim()
                    )
                ) {

                    nextErrors[field.id] =
                        "Please enter a valid phone number.";

                    return;
                }
            }

        });


        setErrors(nextErrors);

        return (
            Object.keys(nextErrors).length === 0
        );
    }


    /* =====================================================
       SUBMIT
    ===================================================== */

    const handleSubmit = (event) => {
    event.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
        return;
    }

    const submission = {
        id: `submission_${Date.now()}`,

        formId:
            formConfig?.id ||
            "student-form",

        submittedAt:
            new Date().toISOString(),

        data: {
            ...values
        }
    };

    try {

        const existingSubmissions =
            JSON.parse(
                localStorage.getItem(
                    "idCardSubmissions"
                )
            ) || [];

        existingSubmissions.push(
            submission
        );

        localStorage.setItem(
            "idCardSubmissions",
            JSON.stringify(
                existingSubmissions
            )
        );

        /*
         * Keep the latest submitted
         * student available for the
         * existing ID preview.
         */
        localStorage.setItem(
            "idCardLatestSubmission",
            JSON.stringify(
                submission
            )
        );

        /*
         * Existing submitted state
         */
        setSubmitted(true);

    } catch (error) {

        console.error(
            "Failed to save submission:",
            error
        );

    }
};


    /* =====================================================
       RESET
    ===================================================== */

    function handleSubmitAnother() {

        const emptyValues = {};


        formFields.forEach(
            field => {

                emptyValues[
                    field.id
                ] = "";

            }
        );


        setValues(
            emptyValues
        );


        setErrors(
            {}
        );


        setSubmission(
            null
        );


        setSubmitted(
            false
        );


        setPreviewSide(
            "front"
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    /* =====================================================
       DISPLAY VALUE
    ===================================================== */

    function getDisplayValue(
        field
    ) {

        const value =
            submission?.data?.[
                field.id
            ];


        if (!value) {

            return "—";

        }


        if (
            isDateField(
                field
            )
        ) {

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
       CARD FIELD HELPERS
    ===================================================== */

    const visibleFields =
        useMemo(
            () => {

                if (
                    !submission
                ) {

                    return [];

                }

                return formFields;

            },
            [
                formFields,
                submission
            ]
        );


    /*
     * PHOTO
     *
     * Explicitly find Photo first.
     */

    const photoField =
        visibleFields.find(
            field =>
                isMediaField(field) &&
                (
                    field.name
                        ?.toLowerCase()
                        .trim() ===
                    "photo" ||
                    field.label
                        ?.toLowerCase()
                        .trim() ===
                    "photo"
                )
        ) ||
        visibleFields.find(
            field =>
                isMediaField(field) &&
                (
                    field.name
                        ?.toLowerCase()
                        .includes("photo") ||
                    field.label
                        ?.toLowerCase()
                        .includes("photo")
                )
        );


    /*
     * INFORMATION FIELDS
     */

    const informationFields =
        visibleFields.filter(
            field =>
                !isMediaField(field)
        );


    /*
     * STUDENT NAME
     *
     * Only use a field whose actual name/label
     * is "name" or starts with "name".
     */

    const studentNameField =
        informationFields.find(
            field => {

                const label =
                    field.label
                        ?.toLowerCase()
                        .trim();

                const name =
                    field.name
                        ?.toLowerCase()
                        .trim();


                return (
                    label === "name" ||
                    name === "name" ||
                    label === "student name" ||
                    name === "student_name" ||
                    name === "studentname"
                );

            }
        );


    /* =====================================================
       GET FIELD LAYOUT
    ===================================================== */

    function getFieldLayout(
        field,
        index,
        activeFieldLayout
    ) {

        return (
            activeFieldLayout?.[
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
       GET FIELD SIDE
    ===================================================== */

    function getFieldSide(
        field
    ) {

        /*
         * If fieldSides exists and has the field,
         * use that value.
         */

        if (
            design.fieldSides &&
            Object.prototype.hasOwnProperty.call(
                design.fieldSides,
                field.id
            )
        ) {

            return (
                design.fieldSides[
                    field.id
                ] || "front"
            );

        }


        /*
         * Old designs without fieldSides:
         * keep everything on front.
         */

        return "front";

    }


    /* =====================================================
       CARD
    ===================================================== */

    function renderCard() {

        const dimensions =
            getCardDimensions(
                design
            );


        /*
         * If one side only, always show front.
         */

        const activeSide =
            design.sides === 2
                ? previewSide
                : "front";


        /* =================================================
           ACTIVE LAYOUT
        ================================================= */

        const activeFieldLayout =
            activeSide === "front"
                ? (
                    design.frontFieldLayout &&
                    Object.keys(
                        design.frontFieldLayout
                    ).length
                        ? design.frontFieldLayout
                        : (
                            design.fieldLayout ||
                            {}
                        )
                )
                : (
                    design.backFieldLayout &&
                    Object.keys(
                        design.backFieldLayout
                    ).length
                        ? design.backFieldLayout
                        : (
                            design.fieldLayout ||
                            {}
                        )
                );


        /* =================================================
           ACTIVE SIDE FIELDS
        ================================================= */

        const sideFields =
            formFields.filter(
                field =>
                    getFieldSide(
                        field
                    ) ===
                    activeSide
            );


        /* =================================================
           CURRENT PHOTO
        ================================================= */

        const currentPhotoField =
            activeSide === "front"
                ? (
                    sideFields.find(
                        field =>
                            isMediaField(field) &&
                            (
                                field.name
                                    ?.toLowerCase()
                                    .trim() ===
                                "photo" ||
                                field.label
                                    ?.toLowerCase()
                                    .trim() ===
                                "photo"
                            )
                    ) ||
                    sideFields.find(
                        field =>
                            isMediaField(field)
                    )
                )
                : null;


        /* =================================================
           CURRENT INFORMATION FIELDS
        ================================================= */

        const currentInformationFields =
            sideFields.filter(
                field =>
                    !isMediaField(field)
            );


        /* =================================================
           CURRENT STUDENT NAME
        ================================================= */

        const currentStudentNameField =
            activeSide === "front"
                ? currentInformationFields.find(
                      field =>
                          studentNameField?.id ===
                          field.id
                  )
                : null;


        /* =================================================
           ROW COUNTS
        ================================================= */

        const rowCounts = {};


        currentInformationFields.forEach(
            (
                field,
                index
            ) => {

                /*
                 * Student name is already displayed
                 * in identity section.
                 */

                if (
                    currentStudentNameField?.id ===
                    field.id
                ) {

                    return;

                }


                const layout =
                    getFieldLayout(
                        field,
                        index,
                        activeFieldLayout
                    );


                const row =
                    layout.row ||
                    index + 1;


                rowCounts[row] =
                    (
                        rowCounts[row] ||
                        0
                    ) + 1;

            }
        );


        return (

            <div>

                {/* =================================================
                    FRONT / BACK SWITCH
                ================================================= */}

                {design.sides === 2 && (

                    <div className="side-switch" style={{margin:"10px"}}>

                        <button
                            type="button"
                            className={
                                previewSide ===
                                "front"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setPreviewSide(
                                    "front"
                                )
                            }
                        >
                            Front
                        </button>


                        <button
                            type="button"
                            className={
                                previewSide ===
                                "back"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setPreviewSide(
                                    "back"
                                )
                            }
                        >
                            Back
                        </button>

                    </div>

                )}


                {/* =================================================
                    CARD
                ================================================= */}

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
                        design.template ||
                            "modern"
                    ]
                        .filter(Boolean)
                        .join(" ")}
                    style={{
                        width:
                            dimensions.width,

                        height:
                            dimensions.height,

                        "--card-primary":
                            design.primaryColor ||
                            "#2563eb"
                    }}
                >

                    {/* =================================================
                        BACKGROUND
                    ================================================= */}

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
                                        .opacity ??
                                    1
                            }}
                        />

                    )}


                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="premium-card-header">

                        {design.logo?.visible !==
                            false && (

                            design.logo?.data ? (

                                <img
                                    src={
                                        design
                                            .logo
                                            .data
                                    }
                                    alt="Organization"
                                    className="premium-card-logo"
                                />

                            ) : (

                                <div className="premium-card-logo-placeholder">
                                    LOGO
                                </div>

                            )

                        )}


                        {design.organization
                            ?.visible !==
                            false && (

                            <div className="premium-card-heading">

                                <div className="premium-org-name">

                                    {
                                        organization
                                    }

                                </div>


                                <div className="premium-org-subtitle">
                                    STUDENT IDENTITY CARD
                                </div>

                            </div>

                        )}


                        <div className="premium-header-accent" />

                    </div>


                    {/* =================================================
                        FRONT
                    ================================================= */}

                    {activeSide ===
                        "front" && (

                        <div className="premium-card-front">

                            {/* =====================================
                                IDENTITY AREA
                            ===================================== */}

                            <div
                                className={[
                                    "premium-identity-area",
                                    `photo-position-${
                                        design.photo
                                            ?.position ||
                                        "left"
                                    }`
                                ].join(" ")}
                            >

                                {currentPhotoField &&
                                    design.photo
                                        ?.visible !==
                                    false && (

                                    <div
                                        className="premium-photo"
                                        style={{
                                            width:
                                                design
                                                    .photo
                                                    ?.width ||
                                                74,

                                            height:
                                                design
                                                    .photo
                                                    ?.height ||
                                                91
                                        }}
                                    >

                                        {submission?.data?.[
                                            currentPhotoField
                                                .id
                                        ] ? (

                                            <img
                                                src={
                                                    submission
                                                        .data[
                                                        currentPhotoField
                                                            .id
                                                    ]
                                                }
                                                alt="Student"
                                            />

                                        ) : (

                                            <span>
                                                PHOTO
                                            </span>

                                        )}

                                    </div>

                                )}


                                <div className="premium-identity-text">

                                    <div className="premium-student-name">

                                        {currentStudentNameField
                                            ? getDisplayValue(
                                                  currentStudentNameField
                                              )
                                            : "Student Name"}

                                    </div>


                                    <div className="premium-student-role">
                                        STUDENT
                                    </div>

                                </div>

                            </div>


                            {/* =====================================
                                INFORMATION
                            ===================================== */}

                            <div className="premium-information-area">

                                <div className="premium-section-title">
                                    STUDENT INFORMATION
                                </div>


                                <div className="premium-information-grid">

                                    {currentInformationFields.map(
                                        (
                                            field,
                                            index
                                        ) => {

                                            /*
                                             * Student name is already
                                             * displayed above.
                                             */

                                            if (
                                                currentStudentNameField?.id ===
                                                field.id
                                            ) {

                                                return null;

                                            }


                                            const layout =
                                                getFieldLayout(
                                                    field,
                                                    index,
                                                    activeFieldLayout
                                                );


                                            const row =
                                                layout.row ||
                                                index + 1;


                                            const fieldsInRow =
                                                rowCounts[
                                                    row
                                                ] ||
                                                1;


                                            const isSingleFieldRow =
                                                fieldsInRow ===
                                                1;


                                            return (

                                                <div
                                                    key={
                                                        field.id
                                                    }
                                                    className="premium-info-item"
                                                    style={{
                                                        /*
                                                         * IMPORTANT:
                                                         *
                                                         * The grid itself stays
                                                         * two-column.
                                                         *
                                                         * A single field spans
                                                         * both columns.
                                                         */

                                                        gridColumn:
                                                            layout.width ===
                                                                2 ||
                                                            isSingleFieldRow
                                                                ? "1 / -1"
                                                                : layout.column,

                                                        gridRow:
                                                            row
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


                            {/* =====================================
                                FOOTER
                            ===================================== */}

                            <div className="premium-card-footer">

                                <span>
                                    ID CARD
                                </span>

                                <div className="premium-footer-line" />

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        BACK
                    ================================================= */}

                    {activeSide ===
                        "back" && (

                        <div className="premium-card-front">

                            <div className="premium-information-area">

                                <div className="premium-section-title">
                                    STUDENT INFORMATION
                                </div>


                                <div className="premium-information-grid">

                                    {currentInformationFields.map(
                                        (
                                            field,
                                            index
                                        ) => {

                                            const layout =
                                                getFieldLayout(
                                                    field,
                                                    index,
                                                    activeFieldLayout
                                                );


                                            const row =
                                                layout.row ||
                                                index + 1;


                                            /*
                                             * Count only normal
                                             * information fields
                                             * in this row.
                                             */

                                            const fieldsInRow =
                                                rowCounts[
                                                    row
                                                ] ||
                                                1;


                                            const isSingleFieldRow =
                                                fieldsInRow ===
                                                1;


                                            return (

                                                <div
                                                    key={
                                                        field.id
                                                    }
                                                    className="premium-info-item"
                                                    style={{
                                                        gridColumn:
                                                            layout.width ===
                                                                2 ||
                                                            isSingleFieldRow
                                                                ? "1 / -1"
                                                                : layout.column,

                                                        gridRow:
                                                            row
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


                                    {/* =================================
                                        BACK MEDIA FIELDS
                                    ================================= */}

                                    {sideFields
                                        .filter(
                                            field =>
                                                isMediaField(
                                                    field
                                                )
                                        )
                                        .map(
                                            (
                                                field,
                                                index
                                            ) => {

                                                const layout =
                                                    getFieldLayout(
                                                        field,
                                                        index,
                                                        activeFieldLayout
                                                    );


                                                return (

                                                    <div
                                                        key={
                                                            field.id
                                                        }
                                                        className="premium-info-item"
                                                        style={{
                                                            gridColumn:
                                                                "1 / -1",

                                                            gridRow:
                                                                layout.row
                                                        }}
                                                    >

                                                        <span className="premium-info-label">

                                                            {
                                                                field.label
                                                            }

                                                        </span>


                                                        <div className="premium-back-media">

                                                            {submission?.data?.[
                                                                field.id
                                                            ] ? (

                                                                <img
                                                                    src={
                                                                        submission
                                                                            .data[
                                                                            field.id
                                                                        ]
                                                                    }
                                                                    alt={
                                                                        field.label
                                                                    }
                                                                />

                                                            ) : (

                                                                <span>
                                                                    {
                                                                        field.label
                                                                    }
                                                                </span>

                                                            )}

                                                        </div>

                                                    </div>

                                                );

                                            }
                                        )}

                                </div>

                            </div>


                            <div className="premium-card-footer">

                                <span>
                                    ID CARD
                                </span>

                                <div className="premium-footer-line" />

                            </div>

                        </div>

                    )}

                </div>

            </div>

        );

    }


    /* =====================================================
       FORM FIELD RENDER
    ===================================================== */

    function renderField(
        field
    ) {

        const value =
            values[
                field.id
            ] || "";


        const error =
            errors[
                field.id
            ];


        const commonProps = {

            id:
                field.id,

            name:
                field.name,

            value,

            placeholder:
                field.placeholder,

            onChange:
                event =>
                    handleChange(
                        field,
                        event.target.value
                    ),

            className:
                error
                    ? "student-input input-error"
                    : "student-input"

        };


        /* =================================================
           MEDIA
        ================================================= */

        if (
            isMediaField(
                field
            )
        ) {

            return (

                <div className="student-upload">

                    <label
                        htmlFor={
                            field.id
                        }
                        className={
                            error
                                ? "upload-box upload-error"
                                : "upload-box"
                        }
                    >

                        <div className="upload-icon">
                            ↑
                        </div>


                        <strong>

                            {value
                                ? "Change file"
                                : "Upload file"}

                        </strong>


                        <span>

                            {
                                field.allowedTypes
                                    ?.length
                                    ? field.allowedTypes
                                          .map(
                                              type =>
                                                  type.toUpperCase()
                                          )
                                          .join(
                                              ", "
                                          )
                                    : "Image"
                            }


                            {field.maxFileSize
                                ? ` • Max ${field.maxFileSize} MB`
                                : ""}

                        </span>

                    </label>


                    <input
                        id={
                            field.id
                        }
                        type="file"
                        accept={
                            field.allowedTypes
                                ?.map(
                                    type =>
                                        `.${type}`
                                )
                                .join(
                                    ","
                                ) ||
                            "image/*"
                        }
                        onChange={
                            event =>
                                handleFileChange(
                                    field,
                                    event
                                        .target
                                        .files?.[0]
                                )
                        }
                        hidden
                    />


                    {value && (

                        <div className="upload-preview">

                            <img
                                src={value}
                                alt={
                                    field.label
                                }
                            />


                            <span>
                                File selected
                            </span>

                        </div>

                    )}

                </div>

            );

        }


        /* =================================================
           TEXTAREA
        ================================================= */

        if (
            isTextareaField(
                field
            )
        ) {

            return (

                <textarea
                    {...commonProps}
                    rows="4"
                />

            );

        }


        /* =================================================
   SELECT / DROPDOWN
================================================= */

if (isSelectField(field)) {
    return (
        <select
            id={field.id}
            name={field.name}
            value={value}
            onChange={event =>
                handleChange(
                    field,
                    event.target.value
                )
            }
            className={
                error
                    ? "student-input input-error"
                    : "student-input"
            }
        >
            <option value="">
                {field.placeholder || "Select an option"}
            </option>

            {field.options?.map((option, index) => {
                const optionValue =
                    typeof option === "object"
                        ? option.value
                        : option;

                const optionLabel =
                    typeof option === "object"
                        ? option.label
                        : option;

                return (
                    <option
                        key={`${field.id}_${index}`}
                        value={optionValue}
                    >
                        {optionLabel}
                    </option>
                );
            })}
        </select>
    );
}


/* =================================================
   CHECKBOX
================================================= */

if (isCheckboxField(field)) {

    const hasMultipleOptions =
        Array.isArray(field.options) &&
        field.options.length > 0;

    /* ---------------------------------------------
       MULTIPLE CHECKBOX OPTIONS
    --------------------------------------------- */

    if (hasMultipleOptions) {

        const selectedValues =
            Array.isArray(value)
                ? value
                : [];

        return (
            <div className="student-checkbox-group">

                {field.options.map(
                    (option, index) => {

                        const optionValue =
                            typeof option === "object"
                                ? option.value
                                : option;

                        const optionLabel =
                            typeof option === "object"
                                ? option.label
                                : option;

                        const checked =
                            selectedValues.includes(
                                optionValue
                            );

                        return (
                            <label
                                key={`${field.id}_${index}`}
                                className="student-checkbox-item"
                            >
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={event => {

                                        const nextValues =
                                            event.target.checked
                                                ? [
                                                    ...selectedValues,
                                                    optionValue
                                                ]
                                                : selectedValues.filter(
                                                    item =>
                                                        item !==
                                                        optionValue
                                                );

                                        handleChange(
                                            field,
                                            nextValues
                                        );
                                    }}
                                />

                                <span>
                                    {optionLabel}
                                </span>
                            </label>
                        );
                    }
                )}

            </div>
        );
    }


    /* ---------------------------------------------
       SINGLE CHECKBOX
    --------------------------------------------- */

    return (
            <label className="student-checkbox-item">

                <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={event =>
                        handleChange(
                            field,
                            event.target.checked
                        )
                    }
                />

                <span>
                    {field.placeholder ||
                        field.label}
                </span>

            </label>
        );
    }

        /* =================================================
           INPUT TYPE
        ================================================= */

        let inputType =
            "text";


        if (
            field.type ===
            "email"
        ) {

            inputType =
                "email";

        }


        if (
            field.type ===
            "phone"
        ) {

            inputType =
                "tel";

        }


        if (
            isDateField(
                field
            )
        ) {

            inputType =
                "date";

        }


        return (

            <input
                {...commonProps}
                type={
                    inputType
                }
                minLength={
                    field.minLength
                }
                maxLength={
                    field.maxLength
                }
            />

        );

    }


    /* =====================================================
       SUBMITTED SCREEN
    ===================================================== */

    if (submitted) {

        return (

            <div className="student-form-page">

                <div className="student-form-container">

                    <div className="student-success">

                        <div className="success-icon">
                            ✓
                        </div>


                        <h1>
                            Application Submitted
                        </h1>


                        <p>
                            Your information has been
                            submitted successfully.
                        </p>


                        <span className="submission-id">

                            Submission ID:{" "}

                            {
                                submission?.id
                            }

                        </span>

                    </div>


                    <div className="student-card-preview">

                        <div className="student-card-preview-header">

                            <div>

                                <h2>
                                    Your ID Card Preview
                                </h2>


                                <p>
                                    Review your submitted
                                    information.
                                </p>

                            </div>

                        </div>


                        <div className="student-card-preview-body">

                            {renderCard()}

                        </div>

                    </div>


                    <button
                        type="button"
                        className="student-submit another"
                        onClick={
                            handleSubmitAnother
                        }
                    >
                        Submit Another Student
                    </button>

                </div>


                {toast && (

                    <div className="student-toast">
                        {toast}
                    </div>

                )}

            </div>

        );

    }


    /* =====================================================
       MAIN FORM UI
    ===================================================== */

    return (

        <div className="student-form-page">

            <div className="student-form-container">

                {/* =========================================
                    BRAND
                ========================================= */}

                <header className="student-form-header">

                    {design.logo?.data ? (

                        <img
                            src={
                                design.logo.data
                            }
                            alt={
                                organization
                            }
                            className="student-org-logo"
                        />

                    ) : (

                        <div className="student-org-logo-placeholder">
                            LOGO
                        </div>

                    )}


                    <div>

                        <h1>
                            {
                                organization
                            }
                        </h1>


                        <p>
                            Student ID Card Registration
                        </p>

                    </div>

                </header>


                {/* =========================================
                    FORM CARD
                ========================================= */}

                <div className="student-form-card">

                    <div className="student-form-title">

                        <span className="form-step">
                            01
                        </span>


                        <div>

                            <h2>
                                {
                                    formName
                                }
                            </h2>


                            <p>
                                Please enter your details
                                carefully.
                            </p>

                        </div>

                    </div>


                    <form
                        onSubmit={
                            handleSubmit
                        }
                        noValidate
                    >

                        <div className="student-fields">

                            {/*
                             * IMPORTANT:
                             *
                             * Form input order is ALWAYS
                             * savedForm.fields order.
                             *
                             * We DO NOT sort this using
                             * card row/column layout.
                             */}

                            {formFields.map(
                                field => (

                                    <div
                                        className="student-field"
                                        key={
                                            field.id
                                        }
                                    >

                                        <label
                                            htmlFor={
                                                field.id
                                            }
                                        >

                                            {
                                                field.label
                                            }


                                            {field.required && (

                                                <span className="required">
                                                    *
                                                </span>

                                            )}

                                        </label>


                                        {renderField(
                                            field
                                        )}


                                        {errors[
                                            field.id
                                        ] && (

                                            <div className="field-error">

                                                <span>
                                                    !
                                                </span>


                                                {
                                                    errors[
                                                        field.id
                                                    ]
                                                }

                                            </div>

                                        )}

                                    </div>

                                )
                            )}

                        </div>


                        {/* =================================
                            FORM FOOTER
                        ================================= */}

                        <div className="student-form-footer">

                            <p>
                                Your information will be
                                used to create your student
                                ID card.
                            </p>


                            <button
                                type="submit"
                                className="student-submit"
                                disabled={
                                    submitting
                                }
                            >

                                {submitting
                                    ? "Submitting..."
                                    : "Submit & Preview ID Card"}


                                {!submitting && (

                                    <span>
                                        →
                                    </span>

                                )}

                            </button>

                        </div>

                    </form>

                </div>


                <footer className="student-page-footer">

                    <span>
                        Powered by ID Card System
                    </span>


                    <span>
                        Secure Student Registration
                    </span>

                </footer>

            </div>


            {toast && (

                <div className="student-toast">
                    {toast}
                </div>

            )}

        </div>

    );

}


export default StudentForm;
