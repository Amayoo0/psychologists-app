import { cn } from "@/lib/utils";
import React from "react";
import { Event } from '@prisma/client'
import { getDayEs, groupOverlappingEvents, formatTime } from "./utils";
import { EventDialog } from "../EventDialog";
import { X } from "lucide-react";


const EventMonthView = ({
    events,
    days,
    showWeekends,
    cellSize
}: { events: Event[] | null, days: Date[], showWeekends: boolean, cellSize: number }) => {

    if (!events) return null;

    const [showEventDialog, setShowEventDialog] = React.useState(false);
    const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
    const [showHiddenEvents, setShowHiddenEvents] = React.useState(false);

    const overlappingGroups = groupOverlappingEvents(events, "month");
  
    return overlappingGroups.flatMap((group, groupIndex) => {
        // return null if the group is on the weekend and weekends are hidden
        if (!showWeekends && getDayEs(group[0].startTime) > 4){
            return '';
        } else {
            const paddingTop = 30;
            const height = 20;
            return <div key={`events-groupIndex-${groupIndex}`}>
                {group.map((e, i) => {
                    const weekOfMonth = Math.trunc(days.findIndex(day => day.getDate() === e.startTime.getDate()) / 7); // divided by 7 due to days always contains weekends
                    const width = 100 / (showWeekends ? 7 : 5) -0.5;
                    const top = weekOfMonth*cellSize + height*i + paddingTop;
                    const left = getDayEs(e.startTime) * (100 / (showWeekends ? 7 : 5)) +0.25;
 
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
                                        if ((i + 2) * height + paddingTop < cellSize || showHiddenEvents) {
                                            setSelectedEvent(e);
                                            setShowEventDialog(true);
                                        }
                                    }}    
                                >
                                    <div 
                                        className={cn(
                                            "w-full h-full rounded-md p-1 text-sm font-medium text-white overflow-hidden break-words leading-tight",
                                            e.endTime < new Date() ? "bg-gray-300" : "bg-blue-500",
                                            (i+2) * height + paddingTop >= cellSize && !showHiddenEvents && "hidden",
                                            showHiddenEvents && "z-50"
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
                })}
                {/* Show hidden items */}
                {group.length >= (cellSize - paddingTop - height) / height &&
                    <div key={`extend-groupIndex-${groupIndex}`} className="absolute left-0 right-0 z-50 inset-1 rounded-lg" style={{
                            top: `${Math.trunc(days.findIndex(day => day.getDate() === group[0].startTime.getDate()) / (showWeekends ? 7 : 5)) *cellSize + (!showHiddenEvents ? cellSize - paddingTop : 5)}px`,
                            height: "25px",
                            width: "25px",
                            left: `calc(${(getDayEs(group[0].startTime) + 1) * (100 / (showWeekends ? 7 : 5))}% - 25px)`,
                    }}>
                        {!showHiddenEvents ? 
                            <a onClick={() => setShowHiddenEvents(true)} className="hover:underline">
                                +{group.length - Math.trunc((cellSize - paddingTop) / height)+1}
                                {/* Mostrar todos... */}
                            </a>
                        : 
                            <a onClick={() => setShowHiddenEvents(false)}>
                                <X size={20}/>
                            </a>
                        }
                    </div>
                }
            </div>
        }
        
    });
};


export { EventMonthView };