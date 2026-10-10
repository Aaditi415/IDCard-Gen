import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import IDCardRenderer from "../components/IDCardRenderer";
import{
 SquareDashedPlus,
 LayoutTemplate
} from 'lucide-react'


/* =========================================================
   STORAGE KEYS
========================================================= */

const TEMPLATES_STORAGE_KEY = "idCardTemplates";
const FORM_STORAGE_KEY = "idCardForm";


/* =========================================================
   HELPERS
========================================================= */

function formatLabel(value) {

    if (!value) {
        return "—";
    }

    return String(value)
        .charAt(0)
        .toUpperCase() +
        String(value).slice(1);

}


function formatDate(date) {

    if (!date) {
        return "—";
    }

    try {

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    } catch (error) {

        return "—";

    }

}


/* =========================================================
   CARD DIMENSIONS
========================================================= */

function getCardDimensions(design) {

    if (design?.orientation === "landscape") {

        if (design?.cardSize === "compact") {

            return {
                width: 180,
                height: 115
            };

        }

        return {
            width: 220,
            height: 140
        };

    }


    if (design?.cardSize === "compact") {

        return {
            width: 115,
            height: 180
        };

    }


    return {
        width: 140,
        height: 220
    };

}


/* =========================================================
   TEMPLATE PREVIEW
========================================================= */

function TemplatePreview({
    template,
    form
}) {

    const design =
        template?.design || {};

    const fields =
        Array.isArray(form?.fields)
            ? form.fields
            : [];

    const dimensions =
        getCardDimensions(
            design
        );


    const photoField =
        fields.find(
            (field) =>
                [
                    "media",
                    "image",
                    "photo",
                    "file"
                ].includes(
                    String(
                        field?.type || ""
                    ).toLowerCase()
                )
        );


    const nameField =
        fields.find(
            (field) =>
                String(
                    field?.label ||
                    field?.name ||
                    ""
                )
                    .toLowerCase()
                    .includes("name")
        );


    const informationFields =
        fields.filter(
            (field) =>
                field?.id !==
                photoField?.id &&
                field?.id !==
                nameField?.id
        );


    return (

        <div className="template-preview-wrapper">

            <div
                className={[
                    "template-preview-card",
                    design.orientation || "portrait",
                    design.template || "modern",
                    design.cardSize === "compact"
                        ? "compact"
                        : "",
                    design.background === "soft"
                        ? "background-soft"
                        : "",
                    design.background === "light"
                        ? "background-light"
                        : ""
                ]
                    .filter(Boolean)
                    .join(" ")}

                style={{
                    width: `${dimensions.width}px`,
                    height: `${dimensions.height}px`,
                    "--template-primary":
                        design.primaryColor ||
                        "#2563eb"
                }}
            >

                {/* BACKGROUND IMAGE */}

                {design.backgroundImage?.data &&
                    design.backgroundImage.visible !== false && (

                        <img
                            src={
                                design
                                    .backgroundImage
                                    .data
                            }
                            alt=""
                            className="template-background-image"
                            style={{
                                opacity:
                                    design
                                        .backgroundImage
                                        .opacity ??
                                    1
                            }}
                        />

                    )}


                {/* HEADER */}

                <div className="template-preview-header">

                    {design.logo?.visible !== false && (

                        design.logo?.data ? (

                            <img
                                src={
                                    design
                                        .logo
                                        .data
                                }
                                alt="Logo"
                                className="template-preview-logo"
                            />

                        ) : (

                            <div className="template-logo-placeholder">
                                LOGO
                            </div>

                        )

                    )}


                    {design.organization?.visible !== false && (

                        <div className="template-preview-organization">

                            <strong>
                                {
                                    design
                                        .organization
                                        ?.text ||
                                    "ORGANIZATION"
                                }
                            </strong>

                            <span>
                                STUDENT IDENTITY CARD
                            </span>

                        </div>

                    )}

                </div>


                {/* BODY */}

                <div className="template-preview-body">

                    <div className="template-identity">

                        {photoField &&
                            design.photo?.visible !== false && (

                                <div
                                    className="template-photo"
                                    style={{
                                        width: Math.min(
                                            Number(
                                                design
                                                    .photo
                                                    ?.width ||
                                                74
                                            ),
                                            42
                                        ),

                                        height: Math.min(
                                            Number(
                                                design
                                                    .photo
                                                    ?.height ||
                                                91
                                            ),
                                            52
                                        )
                                    }}
                                >

                                    <span>
                                        PHOTO
                                    </span>

                                </div>

                            )}


                        <div className="template-name-area">

                            <strong>
                                {
                                    nameField
                                        ?.label ||
                                    "Student Name"
                                }
                            </strong>

                            <span>
                                STUDENT
                            </span>

                        </div>

                    </div>


                    <div className="template-info-title">
                        STUDENT INFORMATION
                    </div>


                    <div className="template-info-grid">

                        {informationFields
                            .slice(0, 4)
                            .map(
                                (
                                    field
                                ) => (

                                    <div
                                        key={
                                            field.id
                                        }
                                        className="template-info-item"
                                    >

                                        <span>
                                            {
                                                field.label ||
                                                field.name ||
                                                "Field"
                                            }
                                        </span>

                                        <strong>
                                            Sample
                                        </strong>

                                    </div>

                                )
                            )}

                    </div>

                </div>


                {/* FOOTER */}

                <div className="template-preview-footer">

                    <span>
                        ID CARD
                    </span>

                    <div />

                </div>

            </div>

        </div>

    );

}


