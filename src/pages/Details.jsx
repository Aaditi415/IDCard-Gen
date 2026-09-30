import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";


/* =====================================================
   FORM CONFIG
===================================================== */

const formConfig = {

    student: {

        title: "Student Information",

        description:
            "Enter the student's information below.",

        fields: [

            {
                name: "fullName",
                label: "Full Name",
                placeholder: "Enter student's full name",
                required: true
            },

            {
                name: "studentId",
                label: "Student ID",
                placeholder: "e.g. STU-2026-001",
                required: true
            },

            {
                name: "class",
                label: "Class / Course",
                placeholder: "e.g. B.Sc Computer Science",
                required: true
            },

            {
                name: "division",
                label: "Division",
                placeholder: "e.g. A",
                required: false
            },

            {
                name: "dob",
                label: "Date of Birth",
                type: "date",
                required: false
            },

            {
                name: "bloodGroup",
                label: "Blood Group",
                type: "select",
                options: [
                    "Select blood group",
                    "A+",
                    "A-",
                    "B+",
                    "B-",
                    "AB+",
                    "AB-",
                    "O+",
                    "O-"
                ],
                required: false
            },

            {
                name: "phone",
                label: "Phone Number",
                type: "tel",
                placeholder: "Enter phone number",
                required: false
            },

            {
                name: "email",
                label: "Email",
                type: "email",
                placeholder: "student@example.com",
                required: false
            },

            {
                name: "address",
                label: "Address",
                type: "textarea",
                placeholder: "Enter address",
                required: false,
                full: true
            }

        ]

    },


    staff: {

        title: "Staff Information",

        description:
            "Enter the staff member's information below.",

        fields: [

            {
                name: "fullName",
                label: "Full Name",
                placeholder: "Enter full name",
                required: true
            },

            {
                name: "employeeId",
                label: "Employee ID",
                placeholder: "e.g. STF-2026-014",
                required: true
            },

            {
                name: "designation",
                label: "Designation",
                placeholder: "e.g. Mathematics Teacher",
                required: true
            },

            {
                name: "department",
                label: "Department",
                placeholder: "e.g. Mathematics",
                required: false
            },

            {
                name: "dob",
                label: "Date of Birth",
                type: "date",
                required: false
            },

            {
                name: "phone",
                label: "Phone Number",
                type: "tel",
                placeholder: "Enter phone number",
                required: false
            },

            {
                name: "email",
                label: "Email",
                type: "email",
                placeholder: "staff@example.com",
                required: false
            },

            {
                name: "joiningDate",
                label: "Joining Date",
                type: "date",
                required: false
            },

            {
                name: "address",
                label: "Address",
                type: "textarea",
                placeholder: "Enter address",
                required: false,
                full: true
            }

        ]

    },


    employee: {

        title: "Employee Information",

        description:
            "Enter the employee's information below.",

        fields: [

            {
                name: "fullName",
                label: "Full Name",
                placeholder: "Enter employee name",
                required: true
            },

            {
                name: "employeeId",
                label: "Employee ID",
                placeholder: "e.g. EMP-2026-001",
                required: true
            },

            {
                name: "jobTitle",
                label: "Job Title",
                placeholder: "e.g. Software Developer",
                required: true
            },

            {
                name: "department",
                label: "Department",
                placeholder: "e.g. Technology",
                required: true
            },

            {
                name: "phone",
                label: "Phone Number",
                type: "tel",
                placeholder: "Enter phone number",
                required: false
            },

            {
                name: "email",
                label: "Email",
                type: "email",
                placeholder: "employee@example.com",
                required: false
            },

            {
                name: "joiningDate",
                label: "Joining Date",
                type: "date",
                required: false
            },

            {
                name: "location",
                label: "Office Location",
                placeholder: "e.g. Pune Office",
                required: false
            },

            {
                name: "address",
                label: "Address",
                type: "textarea",
                placeholder: "Enter address",
                required: false,
                full: true
            }

        ]

    },


    custom: {

        title: "Custom ID Information",

        description:
            "Enter the basic information for your custom ID card.",

        fields: [

            {
                name: "fullName",
                label: "Full Name",
                placeholder: "Enter full name",
                required: true
            },

            {
                name: "idNumber",
                label: "ID Number",
                placeholder: "Enter ID number",
                required: true
            },

            {
                name: "organization",
                label: "Organization",
                placeholder: "Enter organization name",
                required: false
            },

            {
                name: "designation",
                label: "Designation",
                placeholder: "Enter designation",
                required: false
            }

        ]

    }

};


/* =====================================================
   DETAILS PAGE
===================================================== */

