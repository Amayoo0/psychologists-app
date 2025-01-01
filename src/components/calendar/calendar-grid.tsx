"use client"

import { cn } from "@/lib/utils"
import { useCalendar } from "./calendar-context"
import { Separator } from "../ui/separator"
import React, { useEffect, useRef, useState } from "react"
import { Event } from '@prisma/client'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { EventDialog } from "../EventDialog"
import { getEvents } from "@/app/actions/events"

interface DragSelection {
  startTime: Date
  endTime: Date
  startY: number
  currentY: number
  isDragging: boolean
  dayIndex: number
}

const CalendarGrid = () => {
  const { view, date, showWeekends, events, setEvents, cellSize, workHours } = useCalendar()
  const gridRef = useRef<HTMLDivElement>(null)
  const [dragSelection, setDragSelection] = useState<DragSelection>({
    startTime: new Date(),
    endTime: new Date(),
    startY: 0,
    currentY: 0,
    isDragging: false,
    dayIndex: 0
  })
  const [showEventDialog, setShowEventDialog] = useState(false)

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
    if (!gridRef.current) return

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
    renderDragSelection();
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

  const renderDragSelection = () => {
    if (!dragSelection.isDragging) return null

    const top = Math.min(dragSelection.startY, dragSelection.currentY)
    const height = Math.abs(dragSelection.currentY - dragSelection.startY)
    const leftOffset = `${dragSelection.dayIndex * (100 / (showWeekends ? 7 : 5))}%`
    const width = `${100 / (showWeekends ? 7 : 5)}%`

    const timeFormatter = new Intl.DateTimeFormat('es', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });

    const startTimeFormatted = timeFormatter.format(
      dragSelection.startTime < dragSelection.endTime ? dragSelection.startTime : dragSelection.endTime
    );

    const endTimeFormatted = timeFormatter.format(
      dragSelection.startTime < dragSelection.endTime ? dragSelection.endTime : dragSelection.startTime
    );

    return (
      <div
        className="absolute pointer-events-none z-50"
        style={{
          top: `${top}px`,
          height: `${height}px`,
          left: leftOffset,
          width: width,
        }}
      >
        <div className="absolute inset-1 bg-blue-500 rounded-lg shadow-lg">
          <div className="p-1 text-white">
            <div className="text-sm font-medium">(Sin título)</div>
            <div className="text-xs">
              {startTimeFormatted} - {endTimeFormatted}
            </div>
          </div>
        </div>
      </div>
    )
  }


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
        startDate.setDate(date.getDate() - getDayEs(date))
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
      }

      const fetchedEvents = await getEvents(startDate, endDate)
      setEvents(fetchedEvents)
    }

    loadEvents()
  }, [date, view, setEvents])

  // useEffect(() => {
  //   if (gridRef.current) {
  //     const firstWorkHourElement = gridRef.current.querySelector(`[data-hour="${workHours.start}"]`)
  //     if (firstWorkHourElement) {
  //       firstWorkHourElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
  //     }
  //   }
  // }, [workHours.start])
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollIntoView({
        behavior: "smooth", 
        block: "start",
      });
    }
  }, [workHours.start]);

  
  type EventGroup = Event[][];

  const groupOverlappingEvents = (events: Event[]): EventGroup => {
    // Sort events by start date to facilitate grouping
    const sortedEvents = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
    const groups: EventGroup = [];
  
    // Function to check if two events overlap
    const doEventsOverlap = (e1: Event, e2: Event): boolean => {
      return (
        e1.startTime < e2.endTime && // e1 starts before e2 ends
        e1.endTime > e2.startTime // e1 ends after e2 starts
      );
    };
  
    // Iterate over events and group overlapping ones
    sortedEvents.forEach((event) => {
      let addedToGroup = false;
  
      // Try to add the event to an existing group
      for (const group of groups) {
        if (group.some((e) => doEventsOverlap(e, event))) {
          group.push(event);
          addedToGroup = true;
          break;
        }
      }
  
      // If it couldn't be added to any group, create a new one
      if (!addedToGroup) {
        groups.push([event]);
      }
    });
  
    return groups;
  };

  const renderEventWeekView = (events: Event[]) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - getDayEs(date));
    const overlappingGroups = groupOverlappingEvents(events);
    console.log(overlappingGroups);
    return overlappingGroups.flatMap((group) => {
      const groupLength = group.length;
      return group.map((e, i) => {
        const dayOfWeek = getDayEs(e.startTime);
        const height = ((e.endTime.getTime() - e.startTime.getTime()) / (1000 * 60 * 60)) * cellSize; // Hours duration * 48px
        const top = ((e.startTime.getHours() + e.startTime.getMinutes() / 60) - 1)* cellSize; // hours + minutes fraction * 48px
        const width = 100 / (showWeekends ? 7 : 5) / groupLength;
        const left = dayOfWeek * (100 / (showWeekends ? 7 : 5)) + width * i;
        return (
            <div 
              key={`event-${e.id}`}
              className="absolute left-0 right-0 "
              style={{
                top: `${top}px`,
                height: `${height}px`,
                left: `${left}%`,
                width: `${width}%`,
              }}>
              <TooltipProvider delayDuration={70}>
                <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "flex items-center justify-center rounded py-1 h-full w-full text-sm text-center overflow-hidden break-words leading-tight",
                      e.endTime < new Date()
                        ? "bg-gray-300 text-gray-700 border border-gray-800"
                        : "bg-blue-100 text-blue-800 border border-blue-950"
                    )}>
                    {e.title}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {e.title}
                </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
        );
      });
    });
  };

  const renderMonthView = () => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    const days = []
    
    // Add days from previous month to start on Sunday
    const firstDay = getDayEs(start)
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
    const lastDay = getDayEs(end)
    for (let i = 1; i < 7 - lastDay; i++) {
      const nextDate = new Date(end)
      nextDate.setDate(end.getDate() + i)
      days.push(nextDate)
    }

    return (
      <div className="grid grid-cols-7 flex-1">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
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
              !showWeekends && [5, 6].includes(getDayEs(day)) && "hidden"
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

  function getDayEs(date: Date) {
    const day = date.getDay();
    // If it's Sunday (0), return 6 (the last day of the week)
    // If it's Monday (1), return 0 (the first day of the week)
    return day === 0 ? 6 : day - 1;
  }

  

  const renderWeekView = () => {
    const now = new Date()
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(date)
      day.setDate(date.getDate() - getDayEs(date) + i)
      return day
    })

    return (
      <div className="h-screen pb-4 flex flex-col z-10">
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
                ref={hour === workHours.start ? gridRef : null}
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
                  (!showWeekends && [0, 6].includes(getDayEs(day))) ? null : (
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
            {renderDragSelection()}

            {/* Time marker */}
            {isToday(date) && (
              <div 
                id="time-marker" 
                className="absolute left-0 right-0 z-10"
                style={{
                  top: `${((now.getHours() + now.getMinutes() / 60)-0.09) * cellSize}px`,
                  left: `${getDayEs(now) * (100 / (showWeekends ? 7 : 5))}%`,
                  width: `${100 / (showWeekends ? 7 : 5)}%`,
                }}
              >
                <div className="flex items-center w-full">
                  <span className="h-2 w-2 bg-red-600 rounded-full -ml-1"/>
                  <Separator className="flex-1 bg-red-600 h-[2px]"/>
                </div>
              </div>
            )}

            {/* Events */}
            {renderEventWeekView(events)}
          </div>
        </div>
        
        {/* Event Dialog */}
        <EventDialog
          open={showEventDialog}
          onOpenChange={setShowEventDialog}
          startTime={dragSelection.startTime}
          endTime={dragSelection.endTime}
        />
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