/* =========================================================
   TEMPLATE CARD
========================================================= */

function TemplateCard({
    template,
    form,
    onUse,
    onEdit,
    onDelete
}) {

    const design =
        template?.design || {};

    const fieldCount =
        Array.isArray(form?.fields)
            ? form.fields.length
            : 0;


    return (

        <div className="template-card">

            {/* PREVIEW */}


            <div className="template-preview">

                <div className="template-preview-card">

                    {template.form ? (

                        <IDCardRenderer

                            formFields={
                                template
                                    .form
                                    .fields ||
                                []
                            }

                            data={
                                template
                                    .demoData ||
                                {}
                            }

                            design={
                                template
                                    .design ||
                                {}
                            }

                            activeSide="front"

                        />

                    ) : (

                        <div className="template-preview-missing">

                            Form data
                            unavailable

                        </div>

                    )}

                </div>

            </div>

            {/* DETAILS */}

            <div className="template-card-content">

                <div className="template-title-row">

                    <div>

                        <h3>
                            {
                                template.name ||
                                "Untitled Template"
                            }
                        </h3>

                        <span className="template-updated">

                            Updated{" "}

                            {
                                formatDate(
                                    template.updatedAt ||
                                    template.createdAt
                                )
                            }

                        </span>

                    </div>


                    <button
                        type="button"
                        className="template-menu-btn"
                        title="Template options"
                        onClick={() =>
                            onDelete(
                                template.id
                            )
                        }
                    >
                        ⋮
                    </button>

                </div>


                {/* META */}

                <div className="template-meta">

                    <span>
                        <b>
                            Design
                        </b>

                        {formatLabel(
                            design.template
                        )}

                    </span>


                    <span>
                        <b>
                            Orientation
                        </b>

                        {formatLabel(
                            design.orientation
                        )}

                    </span>


                    <span>
                        <b>
                            Fields
                        </b>

                        {fieldCount}

                    </span>


                    <span>
                        <b>
                            Sides
                        </b>

                        {design.sides === 2
                            ? "Front + Back"
                            : "Front"}

                    </span>

                </div>


                {/* ACTIONS */}

                <div className="template-actions">

                    <button
                        type="button"
                        className="template-use-btn"
                        onClick={() =>
                            onUse(
                                template
                            )
                        }
                    >
                        Use Template
                    </button>


                    <button
                        type="button"
                        className="template-edit-btn"
                        onClick={() =>
                            onEdit(
                                template
                            )
                        }
                    >
                        Edit
                    </button>

                </div>

            </div>

        </div>

    );

}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyTemplates({
    onCreate
}) {

    return (

        <div className="templates-empty">

            <div className="empty-icon">
                <SquareDashedPlus />
            </div>


            <h2>
                No templates yet
            </h2>


            <p>
                Create your first ID card template
                to start generating ID cards.
            </p>


            <button
                type="button"
                className="primary-btn"
                onClick={
                    onCreate
                }
            >
                + Create Template
            </button>

        </div>

    );

}


/* =========================================================
   MAIN PAGE
========================================================= */

