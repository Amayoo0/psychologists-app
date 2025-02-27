import { CalendarClock, Clock, Video, Calendar, CheckSquare } from "lucide-react"
import { formatDistanceToNow, format, isSameDay } from "date-fns"
import { es } from "date-fns/locale"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Event } from "@prisma/client"
import { getUpcomingEvents } from "@/app/actions/events"

function getEventIcon(type: string) {
  switch (type) {
    case "appointment":
      return <Calendar className="h-4 w-4 text-blue-500" />
    case "task":
      return <CheckSquare className="h-4 w-4 text-green-500" />
    default:
      return <CalendarClock className="h-4 w-4 text-primary" />
  }
}

function getEventTypeName(type: string) {
  switch (type) {
    case "appointment":
      return "Cita"
    case "task":
      return "Tarea"
    default:
      return "Evento"
  }
}

function getEventTypeColor(type: string) {
  switch (type) {
    case "appointment":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    case "task":
      return "bg-green-100 text-green-800 hover:bg-green-200"
    default:
      return "bg-primary/10 text-primary hover:bg-primary/20"
  }
}

export function NextEvents() {
    const [eventsToShow, setEventsToShow] = useState<Event[] | null>(null);
    useEffect(() => {
        async function fetchEvent(){
            const events = await getUpcomingEvents()
            if (events) setEventsToShow(events);
        }
        fetchEvent();
    }, [])

    if (!eventsToShow) return null

    return (
        <Card className="">
        <CardHeader>
            <div className="flex items-center justify-between">
            <div>
                <CardTitle>Próximos eventos</CardTitle>
                <CardDescription>Tus eventos más cercanos en el tiempo</CardDescription>
            </div>
            </div>
        </CardHeader>
        <CardContent className="p-0 max-h-[300px] overflow-auto">
            <div className="divide-y">
            {eventsToShow.length > 0 ? (
                eventsToShow.map((event) => (
                <div key={event.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        {getEventIcon(event.type)}
                        <h3 className="font-medium">{event.title}</h3>
                        <Badge className={getEventTypeColor(event.type)} variant="outline">
                        {getEventTypeName(event.type)}
                        </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(event.startTime, { addSuffix: true, locale: es })}
                    </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {isSameDay(event.startTime, event.endTime) 
                            ?   `${format(event.startTime, "d MMM, HH:mm", { locale: es })} - ${format(event.endTime, "HH:mm", { locale: es })}`
                            :   `${format(event.startTime, "d MMM, HH:mm", { locale: es })} - ${format(event.endTime, "d MMM, HH:mm", { locale: es })}`
                          }
                        </span>
                    </div>

                    </div>

                    {event.sessionUrl && (
                    <div className="mt-2">
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <Video className="h-3.5 w-3.5" />
                        Unirse a sesión
                        </Button>
                    </div>
                    )}
                </div>
                ))
            ) : (
                <div className="p-6 text-center text-muted-foreground">No hay eventos próximos programados</div>
            )}
            </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 p-4">
            <div className="flex w-full justify-between text-sm text-muted-foreground">
            <span>Mostrando {eventsToShow.length} eventos</span>
            <Button variant="link" size="sm" onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/calendar`}>
                Calendario completo
            </Button>
            </div>
        </CardFooter>
        </Card>
    )
}

