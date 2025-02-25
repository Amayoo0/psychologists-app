import { Event } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { EventDialog } from "@/components/event/EventDialog";
import { useState } from "react";
import { deleteEvent } from "@/app/actions/events";
import { ChevronDown, Pencil, Trash } from "lucide-react";
import { addHours, format } from "date-fns";

function EventTable({ 
	events,
    setEvents,
}: {
    events: Event[],
    setEvents: (events: Event[]) => void
}) {
    const [showEventDialog, setShowEventDialog] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

    const onEditEvent = (event: Event) => {
        setSelectedEvent(event)
        setShowEventDialog(true)
    }

    const onDeleteEvent = async (event: Event) => {
        const result = await deleteEvent(event.id)
        const newEvents = events.filter(e => e.id !== event.id)
        setEvents(newEvents)
    }


    return (
        <div className="flex flex-col relative">
        <div className="max-h-[200px] overflow-y-auto border border-gray-300 rounded-md">
        <table className="min-w-full border-collapse bg-white shadow">
            <thead className="sticky top-0">
            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                <th className="px-4 py-2 border-b max-w-[40px] w-[40px]">Nº</th>
                <th className="px-4 py-2 border-b max-w-[400px] w-[400px]">Título</th>
                <th className="px-4 py-2 border-b">Tipo</th>
                <th className="px-4 py-2 border-b flex flex-row gap-1 items-center">Fecha <ChevronDown size={16}/></th> 
                <th className="px-4 py-2 border-b">Sala de reunión</th>
                <th className="px-4 py-2 border-b">Acciones</th>
            </tr>
            </thead>
            <tbody>
        {[...events]
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .map((event, index) => {
            return (
            <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b max-w-[40px] w-[40px]">{index + 1}</td>

                <td className="px-4 py-2 border-b max-w-[400px] w-[400px] truncate overflow-hidden whitespace-nowrap">{event.title !== '' ? event.title : '(Sin título)'}</td>
                <td className="px-4 py-2 border-b">
                {event.type === "appointment" ? "Cita" : event.type === "event" ? "Evento" : "Tarea"}
                </td>
            
                <td className="px-4 py-2 border-b whitespace-nowrap">
                {event.type === "event"
                    ? `${format(event.startTime, "dd/MM/yyyy")} - ${format(event.endTime, "dd/MM/yyyy")}`
                    : `${format(event.startTime, "EEEE d MMM, yyyy")} ${format(event.startTime, "HH:mm")}`}
                </td>
                <td className="px-4 py-2 border-b max-w-[400px] w-[400px] truncate overflow-hidden whitespace-nowrap">
                <a href={event.sessionUrl ?? "#"} target="_blank" rel="noreferrer">
                    {event.sessionUrl}
                </a>
                </td>
                <td className="px-4 py-2 border-b space-x-2 whitespace-nowrap">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditEvent(event)}
                >
                    <Pencil/>
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    className="hover:animate-shake"
                    onClick={() => onDeleteEvent(event)}
                >
                    <Trash/>
                </Button>
                </td>
            </tr>
            )})}
            </tbody>
        </table>
        </div>
        {/* {showEventDialog &&  */}
            <EventDialog
                open={showEventDialog}
                onOpenChange={setShowEventDialog}
                eventData={selectedEvent ?? {
                    startTime: new Date(),
                    endTime: addHours(new Date(), 1),
                }}
            />
        {/* } */}
        </div>
    );
}

export default EventTable;