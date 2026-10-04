import React from "react";


/* =========================================================
   MEDIA FIELD
========================================================= */

function isMediaField(field) {

    return [
        "media",
        "image",
        "photo",
        "file"
    ].includes(field.type);

}


/* =========================================================
   DATE FIELD
========================================================= */

function isDateField(field) {

    return [
        "date",
        "dob",
        "birthdate"
    ].includes(field.type);

}


/* =========================================================
   NORMALIZE FIELD
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
   ID CARD RENDERER
========================================================= */

function IDCardRenderer({

    formFields = [],
    data = {},
    design = {},
    activeSide = "front"

}) {

    const fields =
        formFields.map(
            (field, index) =>
                normalizeField(
                    field,
                    index
                )
        );


    /* =====================================================
       CARD DIMENSIONS
    ===================================================== */

    const cardDimensions = {

        width:
            design.orientation === "landscape"
                ? (
                    design.cardSize === "compact"
                        ? 360
                        : 440
                )
                : (
                    design.cardSize === "compact"
                        ? 230
                        : 280
                ),

        height:
            design.orientation === "landscape"
                ? (
                    design.cardSize === "compact"
                        ? 230
                        : 280
                )
                : (
                    design.cardSize === "compact"
                        ? 360
                        : 440
                )

    };


    /* =====================================================
       TEMPLATE
    ===================================================== */

    const templateClass =
        design.template || "modern";


    /* =====================================================
       ACTIVE LAYOUT
    ===================================================== */

    const activeFieldLayout =
        activeSide === "back"
            ? design.backFieldLayout || {}
            : design.frontFieldLayout ||
              design.fieldLayout ||
              {};


    /* =====================================================
       VISIBLE FIELDS
    ===================================================== */

    const visibleFields =
        fields.filter(
            (field) => {

                if (
                    Number(design.sides || 1) === 1
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


    /* =====================================================
       PHOTO FIELD
    ===================================================== */

    const photoField =
        visibleFields.find(
            (field) =>
                isMediaField(field)
        );


    /* =====================================================
       INFORMATION FIELDS
    ===================================================== */

    const informationFields =
        visibleFields.filter(
            (field) =>
                !isMediaField(field)
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
       GET VALUE
    ===================================================== */

    const getFieldValue = (
        field
    ) => {

        const value =
            data?.[field.id];

        if (
            value === undefined ||
            value === null
        ) {

            return "";

        }

        if (
            Array.isArray(value)
        ) {

            return value.join(
                ", "
            );

        }

        if (
            typeof value === "boolean"
        ) {

            return value
                ? "Yes"
                : "No";

        }

        return String(value);

    };


    /* =====================================================
       DISPLAY VALUE
    ===================================================== */

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


    return (

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

                "--card-primary":
                    design.primaryColor ||
                    "#2563eb"
            }}
        >

            {/* =================================================
                BACKGROUND IMAGE
            ================================================= */}

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


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="premium-card-header">

                {/* LOGO */}

                {design.logo?.visible !==
                    false &&
                    (
                        design.logo?.data ? (

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


                {/* HEADER ACCENT */}

                <div className="premium-header-accent" />

            </div>


            {/* =================================================
                FRONT
            ================================================= */}

            {activeSide === "front" && (

                <div className="premium-card-front">

                    {/* IDENTITY */}

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
                                            src={getFieldValue(
                                                photoField
                                            )}
                                            alt="Student"
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
                                            field.id
                                        ] || {
                                            row:
                                                index +
                                                1,

                                            column:
                                                1,

                                            width:
                                                1
                                        };


                                    const isStudentName =
                                        studentNameField?.id ===
                                        field.id;


                                    if (
                                        isStudentName
                                    ) {

                                        return null;

                                    }


                                    /* =========================
                                       COUNT SAME ROW
                                    ========================= */

                                    const fieldsInSameRow =
                                        informationFields.filter(
                                            (
                                                rowField
                                            ) => {

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
                                                            ) +
                                                            1,

                                                        column:
                                                            1,

                                                        width:
                                                            1
                                                    };


                                                return (
                                                    rowLayout.row ===
                                                    layout.row
                                                );

                                            }
                                        ).length;


                                    /* =========================
                                       SINGLE FIELD ROW
                                    ========================= */

                                    const isSingleFieldRow =
                                        fieldsInSameRow ===
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


            {/* =================================================
                BACK
            ================================================= */}

            {activeSide === "back" &&
                Number(design.sides || 1) ===
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
                                            field.id
                                        ] || {
                                            row:
                                                index +
                                                1,

                                            column:
                                                1,

                                            width:
                                                1
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

    );

}


export default IDCardRenderer;