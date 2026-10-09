import { Bell } from "lucide-react";
import "../styles/topbar.css";

function Topbar() {
return ( 
    <header className="topbar"> 
        <div className="topbar-spacer" />

        <button
            type="button"
            className="top-icon"
            title="Notifications"
            aria-label="Notifications"
            onClick={() => {
                // Connect the notification panel when real
                // notification data is available.
            }}
        >
            <Bell size={19} strokeWidth={1.8} />
        </button>

        <div className="profile">
            <div className="profile-avatar" aria-hidden="true">
                AG
            </div>

            <div className="profile-details">
                <div className="profile-name">Aaditi</div>
                <div className="profile-role">Administrator</div>
            </div>
        </div>
    </header>
);

}

export default Topbar;
