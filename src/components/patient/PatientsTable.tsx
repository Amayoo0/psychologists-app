import { useEffect, useState } from "react";
import { Patient, Event, PsyFile } from "@prisma/client";
import React from "react";
import { format } from "date-fns";
import PatientDetails from "@/components/patient/PatientDetails";
import { useCalendar } from "@/components/calendar/calendar-context";
import { Pencil, Trash } from "lucide-react";

function PatientTable({ 
    patients,
    onEditPatient, 
    onDeletePatient 
}: { 
    patients: Patient[],
    onEditPatient: (patient: Patient) => void, 
    onDeletePatient: (patient: Patient) => void 
}) {
    const { isAuthenticated, files, events, setEvents } = useCalendar();
    const [expandedPatientId, setExpandedPatientId] = useState<number | null>(null);
    const [, setShowPasswordDialog] = useState(false);
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
        <div className="h-full overflow-y-auto">
            <table className="min-w-full border-collapse bg-white shadow rounded-lg">
                <thead className="bg-gray-100 text-left text-sm font-semibold text-gray-700 sticky top-0 z-10">
                    <tr>
                        <th className="px-4 py-2 border-b">Iniciales</th>
                        <th className="px-4 py-2 border-b">Última Sesión</th>
                        <th className="px-4 py-2 border-b">Eventos</th>
                        <th className="px-4 py-2 border-b">Ficheros</th>
                        <th className="px-4 py-2 border-b">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {patients.map((patient) => {
                        const patientEvents = events.filter((event) => event.patientId === patient.id).reverse();
                        const patientLastSession = patientEvents.length > 0 ? patientEvents[0].startTime : null;
                        const patientFiles = patientFilesMap[patient.id];
                        const setPatientFiles = (newFiles: PsyFile[]) => {
                            setPatientFilesMap((prev) => ({
                                ...prev,
                                [patient.id]: newFiles,
                            }));
                        };
                        return (
                            <React.Fragment key={patient.id}>
                                <tr className="hover:bg-gray-50 cursor-pointer border-b" onClick={() => onShowDetails(patient)}>
                                    <td className="px-4 py-2">{patient.initials}</td>
                                    <td className="px-4 py-2">
                                        {patientLastSession ? format(patientLastSession, "EEEE d MMM, yyyy") : "No disponible"}
                                    </td>
                                    <td className="px-4 py-2">{patientEvents.length}</td>
                                    <td className="px-4 py-2">{patientFiles?.length}</td>
                                    <td className="px-4 py-6 space-x-2 flex flex-items">
                                        <Pencil
                                            size={25}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditPatient(patient);
                                            }}
                                            className="hover:animate-shake"
                                        />
                                        <Trash
                                            size={25}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeletePatient(patient);
                                            }}
                                            color="#bc0101" 
                                            className="hover:animate-shake"
                                        />
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
        </div>
    </div>

    );
}

export default PatientTable;
