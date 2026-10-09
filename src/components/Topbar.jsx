import { Bell, CircleHelp } from "lucide-react";
import { useTour } from "./TourContext";
import "../styles/topbar.css";

function Topbar() {
const { startTour } = useTour();


return (
    <header className="topbar">
        <div className="topbar-spacer" />

        <button
            type="button"
            className="take-tour-btn"
            onClick={startTour}
            title="Take a guided tour"
            aria-label="Take a guided tour"
        >
            <CircleHelp size={18} strokeWidth={1.8} />
            <span>Take a Tour</span>
        </button>

        <button
            type="button"
            className="top-icon"
            title="Notifications"
            aria-label="Notifications"
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
