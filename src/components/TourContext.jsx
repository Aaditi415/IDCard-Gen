import {
createContext,
useContext,
useState,
} from "react";

const TourContext = createContext(null);

export function TourProvider({ children }) {
const [tourOpen, setTourOpen] = useState(false);


const startTour = () => setTourOpen(true);
const closeTour = () => setTourOpen(false);

return (
    <TourContext.Provider
        value={{ tourOpen, startTour, closeTour }}
    >
        {children}
    </TourContext.Provider>
);


}

export function useTour() {
const context = useContext(TourContext);


if (!context) {
    throw new Error(
        "useTour must be used inside TourProvider"
    );
}

return context;


}
