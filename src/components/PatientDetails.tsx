import { Patient, Event, PsyFile } from "@prisma/client";
import EventTable from "./EventsTable";
import { FilesView } from "./FilesView";
import { useState } from "react";
import { set } from "date-fns";
import { useCalendar } from "./calendar/calendar-context";
import { Button } from "./ui/button";
import { Save, Upload } from "lucide-react";
import { EventDialog } from "./EventDialog";

const PatientDetails = ({
    patient,
    patientEvents,
    setPatientEvents,
    patientFiles = [],
}: {
    patient: Patient;
    patientEvents?: Event[];
    setPatientEvents: (events: Event[]) => void;
    patientFiles?: PsyFile[];
}) => {
    const {files, setFiles} = useCalendar()
    const [filesToSave, setFilesToSave] = useState<File[]>([])
    const [filesToDelete, setFilesToDelete] = useState<number[]>([])
    const [showEventDialog, setShowEventDialog] = useState(false)
   
    return (
        <>
            <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Detalles del Paciente</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Nombre</p>
                        <p className="text-lg text-gray-900">{patient.name}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-lg text-gray-900">{patient.email}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Teléfono</p>
                        <p className="text-lg text-gray-900">{patient.phone}</p>
                    </div>
                </div>
                <div id="events-buttons-control" className="flex flex-row items-center">
                    <h4 className="text-lg font-semibold mt-6 mb-4 pr-4">Eventos</h4>
                    <div className="border-2 border-gray-400 rounded-md ">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setShowEventDialog(true)}
                        >
                            <Upload/>
                        </Button>
                    </div>
                </div>
                <EventTable
                    events={patientEvents ?? []}
                    setEvents={setPatientEvents}
                />
                <div id="files-buttons-control" className="flex flex-row items-center">
                    <h4 className="text-lg font-semibold mt-6 mb-4 pr-4">Ficheros Relacionados</h4>
                    <input type="file"
                        multiple
                        onChange={(e) => {
                            const filesList = Array.from(e.target.files ?? [])                                    
                            setFilesToSave((prevFiles) => ([...(prevFiles || []), ...filesList]))
                        }}
                        className="hidden"
                        id="file-input"
                    />
                    <div className="mt-3 border-2 border-gray-400 rounded-md ">
                        <Button
                            id="files-buttons-control-upload"
                            size="icon"
                            variant="ghost"
                            onClick={() => document.getElementById('file-input')?.click()}
                        >
                            <Upload/>
                        </Button>
                        {((filesToSave.length > 0 || filesToDelete.length > 0) && 
                            <Button 
                                id="files-buttons-control-save"
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                    console.error("Save files not implemented yet")
                                    setFilesToSave([]);
                                    setFilesToDelete([]);
                                }}
                            >
                                <Save/>
                            </Button>
                        )}
                    </div>
                </div>
                <ul className="list-disc list-inside space-y-2 w-full">
                    
                        {((patientFiles.length > 0 || filesToSave.length > 0) 
                            ?   <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))" }}>
                                    <FilesView 
                                        eventFiles={files.filter((file) => file.patientId === patient.id)} 
                                        filesToSave={filesToSave ?? []} 
                                        filesToDelete={filesToDelete}
                                        setFilesToDelete={setFilesToDelete}
                                        setFilesToSave={setFilesToSave}
                                        maxPatientFiles={100}
                                    />
                                </div>
                            :   <p className="text-gray-500 text-sm">No hay ficheros relacionados.</p>
                        )}
                    
                </ul>
            </div>
            <EventDialog
                open={showEventDialog}
                onOpenChange={setShowEventDialog}
                eventData={{}}
            />
        </>
    )
}

export default PatientDetails;