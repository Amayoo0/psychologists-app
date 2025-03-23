import { Patient, Event, PsyFile } from "@prisma/client";
import EventTable from "@/components/event/EventsTable";
import { useEffect, useState } from "react";
import { addHours } from "date-fns";
import { useCalendar } from "@/components/calendar/calendar-context";
import { Button } from "@/components/ui/button";
import { Plus, Save, Upload } from "lucide-react";
import { EventDialog } from "@/components/event/EventDialog";
import { FilesViewTable } from "@/components/patient/FilesViewTable";
import { deleteFiles, getFilesByPatient, saveFiles } from "@/app/actions/files";

const PatientDetails = ({
    patient,
    patientEvents,
    setPatientEvents,
    patientFiles = [],
    setPatientFiles,
}: {
    patient: Patient;
    patientEvents?: Event[];
    setPatientEvents: (events: Event[]) => void;
    patientFiles?: PsyFile[];
    setPatientFiles: (files: PsyFile[]) => void;
}) => {
    const {files, setFiles} = useCalendar()
    const [filesToSave, setFilesToSave] = useState<File[]>([])
    const [filesToDelete, setFilesToDelete] = useState<number[]>([])
    const [showEventDialog, setShowEventDialog] = useState(false)
    const [newEventPatientId, setNewEventPatientId] = useState<number | undefined>(patient.id)

    useEffect(() => {
        // Clean input
        const inputElement = document.getElementById('file-input') as HTMLInputElement;
        if (inputElement) {
            inputElement.value = '';
        }

    },[filesToSave]);

    useEffect(() => {
        const fetchData = async () => {
            setPatientFiles(await getFilesByPatient(patient.id));
        }
        fetchData();
    }, [files]);

   
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
                        <p className="text-sm font-medium text-gray-500">DNI</p>
                        <p className="text-lg text-gray-900">{patient.dni}</p>
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
                            onClick={() => {
                                setNewEventPatientId(patient.id)
                                setShowEventDialog(true)
                            }}
                        >
                            <Plus/>
                        </Button>
                    </div>
                </div>
                {((patientEvents && patientEvents.length > 0) 
                    ?   <EventTable
                            events={patientEvents}
                            setEvents={setPatientEvents}
                        />
                    :   <p className="text-gray-500 text-sm">No hay eventos relacionados.</p>
                )}
                <div id="files-buttons-control" className="flex flex-row items-center">
                    <h4 className="text-lg font-semibold mt-6 mb-4 pr-4">Ficheros Relacionados</h4>
                    <input type="file"
                        multiple
                        onChange={(e) => {
                            const filesList = Array.from(e.target.files ?? [])  
                            const existingFileNames = filesToSave.map(file => file.name);
                            const existingFiles = filesList.filter(file => existingFileNames.includes(file.name));
                            if (existingFiles.length > 0) {
                                const existingFileNames = existingFiles.map(file => file.name).join(', ');
                                alert(`Los siguientes archivos ya existen y no se volverán a cargar: ${existingFileNames}`);
                            }
                            setFilesToSave((prevFiles) => {
                                const newFiles = filesList.filter(file => !prevFiles.some(prevFile => prevFile.name === file.name));
                                return [...(prevFiles || []), ...newFiles];
                            })
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
                                onClick={async () => {
                                    if (filesToSave.length > 0){
                                        let existingFiles = '';
                                        let newFilesToSave = filesToSave;
                                        filesToSave.forEach(file => {
                                            if (patientFiles.some(existingFile => existingFile.filename === file.name && existingFile.patientId === patient.id && existingFile.eventId === null)) {
                                                existingFiles += file.name + ', ';
                                                newFilesToSave = newFilesToSave.filter(prevFile => prevFile.name !== file.name);
                                            }
                                        });
                                        if (existingFiles.length > 0) {
                                            alert(`Los siguientes archivos ya existen y no se volverán a cargar: ${existingFiles.slice(0, -2)}.`);
                                        }
                                        const savedFiles = await saveFiles(newFilesToSave, null, patient.id)
                                        const newFiles = [...files, ...savedFiles];
                                        setFiles(newFiles);
                                    }
                                    if (filesToDelete.length > 0){
                                        const deletedFiles = await deleteFiles(filesToDelete)
                                        setFiles(files.filter(file => !deletedFiles.includes(file.id)))
                                    }
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
                            ?   
                                <div>
                                    <FilesViewTable
                                        patientFiles={patientFiles}
                                        filesToSave={filesToSave ?? []} 
                                        filesToDelete={filesToDelete}
                                        setFilesToDelete={setFilesToDelete}
                                        setFilesToSave={setFilesToSave}
                                        patientEvents={patientEvents ?? []}
                                    />
                                </div>
                            :   <p className="text-gray-500 text-sm">No hay ficheros relacionados.</p>
                        )}
                    
                </ul>
            </div>
            <EventDialog
                open={showEventDialog}
                onOpenChange={setShowEventDialog}
                eventData={{
                    startTime: new Date(),
                    endTime: addHours(new Date(), 1),
                    patientId: newEventPatientId,
                }}
            />
        </>
    )
}

export default PatientDetails;