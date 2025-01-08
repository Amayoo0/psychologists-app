"use client"

import { cn } from "@/lib/utils"
import { useCalendar } from "./calendar-context"
import React, { useEffect, useRef, useState } from "react"
import { EventDialog } from "../EventDialog"
import { getEvents } from "@/app/actions/events"
import { getDayEs, getMonth, isToday  } from "./utils"
import { EventWeekView, EventWeekViewDragged, DragSelection } from "./EventWeekView"
import TimeMarker from "./TimeMarker"
import HeaderWeekDays from "./HeaderWeekDays"
import { Event } from '@prisma/client'
import { EventMonthView } from "./EventMonthView"
import LoadingSpinner from "../LoadingSpinner"


const CalendarGrid = () => {
  const { view, date, showWeekends, cellSize, setCellSize, workHours, events, loading, loadMoreEvents } = useCalendar()
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [eventsToShow, setEventsToShow] = useState<Event[]>([])
  const [days, setDays] = useState<Date[]>([])

  const gridRef = useRef<HTMLDivElement>(null)
  const [dragSelection, setDragSelection] = useState<DragSelection>({
    startTime: new Date(),
    endTime: new Date(),
    startY: 0,
    currentY: 0,
    isDragging: false,
    dayIndex: 0
  })

  // Scroll to the first work hour when the work hours change
  useEffect(() => {
    if (gridRef.current) {
      const firstWorkHourElement = gridRef.current.querySelector(`[data-hour="${workHours.start}"]`);
      if (firstWorkHourElement) {
        const offsetTop = (firstWorkHourElement as HTMLElement).offsetTop;
        gridRef.current.scrollTo({
          top: offsetTop,
          behavior: 'smooth',
        });
      }
    }
  }, [workHours.start, gridRef, date, view]);


  // Load events when the date, view or days change
  useEffect(() => {
    function loadEvents() {
      console.log('CalendarGrid.LoadEvents.events: ', events)
      const filteredEvents: Event[] = events.filter(event => {
        return event.startTime >= days[0] && event.endTime <= days[days.length - 1];
      });

      if (filteredEvents) {
        setEventsToShow(filteredEvents);
      }
      console.log("CalendarGrid.LoadEvents.filteredEvents: ", days[0], days[days.length - 1], filteredEvents)
    }
    loadEvents();
  }, [view, events, days]);


  // Load days when view or date change
  useEffect(() => {
    if (view === "month"){
      const start = new Date(date.getFullYear(), date.getMonth(), 1)
      start.setHours(0, 0, 0, 0)
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      const monthDays = []
      
      // Add days from previous month to start on Sunday
      const firstDay = getDayEs(start)
      for (let i = firstDay; i > 0; i--) {
        const prevDate = new Date(start)
        prevDate.setDate(-i + 1)
        monthDays.push(prevDate)
      }
      
      // Add days of current month
      for (let i = 1; i <= end.getDate(); i++) {
        monthDays.push(new Date(date.getFullYear(), date.getMonth(), i))
      }
      
      // Add days from next month to complete the grid
      const lastDay = getDayEs(end)
      for (let i = 1; i < 7 - lastDay; i++) {
        const nextDate = new Date(end)
        nextDate.setDate(end.getDate() + i)
        monthDays.push(nextDate)
      }
  
      setDays(monthDays);
    }else{
      const weekDays = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(date)
        if (i === 0)
          day.setHours(0, 0, 0, 0)
        else if (i === 6)
          day.setHours(23, 59, 59, 999)
        day.setDate(date.getDate() - getDayEs(date) + i)
        return day
      })
  
      setDays(weekDays)
    }
    loadMoreEvents(days[0], days[days.length - 1])
  }, [view, date])
  
  

  const renderMonthView = () => {
    
    return (
      <div 
        id="calendar-grid-month-view" 
        className="flex flex-col z-10"
        style={{
          height: `calc(100vh - 50px)`
        }}
      >
        <div id="month-header" className="grid" style={{
          gridTemplateColumns: `repeat(${showWeekends ? 7 : 5}, 1fr)`,
        }}>
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
            (!showWeekends && (day === "Sáb" || day === "Dom") ? null :
              <div
              key={day}
              className="text-sm font-medium text-center border-b"
            >
              {day}
            </div>
            )
          ))}
        </div>
         
          <div className="flex-1 overflow-y-auto flex relative">
            <div id="month-grid" className="grid flex-1" ref={gridRef} style={{
              gridTemplateColumns: `repeat(${showWeekends ? 7 : 5}, 1fr)`,
            }}>
              {days.map((day, i) => (
                <div
                  key={`monthView-dayIndex-${i}`}
                  className={cn(
                    "p-2 border-b border min-h-[100px]",
                    day.getMonth() !== date.getMonth() && "text-muted-foreground bg-muted/5",
                    !showWeekends && [5, 6].includes(getDayEs(day)) && "hidden"
                  )}
                >
                  <div className={cn(
                    "w-10 h-5 rounded-full flex flex-col items-center justify-center text-xs",
                    isToday(day) && "bg-blue-600 text-white"
                  )}>
                      {day.getDate() === 1 
                      ? day.getDate() + ' ' + getMonth(day.getMonth())
                      : day.getDate()}
                  </div>
                </div>
              ))}
              {eventsToShow && <EventMonthView events={eventsToShow} days={days} showWeekends={showWeekends} cellSize={100}/>}
            </div>

          </div>
      </div>
    )
  }


  const renderWeekView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
 

    const getTimeFromMousePosition = (y: number, baseDate: Date) => {
      if (!gridRef.current) return new Date()
  
      const scrollTop = gridRef.current.scrollTop
      const totalY = y + scrollTop
      const hour = Math.floor(totalY / cellSize)
      const minutes = Math.floor((totalY % cellSize) / cellSize * 60)
      
      const time = new Date(baseDate)
      time.setHours(hour, minutes, 0, 0)
      return time
    }
  
    const handleMouseDown = (e: React.MouseEvent, dayIndex: number) => {
      if (!gridRef.current) {
        return
      }
  
      const rect = gridRef.current.getBoundingClientRect()
      const y = e.clientY - rect.top
      
      const startDate = new Date(date)
      startDate.setDate(date.getDate() - getDayEs(date) + dayIndex)
      const startTime = getTimeFromMousePosition(y, startDate)
      
      setDragSelection({
        startTime,
        endTime: startTime,
        startY: y,
        currentY: y,
        isDragging: true,
        dayIndex
      })
  
      // Prevent text selection while dragging
      e.preventDefault()
    }
  
    const handleMouseMove = (e: React.MouseEvent) => {
      if (!dragSelection.isDragging || !gridRef.current) return
  
      const rect = gridRef.current.getBoundingClientRect()
      const y = e.clientY - rect.top
      
      const endTime = getTimeFromMousePosition(y, dragSelection.startTime)
  
      setDragSelection(prev => ({
        ...prev,
        endTime,
        currentY: y
      }))
    }
  
    const handleMouseUp = () => {
      if (dragSelection.isDragging) {
        // Ensure start time is always before end time
        const finalStartTime = dragSelection.startTime < dragSelection.endTime 
          ? dragSelection.startTime 
          : dragSelection.endTime
        const finalEndTime = dragSelection.startTime < dragSelection.endTime 
          ? dragSelection.endTime 
          : dragSelection.startTime
  
        setDragSelection(prev => ({ 
          ...prev, 
          isDragging: false,
          startTime: finalStartTime,
          endTime: finalEndTime
        }))
        setShowEventDialog(true)
      }
    }
  

    return (
      <div 
        id="calendar-grid-week-view"
        className="pb-4 flex flex-col z-10"
        style={{ height: `calc(100vh - 50px)` }}
      >
        {/* Sticky Header */}
        <div id="sticky-header" className="sticky bg-background border-b flex top-0 z-10">
            <div id="header-hours-column" className={`w-16 h-[${cellSize}px]`}/>
            <HeaderWeekDays showWeekends={showWeekends} days={days} />
        </div>

        {/* Scrollable Content */}
        <div 
          id="scrollable-content" 
          className="flex-1 overflow-y-auto flex relative"
          ref={gridRef}
        >
          {/* Hours column */}
          <div className={`w-16 h-[${cellSize}] bg-background sticky left-0 z-10`}>
            {hours.map((hour) => (
              <div 
                key={hour} 
                className={cn(
                  "border-b border-r pt-1 text-sm text-muted-foreground flex justify-end pr-4",
                  hour < workHours.start || hour >= workHours.end ? "bg-gray-100" : ""
                )}
                style={{height: `${cellSize}px`}}
                data-hour={hour}
              >
                {`${hour.toString().padStart(2, '0')}:00`}
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div className="grid flex-1 relative" style={{ 
            gridTemplateColumns: `repeat(${showWeekends ? 7 : 5}, 1fr)`,
            gridAutoRows: `${cellSize}px`
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >

            {hours.map((hour) => (
              <React.Fragment key={hour}>
                {days.map((day, dayIndex) => (
                  (!showWeekends && [5, 6].includes(getDayEs(day))) ? null : (
                    <div 
                      key={dayIndex} 
                      className={cn(
                        "border-r border-b c",
                        hour < workHours.start || hour >= workHours.end ? "bg-gray-100" : ""
                      )}
                      onMouseDown={(e) => handleMouseDown(e, dayIndex)}
                    />
                  )
                ))}
              </React.Fragment>
            ))}
            {gridRef.current && (
              <EventWeekViewDragged dragSelection={dragSelection} showWeekends={showWeekends} gridRef={gridRef as React.RefObject<HTMLDivElement>} />
            )}

            {/* Time marker */}
            {isToday(date) && (
              <TimeMarker showWeekends={showWeekends} cellSize={cellSize} />
            )}

            {/* Events */}
            {eventsToShow && <EventWeekView events={eventsToShow} date={date} cellSize={cellSize} showWeekends={showWeekends} />}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {loading ? (
        <LoadingSpinner message="Cargando eventos..." />
      ) : (
        view === "month" ? renderMonthView() : renderWeekView()
      )}
    </>
  )
}

export default CalendarGrid
