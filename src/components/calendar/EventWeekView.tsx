import { cn } from "@/lib/utils";
import React from "react";
import { Event } from '@prisma/client'
import { getDayEs, groupOverlappingEvents, formatTime } from "./utils";
import { EventDialog } from "../EventDialog";


const EventWeekView = ({
    events,
    date,
    cellSize,
    showWeekends 
}: { events: Event[] | null, date: Date, cellSize: number, showWeekends: boolean }) => {

    if (!events) return null;

    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - getDayEs(date));
    const [showEventDialog, setShowEventDialog] = React.useState(false);
    const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);

    const minHeight = 21;
    const rightMargin = 1.5;
    const leftOverlapping = 2
    const overlappingGroups = groupOverlappingEvents(events);
  
    return overlappingGroups.flatMap((group) => {
        return group.map((e, i) => {
            const dayOfWeek = getDayEs(e.startTime);
            let height = ((e.endTime.getTime() - e.startTime.getTime()) / (1000 * 60 * 60)) * cellSize;
            if (height < 21) height = minHeight
            const top = ((e.startTime.getHours() + e.startTime.getMinutes() / 60) ) * cellSize;
            let width = 100 / (showWeekends ? 7 : 5);
            const left = dayOfWeek * width + leftOverlapping * i;
            width -= i * leftOverlapping + rightMargin;
            // properties withour overlapping
            // let width = 100 / (showWeekends ? 7 : 5) / groupLength;
            // const left = dayOfWeek * (100 / (showWeekends ? 7 : 5)) + width * i;
            // if (i === groupLength-1) width = width + leftOverlapping*i

            return (
                <React.Fragment key={`EventWeekView-Fragment-${e.id}`}>
                    {showEventDialog && selectedEvent ? (
                        <EventDialog
                            open={showEventDialog}
                            onOpenChange={setShowEventDialog}
                            eventData={selectedEvent}
                        />
                    ): (
                    <div 
                        key={`EventWeekView-${e.id}`}
                        className="absolute left-0 right-0 z-30 inset-1"
                        style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            left: `${left}%`,
                            width: `${width}%`,
                        }}
                        onClick={() => {
                            setSelectedEvent(e);
                            setShowEventDialog(true);
                        }}    
                    >
                        <div 
                            className={cn(
                                "w-full h-full rounded-lg border border-white shadow-lg p-1 text-sm font-medium text-white overflow-hidden break-words leading-tight",
                                e.endTime < new Date() ? "bg-gray-400 hover:bg-gray-500" : "bg-blue-500 hover:bg-blue-600",
                            )}
                        >
                            {e.title}
                            <div className="text-xs">
                                {formatTime(e.startTime)} - {formatTime(e.endTime)}h
                            </div>
                        </div>  
                    </div>
                    )}
                </React.Fragment>
            );
        });
    });
};

export interface DragSelection {
    startTime: Date
    endTime: Date
    startY: number
    currentY: number
    isDragging: boolean
    dayIndex: number
}

const EventWeekViewDragged = ({
    dragSelection,
    showWeekends,
    gridRef
}: {dragSelection: DragSelection, showWeekends: boolean, gridRef: React.RefObject<HTMLDivElement>}) => {
    
    if (!dragSelection.isDragging) return null

    const scrollTop = gridRef.current?.scrollTop || 0;

    const top = Math.min(dragSelection.startY, dragSelection.currentY) + scrollTop;

    const height = Math.abs(dragSelection.currentY - dragSelection.startY)
    const leftOffset = `${dragSelection.dayIndex * (100 / (showWeekends ? 7 : 5))}%`
    const width = `${100 / (showWeekends ? 7 : 5)}%`


    const startTimeFormatted = formatTime(
        dragSelection.startTime < dragSelection.endTime ? dragSelection.startTime : dragSelection.endTime
    );

    const endTimeFormatted = formatTime(
        dragSelection.startTime < dragSelection.endTime ? dragSelection.endTime : dragSelection.startTime
    );

    return (
    <div
        className="absolute pointer-events-none z-40"
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
                {startTimeFormatted} - {endTimeFormatted} h
            </div>
        </div>
        </div>
    </div>
    )
}

export { EventWeekView, EventWeekViewDragged };