function Templates() {

    const [
        templates,
        setTemplates
    ] = useState([]);


    const [
        form,
        setForm
    ] = useState(null);


    const [
        toast,
        setToast
    ] = useState("");


    /* =====================================================
       LOAD STORAGE
    ===================================================== */

    function loadTemplates() {

        try {

            const savedTemplates =
                JSON.parse(
                    localStorage.getItem(
                        TEMPLATES_STORAGE_KEY
                    )
                );


            const savedForm =
                JSON.parse(
                    localStorage.getItem(
                        FORM_STORAGE_KEY
                    )
                );


            setTemplates(
                Array.isArray(
                    savedTemplates
                )
                    ? savedTemplates
                    : []
            );


            setForm(
                savedForm &&
                typeof savedForm ===
                    "object"
                    ? savedForm
                    : null
            );

        } catch (error) {

            console.error(
                "Unable to load templates:",
                error
            );

            setTemplates([]);
            setForm(null);

        }

    }


    useEffect(() => {

        loadTemplates();

    }, []);


    /* =====================================================
       TEMPLATE COUNT
    ===================================================== */

    const templateCount =
        useMemo(
            () =>
                templates.length,
            [templates]
        );


    /* =====================================================
       CREATE
    ===================================================== */

    function handleCreate() {

        window.location.href =
            "/create-form";

    }


    /* =====================================================
       USE TEMPLATE
    ===================================================== */

    function handleUseTemplate(
        template
    ) {

        try {

            const savedForm =
                JSON.parse(
                    localStorage.getItem(
                        FORM_STORAGE_KEY
                    )
                );


            /*
             * Save selected template
             * separately so the creation
             * flow can identify it.
             */

            localStorage.setItem(
                "selectedIdCardTemplate",
                JSON.stringify(
                    template
                )
            );


            if (
                savedForm &&
                savedForm.id ===
                    template.formId
            ) {

                localStorage.setItem(
                    "idCardDesign",
                    JSON.stringify(
                        template.design
                    )
                );

            }


            window.location.href =
                "/demo";

        } catch (error) {

            console.error(
                "Unable to use template:",
                error
            );

            showToast(
                "Unable to use template."
            );

        }

    }


    /* =====================================================
       EDIT TEMPLATE
    ===================================================== */

    function handleEditTemplate(
        template
    ) {

        try {

            /*
             * Put the selected template
             * design back into the active
             * design storage.
             */

            localStorage.setItem(
                "idCardDesign",
                JSON.stringify(
                    template.design
                )
            );


            localStorage.setItem(
                "selectedIdCardTemplate",
                JSON.stringify(
                    template
                )
            );


            window.location.href =
                "/design";

        } catch (error) {

            console.error(
                "Unable to edit template:",
                error
            );

            showToast(
                "Unable to edit template."
            );

        }

    }


    /* =====================================================
       DELETE TEMPLATE
    ===================================================== */

    function handleDeleteTemplate(
        templateId
    ) {

        const shouldDelete =
            window.confirm(
                "Are you sure you want to delete this template?"
            );


        if (!shouldDelete) {
            return;
        }


        try {

            const updatedTemplates =
                templates.filter(
                    (template) =>
                        template.id !==
                        templateId
                );


            localStorage.setItem(
                TEMPLATES_STORAGE_KEY,
                JSON.stringify(
                    updatedTemplates
                )
            );


            setTemplates(
                updatedTemplates
            );


            showToast(
                "Template deleted."
            );

        } catch (error) {

            console.error(
                "Unable to delete template:",
                error
            );

            showToast(
                "Unable to delete template."
            );

        }

    }


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(
        message
    ) {

        setToast(
            message
        );


        setTimeout(() => {

            setToast("");

        }, 2500);

    }


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="app">

            <Sidebar
                activePage="templates"
            />


            <main className="main">

                <Topbar />


                <section className="content">

                    {/* =================================
                        PAGE HEADER
                    ================================= */}

                    <div className="page-header">

                        <div>

                            <h1 className="page-title">
                                Templates
                            </h1>

                            <p className="page-subtitle">
                                Manage your saved ID card
                                designs and templates.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="add-record-btn"
                            onClick={
                                handleCreate
                            }
                        >
                            + Create Template
                        </button>

                    </div>


                    {/* =================================
                        SUMMARY
                    ================================= */}

                    <div className="templates-summary">

                        <div className="templates-summary-icon">
                            <LayoutTemplate />
                        </div>


                        <div>

                            <span>
                                Saved Templates
                            </span>

                            <strong>
                                {templateCount}
                            </strong>

                        </div>

                    </div>


                    {/* =================================
                        TEMPLATE GRID
                    ================================= */}

                    {templates.length ===
                    0 ? (

                        <EmptyTemplates
                            onCreate={
                                handleCreate
                            }
                        />

                    ) : (

                        <div className="templates-grid">

                            {templates.map(
                                (
                                    template
                                ) => {

                                    /*
                                     * Current system has
                                     * one active idCardForm.
                                     *
                                     * Match it using formId.
                                     */

                                    const matchingForm =
                                        form?.id ===
                                        template.formId
                                            ? form
                                            : null;


                                    return (

                                        <TemplateCard
                                            key={
                                                template.id
                                            }

                                            template={
                                                template
                                            }

                                            form={
                                                matchingForm
                                            }

                                            onUse={
                                                handleUseTemplate
                                            }

                                            onEdit={
                                                handleEditTemplate
                                            }

                                            onDelete={
                                                handleDeleteTemplate
                                            }
                                        />

                                    );

                                }
                            )}

                        </div>

                    )}


                    {/* =================================
                        FOOTER
                    ================================= */}

                    <div className="templates-page-footer">

                        <span>
                            ID Card System
                        </span>

                        <span>
                            Templates
                        </span>

                    </div>

                </section>

            </main>


            {/* =================================
                TOAST
            ================================= */}

            {toast && (

                <div className="toast">
                    {toast}
                </div>

            )}

        </div>

    );

}


export default Templates;