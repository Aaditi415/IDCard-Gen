
import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function SingleRecord() {
    const [listSetup, setListSetup] = useState(null);
    const [formData, setFormData] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        try {
            const savedSetup = JSON.parse(
                sessionStorage.getItem("singleRecordListSetup")
            );

            if (
                !savedSetup ||
                !savedSetup.listName ||
                !savedSetup.tabName ||
                !Array.isArray(savedSetup.headers) ||
                savedSetup.headers.length === 0
            ) {
                window.location.href = "/add-single-record";
                return;
            }

            setListSetup(savedSetup);
            setFormData(savedSetup.headers.map(() => ""));
        } catch (error) {
            console.error("Failed to load list setup:", error);
            window.location.href = "/add-single-record";
        }
    }, []);
    
    const getFieldType = (header) => {
        const name = String(header).trim().toLowerCase();

        if (/\b(email|e-mail)\b/.test(name)) {
            return "email";
        }

        if (/\b(dob|date of birth|birth date|birthdate)\b/.test(name)) {
            return "dob";
        }

        if (/\b(date|joining date|admission date|expiry date)\b/.test(name)) {
            return "date";
        }

        if (
            /\b(phone|mobile|telephone|contact number|phone number)\b/.test(name)
        ) {
            return "tel";
        }

        return "text";
    };
    // Identify the input type from the column name.
    
    const getFieldHint = (header) => {
        const name = String(header).trim().toLowerCase();
        const type = getFieldType(header);

        if (type === "email") {
            return "Enter a valid email address, e.g. student@example.com.";
        }

        if (type === "dob") {
            return "Select the student's date of birth. Future dates are not allowed.";
        }

        if (type === "date") {
            return "Select a valid date.";
        }

        if (type === "tel") {
            return "Enter a contact number containing 10–15 digits.";
        }

        if (/\b(name|student name|full name)\b/.test(name)) {
            return "Enter the student's full name.";
        }

        if (/\b(roll no|roll number|roll)\b/.test(name)) {
            return "Enter a unique roll number for the student.";
        }

        if (/\b(class|standard|division)\b/.test(name)) {
            return "Enter the student's class or division.";
        }

        if (/\b(address|location)\b/.test(name)) {
            return "Enter the complete address.";
        }

        return `Enter ${header.toLowerCase()}.`;
    };

    const getFieldLength = (header) => {
        const name = String(header).trim().toLowerCase();

        if (/\b(roll no|roll number|roll)\b/.test(name)) {
            return { minLength: 1, maxLength: 20 };
        }

        if (/\b(name|student name|full name)\b/.test(name)) {
            return { minLength: 2, maxLength: 100 };
        }

        if (/\b(class|standard|division)\b/.test(name)) {
            return { minLength: 1, maxLength: 30 };
        }

        if (getFieldType(header) === "email") {
            return { minLength: 5, maxLength: 254 };
        }

        if (getFieldType(header) === "tel") {
            return { minLength: 10, maxLength: 15 };
        }

        return { minLength: 1, maxLength: 255 };
    };
    const getToday = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const validateField = (header, value) => {
        const name = String(header).trim();
        const type = getFieldType(header);
        const cleanValue = String(value ?? "").trim();
        const { minLength, maxLength } = getFieldLength(header);

        if (cleanValue.length < minLength) {
            return `${name} must contain at least ${minLength} characters.`;
        }

        if (cleanValue.length > maxLength) {
            return `${name} cannot exceed ${maxLength} characters.`;
        }

        if (!cleanValue) {
            return `${name} is required.`;
        }

        if (type === "email") {
            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(cleanValue)) {
                return "Enter a valid email address.";
            }
        }

        if (type === "tel") {
            const digits = cleanValue.replace(/\D/g, "");

            if (digits.length < 10 || digits.length > 15) {
                return "Enter a valid phone number with 10–15 digits.";
            }
        }

        
        if (type === "dob" || type === "date") {
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;

            if (!datePattern.test(cleanValue)) {
                return "Select a valid date.";
            }

            const [year, month, day] = cleanValue.split("-").map(Number);
            const parsedDate = new Date(year, month - 1, day);

            const isValidDate =
                parsedDate.getFullYear() === year &&
                parsedDate.getMonth() === month - 1 &&
                parsedDate.getDate() === day;

            if (!isValidDate) {
                return "Enter a valid date.";
            }

            if (type === "dob" && cleanValue > getToday()) {
                return "Date of birth cannot be in the future.";
            }
        }

        return "";
    };

    const handleChange = (index, value) => {
        setFormData((currentData) =>
            currentData.map((item, itemIndex) =>
                itemIndex === index ? value : item
            )
        );

        setErrors((currentErrors) => ({
            ...currentErrors,
            [index]: listSetup
                ? validateField(listSetup.headers[index], value)
                : ""
        }));
    };

    const handleContinue = () => {
        if (!listSetup) return;

        const nextErrors = {};

        listSetup.headers.forEach((header, index) => {
            const message = validateField(header, formData[index]);
            if (message) {
                nextErrors[index] = message;
            }
        });

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        // Preserve the data format used by Review.jsx.
        localStorage.setItem(
            "idCardList",
            JSON.stringify({
                listName: listSetup.listName,
                tabName: listSetup.tabName
            })
        );

        localStorage.setItem(
            "idCardImportedData",
            JSON.stringify({
                headers: listSetup.headers,
                rows: [formData],
                removedCount: 0
            })
        );

        sessionStorage.removeItem("singleRecordListSetup");

        window.location.href = "/review";
    };

    const handleBack = () => {
        window.location.href = "/add-single-record";
    };

    if (!listSetup) {
        return null;
    }

    return (
        <div className="app">
            <Sidebar />

            <main className="main">
                <Topbar />

                <div className="content single-record-page">
                    <div className="breadcrumb">
                        <span>Add Single Record</span>
                        <span className="breadcrumb-separator">/</span>
                        <span>Add Record</span>
                    </div>

                    <div className="page-title">Add Student Record</div>

                    <div className="page-subtitle">
                        Enter the student’s details to add the first record to your selected master list.
                    </div>

                    <div className="steps">
                        <div className="step completed">
                            <div className="step-number">✓</div>
                            <div className="step-label">List</div>
                        </div>

                        <div className="step-line completed" />

                        <div className="step active">
                            <div className="step-number">2</div>
                            <div className="step-label">Add Record</div>
                        </div>

                        <div className="step-line" />

                        <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-label">Review</div>
                        </div>
                    </div>

                    <div className="single-record-layout">
                        <section className="form-card single-record-form-card">
                            <div className="form-card-header">
                                <div>
                                    <h3>Add Data in {listSetup.listName} List</h3>
                                    <p>
                                        Fill in all required fields. Make sure the details are accurate before continuing.
                                    </p>
                                </div>
                            </div>

                            <div className="form-body">
                                <div className="record-list-info">
                                    <div className="record-list-info-item">
                                        <span className="record-list-info-label">
                                            List
                                        </span>
                                        <strong>{listSetup.listName}</strong>
                                    </div>

                                    <div className="record-list-info-item">
                                        <span className="record-list-info-label">
                                            Tab
                                        </span>
                                        <strong>{listSetup.tabName}</strong>
                                    </div>
                                </div>

                                <div className="single-record-section-heading">
                                    <div>
                                        <h4>Record information</h4>
                                        <p>
                                            Required fields are marked with an asterisk ().*
                                        </p>
                                    </div>

                                </div>

                                <div className="single-record-fields">
                                    {listSetup.headers.map((header, index) => {
                                        const type = getFieldType(header);
                                        const { minLength, maxLength } = getFieldLength(header);
                                        const inputType =
                                            type === "dob" || type === "date"
                                                ? "date"
                                                : type;

                                        return (
                                            <div
                                                className="field single-record-field"
                                                key={`${header}-${index}`}
                                            >
                                                <label
                                                    className="field-label"
                                                    htmlFor={`record-field-${index}`}
                                                >
                                                    {header}
                                                    <span className="required-star">
                                                        {" "}*
                                                    </span>
                                                </label>

                                                
                                                <input
                                                    id={`record-field-${index}`}
                                                    type={inputType}
                                                    className={`input ${errors[index] ? "invalid" : ""}`}
                                                    value={formData[index] || ""}
                                                    minLength={minLength}
                                                    maxLength={maxLength}
                                                    placeholder={
                                                        inputType === "date"
                                                            ? "Select date"
                                                            : type === "email"
                                                            ? "e.g. student@example.com"
                                                            : type === "tel"
                                                            ? "e.g. 9876543210"
                                                            : /\b(name|full name)\b/i.test(header)
                                                            ? "e.g. Aarav Sharma"
                                                            : `Enter ${header}`
                                                    }
                                                    max={type === "dob" ? getToday() : undefined}
                                                    aria-invalid={Boolean(errors[index])}
                                                    aria-describedby={
                                                        errors[index]
                                                            ? `record-error-${index}`
                                                            : `record-hint-${index}`
                                                    }
                                                    onChange={(event) =>
                                                        handleChange(index, event.target.value)
                                                    }
                                                />

                                                <p
                                                    className="field-hint"
                                                >
                                                    {getFieldHint(header)}
                                                </p>

                                                {errors[index] && (
                                                    <p
                                                        className="field-error"
                                                        role="alert"
                                                    >
                                                        {errors[index]}
                                                    </p>
                                                )}

                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                                

                            <div className="bottom-actions ">
                                <button
                                    type="button"
                                    className="ui-btn ui-btn--secondary"
                                    onClick={handleBack}
                                >
                                    Back
                                </button>

                                <button
                                    type="button"
                                    className="ui-btn ui-btn--primary"
                                    onClick={handleContinue}
                                >
                                    Continue to Review
                                    <span aria-hidden="true"> →</span>
                                </button>
                            </div>
                        </section>

                        
                        <aside className="info-card">
                            <div className="info-card-heading">
                                <div className="info-heading-icon">i</div>

                                <div>
                                    <h3>Before you continue</h3>
                                    <p>Understand how your student record will be added.</p>
                                </div>
                            </div>

                            <div className="info-divider"></div>

                            <div className="info-item">
                                <div className="info-number">1</div>

                                <div>
                                    <strong>List Created</strong>
                                    <span>
                                        Your master list and tab are ready to organize
                                        student records.
                                    </span>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-number">2</div>

                                <div>
                                    <strong>Enter Student Details</strong>
                                    <span>
                                        Fill in the required fields. Email, date of birth,
                                        and phone fields are validated automatically when
                                        their column names are recognized.
                                    </span>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-number">3</div>

                                <div>
                                    <strong>Review the Record</strong>
                                    <span>
                                        Continue to review your student's information
                                        before saving it to the list.
                                    </span>
                                </div>
                            </div>


                            <div className="info-tip">
                                <strong>Tip</strong>
                                <p>
                                    Double-check student names, dates of birth, and contact
                                    details before continuing to review.
                                </p>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default SingleRecord;