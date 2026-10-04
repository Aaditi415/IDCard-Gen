/* =====================================================
   VERIFICATION ENGINE
===================================================== */

/* -----------------------------------------------------
   NORMALIZE TEXT
----------------------------------------------------- */

const normalizeText = (value) => {

    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }

    return String(value)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

};


/* -----------------------------------------------------
   NORMALIZE DATE
----------------------------------------------------- */

const normalizeDate = (value) => {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return "";
    }

    const text = String(value).trim();

    /* YYYY-MM-DD */

    let match =
        text.match(
            /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/
        );

    if (match) {

        const year = match[1];
        const month =
            match[2].padStart(2, "0");
        const day =
            match[3].padStart(2, "0");

        return `${year}-${month}-${day}`;

    }


    /* DD/MM/YYYY or DD-MM-YYYY */

    match =
        text.match(
            /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/
        );

    if (match) {

        const day =
            match[1].padStart(2, "0");

        const month =
            match[2].padStart(2, "0");

        const year =
            match[3];

        return `${year}-${month}-${day}`;

    }


    return normalizeText(text);

};


/* -----------------------------------------------------
   FIELD ALIASES
----------------------------------------------------- */

const FIELD_ALIASES = {

    name: [
        "name",
        "student name",
        "full name",
        "student full name",
        "candidate name"
    ],

    studentId: [
        "id",
        "id number",
        "student id",
        "student id number",
        "student number",
        "student no",
        "member id",
        "member number",
        "member no",
        "membership id",
        "membership number",
        "enrollment number",
        "enrolment number",
        "registration number",
        "registration no",
        "admission number",
        "admission no"
    ],

    dob: [
        "dob",
        "date of birth",
        "birth date",
        "birthdate"
    ]

};


/* -----------------------------------------------------
   GET LOGICAL FIELD TYPE
----------------------------------------------------- */

const getLogicalFieldType = (label) => {

    const normalized =
        normalizeText(label);

    for (
        const [type, aliases]
        of Object.entries(FIELD_ALIASES)
    ) {

        const matched =
            aliases.some(
                alias =>
                    normalized ===
                    normalizeText(alias)
            );

        if (matched) {
            return type;
        }

    }

    return null;

};


/* -----------------------------------------------------
   GET MASTER COLUMN
----------------------------------------------------- */

const findMasterColumn = (
    headers,
    logicalType
) => {

    if (!Array.isArray(headers)) {
        return -1;
    }

    const aliases =
        FIELD_ALIASES[logicalType] || [];

    return headers.findIndex(
        header => {

            const normalizedHeader =
                normalizeText(header);

            return aliases.some(
                alias => {

                    const normalizedAlias =
                        normalizeText(alias);

                    return (
                        normalizedHeader ===
                        normalizedAlias
                    );

                }
            );

        }
    );

};


/* -----------------------------------------------------
   FIND STUDENT FORM FIELD
----------------------------------------------------- */

const findStudentFormField = (
    formFields,
    logicalType
) => {

    if (!Array.isArray(formFields)) {
        return null;
    }

    return (
        formFields.find(field => {

            const label =
                field?.label ||
                field?.name ||
                "";

            return (
                getLogicalFieldType(label) ===
                logicalType
            );

        }) || null
    );

};


/* -----------------------------------------------------
   GET MASTER LIST
----------------------------------------------------- */

const getMasterList = (
    masterListId
) => {

    if (!masterListId) {
        return null;
    }

    try {

        /* ---------------------------------------------
           PRIMARY SOURCE
        --------------------------------------------- */

        const masterLists =
            JSON.parse(
                localStorage.getItem(
                    "idCardMasterLists"
                )
            ) || [];

        if (Array.isArray(masterLists)) {

            const found =
                masterLists.find(
                    list =>
                        list.id ===
                        masterListId
                );

            if (found) {
                return found;
            }

        }


        /* ---------------------------------------------
           FALLBACK
        --------------------------------------------- */

        const storedLists =
            JSON.parse(
                localStorage.getItem(
                    "idCardStoredLists"
                )
            ) || [];

        if (Array.isArray(storedLists)) {

            const found =
                storedLists.find(
                    list =>
                        list.id ===
                        masterListId
                );

            if (found) {
                return found;
            }

        }


        /* ---------------------------------------------
           OLD DATA
        --------------------------------------------- */

        const oldMaster =
            JSON.parse(
                localStorage.getItem(
                    "idCardFinalList"
                )
            );

        if (
            oldMaster &&
            oldMaster.id === masterListId
        ) {
            return oldMaster;
        }

    } catch (error) {

        console.error(
            "Failed to load master list:",
            error
        );

    }

    return null;

};


/* -----------------------------------------------------
   GET MASTER RECORDS
----------------------------------------------------- */

