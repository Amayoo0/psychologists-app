'use client'

import { createContext, useContext, useState } from "react"
import { Event } from '@prisma/client'

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
    events: Event[]
    setEvents: (events: Event[]) => void
    cellSize: number
    setCellSize: (size: number) => void
    workHours: WorkHours
    setWorkHours: (hours: WorkHours) => void
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)


export function CalendarProvider({ children }: { children: React.ReactNode}) {
    const [view, setView] = useState<ViewType>("month")
    const [date, setDate] = useState(new Date())
    const [showWeekends, setShowWeekends] = useState(true)
    const [showDeclinedEvents, setShowDeclinedEvents] = useState(true)
    const [showCompletedTasks, setShowCompletedTasks] = useState(true)
    const [events, setEvents] = useState<Event[]>([])
    const [cellSize, setCellSize] = useState(60)
    const [workHours, setWorkHours] = useState<WorkHours>({ start: 9, end: 21 })

    return (
        <CalendarContext.Provider 
            value={{
                view,
                setView,
                date,
                setDate,
                showWeekends,
                setShowWeekends,
                showDeclinedEvents,
                setShowDeclinedEvents,
                showCompletedTasks,
                setShowCompletedTasks,
                events,
                setEvents,
                cellSize,
                setCellSize,
                workHours,
                setWorkHours,
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