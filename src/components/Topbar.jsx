function Topbar() {

    return (
        <header className="topbar">

            {/* NOTIFICATION */}

            <button
                className="top-icon"
                title="Notifications"
            >
                ♢
            </button>


            {/* PROFILE */}

            <div className="profile">

                <div className="profile-avatar">
                    AG
                </div>

                <div className="profile-name">
                    Aaditi
                </div>

                <span
                    style={{
                        fontSize: "10px",
                        color: "#9ca3af"
                    }}
                >
                    ⌄
                </span>

            </div>

        </header>
    );
}

export default Topbar;