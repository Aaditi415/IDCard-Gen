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
import IdCardPreview  from "./pages/IdCardPreview";
import StudentForm from "./pages/StudentForm";
import Templates from "./pages/Templates";
import IDListForm from "./pages/IDListForm";
import StudentData from "./pages/StudentData";

function App() {
    const path = window.location.pathname;

    // Card
    if (
        path.endsWith("/card") ||
        path.endsWith("/card.html")
    ) {
        return <Card />;
    }

    if (
        path.endsWith("/create-form") ||
        path.endsWith("/create-form.html")
    ) {
        return <CreateForm />;
    }

    if (
        path.endsWith("/design") ||
        path.endsWith("/design.html")
    ) {
        return <Design />;
    }
    if (
        path.endsWith("/demo") ||
        path.endsWith("/demo.html")
    ) {
        return <Demo />;
    }

    if (
        path.endsWith("/idcardpreview") ||
        path.endsWith("/idcardpreview.html")
    ) {
        return <IdCardPreview />;
    }

    if (
        path.endsWith("/templates") ||
        path.endsWith("/templates.html")
    ) {
        return <Templates />;
    }
    
    if (
        path.endsWith("/idlistform") ||
        path.endsWith("/idlistform.html")
    ) {
        return <IDListForm />;
    }

    if (
        path.startsWith("/studentform/") ||
        path.endsWith("/studentform.html")
    ) {
        return <StudentForm />;
    }

    // Details
    if (
        path.endsWith("/details") ||
        path.endsWith("/details.html")
    ) {
        return <Details />;
    }

    // List Form
    if (
        path.endsWith("/listform") ||
        path.endsWith("/listform.html")
    ) {
        return <ListForm />;
    }

    // Import Data
    if (
        path.endsWith("/importdata") ||
        path.endsWith("/importdata.html")
    ) {
        return <ImportData />;
    }

    if (
        path.endsWith("/add-single-record") ||
        path.endsWith("/add-single-record.html")
    ) {
        return <AddSingleRecord />;
    }

    if (
        path.endsWith("/single-record") ||
        path.endsWith("/single-record.html")
    ) {
        return <SingleRecord />;
    }

    if (
        path.endsWith("/single-record-review") ||
        path.endsWith("/single-record-review.html")
    ) {
        return <SingleRecordReview />;
    }
    // Preview
    if (
        path.endsWith("/preview") ||
        path.endsWith("/preview.html")
    ) {
        return <Preview />;
    }

    // Review
    if (
        path.endsWith("/review") ||
        path.endsWith("/review.html")
    ) {
        return <Review />;
    }

    // Stored Data
    if (
        path.startsWith("/stored-data") ||
        path.startsWith("/stored-data.html")
    ) {
        return <StoredData />;
    }

    if (
        path.startsWith("/student-data")
    ) {
        return <StudentData />;
    }

    if (
        path.startsWith("/data") ||
        path.startsWith("/data.html")
    ) {
        return <Data />;
    }

    // Settings
    if (
        path.endsWith("/settings") ||
        path.endsWith("/settings.html")
    ) {
        return <DataMenuSettings />;
    }

    // Default
    return <Dashboard />;
}

export default App;