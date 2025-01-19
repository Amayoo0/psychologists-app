import { cn } from "@/lib/utils";
import React from "react";
import { Event } from '@prisma/client'
import { getDayEs, groupOverlappingEvents, formatTime } from "./utils";
import { EventDialog } from "../EventDialog";
import { CircleCheckBig, CornerDownRight, X } from "lucide-react";


const EventMonthView = ({
    events,
    days,
    showWeekends,
    cellSize
}: { events: Event[] | null, days: Date[], showWeekends: boolean, cellSize: number }) => {

    if (!events) return null;

    const [showEventDialog, setShowEventDialog] = React.useState(false);
    const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
    const [selectedGroup, setSelectedGroup] = React.useState<number | null>(null);

    const overlappingGroups = groupOverlappingEvents(events, "month");
  
    return overlappingGroups.flatMap((group, groupIndex) => {
        // return null if the group is on the weekend and weekends are hidden
        if (!showWeekends && getDayEs(group[0].startTime) > 4){
            return '';
        } else {
            const paddingTop = 30;
            const height = 21;
            return <div key={`events-groupIndex-${groupIndex}`}>
                {group.map((e, i) => {
                    const weekOfMonth = Math.trunc(days.findIndex(day => day.getDate() === e.startTime.getDate()) / 7); // divided by 7 due to days always contains weekends
                    const width = 100 / (showWeekends ? 7 : 5) -0.5;
                    const top = weekOfMonth*cellSize + height*i + paddingTop;
                    const left = getDayEs(e.startTime) * (100 / (showWeekends ? 7 : 5)) +0.25;
 
                    return (
                        <React.Fragment key={`EventMonthView-Fragment-${e.id}`}>
                            {showEventDialog && selectedEvent ? (
                                <EventDialog
                                    open={showEventDialog}
                                    onOpenChange={setShowEventDialog}
                                    eventData={selectedEvent}
                                />
                            ): (
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
                                        width: `${width}%`,
                                    }}
                                    onClick={() => {
                                        if ((i + 2) * height + paddingTop < cellSize || selectedGroup === groupIndex) {
                                            setSelectedEvent(e);
                                            setShowEventDialog(true);
                                        }
                                    }}    
                                >
                                    <div 
                                        className={cn(
                                            "w-full h-full rounded-md p-1 text-sm font-medium text-white overflow-hidden break-words leading-tight justify-between flex border-b border-white",
                                            e.endTime.getDate() < new Date().getDate() ? "bg-gray-400 hover:bg-gray-500" : "bg-blue-500 hover:bg-blue-600",
                                            (i+2) * height + paddingTop >= cellSize && selectedGroup !== groupIndex  && "hidden",

                                        )}
                                    >
                                        
                                        <div className="flex flex-row space-x-1">
                                            {(i+2) * height + paddingTop >= cellSize && selectedGroup === groupIndex && <CornerDownRight size={15}/>}
                                            <span>{formatTime(e.startTime)}h, </span>
                                            <span>{e.title == "" ? "(sin título)" : e.title}</span>
                                        </div>
                                        {e?.type === "task" && <CircleCheckBig size={15}/>}
                                    </div> 
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
                {/* Show hidden items */}
                {group.length >= (cellSize - paddingTop - height) / height &&
                    <div key={`extend-groupIndex-${groupIndex}`} className="absolute left-0 right-0 z-50 inset-1" style={{
                            top: `${Math.trunc(days.findIndex(day => day.getDate() === group[0].startTime.getDate()) / (showWeekends ? 7 : 5)) *cellSize + (selectedGroup !== groupIndex ? cellSize - paddingTop : 5)}px`,
                            height: "25px",
                            width: "25px",
                            left: `calc(${(getDayEs(group[0].startTime) + 1) * (100 / (showWeekends ? 7 : 5))}% - 25px)`,
                    }}>
                        {selectedGroup !== groupIndex ? 
                            <a onClick={() => {
                                    setSelectedGroup(groupIndex)
                                }} 
                                className="hover:underline"
                            >
                                +{group.length - Math.trunc((cellSize - paddingTop) / height)+1}
                            </a>
                        : 
                            <a onClick={() => {
                                    setSelectedGroup(null)
                                }}
                            >
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