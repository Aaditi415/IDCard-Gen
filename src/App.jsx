
import { useEffect } from "react";

import Dashboard from "./pages/Dashboard";
import Card from "./pages/Card";
import Details from "./pages/Details";
import ListForm from "./pages/ListForm";
import ImportData from "./pages/ImportData";
import AddSingleRecord from "./pages/AddSingleRecord";
import SingleRecord from "./pages/SingleRecord";
import SingleRecordReview from "./pages/SingleRecordReview";
import Preview from "./pages/Preview";
import Review from "./pages/Review";
import StoredData from "./pages/StoredData";
import Data from "./pages/Data";
import DataMenuSettings from "./pages/DataMenuSettings";
import CreateForm from "./pages/CreateForm";
import Design from "./pages/Design";
import Demo from "./pages/Demo";
import IdCardPreview from "./pages/IdCardPreview";
import StudentForm from "./pages/StudentForm";
import Templates from "./pages/Templates";
import IDListForm from "./pages/IDListForm";
import StudentData from "./pages/StudentData";
import AppTheme from "./pages/AppTheme";
import Login from "./pages/Login";


import { TourProvider, useTour } from "./components/TourContext";
import GuidedTour from "./components/GuidedTour";

function AppContent() {
    const { tourOpen, closeTour } = useTour();

    useEffect(() => {
        const savedTheme =
            localStorage.getItem("idCardTheme") || "light";

        const root = document.documentElement;

        root.classList.remove("theme-light", "theme-dark");

        if (savedTheme === "dark") {
            root.classList.add("theme-dark");
        } else if (savedTheme === "system") {
            const prefersDark = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;

            root.classList.add(
                prefersDark ? "theme-dark" : "theme-light"
            );
        } else {
            root.classList.add("theme-light");
        }
    }, []);


    
useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
        const currentPath = window.location.pathname;

        if (
            currentPath === "/login" ||
            currentPath === "/login.html"
        ) {
            return;
        }

        const token = localStorage.getItem("idFoundryToken");

        if (!token) {
            window.location.replace("/login");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/me",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (cancelled) return;

            if (!response.ok) {
                localStorage.removeItem("idFoundryToken");
                localStorage.removeItem("idFoundryUser");
                window.location.replace("/login");
            }
        } catch (error) {
            if (!cancelled) {
                console.error("Session verification failed:", error);
            }
        }
    };

    checkSession();

    return () => {
        cancelled = true;
    };
}, []);

    
    const path = window.location.pathname;

    let page;

    const isLoginPage =
        path === "/login" || path === "/login.html";

    const token = localStorage.getItem("idFoundryToken");

    useEffect(() => {
        if (!isLoginPage && !token) {
            window.location.replace("/login");
        }
    }, [isLoginPage, token]);

    // Keep the login page accessible without a token.
    if (isLoginPage) {
        return <Login />;
    }

    // Don't render private pages while redirecting.
    if (!token) {
        return null;
    }

    if (path.endsWith("/card") || path.endsWith("/card.html")) {
        page = <Card />;
    } else if (
        path.endsWith("/create-form") ||
        path.endsWith("/create-form.html")
    ) {
        page = <CreateForm />;
    } else if (
        path.endsWith("/design") ||
        path.endsWith("/design.html")
    ) {
        page = <Design />;
    } else if (
        path.endsWith("/demo") ||
        path.endsWith("/demo.html")
    ) {
        page = <Demo />;
    } else if (
        path.endsWith("/idcardpreview") ||
        path.endsWith("/idcardpreview.html")
    ) {
        page = <IdCardPreview />;
    } else if (
        path.endsWith("/templates") ||
        path.endsWith("/templates.html")
    ) {
        page = <Templates />;
    } else if (
        path.endsWith("/idlistform") ||
        path.endsWith("/idlistform.html")
    ) {
        page = <IDListForm />;
    } else if (
        path.startsWith("/studentform/") ||
        path.endsWith("/studentform.html")
    ) {
        page = <StudentForm />;
    } else if (
        path.endsWith("/details") ||
        path.endsWith("/details.html")
    ) {
        page = <Details />;
    } else if (
        path.endsWith("/listform") ||
        path.endsWith("/listform.html")
    ) {
        page = <ListForm />;
    } else if (
        path.endsWith("/importdata") ||
        path.endsWith("/importdata.html")
    ) {
        page = <ImportData />;
    } else if (
        path.endsWith("/add-single-record") ||
        path.endsWith("/add-single-record.html")
    ) {
        page = <AddSingleRecord />;
    } else if (
        path.endsWith("/single-record") ||
        path.endsWith("/single-record.html")
    ) {
        page = <SingleRecord />;
    } else if (
        path.endsWith("/single-record-review") ||
        path.endsWith("/single-record-review.html")
    ) {
        page = <SingleRecordReview />;
    } else if (
        path.endsWith("/preview") ||
        path.endsWith("/preview.html")
    ) {
        page = <Preview />;
    } else if (
        path.endsWith("/review") ||
        path.endsWith("/review.html")
    ) {
        page = <Review />;
    } else if (
        path.endsWith("/data-menu-settings") ||
        path.endsWith("/data-menu-settings.html")
    ) {
        page = <DataMenuSettings />;
    } else if (
        path.endsWith("/settings") ||
        path.endsWith("/settings.html") ||
        path.endsWith("/apptheme") ||
        path.endsWith("/apptheme.html")
    ) {
        page = <AppTheme />;
    } else if (
        path.startsWith("/stored-data")
    ) {
        page = <StoredData />;
    } else if (path.startsWith("/student-data")) {
        page = <StudentData />;
    } else if (
        path === "/data" ||
        path === "/data.html" ||
        path.startsWith("/data/")
    ) {
        page = <Data />;
    } else {
        page = <Dashboard />;
    }

    return (
        <>
            {page}

            <GuidedTour
                open={tourOpen}
                onClose={closeTour}
            />
        </>
    );
}

function App() {
    return (
        <TourProvider>
            <AppContent />
        </TourProvider>
    );
}

export default App;