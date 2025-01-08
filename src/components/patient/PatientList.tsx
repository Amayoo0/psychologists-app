'use client'
import { useState } from "react";
import NewPatientDialog from "../PatientDialog";
import { Button } from "../ui/button";
import { useCalendar } from "../calendar/calendar-context";
import { Patient } from "@prisma/client";
import { PasswordProtect } from "../PasswordProtect";

const PatientList = () => {
    const { patients, setPatients, events, setEvents } = useCalendar()
	const [showPatientDialog, setShowPatientDialog] = useState(false)
	const [showPasswordDialog, setShowPasswordDialog] = useState(false)
	const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

	const openPasswordDialog = (patient: Patient) => {
		setShowPasswordDialog(true)
		setSelectedPatient(patient)
	}
	
    return (
		<>
        <ul className="space-y-2">
			{patients.map((patient) => (
				<li key={patient.id} className="flex items-center justify-between p-2 bg-white rounded-lg shadow">
				<span>{patient.name}</span>
				<Button onClick={() => {
					openPasswordDialog(patient)}
					// if isAuthenticated setShowPatientDialog(true)
				}>	
					Ver detalles
				</Button>
				</li>
			))}
        </ul>
		
		<PasswordProtect 
			open={showPasswordDialog} 
			onOpenChange={setShowPasswordDialog}
			onAuthenticated={() => setShowPatientDialog(true)}
		>
			<NewPatientDialog 
				open={showPatientDialog}
				onOpenChange={setShowPatientDialog}
				patientData={selectedPatient ?? undefined}  
			/>
		</PasswordProtect>
		</>
    )
}

export default PatientList;