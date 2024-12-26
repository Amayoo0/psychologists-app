'use client'

import { createContext, useContext, useState } from "react"

type ViewType = "week" | "month" | "schedule"

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
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)


export function CalendarProvider({ children }: { children: React.ReactNode}) {
    const [view, setView] = useState<ViewType>("month")
    const [date, setDate] = useState(new Date())
    const [showWeekends, setShowWeekends] = useState(true)
    const [showDeclinedEvents, setShowDeclinedEvents] = useState(true)
    const [showCompletedTasks, setShowCompletedTasks] = useState(true)
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