'use client'

import { createContext, useContext, useEffect, useState } from "react"
import { Event, Patient, PsyFile } from '@prisma/client'
import { getEvents } from "@/app/actions/events"
import { addMonths, isAfter, isBefore, set, subMonths } from "date-fns"
import { getPatients } from "@/app/actions/patients"
import { getFiles } from "@/app/actions/files"

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
    files: PsyFile[]
    setFiles: (files: PsyFile[]) => void
    loading: boolean
    loadedRange: { start: Date; end: Date }
    loadMoreEvents: (viewStartDate: Date, viewEndDate: Date) => Promise<void>
    isAuthenticated: boolean
    setIsAuthenticated: (isAuthenticated: boolean) => void
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)


export function CalendarProvider({ children }: { children: React.ReactNode}) {
    const [view, setView] = useState<ViewType>("month")
    const [date, setDate] = useState(new Date())
    const [showWeekends, setShowWeekends] = useState(true)
    const [showDeclinedEvents, setShowDeclinedEvents] = useState(true)
    const [showCompletedTasks, setShowCompletedTasks] = useState(true)
    const [cellSize, setCellSize] = useState(60)
    const [workHours, setWorkHours] = useState<WorkHours>({ start: 9, end: 21 })
    const [events, setEvents] = useState<Event[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [files, setFiles] = useState<PsyFile[]>([])
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingPatients, setLoadingPatients] = useState<boolean>(false);
    const [loadingEvents, setLoadingEvents] = useState<boolean>(false);
    const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
    const [loadedRange, setLoadedRange] = useState<{ start: Date; end: Date }>(() => {
        const now = new Date();
        return { start: subMonths(now, 3), end: addMonths(now, 3) };
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false)



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
    }, []);

    const loadMoreEvents = async (viewStartDate: Date, viewEndDate: Date) => {
        if (isBefore(viewStartDate, loadedRange.start) || isAfter(viewEndDate, loadedRange.end)) {
            setLoadingEvents(true);
            try {
                const newStart = isBefore(viewStartDate, loadedRange.start)
                    ? subMonths(viewStartDate, 3)
                    : loadedRange.start;
                const newEnd = addMonths(newStart, 6)

                const fetchedEvents = await getEvents(newStart, newEnd);
                setEvents(fetchedEvents);
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
            const fetchedPatients = await getPatients();
            if (fetchedPatients) {
                setPatients(fetchedPatients);
            }
            setLoadingPatients(false);
        }
        loadPatients();
    }, []);

    useEffect(() => {
        setLoading(loadingPatients || loadingEvents || loadingFiles);
    }, [loadingPatients, loadingEvents, loadingFiles]);

    useEffect(() => {
        async function loadFiles() {
            setLoadingFiles(true);
            const fetchedFiles = await getFiles();
            if (fetchedFiles) {
                setFiles(fetchedFiles);
            }
            setLoadingFiles(false);
        }
        loadFiles();
    }, []);

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
                files, setFiles,
                loading,
                loadedRange,
                loadMoreEvents,
                isAuthenticated, setIsAuthenticated
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