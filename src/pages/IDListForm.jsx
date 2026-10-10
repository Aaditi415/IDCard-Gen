import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function IDListForm() {
    const [listName, setListName] = useState("");
    const [tabName, setTabName] = useState("");

    const [selectedTemplateId, setSelectedTemplateId] =
        useState("");

    const [selectedMasterListId, setSelectedMasterListId] =
        useState("");

    const [templates, setTemplates] = useState([]);
    const [masterLists, setMasterLists] = useState([]);

    const [listNameError, setListNameError] =
        useState(false);

    const [tabNameError, setTabNameError] =
        useState(false);

    const [templateError, setTemplateError] =
        useState(false);

    const [masterListError, setMasterListError] =
        useState(false);

    const [showSuccess, setShowSuccess] =
        useState(false);

    const [createdList, setCreatedList] =
        useState(null);

    const [toast, setToast] = useState("");
    const [toastVisible, setToastVisible] =
        useState(false);


    /* =========================
       TOAST
    ========================== */

    const showToast = (message) => {
        setToast(message);
        setToastVisible(true);

        setTimeout(() => {
            setToastVisible(false);
        }, 2500);
    };


    /* =========================
       LOAD TEMPLATES + MASTER LISTS
    ========================== */

    useEffect(() => {
        try {

            /* =========================
               LOAD TEMPLATES
            ========================== */

            const savedTemplates =
                JSON.parse(
                    localStorage.getItem("idCardTemplates")
                ) || [];

            setTemplates(
                Array.isArray(savedTemplates)
                    ? savedTemplates
                    : []
            );


            /* =========================
               LOAD MASTER LISTS
            ========================== */

            const savedMasterLists =
                JSON.parse(
                    localStorage.getItem("idCardStoredLists")
                );


            /*
             * New storage:
             *
             * idCardStoredLists = [
             *   masterList1,
             *   masterList2,
             *   masterList3
             * ]
             */

            if (Array.isArray(savedMasterLists)) {

                setMasterLists(
                    savedMasterLists
                );

            } else {

                /*
                 * Backward compatibility
                 *
                 * If old data exists under
                 * idCardFinalList, convert it
                 * into an array.
                 */

                const oldMasterList =
                    JSON.parse(
                        localStorage.getItem(
                            "idCardFinalList"
                        )
                    );


                if (oldMasterList) {

                    const convertedMasterList = {

                        ...oldMasterList,

                        id:
                            oldMasterList.id ||
                            "master_" + Date.now()

                    };


                    const convertedLists = [
                        convertedMasterList
                    ];


                    /*
                     * Save it in the new format
                     * so future lists can be added.
                     */

                    localStorage.setItem(
                        "idCardStoredLists",
                        JSON.stringify(
                            convertedLists
                        )
                    );


                    setMasterLists(
                        convertedLists
                    );

                } else {

                    setMasterLists([]);

                }
            }

        } catch (error) {

            console.error(
                "Unable to load templates or master lists:",
                error
            );

            setTemplates([]);
            setMasterLists([]);
        }

    }, []);

    
    const LIST_NAME_MIN_LENGTH = 3;
    const LIST_NAME_MAX_LENGTH = 50;

    const TAB_NAME_MIN_LENGTH = 2;
    const TAB_NAME_MAX_LENGTH = 30;

    /* =========================
       VALIDATION
    ========================== */


    const validateForm = () => {
        let valid = true;

        const listValue = listName.trim();
        const tabValue = tabName.trim();

        setListNameError(false);
        setTabNameError(false);
        setTemplateError(false);
        setMasterListError(false);

        // Validate List Name
        if (!listValue) {
            setListNameError("Please enter a list name.");
            valid = false;
        } else if (listValue.length < LIST_NAME_MIN_LENGTH) {
            setListNameError(
                `List name must contain at least ${LIST_NAME_MIN_LENGTH} characters.`
            );
            valid = false;
        } else if (listValue.length > LIST_NAME_MAX_LENGTH) {
            setListNameError(
                `List name cannot exceed ${LIST_NAME_MAX_LENGTH} characters.`
            );
            valid = false;
        }

        // Validate Tab Name
        if (!tabValue) {
            setTabNameError("Please enter a tab name.");
            valid = false;
        } else if (tabValue.length < TAB_NAME_MIN_LENGTH) {
            setTabNameError(
                `Tab name must contain at least ${TAB_NAME_MIN_LENGTH} characters.`
            );
            valid = false;
        } else if (tabValue.length > TAB_NAME_MAX_LENGTH) {
            setTabNameError(
                `Tab name cannot exceed ${TAB_NAME_MAX_LENGTH} characters.`
            );
            valid = false;
        }

        // Load existing lists
        let existingLists = [];

        try {
            const savedLists = JSON.parse(
                localStorage.getItem("idCardLists") || "[]"
            );

            if (Array.isArray(savedLists)) {
                existingLists = savedLists;
            }
        } catch (error) {
            console.error("Unable to load existing lists:", error);
        }

        const normalizedList = listValue.toLowerCase();
        const normalizedTab = tabValue.toLowerCase();
        const slug = createSlug(tabValue);

        // Duplicate List Name
        if (
            listValue &&
            existingLists.some(
                (item) =>
                    item.listName?.trim().toLowerCase() === normalizedList
            )
        ) {
            setListNameError("This list name already exists.");
            valid = false;
        }

        // Duplicate Tab Name or Student Link
        if (
            tabValue &&
            existingLists.some(
                (item) =>
                    item.tabName?.trim().toLowerCase() === normalizedTab ||
                    item.slug === slug
            )
        ) {
            setTabNameError(
                "This tab name or its student link already exists."
            );
            valid = false;
        }

        // Validate Template
        if (!selectedTemplateId) {
            setTemplateError(true);
            valid = false;
        }

        // Validate Master List
        if (!selectedMasterListId) {
            setMasterListError(true);
            valid = false;
        }

        return valid;
    };

    /* =========================
       CREATE SLUG
    ========================== */

    const createSlug = (value) => {

        return value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

    };


    /* =========================
       CONTINUE
    ========================== */

    const handleContinue = () => {

        if (!validateForm()) {

            showToast(
                "Please complete the required fields."
            );

            return;
        }


        const list =
            listName.trim();

        const tab =
            tabName.trim();


        /* =========================
           FIND TEMPLATE
        ========================== */

        const selectedTemplate =
            templates.find(
                (template) =>
                    template.id ===
                    selectedTemplateId
            );


        /* =========================
           FIND MASTER LIST
        ========================== */

        const selectedMasterList =
            masterLists.find(
                (masterList) =>
                    masterList.id ===
                    selectedMasterListId
            );


        if (!selectedMasterList) {

            showToast(
                "Selected master list could not be found."
            );

            return;
        }


        /* =========================
           CREATE SLUG
        ========================== */

        const slug =
            createSlug(tab);


        if (!slug) {

            showToast(
                "Please enter a valid tab name."
            );

            return;
        }


        /* =========================
           CREATE STUDENT LINK
        ========================== */

        const studentLink =
            `/studentform/${slug}`;


        /* =========================
           LOAD EXISTING CLASS LISTS
        ========================== */

        let existingLists = [];

        try {

            const savedLists =
                JSON.parse(
                    localStorage.getItem(
                        "idCardLists"
                    )
                ) || [];


            if (Array.isArray(savedLists)) {

                existingLists =
                    savedLists;

            }

        } catch (error) {

            console.error(
                "Unable to load existing class lists:",
                error
            );

        }


        /* =========================
           CHECK DUPLICATE TAB / SLUG
        ========================== */

        const duplicate =
            existingLists.find(
                (item) =>
                    item.slug === slug
            );


        if (duplicate) {

            showToast(
                `A link already exists for ${tab}.`
            );

            return;
        }


        /* =========================
           CREATE LIST DATA
        ========================== */

        const now =
            new Date().toISOString();


        const listData = {

            id:
                "list_" +
                Date.now(),

            listName:
                list,

            tabName:
                tab,

            slug:
                slug,

            studentLink:
                studentLink,


            /* =========================
               TEMPLATE
            ========================= */

            templateId:
                selectedTemplateId,

            templateName:
                selectedTemplate?.name ||
                "",


            /* =========================
               MASTER LIST
            ========================= */

            masterListId:
                selectedMasterListId,

            masterListName:
                selectedMasterList?.listName ||
                selectedMasterList?.name ||
                "",


            /* =========================
               VERIFICATION
            ========================= */

            verification: {

                status:
                    "pending",

                masterListId:
                    selectedMasterListId

            },


            createdAt:
                now,

            updatedAt:
                now

        };


        /* =========================
           ADD NEW CLASS LIST
        ========================== */

        const updatedLists = [

            ...existingLists,

            listData

        ];


        /* =========================
           SAVE ALL CLASS LISTS
        ========================= */

        localStorage.setItem(
            "idCardLists",
            JSON.stringify(
                updatedLists
            )
        );


        /* =========================
           SAVE CURRENT LIST
           
           Kept for backward
           compatibility with
           current StudentForm.
        ========================= */

        localStorage.setItem(
            "idCardList",
            JSON.stringify(
                listData
            )
        );


        /* =========================
           SET CREATED LIST
        ========================= */

        setCreatedList(
            listData
        );


        console.log(
            "Class list created:",
            listData
        );


        /* =========================
           SHOW SUCCESS
        ========================= */

        setShowSuccess(
            true
        );


        showToast(
            "Class link created successfully."
        );

    };


    /* =========================
       CANCEL
    ========================== */

    const handleCancel = () => {

        const hasData =
            listName.trim() ||
            tabName.trim() ||
            selectedTemplateId ||
            selectedMasterListId;


        if (hasData) {

            const confirmCancel =
                window.confirm(
                    "Are you sure you want to cancel? Your entered information will be lost."
                );


            if (!confirmCancel) {
                return;
            }

        }


        setListName("");
        setTabName("");

        setSelectedTemplateId("");
        setSelectedMasterListId("");

        setListNameError(false);
        setTabNameError(false);
        setTemplateError(false);
        setMasterListError(false);

        setShowSuccess(false);
        setCreatedList(null);
    };


    /* =========================
       ENTER KEY
    ========================== */

    const handleKeyDown = (event) => {

        if (event.key === "Enter") {

            event.preventDefault();

            handleContinue();

        }

    };


    /* =========================
       INITIALS
    ========================== */

    const getInitials = (name) => {

        const words =
            name.trim().split(/\s+/);


        if (
            !words.length ||
            !words[0]
        ) {

            return "A";

        }


        if (words.length === 1) {

            return words[0]
                .charAt(0)
                .toUpperCase();

        }


        return (
            words[0].charAt(0) +
            words[1].charAt(0)
        ).toUpperCase();

    };


    /* =========================
       NAVIGATION
    ========================== */

    const goImportData = () => {

        window.location.href =
            "/importdata";

    };


    const goBack = () => {

        window.location.href =
            "/idlistform";

    };


    /* =========================
       TEMPLATE NAME
    ========================== */

    const getTemplateName = () => {

        const template =
            templates.find(
                (item) =>
                    item.id ===
                    selectedTemplateId
            );


        return (
            template?.name ||
            "Select template"
        );

    };


    /* =========================
       MASTER LIST NAME
    ========================== */

    const getMasterListName = () => {

        const masterList =
            masterLists.find(
                (item) =>
                    item.id ===
                    selectedMasterListId
            );


        return (
            masterList?.listName ||
            masterList?.name ||
            "Select master list"
        );

    };


    return (
        <div className="app">

            {/* =========================
                SIDEBAR
            ========================== */}

            <Sidebar
                activePage="IDlistform"
            />


            <main className="main">

                <Topbar />


                <section className="content">

                    {/* =========================
                        BREADCRUMB
                    ========================== */}

                    <div className="breadcrumb">

                        <button
                            onClick={goBack}
                        >
                            Import Data
                        </button>

                        <span>
                            ›
                        </span>

                        <span>
                            Create New List
                        </span>

                    </div>


                    {/* =========================
                        HEADER
                    ========================== */}

                    <h1 className="page-title">
                        Create Student Form
                    </h1>

                    <p className="page-subtitle">
                        Create a shareable student registration form, choose
                        the master list for verification, and select the ID
                        card design.
                    </p>


                    {/* =========================
                        STEPS
                    ========================== */}

                   

                    <div className="steps">

                        <div
                            className={`step ${
                                showSuccess ? "completed" : "active"
                            }`}
                        >

                            <div className="step-number">
                                {showSuccess ? "✓" : "1"}
                            </div>

                            <div className="step-label">
                                Create List
                            </div>

                        </div>


                        <div
                            className={`step-line ${
                                showSuccess ? "completed" : ""
                            }`}
                        ></div>


                        <div
                            className={`step ${
                                showSuccess ? "active" : ""
                            }`}
                        >

                            <div className="step-number">
                                2
                            </div>

                            <div className="step-label">
                                Copy Link
                            </div>

                        </div>

                    </div>


                    {/* =========================
                        MAIN LAYOUT
                    ========================== */}

                    <div className="layout">


                        {/* =========================
                            FORM
                        ========================== */}

                        <div>

                            {!showSuccess && (

                                <div
                                    className="form-card"
                                    id="formCard"
                                >

                                    <div className="form-card-header">

                                        <h2>
                                            List Information
                                        </h2>

                                        <p>
                                            Set up this student
                                            list before importing
                                            student records.
                                        </p>

                                    </div>


                                    <div className="form-body">


                                        {/* =========================
                                            LIST NAME
                                        ========================== */}

                                        <div className="field">

                                            <div className="field-label">

                                                <label htmlFor="listName">

                                                    List Name

                                                    <span className="required">
                                                        *
                                                    </span>

                                                </label>


                                            </div>


                                            <div className="input-wrap">

                                                <input
                                                    type="text"
                                                    id="listName"
                                                    className={`input ${
                                                        listNameError
                                                            ? "invalid"
                                                            : ""
                                                    }`}
                                                    placeholder="e.g. 1st Standard - A Students"
                                                    minLength={LIST_NAME_MIN_LENGTH}
                                                    maxLength={LIST_NAME_MAX_LENGTH}
                                                    value={listName}
                                                    onChange={(event) => {

                                                        setListName(
                                                            event.target.value
                                                        );


                                                        if (
                                                            event.target.value.trim()
                                                        ) {

                                                            setListNameError(
                                                                false
                                                            );

                                                        }

                                                    }}
                                                    onKeyDown={
                                                        handleKeyDown
                                                    }
                                                />

                                            </div>

                                            <p class="field-hint">Give the complete group a recognizable name. For example, use an academic year or a class name so you can find it later.</p>


                                            <div
                                                className={`error ${
                                                    listNameError
                                                        ? "show"
                                                        : ""
                                                }`}
                                            >
                                                {listNameError}
                                            </div>

                                        </div>


                                        {/* =========================
                                            TAB NAME
                                        ========================== */}

                                        <div className="field">

                                            <div className="field-label">

                                                <label htmlFor="tabName">

                                                    Tab Name

                                                    <span className="required">
                                                        *
                                                    </span>

                                                </label>

                                            </div>


                                            <div className="input-wrap">

                                                <input
                                                    type="text"
                                                    id="tabName"
                                                    className={`input ${
                                                        tabNameError
                                                            ? "invalid"
                                                            : ""
                                                    }`}
                                                    placeholder="e.g. 1st A"
                                                    minLength={TAB_NAME_MIN_LENGTH}
                                                    maxLength={TAB_NAME_MAX_LENGTH}
                                                    value={tabName}
                                                    onChange={(event) => {

                                                        setTabName(
                                                            event.target.value
                                                        );


                                                        if (
                                                            event.target.value.trim()
                                                        ) {

                                                            setTabNameError(
                                                                false
                                                            );

                                                        }

                                                    }}
                                                    onKeyDown={
                                                        handleKeyDown
                                                    }
                                                />

                                            </div>

                                            <p class="field-hint">This is the short label used to identify this group in your student data view. Keep it brief, such as "10th A" or "5th B".</p>


                                            <div
                                                className={`error ${
                                                    tabNameError
                                                        ? "show"
                                                        : ""
                                                }`}
                                            >
                                                {tabNameError}
                                            </div>

                                        </div>


                                        {/* =========================
                                            TEMPLATE
                                        ========================== */}

                                        <div className="field">

                                            <div className="field-label">

                                                <label htmlFor="template">

                                                    ID Card Template

                                                    <span className="required">
                                                        *
                                                    </span>

                                                </label>

                                                <span className="field-hint">
                                                    Card design
                                                </span>

                                            </div>


                                            <div className="input-wrap">

                                                <select
                                                    id="template"
                                                    className={`input ${
                                                        templateError
                                                            ? "invalid"
                                                            : ""
                                                    }`}
                                                    value={
                                                        selectedTemplateId
                                                    }
                                                    onChange={(event) => {

                                                        setSelectedTemplateId(
                                                            event.target.value
                                                        );


                                                        if (
                                                            event.target.value
                                                        ) {

                                                            setTemplateError(
                                                                false
                                                            );

                                                        }

                                                    }}
                                                >

                                                    <option value="">
                                                        Select ID card template
                                                    </option>


                                                    {templates.map(
                                                        (template) => (

                                                            <option
                                                                key={
                                                                    template.id
                                                                }
                                                                value={
                                                                    template.id
                                                                }
                                                            >
                                                                {
                                                                    template.name
                                                                }
                                                            </option>

                                                        )
                                                    )}

                                                </select>

                                            </div>

                                            <p class="field-hint">Select the ID card design you want to use for students in this group. The selected template will be used to generate their ID cards.</p>


                                            <div
                                                className={`error ${
                                                    templateError
                                                        ? "show"
                                                        : ""
                                                }`}
                                            >
                                                Please select an ID card template.
                                            </div>

                                        </div>


                                        {/* =========================
                                            MASTER LIST
                                        ========================== */}

                                        <div className="field">

                                            <div className="field-label">

                                                <label htmlFor="masterList">

                                                    Master List

                                                    <span className="required">
                                                        *
                                                    </span>

                                                </label>

                                                <span className="field-hint">
                                                    Verification source
                                                </span>

                                            </div>


                                            <div className="input-wrap">

                                                <select
                                                    id="masterList"
                                                    className={`input ${
                                                        masterListError
                                                            ? "invalid"
                                                            : ""
                                                    }`}
                                                    value={
                                                        selectedMasterListId
                                                    }
                                                    onChange={(event) => {

                                                        setSelectedMasterListId(
                                                            event.target.value
                                                        );


                                                        if (
                                                            event.target.value
                                                        ) {

                                                            setMasterListError(
                                                                false
                                                            );

                                                        }

                                                    }}
                                                >

                                                    <option value="">
                                                        Select master list
                                                    </option>


                                                    {masterLists.map(
                                                        (masterList) => (

                                                            <option
                                                                key={
                                                                    masterList.id
                                                                }
                                                                value={
                                                                    masterList.id
                                                                }
                                                            >
                                                                {
                                                                    masterList.listName ||
                                                                    masterList.name ||
                                                                    "Unnamed Master List"
                                                                }
                                                            </option>

                                                        )
                                                    )}

                                                </select>

                                            </div>

                                            <p class="field-hint">Select the master student list used to verify submitted details. Student information will be checked against this list before approval.</p>

                                            <div
                                                className={`error ${
                                                    masterListError
                                                        ? "show"
                                                        : ""
                                                }`}
                                            >
                                                Please select a master list.
                                            </div>

                                        </div>


                                        {/* =========================
                                            PREVIEW
                                        ========================== */}

                                        <div className="preview-box">

                                            <div className="preview-label">
                                                List Preview
                                            </div>


                                            <div className="tab-preview">

                                                <div className="tab-icon">

                                                    {getInitials(
                                                        tabName
                                                    )}

                                                </div>


                                                <div>

                                                    <strong>
                                                        {tabName.trim() ||
                                                            "Your tab name"}
                                                    </strong>


                                                    <span
                                                        style={{
                                                            display:
                                                                "block",

                                                            fontSize:
                                                                "12px",

                                                            marginTop:
                                                                "3px"
                                                        }}
                                                    >
                                                        {listName.trim() ||
                                                            "Your list name"}
                                                    </span>

                                                </div>

                                            </div>


                                            <div
                                                style={{
                                                    marginTop:
                                                        "12px",

                                                    fontSize:
                                                        "13px"
                                                }}
                                            >

                                                <strong>
                                                    Template:
                                                </strong>{" "}

                                                {getTemplateName()}


                                                <br />


                                                <strong>
                                                    Master List:
                                                </strong>{" "}

                                                {getMasterListName()}

                                            </div>

                                        </div>

                                    </div>


                                    {/* =========================
                                        FOOTER
                                    ========================== */}

                                     

                                    <div className="bottom-actions">

                                        <button
                                            type="button"
                                            className="ui-btn ui-btn--secondary"
                                            onClick={
                                                handleCancel
                                            }
                                        >
                                            Cancel
                                        </button>


                                        <button
                                            type="button"
                                            className="ui-btn ui-btn--primary"
                                            onClick={
                                                handleContinue
                                            }
                                        >
                                            Continue

                                            <span
                                                style={{
                                                    marginLeft:
                                                        "5px"
                                                }}
                                            >
                                                →
                                            </span>

                                        </button>

                                    </div>

                                 

                                </div>

                            )}


                            {/* =========================
                                SUCCESS STATE
                            ========================== */}

                            <div
                                className={`success-state ${
                                    showSuccess
                                        ? "show"
                                        : ""
                                }`}
                            >

                                <div className="success-icon">
                                    ✓
                                </div>


                                <h2>
                                    Class Link Created
                                </h2>


                                <p>

                                    Share this link with students of

                                    <strong>
                                        {" "}
                                        {createdList?.tabName}
                                    </strong>.

                                </p>


                                <div className="generated-link-box">

                                    <span>
                                        Student Registration Link : &nbsp;
                                    </span>


                                    <strong>

                                        {window.location.origin}

                                        {createdList?.studentLink}

                                    </strong>
                                    <br />



                                </div>


                                <div className="success-actions">

                                    <button
                                        type="button"
                                        className="ui-btn ui-btn--primary"
                                        style={{marginTop: "10px"}}
                                        onClick={() => {

                                            const fullLink =
                                                window.location.origin +
                                                createdList?.studentLink;


                                            navigator.clipboard.writeText(
                                                fullLink
                                            );


                                            showToast(
                                                "Student link copied."
                                            );

                                        }}
                                    >
                                         Copy Link
                                    </button>

                                </div>

                            </div>

                        </div>


                        {/* =========================
                            INFORMATION
                        ========================== */}

                        
                        <aside className="info-card">
                            <div className="info-card-heading">
                                <div className="info-heading-icon">i</div>
                                <div>
                                    <h3>How this works</h3>
                                    <p>
                                        Set up a student submission flow in a few steps.
                                    </p>
                                </div>
                            </div>

                            <div className="info-divider" />

                            <div className="info-item">
                                <div className="info-number">1</div>
                                <div>
                                    <strong>Identify submissions</strong>
                                    <span>
                                        The list name and tab name organize the
                                        submissions from your student form.
                                    </span>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-number">2</div>
                                <div>
                                    <strong>Verify student details</strong>
                                    <span>
                                        Select the master list that will be used
                                        to check the submitted student information.
                                    </span>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-number">3</div>
                                <div>
                                    <strong>Choose the ID card design</strong>
                                    <span>
                                        Associate a saved template with this student
                                        form for the later card-generation workflow.
                                    </span>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-number">4</div>
                                <div>
                                    <strong>Share the link</strong>
                                    <span>
                                        Students can open the generated URL to submit
                                        their information. The public form route must
                                        load and save this configuration.
                                    </span>
                                </div>
                            </div>

                            <div className="info-tip">
                                <strong>Tip</strong>
                                <p>
                                    Select the correct master list before sharing
                                    the link. Student verification depends on the
                                    master data configured for this form.
                                </p>
                            </div>
                        </aside>

                    </div>

                </section>

            </main>


            {/* =========================
                TOAST
            ========================== */}

            <div
                className={`toast ${
                    toastVisible
                        ? "show"
                        : ""
                }`}
                id="toast"
            >
                {toast}
            </div>

        </div>
    );
}

export default IDListForm;