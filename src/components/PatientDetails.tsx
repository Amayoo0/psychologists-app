import { Patient, Event, PsyFile } from "@prisma/client";
import EventTable from "./EventsTable";

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
    return (
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
                    <h4 className="text-lg font-semibold mb-4">Eventos</h4>
                    <EventTable
                        events={patientEvents ?? []}
                        setEvents={setPatientEvents}
                    />
                    <h4 className="text-lg font-semibold mt-6 mb-4">Ficheros Relacionados</h4>
                    <ul className="list-disc list-inside space-y-2">
                        {patientFiles?.length > 0 ? (
                            patientFiles.map((file) => (
                                <li key={file.id} className="flex items-center space-x-2">
                                    <span className="text-gray-900">{file.filename}</span>
                                    <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline text-sm"
                                    >
                                        Descargar
                                    </a>
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">No hay ficheros relacionados.</p>
                        )}
                    </ul>
                </div>
    )
}

export default PatientDetails;