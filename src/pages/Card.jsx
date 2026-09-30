import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function Card() {
    const [selectedType, setSelectedType] = useState(null);

    /* =========================
       CARD SELECTION
    ========================= */

    const handleCardSelect = (type) => {
        setSelectedType(type);
    };


    /* =========================
       CONTINUE
    ========================= */

    const handleContinue = () => {
        if (!selectedType) {
            return;
        }

        window.location.href = "/details";
    };


    /* =========================
       CANCEL
    ========================= */

    const handleCancel = () => {
        window.location.href = "/";
    };


    /* =========================
       DASHBOARD
    ========================= */

    const handleDashboard = () => {
        window.location.href = "/";
    };


    return (
        <div className="app">

            {/* SIDEBAR */}

            <Sidebar activePage="card" />


            {/* MAIN */}

            <main className="main">

                {/* TOPBAR */}

                <Topbar />


                {/* CONTENT */}

                <section className="content">

                    {/* BREADCRUMB */}

                    <div className="breadcrumb">

                        <button
                            id="dashboardBtn"
                            onClick={handleDashboard}
                        >
                            Dashboard
                        </button>

                        <span>
                            ›
                        </span>

                        <span>
                            Create ID Card
                        </span>

                    </div>


                    {/* HEADER */}

                    <h1 className="page-title">
                        Create ID Card
                    </h1>

                    <p className="page-subtitle">
                        Choose the type of ID card you want to create.
                    </p>


                    {/* STEPS */}

                    <div className="steps">

                        <div className="step active">

                            <div className="step-number">
                                1
                            </div>

                            <div className="step-label">
                                Card Type
                            </div>

                        </div>


                        <div className="step-line"></div>


                        <div className="step">

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


                    {/* TYPE */}

                    <h2 className="section-heading">
                        Select ID Card Type
                    </h2>

                    <p className="section-description">
                        Select the type that best matches the person receiving the ID card.
                    </p>


                    {/* TYPE CARDS */}

                    <div className="type-grid">

                        {/* STUDENT */}

                        <div
                            className={`type-card ${
                                selectedType === "student"
                                    ? "selected"
                                    : ""
                            }`}
                            data-type="student"
                            onClick={() => handleCardSelect("student")}
                        >

                            <div className="card-check">
                                ✓
                            </div>

                            <div className="type-icon">
                                🎓
                            </div>

                            <div className="type-title">
                                Student ID
                            </div>

                            <div className="type-description">
                                For schools, colleges, universities and educational institutions.
                            </div>

                        </div>


                        {/* STAFF */}

                        <div
                            className={`type-card ${
                                selectedType === "staff"
                                    ? "selected"
                                    : ""
                            }`}
                            data-type="staff"
                            onClick={() => handleCardSelect("staff")}
                        >

                            <div className="card-check">
                                ✓
                            </div>

                            <div className="type-icon">
                                👨‍🏫
                            </div>

                            <div className="type-title">
                                Staff ID
                            </div>

                            <div className="type-description">
                                For teachers, administrative staff and other institution employees.
                            </div>

                        </div>


                        {/* EMPLOYEE */}

                        <div
                            className={`type-card ${
                                selectedType === "employee"
                                    ? "selected"
                                    : ""
                            }`}
                            data-type="employee"
                            onClick={() => handleCardSelect("employee")}
                        >

                            <div className="card-check">
                                ✓
                            </div>

                            <div className="type-icon">
                                🏢
                            </div>

                            <div className="type-title">
                                Employee ID
                            </div>

                            <div className="type-description">
                                For companies, organizations and business employees.
                            </div>

                        </div>


                        {/* CUSTOM */}

                        <div
                            className={`type-card ${
                                selectedType === "custom"
                                    ? "selected"
                                    : ""
                            }`}
                            data-type="custom"
                            onClick={() => handleCardSelect("custom")}
                        >

                            <div className="card-check">
                                ✓
                            </div>

                            <div className="type-icon">
                                ✦
                            </div>

                            <div className="type-title">
                                Custom ID
                            </div>

                            <div className="type-description">
                                Create a flexible ID card with your own fields and requirements.
                            </div>

                        </div>

                    </div>


                    {/* ACTIONS */}

                    <div className="actions">

                        <button
                            className="cancel-btn"
                            id="cancelBtn"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>


                        <button
                            className={`next-btn ${
                                selectedType
                                    ? "enabled"
                                    : ""
                            }`}
                            id="nextBtn"
                            onClick={handleContinue}
                        >

                            Continue

                            <span>
                                →
                            </span>

                        </button>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Card;