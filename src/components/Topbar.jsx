import { useEffect, useRef, useState } from "react";
import {
    Bell,
    CircleHelp,
    ChevronDown,
    LogOut,
    UserRound,
} from "lucide-react";

import { useTour } from "./TourContext";
import "../styles/topbar.css";

function Topbar() {
    const { startTour } = useTour();

    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    let user = {};

    try {
        user = JSON.parse(
            localStorage.getItem("idFoundryUser") || "{}"
        );
    } catch {
        user = {};
    }

    const name = user.name || "User";

    const role =
        user.role === "superadmin"
            ? "Super Admin"
            : user.role === "orgadmin"
            ? "Organization Admin"
            : "Administrator";

    const initials = name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join("") || "U";

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setProfileOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("idFoundryToken");
        localStorage.removeItem("idFoundryUser");

        window.location.replace("/login");
    };

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

            <div className="profile" ref={profileRef}>
                <button
                    type="button"
                    className="profile-trigger"
                    onClick={() => setProfileOpen((open) => !open)}
                    aria-expanded={profileOpen}
                    aria-haspopup="menu"
                    aria-label="Open account menu"
                >
                    <div className="profile-avatar" aria-hidden="true">
                        {initials}
                    </div>

                    <div className="profile-details">
                        <div className="profile-name">{name}</div>
                        <div className="profile-role">{role}</div>
                    </div>

                    <ChevronDown
                        size={16}
                        className={`profile-chevron ${
                            profileOpen ? "profile-chevron-open" : ""
                        }`}
                    />
                </button>

                {profileOpen && (
                    <div className="profile-dropdown" role="menu">
                        <div className="profile-dropdown-user">
                            <div className="profile-dropdown-avatar">
                                {initials}
                            </div>

                            <div className="profile-dropdown-info">
                                <div className="profile-dropdown-name">
                                    {name}
                                </div>
                                <div className="profile-dropdown-email">
                                    {user.email || ""}
                                </div>
                            </div>
                        </div>

                        <div className="profile-dropdown-divider" />

                        <div className="profile-dropdown-role">
                            <UserRound size={16} />
                            <span>{role}</span>
                        </div>

                        <button
                            type="button"
                            className="profile-logout"
                            role="menuitem"
                            onClick={handleLogout}
                        >
                            <LogOut size={17} />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Topbar;
