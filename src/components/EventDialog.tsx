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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, Video } from 'lucide-react'
import { format } from "date-fns"
import { useState, useEffect, use } from "react"
import SearchableDropdown from "./SearchableDropdown"
import { Patient, Event } from "@prisma/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { currentUser } from "@clerk/nextjs/server"
import { useUser } from "@clerk/nextjs"
import { userAgent } from "next/server"
import { saveEvent } from "@/app/actions/events"
import { prisma } from "@/lib/prisma"
import { useCalendar } from "./calendar/calendar-context"



interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventData?: Partial<Event>
  repeat?: string
}

export function EventDialog({
  open,
  onOpenChange,
  eventData,
}: EventDialogProps) {
    const {patients, setEvents, events} = useCalendar();
    const [title, setTitle] = useState(eventData?.title || "")
    const [description, setDescription] = useState(eventData?.description || "")
    const [type, setType] = useState(eventData?.type || "appointment")
    const [patientId, setPatientId] = useState(eventData?.patientId || 0)
    const [patient, setPatient] = useState<Patient>()
    const [sessionUrl, setSessionUrl] = useState(eventData?.sessionUrl || "")
    const [startTimeStr, setStartTimeStr] = useState(format(eventData?.startTime ? eventData.startTime : new Date(), "HH:mm"))
    const [endTimeStr, setEndTimeStr] = useState(format(eventData?.endTime ? eventData.endTime : new Date(), "HH:mm"))
    const [newStartTime, setNewStartTime] = useState(eventData?.startTime ? eventData.startTime : new Date())
    const [newEndTime, setNewEndTime] = useState(eventData?.endTime ? eventData.endTime : new Date())
    const [repeat, setRepeat] = useState("no-repeat")
    const [repetitionCount, setRepetitionCount] = useState(1)

    useEffect(() => {
        setStartTimeStr(format(newStartTime, "HH:mm"));
        setEndTimeStr(format(newEndTime, "HH:mm"));
    }, [newStartTime, newEndTime]);

    useEffect(() => {
        const patient = patients.find((p) => p.id === patientId)
        if (patient) setPatient(patient)
    }, [patientId, patients])
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const [startHour, startMinute] = startTimeStr.split(':')
        const [endHour, endMinute] = endTimeStr.split(':')
        
        let newStart = new Date(newStartTime)
        newStart.setHours(Number(startHour), Number(startMinute))

        let newEnd = new Date(newEndTime)
        newEnd.setHours(Number(endHour), Number(endMinute))

        const event: Partial<Event> = {
            title,
            type,
            description,
            startTime: newStart,
            endTime: newEnd,
            sessionUrl,
            patientId,
        }
        console.log('saving event', event)

        const savedEvents: Promise<Event[]> = saveEvent(event, repeat, repetitionCount)
        setEvents([...await savedEvents as Event[], ...events])


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
                    className="border-0 border-b pb-0 w-[95%] text-lg font-medium focus-visible:ring-0"
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
                    onChange={(e) => {
                        setNewStartTime((prev) => new Date(new Date(e.target.value).setHours(prev.getHours(), prev.getMinutes())))
                        if (type !== "event"){
                            setNewEndTime((prev) => new Date(new Date(e.target.value).setHours(prev.getHours(), prev.getMinutes())))
                        }
                    }}
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
                    <div className="flex flex-row items-center space-x-2">
                        <Select value={repeat} onValueChange={setRepeat}>
                            <SelectTrigger className="w-[180px] h-8 text-sm">
                            <SelectValue placeholder="No se repite" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="no-repeat">No se repite</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="biweekly">Bisemanal</SelectItem>
                            <SelectItem value="monthly">Mensual</SelectItem>
                            </SelectContent>
                        </Select>
                        {repeat !== "no-repeat" && (
                            <Input
                                type="number"
                                placeholder="Cantidad de sesiones"
                                className="w-25 h-8"
                                min={1}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value, 10);
                                    if (value > 0) {
                                        setRepetitionCount(value);
                                    }
                                }}
                            />
                        )}
                    </div>
                )}

                <div className="grid gap-2">
                <div className="flex items-center gap-4">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <Input
                    type="text"
                    placeholder="Añadir videollamada"
                    value={sessionUrl}
                    onChange={(e) => setSessionUrl(e.target.value)}
                />
                </div>
                <div className="flex items-center gap-4 h-10 pb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div className="relative w-full h-8">
                        <SearchableDropdown
                            options={patients}
                            label="initials"
                            id="id"
                            filterBy="name"                 
                            selectedVal={patient ? patient.initials : ""}
                            handleChange={(val) => setPatientId(Number(val))}
                            placeholder="Seleccionar paciente"
                        />
                    </div>
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
                <Button type="submit">
                    {repetitionCount > 1 ? `Guardar (${repetitionCount})` : "Guardar"}
                </Button>
            </DialogFooter>
            </form>
        </DialogContent>
        </Dialog>
    )
}

