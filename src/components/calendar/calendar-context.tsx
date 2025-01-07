'use client'

import { createContext, useContext, useEffect, useState } from "react"
import { Event, Patient } from '@prisma/client'
import { getDayEs } from "./utils"
import { getEvents } from "@/app/actions/events"
import { addDays, addMonths, isAfter, isBefore, set, subMonths } from "date-fns"
import { getPatients } from "@/app/actions/patients"

type ViewType = "week" | "month" | "schedule"
interface WorkHours {
    start: number
    end: number
  }

interface CalendarContextType {
    view: ViewType
    setView: (view: ViewType) => void
    date: Date
    setDate: (date: Date) => void
    showWeekends: boolean
    setShowWeekends: (show: boolean) => void
    showDeclinedEvents: boolean
    setShowDeclinedEvents: (show: boolean) => void
    showCompletedTasks: boolean
    setShowCompletedTasks: (show: boolean) => void
    cellSize: number
    setCellSize: (size: number) => void
    workHours: WorkHours
    setWorkHours: (hours: WorkHours) => void,
    
    events: Event[]
    setEvents: (events: Event[]) => void
    patients: Patient[]
    setPatients: (patients: Patient[]) => void
    loading: boolean,
    loadedRange: { start: Date; end: Date }
    loadMoreEvents: (viewStartDate: Date, viewEndDate: Date) => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)


export function CalendarProvider({ children }: { children: React.ReactNode}) {
    const [view, setView] = useState<ViewType>("month")
    const [date, setDate] = useState(new Date())
    const [showWeekends, setShowWeekends] = useState(true)
    const [showDeclinedEvents, setShowDeclinedEvents] = useState(true)
    const [showCompletedTasks, setShowCompletedTasks] = useState(true)
    const [cellSize, setCellSize] = useState(view === "week" ? 60 : 130)
    const [workHours, setWorkHours] = useState<WorkHours>({ start: 9, end: 21 })
    const [events, setEvents] = useState<Event[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingPatients, setLoadingPatients] = useState<boolean>(false);
    const [loadingEvents, setLoadingEvents] = useState<boolean>(false);
    const [loadedRange, setLoadedRange] = useState<{ start: Date; end: Date }>(() => {
        const now = new Date();
        return { start: subMonths(now, 3), end: addMonths(now, 3) };
    });


    // Render -> useEffect -> loadEvents -> getEvents -> setEvents
    useEffect(() => {      
        async function loadEvents() {
            setLoadingEvents(true);
            
            const { start, end } = loadedRange;
            const fetchedEvents = await getEvents(start, end);
            setEvents(fetchedEvents);
            setLoadingEvents(false);
        }
      
        loadEvents();
    }, [setEvents]);

    const loadMoreEvents = async (viewStartDate: Date, viewEndDate: Date) => {
        if (isBefore(viewStartDate, loadedRange.start) || isAfter(viewEndDate, loadedRange.end)) {
            setLoadingEvents(true);
            try {
                const newStart = isBefore(viewStartDate, loadedRange.start)
                    ? subMonths(loadedRange.start, 3)
                    : loadedRange.start;
                const newEnd = isAfter(viewEndDate, loadedRange.end)
                    ? addMonths(loadedRange.end, 3)
                    : loadedRange.end;

                const fetchedEvents = await getEvents(newStart, newEnd);
                setEvents((prevEvents) => [...prevEvents, ...fetchedEvents]);
                setLoadedRange({ start: newStart, end: newEnd });
            } catch (error) {
                console.error("Error loading more events:", error);
            } finally {
                setLoadingEvents(false);
            }
        }
    };

    useEffect(() => {
        async function loadPatients() {
            setLoadingPatients(true);
            const patients = await getPatients();
            console.log('CalendarContext.patients', patients)
            if (patients) {
                setPatients(patients);
            }
            setLoadingPatients(false);
        }
        loadPatients();
    }, []);

    useEffect(() => {
        setLoading(loadingPatients || loadingEvents);
    }, [loadingPatients, loadingEvents]);

    return (
        <CalendarContext.Provider 
            value={{
                view, setView,
                date, setDate,
                showWeekends, setShowWeekends,
                showDeclinedEvents, setShowDeclinedEvents,
                showCompletedTasks, setShowCompletedTasks,
                cellSize, setCellSize,
                workHours, setWorkHours,
                events, setEvents,
                patients, setPatients,
                loading,
                loadedRange,
                loadMoreEvents,
            }}
        >
            {children}
        </CalendarContext.Provider>
    )

}

export function useCalendar() {
    const context = useContext(CalendarContext)
    if (context === undefined) {
      throw new Error("useCalendar must be used within a CalendarProvider")
    }
    return context
}