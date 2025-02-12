import { cn } from "@/lib/utils";
import React from "react";
import { Event } from '@prisma/client'
import { getDayEs, groupOverlappingEvents, formatTime, EventMap } from "./utils";
import { EventDialog } from "../EventDialog";
import { CircleCheckBig, CornerDownRight, X } from "lucide-react";

const isMultiDay = (event: Event) => {
    const startDate = event.startTime.toDateString();
    const endDate = event.endTime.toDateString();
    return startDate !== endDate;
};

const EventMonthView = ({
    events,
    days,
    showWeekends,
    cellSize
}: { events: Event[] | null, days: Date[], showWeekends: boolean, cellSize: number }) => {

    if (!events) return null;

    const [showEventDialog, setShowEventDialog] = React.useState(false);
    const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
    const [selectedGroup, setSelectedGroup] = React.useState<String | null>(null);

    const overlappingGroups: EventMap = groupOverlappingEvents(events, "month");
    console.log('overlappingGroups', overlappingGroups);
  
    return <>
        {Array.from(overlappingGroups.entries()).map(([date, group]) => {
            // return null if the group is on the weekend and weekends are hidden
            if (!showWeekends && getDayEs(group[0].startTime) > 4) return null;
            
            const paddingTop = 30;
            const height = 21;
            return (
                <div key={`events-groupIndex-${date}`}>
                    {group.flatMap((e, i) => {
                        const weekOfMonth = Math.trunc(days.findIndex(day => day.getDate() === e.startTime.getDate() && day.getMonth() === e.startTime.getMonth()) / 7); // divided by 7 due to days always contains weekends
                        const startIdx = days.findIndex(day => day.toDateString() === e.startTime.toDateString());
                        const endIdx = days.findIndex(day => day.toDateString() === e.endTime.toDateString());

                        const weekStart = Math.trunc(startIdx / 7);
                        const weekEnd = Math.trunc(endIdx / 7);

                        const width = 100 / (showWeekends ? 7 : 5);
                        const left = getDayEs(e.startTime) * (100 / (showWeekends ? 7 : 5)) + 0.25;
                        let top = weekOfMonth*cellSize + height*i + paddingTop;


                        const eventDate = new Date(String(date));
                        // if multi-day event && is the first day of the event
                        if (isMultiDay(e) && e.startTime.getDate() === eventDate.getDate() && e.startTime.getMonth() === eventDate.getMonth()) {
                            return Array.from({ length: weekEnd - weekStart + 1 }).map((_, weekOffset) => {
                                const currentWeek = weekStart + weekOffset;
                                const currentTop = currentWeek * cellSize + paddingTop + height*i;
                                const isStartWeek = weekOffset === 0;
                                const isEndWeek = currentWeek === weekEnd;
    
                                let eventWidth;
                                if (showWeekends) {
                                    eventWidth = isStartWeek ? (isEndWeek ? width * (endIdx - startIdx + 1) : width * (7 - getDayEs(e.startTime))) : (isEndWeek ? width * (getDayEs(e.endTime) + 1) : width * 7);
                                } else {
                                    const startDay = Math.max(getDayEs(e.startTime), 0);
                                    const endDay = Math.min(getDayEs(e.endTime), 4);
                                    eventWidth = isStartWeek ? (isEndWeek ? width * (endDay - startDay + 1) : width * (5 - startDay)) : (isEndWeek ? width * (endDay + 1) : width * 5);
                                }
    
                                return (
                                    <div
                                        key={`EventMonthView-${e.id}-week-${currentWeek}-multi-day`}
                                        className={cn(
                                            "absolute left-0 right-0 inset-1 multi-day-event",
                                            "z-20"
                                        )}
                                        style={{
                                            top: `${currentTop}px`,
                                            height: `${height}px`,
                                            left: `${isStartWeek ? left : 0}%`,
                                            width: `calc(${eventWidth}% - 15px)`
                                        }}
                                        onClick={() => {
                                            setSelectedEvent(e);
                                            setShowEventDialog(true);
                                        }}
                                    >
                                        <div className="w-full h-full rounded-md p-1 text-sm font-medium text-white overflow-hidden break-words leading-tight flex items-center bg-blue-500 hover:bg-blue-600 border-b border-white">
                                            <span className="truncate">{e.title || "(sin título)"}</span>
                                        </div>
                                    </div>
                                );
                            });
                        }
                        // single-day event
                        return (
                            <React.Fragment key={`EventMonthView-Fragment-${e.id}`}>
                                <div 
                                    key={`EventMonthView-${e.id}`}
                                    className={cn(
                                            "absolute left-0 right-0 inset-1 ",
                                            (i+2) * height + paddingTop >= cellSize && "z-30"
                                        )}
                                        style={{
                                            top: `${top}px`,
                                            height: `${height}px`,
                                            left: `${left}%`,
                                            width: `calc(${width}% - 0px)`
                                        }}
                                        onClick={() => {
                                            if ((i + 2) * height + paddingTop < cellSize || selectedGroup === date) {
                                                setSelectedEvent(e);
                                                setShowEventDialog(true);
                                            }
                                        }}    
                                    >
                                        <div 
                                            className={cn(
                                                "w-full h-full rounded-md p-1 text-sm font-medium text-white overflow-hidden break-words leading-tight justify-between flex border-b border-white",
                                                e.endTime < new Date(new Date().setHours(0, 0, 0, 0)) ? "bg-gray-400 hover:bg-gray-500" : "bg-blue-500 hover:bg-blue-600",
                                                (i+2) * height + paddingTop >= cellSize && selectedGroup !== date  && "hidden",

                                            )}
                                        >
                                            
                                            <div className="flex flex-row space-x-1 items-center">
                                                {(i+2) * height + paddingTop >= cellSize && selectedGroup === date && <CornerDownRight size={15}/>}
                                                <span>{formatTime(e.startTime)}h, </span>
                                                <span className="truncate">{e.title == "" ? "(sin título)" : e.title}</span>
                                            </div>
                                            {e?.type === "task" && <CircleCheckBig size={15}/>}
                                        </div> 
                                    </div>
                            </React.Fragment>
                        );
                    })}
                    {/* Show hidden items */}
                    {group.length >= (cellSize - paddingTop - height) / height &&
                        <div key={`extend-groupIndex-${date}`} className="absolute left-0 right-0 z-50 inset-1" style={{
                                top: `${Math.trunc(days.findIndex(day => day.getDate() === group[0].startTime.getDate()) / (showWeekends ? 7 : 5)) *cellSize + (selectedGroup !== date ? cellSize - paddingTop : 5)}px`,
                                height: "25px",
                                width: "25px",
                                left: `calc(${(getDayEs(group[0].startTime) + 1) * (100 / (showWeekends ? 7 : 5))}% - 25px)`,
                        }}>
                        {selectedGroup !== date 
                            ?   <a onClick={() => {
                                        setSelectedGroup(date)
                                    }} 
                                    className="hover:underline"
                                >
                                    +{group.length - Math.trunc((cellSize - paddingTop) / height)+1}
                                </a>
                            :   <a onClick={() => {
                                        setSelectedGroup(null)
                                    }}
                                >
                                    <X size={20}/>
                                </a>
                        }
                        </div>
                    }
                </div>
            );
        })}
        {showEventDialog && selectedEvent && 
            <EventDialog
                open={showEventDialog}
                onOpenChange={setShowEventDialog}
                eventData={selectedEvent}
            />
        }
    </>
};


export { EventMonthView };