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
import { Calendar, File, Users, Video } from 'lucide-react'
import { format } from "date-fns"
import { useState, useEffect, use } from "react"
import SearchableDropdown from "./SearchableDropdown"
import { Patient, Event, PsyFile } from "@prisma/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { saveEvent, updateEvent } from "@/app/actions/events"
import { useCalendar } from "./calendar/calendar-context"
import { saveFile, updateFile } from "@/app/actions/files"



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
    const {patients, setEvents, events, files, setFiles} = useCalendar();
    const [title, setTitle] = useState(eventData?.title ?? "")
    const [description, setDescription] = useState(eventData?.description ?? "")
    const [type, setType] = useState(eventData?.type ?? "appointment")
    const [patientId, setPatientId] = useState(eventData?.patientId ?? 0)
    const [patient, setPatient] = useState<Patient>()
    const [sessionUrl, setSessionUrl] = useState(eventData?.sessionUrl ?? "")
    const [startTimeStr, setStartTimeStr] = useState(format(eventData?.startTime ?? new Date(), "HH:mm"))
    const [endTimeStr, setEndTimeStr] = useState(format(eventData?.endTime ?? new Date(), "HH:mm"))
    const [newStartTime, setNewStartTime] = useState(eventData?.startTime ?? new Date())
    const [newEndTime, setNewEndTime] = useState(eventData?.endTime ?? new Date())
    const [repeat, setRepeat] = useState("no-repeat")
    const [repetitionCount, setRepetitionCount] = useState(1)
    const [eventFile, setEventFiles] = useState<PsyFile[]>(files.filter((f) => f.eventId === eventData?.id) ?? [])
    const [filesToSave, setFilesToSave] = useState<FileList | null>(null)


    useEffect(() => {
        if (eventData) {
            setTitle(eventData.title || "");
            setDescription(eventData.description || "");
            setType(eventData.type || "appointment");
            setPatientId(eventData.patientId || 0);
            setSessionUrl(eventData.sessionUrl || "");
            setStartTimeStr(format(eventData.startTime ?? new Date(), "HH:mm"));
            setEndTimeStr(format(eventData.endTime ?? new Date(), "HH:mm"));
            setNewStartTime(eventData.startTime ?? new Date());
            setNewEndTime(eventData.endTime ?? new Date());
            setEventFiles(files.filter((f) => f.eventId === eventData?.id) ?? []);
        }
    }, [eventData]);

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
        
        let newEvents: Event[] = []
        if (eventData?.id) {
            // Update event
            console.log('update(event): ', event)
            const updatedEvent = await updateEvent(eventData.id, event)
            if (updatedEvent) {
                newEvents = [updatedEvent]
                const updatedEvents = events.map((e: Event) => e.id === updatedEvent.id ? updatedEvent : e)
                setEvents(updatedEvents)
            }
        } else {
            // Save event
            newEvents = await saveEvent(event, repeat, repetitionCount)
            setEvents([...newEvents, ...events])
        }
        if (filesToSave) {
            // Update existing files
            const existingFiles = Array.from(filesToSave).filter(file => eventFile.some(ef => ef.filename === file.name));
            for (const file of existingFiles) {
                const existingFile = eventFile.find(ef => ef.filename === file.name);
                if (existingFile) {
                    await updateFile(existingFile.id, file);
                }
            }

            // Save new files
            const newFilesToSave = Array.from(filesToSave).filter(file => !eventFile.some(ef => ef.filename === file.name));
            let newFiles: PsyFile[] = [];
            for (const newFile of newFilesToSave) {
                const savedFiles = await saveFile(newFile, newEvents[0].id || "", patientId);
                if (savedFiles) 
                    newFiles.push(savedFiles);
            }
            setFiles([...newFiles, ...files]);
            
            console.log('Files after saveFile call:', files)
        }
        
        onOpenChange(false)
    }

    console.log('files:', files)
    console.log('eventFiles:', eventFile)
    console.log('eventData:', eventData)

    
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
                        setNewStartTime((prev: Date) => new Date(new Date(e.target.value).setHours(prev.getHours(), prev.getMinutes())))
                        if (type !== "event"){
                            setNewEndTime((prev: Date) => new Date(new Date(e.target.value).setHours(prev.getHours(), prev.getMinutes())))
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
                        onChange={(e) => setNewEndTime((prev: Date) => new Date(new Date(e.target.value).setHours(prev.getHours(), prev.getMinutes())))}
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
                <div className="flex items-center gap-4">
                    <File className="h-4 w-4 text-muted-foreground" />
                    <input
                        type="file"
                        multiple
                        onChange={(e) => setFilesToSave(e.target.files)}
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                    />
                    <div className="mt-2">
                        {Array.from(eventFile || []).map((file, index) => (
                            <div key={index} className="text-sm text-gray-700">
                                {file.filename}
                            </div>
                        ))}
                    </div>
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

