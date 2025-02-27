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
import { Calendar, File, RefreshCw, Trash, Users, Video } from 'lucide-react'
import { format } from "date-fns"
import { useState, useEffect } from "react"
import SearchableDropdown from "@/components/SearchableDropdown"
import { Patient, Event, PsyFile } from "@prisma/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { deleteEvent, saveEvent, updateEvent } from "@/app/actions/events"
import { useCalendar } from "@/components/calendar/calendar-context"
import { deleteFiles, getFilesByEvent, saveFiles} from "@/app/actions/files"
import LoadingSpinner from "@/components/LoadingSpinner"
import { FilesView } from "@/components/event/FilesView"
import { useStreamVideoClient } from "@stream-io/video-react-sdk"
import { Checkbox } from "../ui/checkbox"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import { useUser } from "@clerk/nextjs"
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"
import { createMeeting, deleteMeeting } from "@/components/videocall/utils"
import { cn } from "@/lib/utils"
import CreateMeetingActions from "../videocall/CreateMeetingActions"


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
    const [patient, setPatient] = useState<Patient | null>()
    const [sessionUrl, setSessionUrl] = useState(eventData?.sessionUrl ?? "")
    const [startTimeStr, setStartTimeStr] = useState(format(eventData?.startTime ?? new Date(), "HH:mm"))
    const [endTimeStr, setEndTimeStr] = useState(format(eventData?.endTime ?? new Date(), "HH:mm"))
    const [newStartTime, setNewStartTime] = useState(eventData?.startTime ?? new Date())
    const [newEndTime, setNewEndTime] = useState(eventData?.endTime ?? new Date())
    const [repeat, setRepeat] = useState("no-repeat")
    const [repetitionCount, setRepetitionCount] = useState(1)
    const [filesToSave, setFilesToSave] = useState<File[]>([])
    const [filesToDelete, setFilesToDelete] = useState<number[]>([])
    const [eventFiles, setEventFiles] = useState<PsyFile[]>([])
    const [loadingFiles, setLoadingFiles] = useState(false)
    const streamClient = useStreamVideoClient();
    const user = useUser();


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
                setFilesToDelete([]);
                setFilesToSave([]);
                if (eventData.patientId) {
                    setPatient(patients.find((p) => p.id === eventData.patientId) || null);
                }
            }
        };
        fetchData();
    }, [eventData, files]);

    useEffect(() => {
        setStartTimeStr(format(newStartTime, "HH:mm"));
        setEndTimeStr(format(newEndTime, "HH:mm"));
    }, [newStartTime, newEndTime]);

    useEffect(() => {
        const patient = patients.find((p) => p.id === patientId)
        if (patient) setPatient(patient)
    }, [patientId, patients])

    useEffect(() => {
        if (!open && sessionUrl) {
            const endSession = async () => {
                try {
                    await deleteMeeting(streamClient, user, sessionUrl);
                    setSessionUrl("");
                } catch (error) {
                    console.error("Error al finalizar la sesión:", error);
                }
            };
            endSession();
        }
        
    }, [open, sessionUrl]);

    useEffect(() => {
        if (!open) {
            setTitle("");
            setDescription("");
            setType("appointment");
            setPatientId(0);
            setPatient(null);
            setSessionUrl("");
            setStartTimeStr(format(new Date(), "HH:mm"));
            setEndTimeStr(format(new Date(), "HH:mm"));
            setNewStartTime(new Date());
            setNewEndTime(new Date());
            setRepeat("no-repeat");
            setRepetitionCount(1);
            setFilesToSave([]);
            setFilesToDelete([]);
            setEventFiles([]);
            setLoadingFiles(false);
        }
    }, [open]);
      
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const [startHour, startMinute] = startTimeStr.split(':')
        const [endHour, endMinute] = endTimeStr.split(':')
        
        let newStart = new Date(newStartTime)
        newStart.setHours(Number(startHour), Number(startMinute))

        let newEnd = new Date(newEndTime)
        newEnd.setHours(Number(endHour), Number(endMinute))

        if (newEnd.getTime() < newStart.getTime()) {
            alert("La fecha de finalización no puede ser anterior.")
            return
        }

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
            const newFilesToSave = filesToSave.filter(file => !eventFiles.some(ef => ef.filename === file.name));
            if (newFilesToSave.length !== filesToSave.length) {
                const filesNotInNewFilesToSave = filesToSave.filter(file => !newFilesToSave.includes(file));
                const filesNotInNewFilesToSaveStr = filesNotInNewFilesToSave.map(file => file.name).join(', ');
                alert(`Los siguientes archivos ya existen y no se volverán a cargar: ${filesNotInNewFilesToSaveStr}.`);
            }
            const savedFiles: PsyFile[] = await saveFiles(newFilesToSave, newEvents[0]?.id || eventData?.id || "", patientId);
            if (savedFiles){
                setEventFiles([...eventFiles, ...savedFiles])
                setFiles([...files, ...savedFiles])
            }
            setFilesToSave([])
        }
        if (filesToDelete) {
            // Delete files
            const deletedFiles = await deleteFiles(filesToDelete);
            setFiles(files.filter((file) => !deletedFiles.includes(file.id)));
            setFilesToDelete([])
        }

        setPatient(null)
        onOpenChange(false)
    
    }


    const handleAddFile = async (fileList: FileList | null) => {
        if (!fileList) return
        
        const filesArray = Array.from(fileList)

        if (eventFiles.length + filesArray.length + filesToSave.length - filesToDelete.length > 3) {
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
                    className="border border-b pb-0  md:text-lg xl:text-xl font-medium"
                />
                {eventData?.id && 
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
                }
                </DialogTitle>
            </DialogHeader>
            <Tabs 
                defaultValue={type} 
                className="mt-4" 
                onValueChange={(value) => {
                    switch(type){
                        case "event":
                            setNewEndTime(newStartTime)
                    }
                    setType(value)
                }}
            >
                <TabsList className="grid w-full grid-cols-3" autoFocus>
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
                    onChange={(e) => {
                        const [startHour, startMinute] = e.target.value.split(':')
                        let newStart = new Date(newStartTime)
                        newStart.setHours(Number(startHour), Number(startMinute))
                        // check if the end is before the start
                        if( newStart.getTime() > newEndTime.getTime() ){
                            setEndTimeStr(e.target.value)
                        }
                        setStartTimeStr(e.target.value)
                    }}
                />
                {type !== "event" && (
                    <Input
                        type="time"
                        value={endTimeStr}
                        className="w-25"
                        onChange={(e) => {
                            const [endHour, endMinute] = e.target.value.split(':')
                            let newEnd = new Date(newEndTime)
                            newEnd.setHours(Number(endHour), Number(endMinute))
                            // check if the end is before the start
                            if( newEnd.getTime() < newStartTime.getTime() ){
                                alert("La fecha de fin no puede ser anterior a la fecha de inicio.")
                                return
                            }
                            setEndTimeStr(e.target.value)
                        }}
                    />
                )}
                </div>
                {type === "event" ? (
                <div className="flex flex-row items-center space-x-2">
                    <Input
                        type="date"
                        value={format(newEndTime, "yyyy-MM-dd")}
                        className="w-35"
                        onChange={(e) => {
                            const newEnd = new Date(new Date(e.target.value).setHours(newEndTime.getHours(), newEndTime.getMinutes()))
                            // check if the end is before the start
                            if( newEnd.getTime() < newStartTime.getTime() ){
                                alert("La fecha de fin no puede ser anterior a la fecha de inicio.")
                                return
                            }
                            setNewEndTime(newEnd)
                        }}
                    />
                    <Input
                        type="time"
                        className="w-25"
                        value={endTimeStr}
                        onChange={(e) => {
                            const [endHour, endMinute] = e.target.value.split(':')
                            let newEnd = new Date(newEndTime)
                            newEnd.setHours(Number(endHour), Number(endMinute))
                            // check if the end is before the start
                            if( newEnd.getTime() < newStartTime.getTime() ){
                                alert("La fecha de fin no puede ser anterior a la fecha de inicio.")
                                return
                            }
                            setEndTimeStr(e.target.value)
                        }}
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
                            readOnly
                            className="w-100"
                        />
                        <CreateMeetingActions 
                            streamClient={streamClient} 
                            sessionUrl={sessionUrl} 
                            setSessionUrl={setSessionUrl} 
                            user={user} 
                            meetingProps={{
                                startTime: eventData?.startTime ?? newStartTime ?? Date.now,
                                duration: eventData?.endTime && eventData?.startTime ? eventData.endTime.getTime() - eventData.startTime.getTime() : 0,
                                description: eventData?.description ?? description ?? "",
                            }} 
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
                                required
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
                                    
                                    <div className="m-1 grid grid-cols-3 gap-0 max-w-[300px]">
                                        {((eventFiles.length > 0 || filesToSave) && <FilesView 
                                                eventFiles={eventFiles} 
                                                filesToSave={filesToSave ?? []} 
                                                filesToDelete={filesToDelete}
                                                setFilesToDelete={setFilesToDelete}
                                                setFilesToSave={setFilesToSave}
                                                maxPatientFiles={3}
                                            />
                                        )}
                                    </div>
                                    {/* New Files */}
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => handleAddFile(e.target.files)}
                                        className="w-[125px] cursor-pointer bg-white text-white hover:text-white hover:bg-white" 
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

