import { cn } from "@/lib/utils";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import React from "react";
import { Event } from '@prisma/client'
import { getDayEs, groupOverlappingEvents } from "./utils";
import { EventDialog } from "../EventDialog";
import { he } from "date-fns/locale";


export const RenderEventWeekView = ({
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
                    className="absolute left-0 right-0"
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
  