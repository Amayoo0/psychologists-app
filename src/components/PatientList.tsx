'use client'
import { useState } from "react";
import PatientDialog from "./PatientDialog";
import { useCalendar } from "./calendar/calendar-context";
import { Patient, Event } from "@prisma/client";
import { PasswordProtect } from "./PasswordProtect";
import { deletePatient } from "@/app/actions/patients";
import PatientTable from "./PatientsTable";
import LoadingSpinner from "./LoadingSpinner";

const PatientList = () => {
    const { patients, setPatients, isAuthenticated, loading } = useCalendar()
	const [showPatientDialog, setShowPatientDialog] = useState(false)
	const [showPasswordDialog, setShowPasswordDialog] = useState(false)
	const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

	const onEditPatient = (patient: Patient) => {
		if (isAuthenticated) {
			setSelectedPatient(patient)
			setShowPatientDialog(true)
		} else {
			setSelectedPatient(patient)
			setShowPasswordDialog(true)
		}
	}

	const onSendReminder = (patient: Patient) => {
		console.log('Send reminder to patient:', patient)
	}

	const onDeletePatient = async (patient: Patient) => {
		const result = await deletePatient(patient.id)
		setPatients(patients.filter(p => p.id !== patient.id))
	}
	
    return (
		<>
		{loading ? (
        	<LoadingSpinner message="Cargando pacientes..." />
		) : (
			<div className="overflow-x-auto">
			<PatientTable 
				patients={patients} 
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
				/>
			</PasswordProtect>
			</div>
		)}
		</>
    )
}

export default PatientList;