const getMasterRecords = (
    masterList
) => {

    if (!masterList) {
        return [];
    }

    if (
        Array.isArray(
            masterList.students
        )
    ) {
        return masterList.students;
    }

    if (
        Array.isArray(
            masterList.records
        )
    ) {
        return masterList.records;
    }

    return [];

};


/* -----------------------------------------------------
   GET MASTER VALUE
----------------------------------------------------- */

const getMasterValue = (
    record,
    headers,
    columnIndex
) => {

    if (
        columnIndex < 0 ||
        !record
    ) {
        return "";
    }

    /* Array based master data */

    if (Array.isArray(record)) {

        return record[columnIndex];

    }


    /* Object based master data */

    const header =
        headers[columnIndex];

    if (
        record &&
        typeof record === "object"
    ) {

        return (
            record[header] ??
            record[
                Object.keys(record).find(
                    key =>
                        normalizeText(key) ===
                        normalizeText(header)
                )
            ] ??
            ""
        );

    }

    return "";

};


/* -----------------------------------------------------
   COMPARE VALUES
----------------------------------------------------- */

const compareVerificationValue = (
    logicalType,
    masterValue,
    studentValue
) => {

    if (
        logicalType === "dob"
    ) {

        return (
            normalizeDate(
                masterValue
            ) ===
            normalizeDate(
                studentValue
            )
        );

    }

    return (
        normalizeText(
            masterValue
        ) ===
        normalizeText(
            studentValue
        )
    );

};


/* =====================================================
   MAIN VERIFICATION
===================================================== */

const verifyStudentSubmission = ({
    submissionData,
    formFields,
    listData
}) => {

    const masterList =
        getMasterList(
            listData?.masterListId
        );


    /* -------------------------------------------------
       MASTER LIST NOT FOUND
    ------------------------------------------------- */

    if (!masterList) {

        return {

            status: "pending",

            matched: false,

            checkedFields: {},

            issues: [
                "Assigned master list was not found."
            ],

            masterRecordIndex: null,

            checkedAt:
                new Date().toISOString()

        };

    }


    const headers =
        Array.isArray(
            masterList.headers
        )
            ? masterList.headers
            : [];


    const records =
        getMasterRecords(
            masterList
        );


    /* -------------------------------------------------
       FIND COMMON VERIFICATION FIELDS
    ------------------------------------------------- */

    const verificationFields = [];

    for (
        const logicalType
        of Object.keys(FIELD_ALIASES)
    ) {

        const masterColumn =
            findMasterColumn(
                headers,
                logicalType
            );

        const studentField =
            findStudentFormField(
                formFields,
                logicalType
            );


        if (
            masterColumn !== -1 &&
            studentField
        ) {

            verificationFields.push({

                logicalType,

                masterColumn,

                studentField

            });

        }

    }


    /* -------------------------------------------------
       NOT ENOUGH COMMON FIELDS
    ------------------------------------------------- */

    if (
        verificationFields.length < 2
    ) {

        return {

            status: "pending",

            matched: false,

            checkedFields: {},

            issues: [
                "At least 2 matching verification fields are required."
            ],

            masterRecordIndex: null,

            checkedAt:
                new Date().toISOString()

        };

    }


    /* -------------------------------------------------
       FIND MASTER STUDENT
    ------------------------------------------------- */

    let matchedRecordIndex = -1;

    let matchedRecord = null;


    for (
        let index = 0;
        index < records.length;
        index++
    ) {

        const record =
            records[index];


        /*
         * We consider a record a candidate when
         * ALL common verification fields match.
         */

        const matches =
            verificationFields.every(
                field => {

                    const masterValue =
                        getMasterValue(
                            record,
                            headers,
                            field.masterColumn
                        );

                    const studentValue =
                        submissionData?.[
                            field.studentField.id
                        ];

                    return compareVerificationValue(
                        field.logicalType,
                        masterValue,
                        studentValue
                    );

                }
            );


        if (matches) {

            matchedRecordIndex =
                index;

            matchedRecord =
                record;

            break;

        }

    }


    /* -------------------------------------------------
       NO RECORD MATCH
    ------------------------------------------------- */

    if (
        matchedRecordIndex === -1
    ) {

        const checkedFields = {};

        verificationFields.forEach(
            field => {

                checkedFields[
                    field.logicalType
                ] = false;

            }
        );


        return {

            status: "rejected",

            matched: false,

            checkedFields,

            issues: [
                "Student information does not match the master list."
            ],

            masterRecordIndex: null,

            checkedAt:
                new Date().toISOString()

        };

    }


    /* -------------------------------------------------
       ALL COMMON FIELDS MATCH
    ------------------------------------------------- */

    const checkedFields = {};

    verificationFields.forEach(
        field => {

            checkedFields[
                field.logicalType
            ] = true;

        }
    );


    return {

        status: "approved",

        matched: true,

        checkedFields,

        issues: [],

        masterRecordIndex:
            matchedRecordIndex,

        checkedAt:
            new Date().toISOString()

    };

};