import { useEffect, useState } from "react";
import { Patient, Event, PsyFile } from "@prisma/client";
import { Button } from "./ui/button";
import React from "react";
import { format } from "date-fns";
import PatientDetails from "./PatientDetails";
import { PasswordProtect } from "./PasswordProtect";
import { useCalendar } from "./calendar/calendar-context";

function PatientTable({ 
    patients,
    onSendReminder, 
    onEditPatient, 
    onDeletePatient 
}: { 
    patients: Patient[], 
    onSendReminder: (patient: Patient) => void, 
    onEditPatient: (patient: Patient) => void, 
    onDeletePatient: (patient: Patient) => void 
}) {
    const { isAuthenticated, files, events, setEvents } = useCalendar();
    const [expandedPatientId, setExpandedPatientId] = useState<number | null>(null);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const toggleExpand = (patientId: number) => {
        setExpandedPatientId((prev) => (prev === patientId ? null : patientId));
    };

    const [patientFilesMap, setPatientFilesMap] = useState<{ [key: number]: PsyFile[] }>(
        patients.reduce((acc, patient) => {
            acc[patient.id] = files.filter((file) => file.patientId === patient.id);
            return acc;
        }, {} as { [key: number]: PsyFile[] })
    );

    useEffect(() => {
        setPatientFilesMap(
            patients.reduce((acc, patient) => {
                acc[patient.id] = files.filter((file) => file.patientId === patient.id);
                return acc;
            }, {} as { [key: number]: PsyFile[] })
        );
    }, [files, patients]);

    const setPatientsEvents = (patientEvents: Event[]) => {
        const eventsWithOtherPatientId = events.filter((event) => event.patientId !== selectedPatient?.id);

        setEvents([...eventsWithOtherPatientId, ...patientEvents]);
    };

    const onShowDetails = (patient: Patient) => {
        if (isAuthenticated) {
            toggleExpand(patient.id);
        } else {
            setSelectedPatient(patient);
            setShowPasswordDialog(true);
        }
    };



    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse bg-white shadow rounded-lg">
                <thead>
                    <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                        <th className="px-4 py-2 border-b">Iniciales</th>
                        <th className="px-4 py-2 border-b">Última Sesión</th>
                        <th className="px-4 py-2 border-b">Eventos</th>
                        <th className="px-4 py-2 border-b">Ficheros</th>
                        <th className="px-4 py-2 border-b">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {patients.map((patient) => {
                        const patientEvents = events.filter((event) => event.patientId === patient.id).reverse();
                        const patientLastSession = patientEvents.length > 0 ? patientEvents[0].startTime : null;
                        // const [patientFiles, setPatientFiles] = useState<PsyFile[]>(files.filter((file) => file.patientId === patient.id));
                        const patientFiles = patientFilesMap[patient.id];
                        const setPatientFiles = (newFiles: PsyFile[]) => {
                            setPatientFilesMap((prev) => ({
                                ...prev,
                                [patient.id]: newFiles,
                            }));
                        };
                        return (
                            <React.Fragment key={patient.id}>
                                <tr
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => onShowDetails(patient)}
                                >
                                    <td className="px-4 py-2 border-b">{patient.initials}</td>
                                    <td className="px-4 py-2 border-b">
                                        {patientLastSession
                                            ? format(patientLastSession, "EEEE d MMM, yyyy")
                                            : "No disponible"}
                                    </td>
                                    <td className="px-4 py-2 border-b">{patientEvents.length}</td>
                                    <td className="px-4 py-2 border-b">{patientFiles?.length}</td>
                                    <td className="px-4 py-2 border-b space-x-2">
                                        {/* <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSendReminder(patient);
                                            }}
                                        >
                                            Enviar Recordatorio
                                        </Button> */}
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditPatient(patient);
                                            }}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeletePatient(patient);
                                            }}
                                        >
                                            Eliminar
                                        </Button>
                                    </td>
                                </tr>
                                {expandedPatientId === patient.id && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-2 border-b">
                                            <PatientDetails
                                                patient={patient}
                                                patientEvents={patientEvents}
                                                setPatientEvents={setPatientsEvents}
                                                patientFiles={patientFiles}
                                                setPatientFiles={setPatientFiles}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>

            {selectedPatient && (
                <PasswordProtect
                    open={showPasswordDialog}
                    onOpenChange={setShowPasswordDialog}
                    onAuthenticated={() => toggleExpand(selectedPatient.id)}
                >
                    <></>
                </PasswordProtect>
            )}
        </div>
    );
}

export default PatientTable;