function Details() {

    const selectedType = "staff";

    const config = formConfig[selectedType];


    /* =====================================================
       FORM STATE
    ===================================================== */

    const [formValues, setFormValues] = useState({});


    /* =====================================================
       CUSTOM FIELDS
    ===================================================== */

    const [customRows, setCustomRows] = useState([]);


    /* =====================================================
       PHOTO
    ===================================================== */

    const [photo, setPhoto] = useState(null);


    /* =====================================================
       NAVIGATION
    ===================================================== */

    const handleDashboard = () => {
        window.location.href = "/";
    };


    const handleCreate = () => {
        window.location.href = "/card";
    };


    const handleBack = () => {
        window.location.href = "/card";
    };


    /* =====================================================
       FORM INPUT
    ===================================================== */

    const handleInputChange = (event) => {

        const { name, value } = event.target;

        setFormValues(prev => ({
            ...prev,
            [name]: value
        }));

    };


    /* =====================================================
       REQUIRED FIELD VALIDATION
    ===================================================== */

    const isFormValid = config.fields
        .filter(field => field.required)
        .every(field => {

            const value = formValues[field.name] || "";

            return value.trim() !== "";

        });


    /* =====================================================
       PHOTO UPLOAD
    ===================================================== */

    const handlePhotoUpload = (event) => {

        const file = event.target.files[0];

        if (!file) {
            return;
        }


        if (file.size > 2 * 1024 * 1024) {

            alert(
                "Photo must be smaller than 2MB."
            );

            event.target.value = "";

            return;
        }


        const reader = new FileReader();


        reader.onload = (e) => {

            setPhoto(e.target.result);

        };


        reader.readAsDataURL(file);

    };


    /* =====================================================
       CUSTOM FIELD
    ===================================================== */

    const addCustomRow = () => {

        setCustomRows(prev => [
            ...prev,
            {
                id: Date.now(),
                name: "",
                value: ""
            }
        ]);

    };


    const removeCustomRow = (id) => {

        setCustomRows(prev =>
            prev.filter(row => row.id !== id)
        );

    };


    const updateCustomRow = (
        id,
        property,
        value
    ) => {

        setCustomRows(prev =>
            prev.map(row =>
                row.id === id
                    ? {
                        ...row,
                        [property]: value
                    }
                    : row
            )
        );

    };


    /* =====================================================
       FORM SUBMIT
    ===================================================== */

    const handleSubmit = (event) => {

        event.preventDefault();


        if (!isFormValid) {
            return;
        }


        window.location.href = "/design";

    };


    /* =====================================================
       CREATE FIELD
    ===================================================== */

    const renderField = (field) => {

        const value =
            formValues[field.name] || "";


        const hasError =
            field.required &&
            value.trim() === "";


        return (

            <div
                className={`form-group ${
                    hasError && value !== ""
                        ? "error"
                        : ""
                } ${field.full ? "full" : ""}`}
                key={field.name}
            >

                <label className="form-label">

                    {field.label}

                    {field.required && (
                        <span className="required">
                            *
                        </span>
                    )}

                </label>


                {/* SELECT */}

                {field.type === "select" && (

                    <select
                        className="form-control"
                        name={field.name}
                        value={value}
                        data-required={
                            field.required
                                ? "true"
                                : "false"
                        }
                        onChange={handleInputChange}
                    >

                        {field.options.map(
                            (optionText, index) => (

                                <option
                                    key={optionText}
                                    value={
                                        index === 0
                                            ? ""
                                            : optionText
                                    }
                                >
                                    {optionText}
                                </option>

                            )
                        )}

                    </select>

                )}


                {/* TEXTAREA */}

                {field.type === "textarea" && (

                    <textarea
                        className="form-control"
                        name={field.name}
                        placeholder={
                            field.placeholder || ""
                        }
                        value={value}
                        data-required={
                            field.required
                                ? "true"
                                : "false"
                        }
                        onChange={handleInputChange}
                    />

                )}


                {/* NORMAL INPUT */}

                {field.type !== "select" &&
                    field.type !== "textarea" && (

                        <input
                            className="form-control"
                            type={
                                field.type || "text"
                            }
                            name={field.name}
                            placeholder={
                                field.placeholder || ""
                            }
                            value={value}
                            data-required={
                                field.required
                                    ? "true"
                                    : "false"
                            }
                            onChange={handleInputChange}
                        />

                    )}


                <div className="form-error">
                    {field.label} is required.
                </div>

            </div>

        );

    };


    return (

        <div className="app">


            {/* SIDEBAR */}

            <Sidebar activePage="deatils" />


            {/* MAIN */}

            <main className="main">


                {/* TOPBAR */}

                <Topbar />


                <section className="content">


                    {/* BREADCRUMB */}

                    <div className="breadcrumb">

                        <button
                            onClick={handleDashboard}
                        >
                            Dashboard
                        </button>


                        <span>
                            ›
                        </span>


                        <button
                            onClick={handleCreate}
                        >
                            Create ID Card
                        </button>


                        <span>
                            ›
                        </span>


                        <span>
                            Details
                        </span>

                    </div>


                    <h1 className="page-title">
                        Enter Details
                    </h1>


                    <p className="page-subtitle">
                        Add the information that will appear on the ID card.
                    </p>


                    {/* STEPS */}

                    <div className="steps">

                        <div className="step completed">

                            <div className="step-number">
                                ✓
                            </div>

                            <div className="step-label">
                                Card Type
                            </div>

                        </div>


                        <div className="step-line completed"></div>


                        <div className="step active">

                            <div className="step-number">
                                2
                            </div>

                            <div className="step-label">
                                Details
                            </div>

                        </div>


                        <div className="step-line"></div>


                        <div className="step">

                            <div className="step-number">
                                3
                            </div>

                            <div className="step-label">
                                Design
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


                    {/* FORM CARD */}

                    <div className="form-card">


                        <div className="form-header">

                            <h2 id="formTitle">
                                {config.title}
                            </h2>


                            <p id="formDescription">
                                {config.description}
                            </p>

                        </div>


                        {/* PHOTO */}

                        <div className="photo-section">


                            <div
                                className="photo-preview"
                                id="photoPreview"
                            >

                                {photo ? (

                                    <img
                                        src={photo}
                                        alt="Profile photo"
                                    />

                                ) : (

                                    "👤"

                                )}

                            </div>


                            <div className="photo-info">


                                <div className="photo-title">
                                    Profile Photo
                                </div>


                                <div className="photo-description">
                                    Upload a clear photo. JPG or PNG, maximum 2MB.
                                </div>


                                <label
                                    className="upload-btn"
                                    htmlFor="photoInput"
                                >
                                    Upload Photo
                                </label>


                                <input
                                    type="file"
                                    id="photoInput"
                                    accept="image/png,image/jpeg"
                                    onChange={handlePhotoUpload}
                                />


                            </div>

                        </div>


                        {/* FORM */}

                        <form
                            id="detailsForm"
                            onSubmit={handleSubmit}
                        >

                            <div
                                className="form-grid"
                                id="formFields"
                            >

                                {config.fields.map(
                                    renderField
                                )}

                            </div>


                            {/* CUSTOM FIELDS */}

                            {selectedType === "custom" && (

                                <div
                                    className="custom-fields show"
                                    id="customFields"
                                >

                                    <div className="custom-header">

                                        <h3>
                                            Custom Fields
                                        </h3>


                                        <button
                                            type="button"
                                            className="add-field"
                                            id="addField"
                                            onClick={addCustomRow}
                                        >
                                            + Add Field
                                        </button>

                                    </div>


                                    <div id="customRows">

                                        {customRows.map(
                                            row => (

                                                <div
                                                    className="custom-row"
                                                    key={row.id}
                                                >

                                                    <input
                                                        className="form-control"
                                                        placeholder="Field name"
                                                        value={row.name}
                                                        onChange={
                                                            e =>
                                                                updateCustomRow(
                                                                    row.id,
                                                                    "name",
                                                                    e.target.value
                                                                )
                                                        }
                                                    />


                                                    <input
                                                        className="form-control"
                                                        placeholder="Field value"
                                                        value={row.value}
                                                        onChange={
                                                            e =>
                                                                updateCustomRow(
                                                                    row.id,
                                                                    "value",
                                                                    e.target.value
                                                                )
                                                        }
                                                    />


                                                    <button
                                                        type="button"
                                                        className="remove-field"
                                                        title="Remove field"
                                                        onClick={() =>
                                                            removeCustomRow(
                                                                row.id
                                                            )
                                                        }
                                                    >
                                                        ×
                                                    </button>

                                                </div>

                                            )
                                        )}

                                    </div>

                                </div>

                            )}


                            {/* ACTIONS */}

                            <div className="actions">

                                <button
                                    type="button"
                                    className="back-btn"
                                    id="backBtn"
                                    onClick={handleBack}
                                >
                                    ← Back
                                </button>


                                <button
                                    type="submit"
                                    className="next-btn"
                                    id="nextBtn"
                                    disabled={!isFormValid}
                                >
                                    Continue to Design →
                                </button>

                            </div>

                        </form>

                    </div>

                </section>

            </main>

        </div>

    );

}


export default Details;