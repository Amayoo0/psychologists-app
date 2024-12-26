"use client"

import { cn } from "@/lib/utils"
import { useCalendar } from "./calendar-context"
import { Separator } from "../ui/separator"
import { Circle, Dot } from "lucide-react"

const CalendarGrid = () => {
  const { view, date, showWeekends } = useCalendar()

  const getMonth = (day: number) => {
    const months = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];
    return months[day];
  }   

  const renderMonthView = () => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    const days = []
    
    // Add days from previous month to start on Sunday
    const firstDay = start.getDay()
    for (let i = firstDay; i > 0; i--) {
      const prevDate = new Date(start)
      prevDate.setDate(-i + 1)
      days.push(prevDate)
    }
    
    // Add days of current month
    for (let i = 1; i <= end.getDate(); i++) {
      days.push(new Date(date.getFullYear(), date.getMonth(), i))
    }
    
    // Add days from next month to complete the grid
    const lastDay = end.getDay()
    for (let i = 1; i < 7 - lastDay; i++) {
      const nextDate = new Date(end)
      nextDate.setDate(end.getDate() + i)
      days.push(nextDate)
    }



    return (
      <div className="grid grid-cols-7 flex-1">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div
            key={day}
            className="p-2 text-sm font-medium text-center border-b"
          >
            {day}
          </div>
        ))}
        {days.map((day, i) => (
          <div
            key={i}
            className={cn(
              "p-2 border-b border min-h-[100px]",
              day.getMonth() !== date.getMonth() && "text-muted-foreground bg-muted/5",
              !showWeekends && [0, 6].includes(day.getDay()) && "hidden"
            )}
          >
            <span className="text-sm">
                {day.getDate() === 1 
                ? day.getDate() + ' ' + getMonth(day.getMonth())
                : day.getDate()}
            </span>
          </div>
        ))}
      </div>
    )
  }


  const renderWeekView = () => {
    const now = new Date()
    const cellGridHeight = 48
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(date)
      day.setDate(date.getDate() - date.getDay() + i)
      return day
    })

    interface Event {
      id: string
      title: string
      day: number
      time: string
      type: "pending" | "event"
    }
    const SAMPLE_EVENTS: Event[] = [
      {
        id: "1",
        title: "1 pending task",
        day: 26,
        time: "10:00 AM",
        type: "pending"
      },
      {
        id: "2",
        title: "Mayo Gr, 10:30pm",
        day: 26,
        time: "10:30 PM",
        type: "event"
      }
    ]

    return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background border-b flex">
        {/* Time column header */}
        <div className="w-16 h-12 "/>

        {/* Days header */}
        <div className="grid flex-1 pr-[14px]" style={{ gridTemplateColumns: `repeat(${showWeekends ? 7 : 5}, 1fr)` }}>
          {days.map((day, i) => (
            (!showWeekends && [0, 6].includes(day.getDay())) ? null : (
              <div key={i} className="border-r border-l text-center">
                <div className="text-sm text-muted-foreground">{new Intl.DateTimeFormat("es", { weekday: "short" }).format(day).toUpperCase()}</div>
                <div className={cn(
                  "mt-1 w-8 h-8 rounded-full flex items-center justify-center mx-auto text-sm",
                  day.getDate() === new Date().getDate() && "bg-blue-600 text-white"
                )}>
                  {day.getDate()}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto flex">
        {/* Hours column */}
        <div className="w-16 border-r bg-background sticky left-0">
          {hours.map((hour) => (
            <div key={hour} className="h-12 border-b p-2 text-sm text-muted-foreground">
              {`${hour}:00`}
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="grid flex-1 relative" style={{ gridTemplateColumns: `repeat(${showWeekends ? 7 : 5}, 1fr)` }}>
          {days.map((day, dayIndex) => (
            (!showWeekends && [0, 6].includes(day.getDay())) ? null : (
              <div key={dayIndex} className="border-r">
                {hours.map((hour) => (
                  <>
                    <div>
                      {day.getDate() === now.getDate() && hour === now.getHours() && (
                      <div 
                        id="time-marker" 
                        className="absolute left-0 right-0 z-10"
                        style={{
                          top: `${(now.getHours() + now.getMinutes() / 60)*cellGridHeight}px`
                        }}
                      >
                        <div className="flex items-center w-full">
                          <span className="h-2 w-2 bg-red-600 rounded-full -ml-1"/>
                          <Separator className="flex-1 bg-red-600 h-px"/>
                        </div>
                      </div>
                    )}
                    </div>

                    <div key={hour} className="h-12 border-b p-1">
                      {/* Example events */}
                      {day.getDate() === 26 && hour === 10 && (
                        <>
                          <div className="bg-blue-100 text-blue-900 rounded p-1 text-sm mb-1">
                            1 pending task
                          </div>
                          <div className="bg-red-600 text-white rounded p-1 text-sm">
                            Mayo Gr, 10:30pm
                          </div>
                        </>
                      )}
                    </div>
                  </>
                ))}
              </div>
            )
          ))}
        </div>
      </div>
    </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      {view === "month" && renderMonthView()}
      {view === "week" && renderWeekView()}
    </div>
  )
}

export default CalendarGrid
