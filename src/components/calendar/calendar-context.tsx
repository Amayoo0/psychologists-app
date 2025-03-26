'use client'

import { createContext, useContext, useEffect, useState } from "react"
import { Event, Patient, PsyFile } from '@prisma/client'
import { getEvents } from "@/app/actions/events"
import { addMonths, isAfter, isBefore, subMonths } from "date-fns"
import { getPatients } from "@/app/actions/patients"
import { getFiles } from "@/app/actions/files"
import { getSettings } from "@/app/actions/settings"

export type ViewType = "week" | "month"
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
    internalPassword: string
    setInternalPassword: (password: string) => void
    salt: string
    preferredView: ViewType
    setPreferredView: (view: ViewType) => void
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)


export function CalendarProvider({ children }: { children: React.ReactNode}) {
    const [view, setView] = useState<ViewType>("week")
    const [date, setDate] = useState(new Date())
    const [showWeekends, setShowWeekends] = useState(true)
    const [showDeclinedEvents, setShowDeclinedEvents] = useState(true)
    const [showCompletedTasks, setShowCompletedTasks] = useState(true)
    const [cellSize, setCellSize] = useState(60)
    const [workHours, setWorkHours] = useState<WorkHours>({ start: 540, end: 1080 })
    const [events, setEvents] = useState<Event[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [files, setFiles] = useState<PsyFile[]>([])
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingPatients, setLoadingPatients] = useState<boolean>(false);
    const [loadingEvents, setLoadingEvents] = useState<boolean>(false);
    const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
    const [loadingSettings, setLoadingSettings] = useState<boolean>(false);
    const [loadedRange, setLoadedRange] = useState<{ start: Date; end: Date }>(() => {
        const now = new Date();
        return { start: new Date(subMonths(now, 3).setHours(0,0,0,0)), end: new Date(addMonths(now, 3).setHours(23, 59, 59, 999)) };
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [internalPassword, setInternalPassword] = useState("")
    const [preferredView, setPreferredView] = useState<ViewType>("month")
    const [salt] = useState("aComplexSaltValue123!@#")



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
                const newStart = new Date(subMonths(viewStartDate, 3).setHours(0,0,0,0))
                const newEnd = new Date(addMonths(viewEndDate, 3).setHours(23, 59, 59, 999))

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
        setLoading(loadingPatients || loadingEvents || loadingFiles || loadingSettings);
    }, [loadingPatients, loadingEvents, loadingFiles, loadingSettings]);

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

    useEffect(() => {
        async function loadSettings() {
            setLoadingSettings(true);
            const fetchedSettings = await getSettings();
            if (fetchedSettings) {
                setShowWeekends((prev) => fetchedSettings.showWeekends ?? prev);
                setCellSize((prev) => fetchedSettings.cellSize ?? prev);
                setWorkHours((prev) => ({
                    start: fetchedSettings.workDayStart ?? prev.start,
                    end: fetchedSettings.workDayEnd ?? prev.end,
                }));
                setPreferredView((prev) => fetchedSettings.preferredView as ViewType ?? prev);
                setInternalPassword((prev) => fetchedSettings.internalPassword ?? prev);
            }
            setLoadingSettings(false);
        }
        loadSettings();
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
                isAuthenticated, setIsAuthenticated,
                internalPassword, setInternalPassword,
                salt,
                preferredView, setPreferredView,
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