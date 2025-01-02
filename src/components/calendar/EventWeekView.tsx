import { cn } from "@/lib/utils";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import React from "react";
import { Event } from '@prisma/client'
import { getDayEs, groupOverlappingEvents } from "./utils";
import { EventDialog } from "../EventDialog";


const EventWeekView = ({
    events,
    date,
    cellSize,
    showWeekends 
}: { events: Event[], date: Date, cellSize: number, showWeekends: boolean }) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - getDayEs(date));
    const [showEventDialog, setShowEventDialog] = React.useState(false);
    const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);

    const overlappingGroups = groupOverlappingEvents(events);
    console.log('overlappingGroups', overlappingGroups);
  
    return overlappingGroups.flatMap((group) => {
        const groupLength = group.length;
        return group.map((e, i) => {
            const dayOfWeek = getDayEs(e.startTime);
            const height = ((e.endTime.getTime() - e.startTime.getTime()) / (1000 * 60 * 60)) * cellSize;
            const top = ((e.startTime.getHours() + e.startTime.getMinutes() / 60) - 1) * cellSize;
            const width = 100 / (showWeekends ? 7 : 5) / groupLength;
            const left = dayOfWeek * (100 / (showWeekends ? 7 : 5)) + width * i;
            return (
                <div 
                    key={`event-${e.id}`}
                    className="absolute left-0 right-0 z-30"
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
                        {showEventDialog && selectedEvent ? (
                            <EventDialog
                                open={showEventDialog}
                                onOpenChange={(isOpen) => {
                                    setShowEventDialog(isOpen); 
                                    if (!isOpen) {
                                    // Wait for the dialog to close before resetting the selected event
                                    setTimeout(() => setSelectedEvent(null), 0);
                                    }
                                }}
                                startTime={selectedEvent?.startTime || new Date()}
                                endTime={selectedEvent?.endTime || new Date()}
                            />
                        ): (
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
                            {height < 40 && (
                                <TooltipContent>
                                    {e.title}
                                </TooltipContent>
                            )}
                        </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
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

    console.log('renderizando drag selection')

    const scrollTop = gridRef.current?.scrollTop || 0;

    const top = Math.min(dragSelection.startY, dragSelection.currentY) + scrollTop;

    const height = Math.abs(dragSelection.currentY - dragSelection.startY)
    const leftOffset = `${dragSelection.dayIndex * (100 / (showWeekends ? 7 : 5))}%`
    const width = `${100 / (showWeekends ? 7 : 5)}%`

    console.log('top', top, 'height', height, 'leftOffset', leftOffset, 'width', width)

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
        className="absolute pointer-events-none z-30"
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

export { EventWeekView, EventWeekViewDragged };