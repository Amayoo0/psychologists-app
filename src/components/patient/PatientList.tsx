'use client'
import { useState } from "react";
import PatientDialog from "../PatientDialog";
import { Button } from "../ui/button";
import { useCalendar } from "../calendar/calendar-context";
import { Patient, Event } from "@prisma/client";
import { PasswordProtect } from "../PasswordProtect";
import { on } from "events";
import { deletePatient } from "@/app/actions/patients";
import PatientTable from "../PatientsTable";

const PatientList = () => {
    const { patients, setPatients, events, setEvents, isAuthenticated } = useCalendar()
	const [showPatientDialog, setShowPatientDialog] = useState(false)
	const [showPasswordDialog, setShowPasswordDialog] = useState(false)
	const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

	const onEditPatient = (patient: Patient) => {
		if (isAuthenticated) {
			setShowPatientDialog(true)
			setSelectedPatient(patient)
		} else {
			setShowPasswordDialog(true)
			setSelectedPatient(patient)
		}
	}

	const onSendReminder = (patient: Patient) => {
		console.log('Send reminder to patient:', patient)
	}

	const onDeletePatient = async (patient: Patient) => {
		const result = await deletePatient(patient.id)
		if (result)
			console.log('Deleted patient:', patient)
		else
			console.error('Error deleting patient:', patient)

		setPatients(patients.filter(p => p.id !== patient.id))
	}
	
    return (
		<>
		<PatientTable 
			patients={patients} 
			events={events}
			setEvents={setEvents} 
			onSendReminder={onSendReminder}
			onEditPatient={onEditPatient} 
			onDeletePatient={onDeletePatient} 
		/>

		<PasswordProtect 
			open={showPasswordDialog} 
			onOpenChange={setShowPasswordDialog}
			onAuthenticated={() => setShowPatientDialog(true)}
		>
			<PatientDialog 
				open={showPatientDialog}
				onOpenChange={setShowPatientDialog}
				patientData={selectedPatient ?? undefined}
				patientEvents={events.filter((event) => event.patientId === selectedPatient?.id)}
				setPatientEvents={setEvents}
			/>
		</PasswordProtect>
		</>
    )
}

export default PatientList;