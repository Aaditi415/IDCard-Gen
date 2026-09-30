import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function Dashboard() {

    /* =====================================================
       CREATE ID CARD
    ===================================================== */

    const handleCreate = () => {
        window.location.href = "/card";
    };


    return (
        <div className="app">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <Sidebar activePage="dashboard" />


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="main">

                {/* =================================================
                    TOPBAR
                ================================================= */}

                <Topbar />


                {/* =================================================
                    CONTENT
                ================================================= */}

                <section className="content">


                    {/* PAGE HEADER */}

                    <div className="page-header">

                        <div>

                            <h1 className="page-title">
                                Good afternoon, Aaditi 👋
                            </h1>

                            <p className="page-subtitle">
                                Manage your digital ID cards from one place.
                            </p>

                        </div>


                        <button
                            className="primary-btn"
                            id="headerCreate"
                            onClick={handleCreate}
                        >

                            <span>
                                ＋
                            </span>

                            Create ID Card

                        </button>

                    </div>


                    {/* =================================================
                        STATISTICS
                    ================================================= */}

                    <div className="stats">

                        <div className="stat-card">

                            <div className="stat-top">

                                <span className="stat-label">
                                    Total ID Cards
                                </span>

                                <div className="stat-icon">
                                    ▣
                                </div>

                            </div>

                            <div className="stat-number">
                                128
                            </div>

                            <div className="stat-description">
                                All generated and saved ID cards
                            </div>

                        </div>


                        <div className="stat-card">

                            <div className="stat-top">

                                <span className="stat-label">
                                    Templates
                                </span>

                                <div className="stat-icon">
                                    ▤
                                </div>

                            </div>

                            <div className="stat-number">
                                12
                            </div>

                            <div className="stat-description">
                                Available card designs
                            </div>

                        </div>


                        <div className="stat-card">

                            <div className="stat-top">

                                <span className="stat-label">
                                    Drafts
                                </span>

                                <div className="stat-icon">
                                    ✎
                                </div>

                            </div>

                            <div className="stat-number">
                                05
                            </div>

                            <div className="stat-description">
                                ID cards waiting to be completed
                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        RECENT ID CARDS
                    ================================================= */}

                    <div className="section-header">

                        <h2 className="section-title">
                            Recent ID Cards
                        </h2>

                        <button className="view-all">
                            View all →
                        </button>

                    </div>


                    <div className="table-card">

                        <table>

                            <thead>

                                <tr>
                                    <th>PERSON</th>
                                    <th>ID NUMBER</th>
                                    <th>TEMPLATE</th>
                                    <th>STATUS</th>
                                    <th>UPDATED</th>
                                    <th></th>
                                </tr>

                            </thead>


                            <tbody>

                                <tr>

                                    <td>

                                        <div className="id-person">

                                            <div className="person-photo">
                                                RK
                                            </div>

                                            <div>

                                                <div className="person-name">
                                                    Rahul Kulkarni
                                                </div>

                                                <div className="person-type">
                                                    Student
                                                </div>

                                            </div>

                                        </div>

                                    </td>

                                    <td className="id-number">
                                        STU-2026-001
                                    </td>

                                    <td className="template">
                                        Student Classic
                                    </td>

                                    <td>

                                        <span className="status ready">

                                            <span className="status-dot"></span>

                                            Ready

                                        </span>

                                    </td>

                                    <td>
                                        2 min ago
                                    </td>

                                    <td>
                                        <button className="action-btn">
                                            •••
                                        </button>
                                    </td>

                                </tr>


                                <tr>

                                    <td>

                                        <div className="id-person">

                                            <div className="person-photo">
                                                PS
                                            </div>

                                            <div>

                                                <div className="person-name">
                                                    Priya Shah
                                                </div>

                                                <div className="person-type">
                                                    Student
                                                </div>

                                            </div>

                                        </div>

                                    </td>

                                    <td className="id-number">
                                        STU-2026-002
                                    </td>

                                    <td className="template">
                                        Student Classic
                                    </td>

                                    <td>

                                        <span className="status ready">

                                            <span className="status-dot"></span>

                                            Ready

                                        </span>

                                    </td>

                                    <td>
                                        18 min ago
                                    </td>

                                    <td>
                                        <button className="action-btn">
                                            •••
                                        </button>
                                    </td>

                                </tr>


                                <tr>

                                    <td>

                                        <div className="id-person">

                                            <div className="person-photo">
                                                AM
                                            </div>

                                            <div>

                                                <div className="person-name">
                                                    Amit More
                                                </div>

                                                <div className="person-type">
                                                    Staff
                                                </div>

                                            </div>

                                        </div>

                                    </td>

                                    <td className="id-number">
                                        STF-2026-014
                                    </td>

                                    <td className="template">
                                        Staff Professional
                                    </td>

                                    <td>

                                        <span className="status draft">

                                            <span className="status-dot"></span>

                                            Draft

                                        </span>

                                    </td>

                                    <td>
                                        1 hour ago
                                    </td>

                                    <td>
                                        <button className="action-btn">
                                            •••
                                        </button>
                                    </td>

                                </tr>


                                <tr>

                                    <td>

                                        <div className="id-person">

                                            <div className="person-photo">
                                                SN
                                            </div>

                                            <div>

                                                <div className="person-name">
                                                    Sneha Naik
                                                </div>

                                                <div className="person-type">
                                                    Student
                                                </div>

                                            </div>

                                        </div>

                                    </td>

                                    <td className="id-number">
                                        STU-2026-003
                                    </td>

                                    <td className="template">
                                        Student Classic
                                    </td>

                                    <td>

                                        <span className="status ready">

                                            <span className="status-dot"></span>

                                            Ready

                                        </span>

                                    </td>

                                    <td>
                                        2 hours ago
                                    </td>

                                    <td>
                                        <button className="action-btn">
                                            •••
                                        </button>
                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </div>


                    {/* =================================================
                        QUICK ACTIONS
                    ================================================= */}

                    <div className="section-header">

                        <h2 className="section-title">
                            Quick Actions
                        </h2>

                    </div>


                    <div className="quick-actions">

                        <div
                            className="quick-card"
                            id="quickCreate"
                            onClick={handleCreate}
                        >

                            <div className="quick-icon">
                                ＋
                            </div>

                            <div className="quick-title">
                                Create ID Card
                            </div>

                            <div className="quick-description">
                                Create a new digital ID card from a template.
                            </div>

                        </div>


                        <div className="quick-card">

                            <div className="quick-icon">
                                ▤
                            </div>

                            <div className="quick-title">
                                Browse Templates
                            </div>

                            <div className="quick-description">
                                Choose or customize an existing ID card design.
                            </div>

                        </div>


                        <div className="quick-card">

                            <div className="quick-icon">
                                ↓
                            </div>

                            <div className="quick-title">
                                Import Data
                            </div>

                            <div className="quick-description">
                                Import multiple students or employees at once.
                            </div>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Dashboard;