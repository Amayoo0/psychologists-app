"use client"

import { cn } from "@/lib/utils"
import { useCalendar } from "./calendar-context"
import { Separator } from "../ui/separator"
import React, { useEffect, useRef } from "react"
import { getEvents } from "./calendar-events"
import { Event } from '@prisma/client'

const CalendarGrid = () => {
  const { view, date, showWeekends, events, setEvents, cellSize, workHours } = useCalendar()
  const gridRef = useRef<HTMLDivElement>(null)

  const getMonth = (month: number) => {
    const months = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];
    return months[month];
  }
  
  // useEffect will run after the DOM load finishes and every time the date, view or setEvents change.
  // It defines a function (loadEvents) that will fetch the events for the current view and date.
  // Render -> useEffect -> loadEvents -> getEvents -> setEvents
  useEffect(() => {
    async function loadEvents() {
      let startDate: Date
      let endDate: Date
      
      if (view === 'month') {
        startDate = new Date(date.getFullYear(), date.getMonth(), 1)
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      } else {
        startDate = new Date(date)
        startDate.setDate(date.getDate() - date.getDay())
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
      }

      const fetchedEvents = await getEvents(startDate, endDate)
      setEvents(fetchedEvents)
    }

    loadEvents()
  }, [date, view, setEvents])

  useEffect(() => {
    if (gridRef.current) {
      const firstWorkHourElement = gridRef.current.querySelector(`[data-hour="${workHours.start}"]`)
      if (firstWorkHourElement) {
        firstWorkHourElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [workHours.start])
  // useEffect(() => {
  //   if (gridRef.current) {
  //     gridRef.current.scrollIntoView({
  //       behavior: "smooth", // Animación suave
  //       block: "start", // Alinea el elemento al inicio del contenedor
  //     });
  //   }
  // }, []);

  
  const renderEvent = (e: Event) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const dayOfWeek = e.startTime.getDay();
    const height = ((e.endTime.getTime() - e.startTime.getTime()) / (1000 * 60 * 60)) * cellSize; // Hours duration * 48px
    const top = ((e.startTime.getHours() + e.startTime.getMinutes() / 60) )* cellSize; // hours + minutes fraction * 48px

    return (
      <div 
        key={`event-${e.id}`}
        className="absolute left-0 right-0 "
        style={{
          top: `${top}px`,
          height: `${height}px`,
          left: `${dayOfWeek * (100 / 7)}%`,
          width: `${100 / 7}%`,
        }}>
            <div 
              className={cn(
                "rounded py-1 h-full w-full text-sm text-center justify-center",
                e.endTime < new Date()
                  ? "bg-gray-300 text-gray-700 border border-gray-800"
                  : "bg-blue-100 text-blue-800 border border-blue-950"
              )}
            >
              {e.title}
            </div>
      </div>
    )
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

  function isToday(date: Date) {
    const today = new Date()
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
  }

  

  const renderWeekView = () => {
    const now = new Date()
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(date)
      day.setDate(date.getDate() - date.getDay() + i)
      return day
    })
    console.log('renderWeekView.events', events)

    return (
      <div className="h-screen flex flex-col z-10">
        {/* Sticky Header */}
        <div id="sticky-header" className="sticky bg-background border-b flex top-0 z-10">
          {/* Time column header */}
          <div className={`w-16 h-[${cellSize}px]`}/>

          {/* Days header */}
          <div className="grid flex-1 pr-[14px]" style={{ gridTemplateColumns: `repeat(${showWeekends ? 7 : 5}, 1fr)` }}>
            {days.map((day, i) => (
              (!showWeekends && [0, 6].includes(day.getDay())) ? null : (
                <div key={i} className="border-r border-l text-center py-2">
                  <div className="text-sm text-muted-foreground">
                    {new Intl.DateTimeFormat("es", { weekday: "short" }).format(day).toUpperCase()}
                  </div>
                  <div className={cn(
                    "mt-1 w-8 h-8 rounded-full flex items-center justify-center mx-auto text-sm",
                    isToday(day) && "bg-blue-600 text-white"
                  )}>
                    {day.getDate()}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div id="scrollable-content" className="flex-1 overflow-y-auto flex relative" ref={gridRef}>
          {/* Hours column */}
          <div className={`w-16 h-[${cellSize}] bg-background sticky left-0 z-10`}>
            {hours.map((hour) => (
              <div 
                key={hour} 
                className={cn(
                  "border-b border-r p-2 text-sm text-muted-foreground flex items-center justify-end pr-4",
                  hour < workHours.start || hour > workHours.end ? "bg-gray-100" : ""
                )}
                style={{height: `${cellSize}px`}}
              >
                {`${hour.toString().padStart(2, '0')}:00`}
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div className="grid flex-1 relative" style={{ 
            gridTemplateColumns: `repeat(${showWeekends ? 7 : 5}, 1fr)`,
            gridAutoRows: `${cellSize}px`
          }}>
            {hours.map((hour) => (
              <React.Fragment key={hour}>
                {days.map((day, i) => (
                  (!showWeekends && [0, 6].includes(day.getDay())) ? null : (
                    <div 
                      key={i} 
                      ref={hour === workHours.start ? gridRef : null}
                      className={cn(
                        "border-r border-b",
                        hour < workHours.start || hour > workHours.end ? "bg-gray-100" : ""
                      )}
                      data-hour={hour}
                    />
                  )
                ))}
              </React.Fragment>
            ))}

            {/* Time marker */}
            {isToday(date) && (
              <div 
                id="time-marker" 
                className="absolute left-0 right-0 z-10"
                style={{
                  top: `${((now.getHours() + now.getMinutes() / 60)-0.09) * cellSize}px`,
                  left: `${now.getDay() * (100 / 7)}%`,
                  width: `${100 / 7}%`,
                }}
              >
                <div className="flex items-center w-full">
                  <span className="h-2 w-2 bg-red-600 rounded-full -ml-1"/>
                  <Separator className="flex-1 bg-red-600 h-[2px]"/>
                </div>
              </div>
            )}

            {/* Events */}
            {events
              // .filter((e) => e.startTime >= days[0] && e.endTime <= days[6])
              .map(renderEvent)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1">
      {view === "month" && renderMonthView()}
      {view === "week" && renderWeekView()}
    </div>
  )
}

export default CalendarGrid
