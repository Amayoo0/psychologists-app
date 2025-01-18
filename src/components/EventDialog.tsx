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
import { Calendar, File, Trash, Users, Video, X } from 'lucide-react'
import { format } from "date-fns"
import { useState, useEffect, use } from "react"
import SearchableDropdown from "./SearchableDropdown"
import { Patient, Event, PsyFile } from "@prisma/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { deleteEvent, saveEvent, updateEvent } from "@/app/actions/events"
import { useCalendar } from "./calendar/calendar-context"
import { deleteFiles, getFilesByEvent, saveFiles} from "@/app/actions/files"
import { cn } from "@/lib/utils"
import LoadingSpinner from "./LoadingSpinner"



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
    const [filesToSave, setFilesToSave] = useState<File[] | null>(null)
    const [filesToDelete, setFilesToDelete] = useState<number[]>([])
    const [eventFiles, setEventFiles] = useState<PsyFile[]>([])
    const [loadingFiles, setLoadingFiles] = useState(false)


    useEffect(() => {
        const fetchData = async () => {
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
                setLoadingFiles(true);
                setEventFiles(await getFilesByEvent(eventData.id ?? null));
                setLoadingFiles(false);
                // setEventFiles(files.filter(file => file.eventId === eventData.id))
            }
        };
        fetchData();
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
        
        let newEvents: Event[] = []
        // Check if new/update event is necessary
        if (
            eventData?.title !== title ||
            eventData?.description !== description ||
            eventData?.type !== type ||
            eventData?.patientId !== patientId ||
            eventData?.sessionUrl !== sessionUrl ||
            eventData?.startTime?.getTime() !== newStart.getTime() ||
            eventData?.endTime?.getTime() !== newEnd.getTime()
        ) {
            if (eventData?.id) {
                // Update event
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
        }
        if (filesToSave) {
            const newFilesToSave = Array.from(filesToSave).filter(file => !eventFiles.some(ef => ef.filename === file.name));
            const savedFiles: PsyFile[] = await saveFiles(newFilesToSave, newEvents[0]?.id || eventData?.id || "", patientId);
            if (savedFiles){
                setEventFiles([...eventFiles, ...savedFiles]) 
            }
            setFilesToSave([])
        }
        if (filesToDelete) {
            // Delete files
            const result = await deleteFiles(filesToDelete);
            if (result) {
                setFiles(files.filter((file) => !filesToDelete.includes(file.id)));
            }
            setFilesToDelete([])
        }

        onOpenChange(false)
    
    }


    const handleAddFile = async (fileList: FileList | null) => {
        if (!fileList) return
        
        const filesArray = Array.from(fileList)

        if (eventFiles.length + filesArray.length - filesToDelete.length > 3) {
            alert("No se pueden subir más de 3 archivos")
            return
        }
        
        setFilesToSave((prevFiles) => ([...(prevFiles || []), ...filesArray]))

        
    }
 
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[450px]">
            <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle className="flex items-center justify-between w-[90%] space-x-5">
                <Input
                    type="text"
                    placeholder="Añadir título"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-0 border-b pb-0  text-lg font-medium focus-visible:ring-0"
                />
                <Trash 
                    size={25} 
                    color="#bc0101" 
                    onClick={() => {
                        eventData?.id && deleteEvent(eventData.id)
                        setEvents(events.filter((event) => event.id !== eventData?.id))
                        onOpenChange(false)
                    }}
                    className="hover:animate-shake"
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
                    {loadingFiles 
                        ?   <LoadingSpinner message="Cargando ficheros"/> 
                        :   <div className="flex items-center gap-4">
                                <File className="h-4 w-4 text-muted-foreground" />
                        
                            
                                <div className="flex flex-col w-full">
                                    {/* existing files */}
                                    <div className="m-1 flex flex-row">
                                        {eventFiles?.map((file, index) => (
                                            <div
                                                key={index}
                                                className={cn(
                                                    "relative flex flex-col items-center justify-center w-24 h-24 shadow-md bg-gray-50 text-gray-700",
                                                    filesToDelete.includes(file.id) ? "opacity-50" : ""
                                                )}
                                            >
                                                <File className="w-8 h-8 text-gray-500" />
                                                <span className="mt-2 text-xs text-center truncate">{file.filename}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        if (filesToDelete.includes(file.id)){
                                                            if (eventFiles.length + (filesToSave?.length || 0) - filesToDelete.length >= 3) {
                                                                alert("No se pueden subir más de 3 archivos")
                                                            } else{
                                                                setFilesToDelete((prevFiles) => prevFiles.filter(id => id !== file.id))
                                                            }
                                                        } else if(filesToSave?.some(f => f.name === file.filename)){
                                                            setFilesToSave((prevFiles) => (prevFiles ? prevFiles.filter((f) => f.name !== file.filename) : null))
                                                        }else{
                                                            console.log('Agregando fichero a FilesToDelete: ', file.id)
                                                            setFilesToDelete((prevFiles) => [...prevFiles, file.id])
                                                        }
                                                    }}
                                                    className="absolute top-1 right-1 flex items-center justify-center w-5 h-5"
                                                >
                                                    <X className={cn("w-4 h-4",
                                                        filesToDelete.includes(file.id) ? "rotate-45 hover:text-green-600" : "hover:text-red-600")} 
                                                    />
                                                </Button>
                                            </div>
                                        ))}
                                        {filesToSave?.map((file, index) => (
                                            <div
                                                key={index}
                                                className={cn(
                                                    "relative flex flex-col items-center justify-center w-24 h-24 shadow-md bg-gray-50 border-2 border-dashed border-green-500"
                                                )}
                                            >
                                                <File className="w-8 h-8 text-gray-500" />
                                                <span className="mt-2 text-xs text-center truncate">{file.name}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => setFilesToSave((prevFiles) => (prevFiles ? prevFiles.filter(f => f.name !== file.name) : null))}
                                                    className="absolute top-1 right-1 flex items-center justify-center w-5 h-5"
                                                >
                                                    <X className="w-4 h-4 hover:text-red-600"/>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    {/* New Files */}
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => handleAddFile(e.target.files)}
                                        className="w-[110px] cursor-pointer bg-white text-white hover:text-white hover:bg-white" 
                                    />
                                </div>
                            </div>
                    }
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

