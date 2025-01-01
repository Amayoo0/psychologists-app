"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Users, Video } from 'lucide-react'
import { format, set } from "date-fns"
import { es, se } from "date-fns/locale"
import { useState, useEffect } from "react"
import SearchableDropdown from "./SearchableDropdown"
import { getPatients } from "@/app/actions/patients"
import { Patient } from "@prisma/client"
import { on } from "events"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { currentUser } from "@clerk/nextjs/server"
import { useUser } from "@clerk/nextjs"

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  startTime: Date
  endTime: Date
  eventData?: {
    title: string
    description: string
    type: string
    patientId: number
  }
  repeat?: string
}

export function EventDialog({
  open,
  onOpenChange,
  startTime,
  endTime,
  eventData,
}: EventDialogProps) {
    const [title, setTitle] = useState(eventData?.title || "")
    const [description, setDescription] = useState(eventData?.description || "")
    const [type, setType] = useState(eventData?.type || "appointment")
    const [patientId, setPatientId] = useState(eventData?.patientId || 0)
    const [patients, setPatients] = useState<Patient[]>([])
    const [startTimeStr, setStartTimeStr] = useState(format(startTime, "HH:mm"))
    const [endTimeStr, setEndTimeStr] = useState(format(endTime, "HH:mm"))
    const [newStartTime, setNewStartTime] = useState(startTime)
    const [newEndTime, setNewEndTime] = useState(endTime)
    const [repeat, setRepeat] = useState("no-repeat")

    useEffect(() => {
        setNewStartTime(startTime);
        setStartTimeStr(format(startTime, "HH:mm"));
        setNewEndTime(endTime);
        setEndTimeStr(format(endTime, "HH:mm"));
      }, [startTime, endTime]);

    useEffect(() => {
        // Fetch patients when the component mounts
        async function fetchPatients() {
            const fetchedPatients = await getPatients();
            if (!fetchedPatients){
                console.log("No patients found, using mock data");
                setPatients([
                    {
                        id: 4,
                        name: "Bob Brown",
                        initials: "BB",
                        userId: 104,
                        createdAt: new Date("2023-01-15T13:00:00Z"),
                        lastSession: new Date("2023-02-15T13:00:00Z"),
                    },
                    {
                        id: 5,
                        name: "Charlie Davis",
                        initials: "CD",
                        userId: 105,
                        createdAt: new Date("2023-01-20T14:00:00Z"),
                        lastSession: new Date("2023-02-20T14:00:00Z"),
                    },
                    {
                        id: 6,
                        name: "Diana Evans",
                        initials: "DE",
                        userId: 106,
                        createdAt: new Date("2023-01-25T15:00:00Z"),
                        lastSession: new Date("2023-02-25T15:00:00Z"),
                    },
                    {
                        id: 7,
                        name: "Ethan Foster",
                        initials: "EF",
                        userId: 107,
                        createdAt: new Date("2023-01-30T16:00:00Z"),
                        lastSession: new Date("2023-02-28T16:00:00Z"),
                    },
                    {
                        id: 8,
                        name: "Fiona Green",
                        initials: "FG",
                        userId: 108,
                        createdAt: new Date("2023-02-01T17:00:00Z"),
                        lastSession: new Date("2023-03-01T17:00:00Z"),
                    },
                    {
                        id: 9,
                        name: "George Harris",
                        initials: "GH",
                        userId: 109,
                        createdAt: new Date("2023-02-05T18:00:00Z"),
                        lastSession: new Date("2023-03-05T18:00:00Z"),
                    },
                    {
                        id: 10,
                        name: "Hannah Irving",
                        initials: "HI",
                        userId: 110,
                        createdAt: new Date("2023-02-10T19:00:00Z"),
                        lastSession: new Date("2023-03-10T19:00:00Z"),
                    },
                    {
                        id: 11,
                        name: "Ian Johnson",
                        initials: "IJ",
                        userId: 111,
                        createdAt: new Date("2023-02-15T20:00:00Z"),
                        lastSession: new Date("2023-03-15T20:00:00Z"),
                    },
                    {
                        id: 12,
                        name: "Jessica King",
                        initials: "JK",
                        userId: 112,
                        createdAt: new Date("2023-02-20T21:00:00Z"),
                        lastSession: new Date("2023-03-20T21:00:00Z"),
                    },
                    {
                        id: 13,
                        name: "Kevin Lewis",
                        initials: "KL",
                        userId: 113,
                        createdAt: new Date("2023-02-25T22:00:00Z"),
                        lastSession: new Date("2023-03-25T22:00:00Z"),
                    },
                    {
                        id: 1,
                        name: "John Doe",
                        initials: "JD",
                        userId: 101,
                        createdAt: new Date("2023-01-01T10:00:00Z"),
                        lastSession: new Date("2023-02-01T10:00:00Z"),
                    },
                    {
                        id: 2,
                        name: "Jane Smith",
                        initials: "JS",
                        userId: 102,
                        createdAt: new Date("2023-01-05T11:00:00Z"),
                        lastSession: null,
                    },
                    {
                        id: 3,
                        name: "Alice Johnson",
                        initials: "AJ",
                        userId: 103,
                        createdAt: new Date("2023-01-10T12:00:00Z"),
                        lastSession: new Date("2023-02-10T12:00:00Z"),
                    },
                ]);
            } else {
                setPatients(fetchedPatients);
            }

        }
        fetchPatients()
    }, [onOpenChange])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const [startHour, startMinute] = startTimeStr.split(':')
        const [endHour, endMinute] = endTimeStr.split(':')
        newStartTime.setHours(Number(startHour), Number(startMinute))
        newEndTime.setHours(Number(endHour), Number(endMinute))

        console.log("Saving event", title, description, newStartTime, newEndTime, type, patientId)

        const event = {
        title,
        description,
        startTime: newStartTime,
        endTime: newEndTime,
        type,
        patientId,
        }
        switch (repeat) {
            case "daily":
                // Guardar evento diariamente
                break
            case "weekly":
                // Guardar evento semanalmente
                break
            case "monthly":
                // Guardar evento mensualmente
                break
            default:
                // Guardar evento sin repetición
                // saveEvent(event)
                break
        }

        // Cierra el diálogo después de guardar el evento
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[450px]">
            <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>
                <Input
                    type="text"
                    placeholder="Añadir título"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-0 border-b p-0 text-lg font-medium focus-visible:ring-0"
                />
                </DialogTitle>
            </DialogHeader>
            <Tabs defaultValue={type} className="mt-4" onValueChange={(value) => setType(value)}>
                <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="event">Evento</TabsTrigger>
                <TabsTrigger value="task">Tarea</TabsTrigger>
                <TabsTrigger value="appointment">Cita</TabsTrigger>
                </TabsList>
            </Tabs>
            <div className="grid gap-4 py-4">
                <div className="flex flex-row items-center space-x-2">
                <Input
                    type="date"
                    value={format(newStartTime, "yyyy-MM-dd")}
                    className="w-30"
                    onChange={(e) => setNewStartTime((prev) => new Date(new Date(e.target.value).setHours(prev.getHours(), prev.getMinutes())))}
                />
                <Input
                    type="time"
                    className="w-25"
                    value={startTimeStr}
                    onChange={(e) => setStartTimeStr(e.target.value)}
                />
                {type !== "event" && (
                    <Input
                        type="time"
                        value={endTimeStr}
                        className="w-25"
                        onChange={(e) => setEndTimeStr(e.target.value)}
                    />
                )}
                </div>
                {type === "event" ? (
                <div className="flex flex-row items-center space-x-2">
                    <Input
                        type="date"
                        value={format(newEndTime, "yyyy-MM-dd")}
                        className="w-35"
                        onChange={(e) => setNewEndTime((prev) => new Date(new Date(e.target.value).setHours(prev.getHours(), prev.getMinutes())))}
                    />
                    <Input
                        type="time"
                        className="w-25"
                        value={endTimeStr}
                        onChange={(e) => setEndTimeStr(e.target.value)}
                    />
                </div>
                ) : (
                    <Select value={repeat} onValueChange={setRepeat}>
                        <SelectTrigger className="w-[180px] h-8 text-sm">
                        <SelectValue placeholder="No se repite" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="no-repeat">No se repite</SelectItem>
                        <SelectItem value="daily">Diariamente</SelectItem>
                        <SelectItem value="weekly">Semanalmente</SelectItem>
                        <SelectItem value="monthly">Mensualmente</SelectItem>
                        </SelectContent>
                    </Select>
                )}

                <div className="grid gap-2">
                <div className="flex items-center gap-4">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Añadir videollamada"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="pb-32">
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <SearchableDropdown
                    options={patients}
                    label="initials"
                    id="id"
                    selectedVal={patientId.toString()}
                    handleChange={(val) => setPatientId(Number(val))}
                    placeholder="Seleccionar paciente"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Añadir descripción"
                    className="border-0"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                </div>
            </div>
            <DialogFooter>
                <Button type="submit">Guardar</Button>
            </DialogFooter>
            </form>
        </DialogContent>
        </Dialog>
    )
}

