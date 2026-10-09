import { useState } from "react";
import {
ArrowRight,
ChevronLeft,
ChevronRight,
ClipboardList,
Database,
IdCard,
Layers3,
Sparkles,
Users,
X,
} from "lucide-react";

import "../styles/guided-tour.css";

const tourSteps = [

{
icon: <Sparkles size={25} />,
title: "Welcome to IDFoundry!",
description:
"Manage student records, collect submissions, and verify student information in one place. Let's get started!",
action: "Start Exploring",
path: "/listform",
},

{
icon: <Database size={25} />,
title: "Start with Master Data",
description:
"Import your school's student records and organize them into lists. These become the reference for verifying student submissions.",
action: "Go to Import Data",
path: "/listform",
},

{
icon: <IdCard size={25} />,
title: "Design and Preview ID Cards",
description:
"Configure the card layout, arrange fields, preview the front and back, and prepare the design for card generation.",
action: "Start Designing",
path: "/create-form",
},

{
icon: <Layers3 size={25} />,
title: "Save Reusable Templates",
description:
"Create and maintain card templates so your school can reuse a consistent design.",
action: "View Templates",
path: "/templates",
},

{
icon: <ClipboardList size={25} />,
title: "Create a Student Form",
description:
"Choose a master list and configure the fields students need to fill in. Share the generated link with your students.",
action: "Open Student Forms",
path: "/idlistform",
},
{
icon: <Users size={25} />,
title: "Review Submissions",
description:
"Check submitted information against your master data. Review pending records and resolve mismatches before approving them.",
action: "View Submissions",
path: "/student-data",
},
];

function GuidedTour({ open, onClose }) {
const [tourStep, setTourStep] = useState(0);


if (!open) return null;

const currentTourStep = tourSteps[tourStep];
const isLastStep = tourStep === tourSteps.length - 1;

const finishTour = () => {
    setTourStep(0);
    onClose();
};

const navigateToStep = () => {
    const path = currentTourStep.path;
    finishTour();
    window.location.href = path;
};

return (
    <div
        className="dashboard-modal-backdrop tour-backdrop"
        onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
                finishTour();
            }
        }}
        onKeyDown={(event) => {
            if (event.key === "Escape") {
                finishTour();
            }
        }}
    >
        <section
            className="dashboard-modal tour-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tour-title"
        >
            <button
                type="button"
                className="modal-close"
                onClick={finishTour}
                aria-label="Skip tour"
            >
                <X size={19} />
            </button>

            <div className="tour-topline">
                <span>IDFOUNDRY QUICK TOUR</span>
                <span>
                    {tourStep + 1} of {tourSteps.length}
                </span>
            </div>

            <div className="tour-progress">
                {tourSteps.map((step, index) => (
                    <span
                        key={step.title}
                        className={index <= tourStep ? "complete" : ""}
                    />
                ))}
            </div>

            <div className="tour-art">
                <div className="tour-art-circle">
                    {currentTourStep.icon}
                </div>
                <Sparkles className="tour-sparkle" size={19} />
            </div>

            <h2 id="tour-title">{currentTourStep.title}</h2>

            <p className="modal-description">
                {currentTourStep.description}
            </p>

            <div className="tour-actions">
                <button
                    type="button"
                    className="tour-skip"
                    onClick={finishTour}
                >
                    Skip tour
                </button>

                <div className="tour-navigation">
                    {tourStep > 0 && (
                        <button
                            type="button"
                            className="tour-back"
                            onClick={() =>
                                setTourStep((step) => step - 1)
                            }
                            aria-label="Previous step"
                        >
                            <ChevronLeft size={18} />
                        </button>
                    )}

                    <button
                        type="button"
                        className="tour-next"
                        onClick={
                            isLastStep
                                ? navigateToStep
                                : () => setTourStep((step) => step + 1)
                        }
                    >
                        {isLastStep
                            ? currentTourStep.action
                            : "Next"}
                        {isLastStep ? (
                            <ArrowRight size={16} />
                        ) : (
                            <ChevronRight size={17} />
                        )}
                    </button>
                </div>
            </div>
        </section>
    </div>
);


}

export default GuidedTour;
