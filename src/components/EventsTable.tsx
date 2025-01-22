import { Patient, Event } from "@prisma/client";
import { Button } from "./ui/button";
import { EventDialog } from "./EventDialog";
import { useState } from "react";
import { deleteEvent } from "@/app/actions/events";
import { Pencil, Trash } from "lucide-react";
import { format } from "date-fns";

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
            <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                <th className="px-4 py-2 border-b">Título</th>
                <th className="px-4 py-2 border-b">Tipo</th>
                <th className="px-4 py-2 border-b">Fecha</th>
                <th className="px-4 py-2 border-b">Sala de reunión</th>
                <th className="px-4 py-2 border-b">Acciones</th>
            </tr>
            </thead>
            <tbody>
        {events.map((event) => {
            return (
            <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{event.title !== '' ? event.title : '(Sin título)'}</td>
                <td className="px-4 py-2 border-b">{event.type}</td>
                <td className="px-4 py-2 border-b whitespace-nowrap">
                    {`${event.startTime.toLocaleDateString()} ${format(event.startTime, "HH:mm")}`}{" "}
                    {event.type === "event"
                        ? `- ${event.endTime.toLocaleDateString()} ${format(event.endTime, "HH:mm")}`
                        : ` - ${format(event.endTime, "HH:mm")}`}
                </td>
                <td className="px-4 py-2 border-b">{event.sessionUrl}</td>
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
        <EventDialog
            open={showEventDialog}
            onOpenChange={setShowEventDialog}
            eventData={selectedEvent ?? undefined}
        />
        </div>
    );
}

export default EventTable;