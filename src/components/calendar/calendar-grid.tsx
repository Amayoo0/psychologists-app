"use client"

import { cn } from "@/lib/utils"
import { useCalendar } from "./calendar-context"

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
            {/* <span className="text-sm">{day.getDate()}</span> */}
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
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(date)
      day.setDate(date.getDate() - date.getDay() + i)
      return day
    })

    return (
      <div className="flex flex-1">
        <div className="w-16 border-r">
          {hours.map((hour) => (
            <div key={hour} className="h-12 border-b text-xs p-1">
              {`${hour}:00`}
            </div>
          ))}
        </div>
        <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${showWeekends ? 7 : 5}, 1fr)` }}>
          {days.map((day, i) => (
            (!showWeekends && [0, 6].includes(day.getDay())) ? null : (
              <div key={i} className="border-r">
                <div className="h-12 border-b p-2 text-sm font-medium">
                  {new Intl.DateTimeFormat("es", { weekday: "short" }).format(day)}
                  {" "}
                  {day.getDate()}
                </div>
                {hours.map((hour) => (
                  <div key={hour} className="h-12 border-b" />
                ))}
              </div>
            )
          ))}
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
