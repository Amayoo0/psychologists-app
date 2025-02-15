import { cn } from "@/lib/utils";
import { getDayEs } from "./utils";
import React from "react";
import { Event } from "@prisma/client";
import { EventDialog } from "../EventDialog";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../ui/button";

interface EventWeekViewMultiDayProps {
events: Event[];
date: Date;
cellSize: number;
showWeekends: boolean;
showHidden: boolean;
setShowHidden: (show: boolean) => void;
nMultiDaysToShow: number;
}

const EventWeekViewMultiDay: React.FC<EventWeekViewMultiDayProps> = ({
events,
date,
cellSize,
showWeekends,
showHidden,
setShowHidden,
nMultiDaysToShow,
}) => {
    const [showEventDialog, setShowEventDialog] = React.useState(false);
    const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);

    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - getDayEs(date));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + (showWeekends ? 6 : 4));

    const rightMargin = 10;
    if (!events) return null;

    const visibleMultiDaysCount =
        events.length > nMultiDaysToShow
        ? showHidden
            ? events.length
            : nMultiDaysToShow
        : events.length;

    const topPadding = visibleMultiDaysCount * 25;

    return (
        <>
        <div className="relative bg-white" style={{ height: `${topPadding}px` }}>
            {/* Grid background with dividers */}
            <div className="absolute inset-0 grid grid-cols-7 divide-x divide-gray-100 pl-[64px] pr-[16px] border-b-2 border-gray-300">
                {Array.from({ length: 0 }).map((_, index) => (
                    <div key={`divider-${index}`} className="flex-1" />
                ))}
            </div>

            {/* Sticky container for events */}
            <div id="multi-day-fixed-container" className="relative z-10 pl-[64px]">
            <div className="sticky top-0 z-20">
                {events.flatMap((e, i) => {
                    const dayWidth = 100 / (showWeekends ? 7 : 5);
                    const eventStart = new Date(
                        Math.max(startOfWeek.getTime(), e.startTime.getTime())
                    );
                    const eventEnd = new Date(
                        Math.min(endOfWeek.getTime(), e.endTime.getTime())
                    );
                    const startDayIndex = getDayEs(eventStart);
                    const endDayIndex = getDayEs(eventEnd);
                    const left = startDayIndex * dayWidth;
                    const width = (endDayIndex - startDayIndex + 1) * dayWidth;

                    const height = 25;
                    const top = i * height;

                    return (
                        <div
                            key={`EventWeekView-Fragment-${e.id}-multi-day`}
                            className={cn("absolute z-20", i >= nMultiDaysToShow && !showHidden && "hidden")}
                            style={{
                                top: `${top}px`,
                                height: `${height}px`,
                                left: `calc(${left}%)`,
                                width: `calc(${width}% - 15px - ${rightMargin}px)`,
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
                })}
            </div>

            </div>

            {/* Show more button */}
            <div id="show-more-multi-days-button" className="relative bg-white">
            {events.length > nMultiDaysToShow && (
                <div
                    className="absolute left-4 cursor-pointer z-50"
                    style={{ top: `${((showHidden ? events.length : nMultiDaysToShow) - 1.7) * 25}px` }}
                >
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-full w-10 h-10 flex items-center justify-center border-none"
                        onClick={() => setShowHidden(!showHidden)}
                    >
                        {showHidden ? (
                        <ChevronUp className="w-6 h-6 text-gray-500" />
                        ) : (
                        <ChevronDown className="w-6 h-6 text-gray-500" />
                        )}
                    </Button>
                </div>

            )}
            </div>
        </div>

        {showEventDialog && selectedEvent && (
            <EventDialog
            open={showEventDialog}
            onOpenChange={setShowEventDialog}
            eventData={selectedEvent}
            />
        )}
        </>
    );
};

export default EventWeekViewMultiDay;