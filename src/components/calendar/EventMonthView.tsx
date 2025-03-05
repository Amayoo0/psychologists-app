import { cn } from "@/lib/utils";
import React from "react";
import { Event } from '@prisma/client'
import { getDayEs, groupOverlappingEvents, formatTime, EventMap } from "@/components/calendar/utils";
import { EventDialog } from "@/components/event/EventDialog";
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
    const [selectedGroup, setSelectedGroup] = React.useState<string | null>(null);

    const extendedEvents: ExtendedEvent[] = events.map(event => ({
        ...event,
        isHidden: false
    }));

    const overlappingGroups: EventMap = groupOverlappingEvents(extendedEvents, "month");
    type ExtendedEvent = Event & { isHidden: boolean };

    
    return <>
        {Array.from(overlappingGroups.entries()).map(([date, group]) => {           
            const paddingTop = 30;
            const height = 21;
            const eventDate = new Date(String(date));
            const weekOfMonth = Math.trunc(days.findIndex(day => day.getDate() === eventDate.getDate() && day.getMonth() === eventDate.getMonth()) / 7); // divided by 7 due to days always contains weekends
            const dayWidth = 100 / (showWeekends ? 7 : 5);
            return (
                <div key={`events-groupIndex-${date}`}>
                    {group.flatMap((e, i) => {
                        // return null if the group is on the weekend and weekends are hidden
                        if (!showWeekends && getDayEs(e.startTime) > 4) return null;
                        const left = getDayEs(e.startTime) * dayWidth + 0.25;
                        let top = weekOfMonth*cellSize + height*i + paddingTop;

                        // if multi-day event
                        if (isMultiDay(e)){
                            // if is the first time the event is printed OR we are in monday which implies the event could have more than one week
                            if (eventDate.getDate() === e.startTime.getDate() || getDayEs(eventDate) === 0 || ( e.isHidden && selectedGroup === date)) {
                            // Calculate the start of the group's week
                            const startOfWeekDate = new Date(eventDate);
                            startOfWeekDate.setDate(eventDate.getDate() - getDayEs(eventDate));

                            // Normalize event dates to midnight to avoid issues with hours
                            const normalizedEventStart = new Date(e.startTime.toDateString());
                            const normalizedEventEnd = new Date(e.endTime.toDateString());

                            // For the width, use the later of the event start date and the start of the week
                            const eventWidthStartTime =
                            normalizedEventStart.getTime() < startOfWeekDate.getTime()
                                ? startOfWeekDate.getTime()
                                : normalizedEventStart.getTime();

                            // Calculate the difference in days as an absolute value
                            const msPerDay = 1000 * 60 * 60 * 24;
                            const diffDays =
                            Math.floor((normalizedEventEnd.getTime() - eventWidthStartTime) / msPerDay) + 1;

                            // Calculate the available days in the cell (the week)
                            const availableDays = (showWeekends ? 7 : 5) - getDayEs(eventDate);

                            // The event width in percentage is calculated as the minimum between the event duration in days and the available days, multiplied by dayWidth
                            const eventWidth = Math.min(diffDays, availableDays) * dayWidth;

                                e.isHidden = (i + 2) * height + paddingTop >= cellSize && selectedGroup !== date;
                                return (
                                    <div
                                        key={`EventMonthView-${e.id}-week-${weekOfMonth}-multi-day`}
                                        className={cn(
                                            "absolute left-0 right-0 inset-1 multi-day-event",
                                            "z-20",
                                            (i+2) * height + paddingTop >= cellSize && selectedGroup !== date  && "hidden",
                                        )}
                                        style={{
                                            top: `${top}px`,
                                            height: `${height}px`,
                                            left: `${left}%`,
                                            width: `calc(${eventWidth}% - 15px)`
                                        }}
                                        onClick={() => {
                                            setSelectedEvent(e);
                                            setShowEventDialog(true);
                                        }}
                                    >
                                        <div className="w-full h-full rounded-md p-1 text-sm font-medium text-white overflow-hidden break-words leading-tight flex items-center bg-blue-500 hover:bg-blue-600 border-b border-white">
                                            {(i+2) * height + paddingTop >= cellSize && selectedGroup === date && <CornerDownRight size={15}/>}
                                            <span className="truncate">{e.title || "(sin título)"}</span>
                                        </div>
                                    </div>
                                );
                            } else {
                                return null;
                            }
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
                                            width: `calc(${dayWidth}% - 15px)`
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
                                                "bg-blue-500 hover:bg-blue-600",
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
                        )
                    })}
                    {/* Show hidden items */}
                    {group.length >= (cellSize - paddingTop - height) / height &&
                        <div key={`extend-groupIndex-${date}`} className="absolute left-0 right-0 z-50 inset-1" style={{
                                top: `${Math.trunc(days.findIndex(day => day.getDate() === group[0].startTime.getDate()) / 7) *cellSize + (selectedGroup !== date ? cellSize - paddingTop : 5)}px`,
                                height: "25px",
                                width: "25px",
                                left: `calc(${(getDayEs(eventDate) + 1) * dayWidth}% - 25px)`,
                        }}>
                        {selectedGroup !== date 
                            ?   <a onClick={() => {
                                        setSelectedGroup(date)
                                    }} 
                                    className="hover:underline"
                                >
                                    +{group.length - Math.trunc((cellSize - paddingTop) / height) + 1}
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
        <EventDialog
            open={showEventDialog}
            onOpenChange={setShowEventDialog}
            eventData={selectedEvent ?? {}}
        />
    </>
};


export { EventMonthView };